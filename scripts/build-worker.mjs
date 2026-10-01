import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { templateVersion } from "./template-version.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const siteCode = fs.readFileSync(path.join(dist, "assets/site.js"), "utf8");
const localeSource = siteCode.slice(siteCode.indexOf("const ru="), siteCode.indexOf("const articles="));
const { ru, uz } = vm.runInNewContext(`${localeSource}\n({ru,uz})`);
const extracted = spawnSync("python3", [path.join(root, "scripts/extract-cms-fields.py")], { encoding: "utf8" });
if (extracted.status !== 0) throw new Error(extracted.stderr || "Could not extract page fields");
const manifest = JSON.parse(extracted.stdout);
const annotatedPages = {};
for (const [slug, page] of Object.entries(manifest)) {
  annotatedPages[`/${slug}`] = page.html;
  delete page.html;
  page.version = templateVersion(page);
}
// Template versions of the pages as published before overrides were stamped with a version.
const legacyVersions = JSON.parse(fs.readFileSync(path.join(root, "scripts/legacy-template-versions.json"), "utf8"));
for (const [slug, page] of Object.entries(manifest)) {
  if (slug !== "index.html") continue;
  for (const field of page.fields) {
    if (!field.key) continue;
    field.ru = ru[field.key] ?? field.en;
    field.uz = uz[field.key] ?? field.en;
  }
  page.descriptions.ru = ru.heroLead;
  page.descriptions.uz = uz.heroLead;
}

const mime = extension => ({
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon",
})[extension] || "application/octet-stream";

const assets = {};
function walk(directory) {
  for (const name of fs.readdirSync(directory)) {
    if (name === "server" || name === ".openai") continue;
    const file = path.join(directory, name);
    if (fs.statSync(file).isDirectory()) walk(file);
    else {
      const route = "/" + path.relative(dist, file).split(path.sep).join("/");
      const type = mime(path.extname(file));
      assets[route] = type.startsWith("text/") || type.startsWith("application/json")
        ? { type, text: annotatedPages[route] ?? fs.readFileSync(file, "utf8") }
        : { type, base64: fs.readFileSync(file).toString("base64") };
    }
  }
}
walk(dist);
const worker = fs.readFileSync(path.join(root, "worker/index.js"), "utf8");
fs.mkdirSync(path.join(dist, "server"), { recursive: true });
fs.writeFileSync(path.join(dist, "server/index.js"), `const STATIC = ${JSON.stringify(assets)};\nconst TEMPLATE_INFO = ${JSON.stringify(manifest)};\nconst LEGACY_TEMPLATE_VERSIONS = ${JSON.stringify(legacyVersions)};\n${worker}`);
console.log(`Built Worker with ${Object.keys(assets).length} static assets and ${Object.keys(manifest).length} pages`);
