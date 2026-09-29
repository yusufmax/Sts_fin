import fs from "node:fs";
import path from "node:path";
import { Miniflare } from "miniflare";

const root = path.resolve(import.meta.dirname, "..");
const dataDirectory = process.env.S3_DATA_DIR || path.join(root, ".vps-data");
const port = Number(process.env.S3_PORT || 8787);
const required = ["CMS_ADMIN_PASSWORD_HASH", "CMS_SESSION_SECRET"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}

fs.mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
const bindings = {};
for (const name of [
  ...required,
  "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM",
]) {
  if (process.env[name]) bindings[name] = process.env[name];
}

const server = new Miniflare({
  scriptPath: path.join(root, "dist/server/index.js"),
  modules: true,
  compatibilityDate: "2026-08-06",
  bindings,
  d1Databases: { DB: "s3cms" },
  r2Buckets: { BUCKET: "s3-media" },
  host: "127.0.0.1",
  port,
  resourcePersistencePath: dataDirectory,
  unsafeLocalExplorer: false,
  unsafeRegisterWorker: false,
});

try {
  const database = await server.getD1Database("DB");
  await database.exec("CREATE TABLE IF NOT EXISTS vps_migrations (name TEXT PRIMARY KEY NOT NULL)");
  const migrationsDirectory = path.join(root, "drizzle");
  for (const name of fs.readdirSync(migrationsDirectory).filter(name => name.endsWith(".sql")).sort()) {
    const applied = await database.prepare("SELECT name FROM vps_migrations WHERE name = ?").bind(name).first();
    if (applied) continue;
    const sql = fs.readFileSync(path.join(migrationsDirectory, name), "utf8").replaceAll("--> statement-breakpoint", "");
    for (const statement of sql.split(";").map(part => part.trim()).filter(Boolean)) {
      await database.prepare(statement).run();
    }
    await database.prepare("INSERT INTO vps_migrations (name) VALUES (?)").bind(name).run();
    console.log(`Applied ${name}`);
  }
  console.log(`S3 site listening at ${await server.ready}`);
} catch (error) {
  await server.dispose();
  throw error;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await server.dispose();
    process.exit(0);
  });
}
