import { connect } from "cloudflare:sockets";
const SITE_ORIGIN = "https://strategic-security-systems-uz.yusufmax15.chatgpt.site";
const ADMIN_COOKIE = "__Host-s3_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;
const LANGS = ["en", "ru", "uz"];
const DEFAULT_NAV = [
  ["About Us", "О компании", "Kompaniya haqida", "about.html"],
  ["Solutions", "Решения", "Yechimlar", "solutions.html"],
  ["Systems Integration", "Системная интеграция", "Tizim integratsiyasi", "systems-integration.html"],
  ["Training & Knowledge Transfer", "Обучение и передача знаний", "O‘qitish va bilim almashish", "training.html"],
  ["Support & FSR Services", "Поддержка и FSR", "Yordam va FSR xizmatlari", "support.html"],
  ["Technology Partners", "Технологические партнёры", "Texnologik hamkorlar", "partners.html"],
  ["Contact", "Контакты", "Aloqa", "contact.html"],
].map(([en, ru, uz, href]) => ({ en, ru, uz, href }));
const DEFAULT_SETTINGS = { contactEmail: "info@stsec.uz", nav: DEFAULT_NAV, googleVerification: "", bingVerification: "", yandexVerification: "" };
const RETIRED_SLUGS = new Set(["projects.html"]);
const MAX_JSON = 2_000_000;
const articleSlugValid = slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
const imageUrlValid = src => /^\/(?:media|assets)\/[a-zA-Z0-9._/-]+$/.test(src);
const IMAGE_LAYOUTS = new Set(["under-caption-left", "after-center", "after-left", "after-right", "after-full"]);
const GALLERY_MODES = new Set(["auto", "gallery", "slider"]);

const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const cleanText = (value, max = 12000) => String(value ?? "").trim().slice(0, max);
const pathFor = (lang, slug) => `/${lang}/${slug === "index.html" ? "" : slug}`;
const validSlug = slug => !RETIRED_SLUGS.has(slug) && (/^[a-z0-9][a-z0-9-]{0,59}\.html$/.test(slug) || slug === "index.html");
const isBuiltin = slug => Object.hasOwn(TEMPLATE_INFO, slug);
const noStore = { "cache-control": "no-store", "x-content-type-options": "nosniff" };

function assetResponse(route) {
  const asset = STATIC[route];
  if (!asset) return null;
  const body = asset.text !== undefined ? asset.text : Uint8Array.from(atob(asset.base64), c => c.charCodeAt(0));
  return new Response(body, { headers: { "content-type": asset.type, "cache-control": route.startsWith("/assets/admin") ? "no-store" : "public, max-age=86400", "x-content-type-options": "nosniff" } });
}

async function getSettings(env) {
  try {
    const row = await env.DB.prepare("SELECT value FROM cms_settings WHERE key = ?").bind("site").first();
    const settings = { ...DEFAULT_SETTINGS, ...(row ? JSON.parse(row.value) : {}) };
    settings.nav = (Array.isArray(settings.nav) ? settings.nav : DEFAULT_NAV).filter(item => !RETIRED_SLUGS.has(item.href));
    return settings;
  } catch { return DEFAULT_SETTINGS; }
}
async function getPage(env, slug) {
  try {
    const row = await env.DB.prepare("SELECT data, status, updated_at FROM cms_pages WHERE slug = ?").bind(slug).first();
    return row ? { data: JSON.parse(row.data), status: row.status, updatedAt: row.updated_at } : null;
  } catch { return null; }
}
async function publishedArticles(env, limit = 24) {
  try {
    const rows = await env.DB.prepare("SELECT slug,data,published_at FROM cms_articles WHERE status = 'published' ORDER BY published_at DESC, updated_at DESC LIMIT ?").bind(limit).all();
    return rows.results.map(row => ({ slug: row.slug, data: JSON.parse(row.data), publishedAt: row.published_at }));
  } catch { return []; }
}
function articleText(article, lang, key) {
  return article.data.translations?.[lang]?.[key] || article.data.translations?.en?.[key] || "";
}
function articleLink(lang, slug) { return `/${lang}/news/${slug}`; }
function articleCard(article, lang, homepage = false) {
  const data = article.data, title = esc(articleText(article, lang, "title"));
  const summary = esc(articleText(article, lang, "summary"));
  const category = esc(articleText(article, lang, "category") || ({ en: "News", ru: "Новости", uz: "Yangiliklar" }[lang]));
  const image = data.image ? `<img src="${esc(data.image)}" alt="${esc(articleText(article, lang, "alt"))}" loading="lazy">` : "";
  const date = data.date ? `<time datetime="${esc(data.date)}">${esc(data.date)}</time>` : "";
  const href = articleLink(lang, article.slug);
  if (homepage) return `<a class="news-card cms-news-card" href="${href}"><div class="image">${image}</div><div class="body"><span class="kind">${category} ${date}</span><h3>${title}</h3><p>${summary}</p><span class="read">${({ en: "Read story", ru: "Читать", uz: "O‘qish" }[lang])}<span aria-hidden="true">↗</span></span></div></a>`;
  return `<article class="publication cms-publication"><a href="${href}">${image}<div><span class="card-no">${category} ${date}</span><h3>${title}</h3><p>${summary}</p><span class="card-link">${({ en: "Read article", ru: "Читать статью", uz: "Maqolani o‘qish" }[lang])} ↗</span></div></a></article>`;
}
async function sanitizeArticleHtml(source) {
  const allowed = new Set(["p", "h2", "h3", "ul", "ol", "li", "strong", "b", "em", "i", "blockquote", "br", "a", "img", "figure", "figcaption"]);
  const excluded = new Set(["script", "style", "iframe", "object", "embed", "svg", "form", "input", "button"]);
  const response = new HTMLRewriter().on("*", { element(el) {
    const tag = el.tagName.toLowerCase();
    if (excluded.has(tag)) { el.remove(); return; }
    if (!allowed.has(tag)) { el.removeAndKeepContent(); return; }
    const href = tag === "a" ? el.getAttribute("href") : null;
    const src = tag === "img" ? el.getAttribute("src") : null;
    const alt = tag === "img" ? cleanText(el.getAttribute("alt"), 240) : "";
    for (const [name] of [...el.attributes]) el.removeAttribute(name);
    if (tag === "a") {
      if (!/^https?:\/\/[^\s"'<>]+$/.test(href || "") && !/^\/(?:en|ru|uz)\/[a-zA-Z0-9/_-]+$/.test(href || "")) { el.removeAndKeepContent(); return; }
      el.setAttribute("href", href);
      if (href.startsWith("http")) { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener noreferrer"); }
    }
    if (tag === "img") {
      if (!imageUrlValid(src || "")) { el.remove(); return; }
      el.setAttribute("src", src);
      el.setAttribute("alt", alt);
      el.setAttribute("loading", "lazy");
    }
  } }).transform(new Response(cleanText(source, 30000), { headers: { "content-type": "text/html; charset=utf-8" } }));
  return response.text();
}
async function normalizeArticle(input) {
  const data = input && typeof input === "object" ? input : {};
  const date = /^\d{4}-\d{2}-\d{2}$/.test(data.date || "") && !Number.isNaN(Date.parse(`${data.date}T00:00:00Z`)) ? data.date : new Date().toISOString().slice(0, 10);
  const image = imageUrlValid(data.image || "") ? data.image : "";
  const translations = Object.fromEntries(await Promise.all(LANGS.map(async lang => [lang, {
    title: cleanText(data.translations?.[lang]?.title, 180),
    summary: cleanText(data.translations?.[lang]?.summary, 550),
    bodyHtml: await sanitizeArticleHtml(data.translations?.[lang]?.bodyHtml || ""),
    category: cleanText(data.translations?.[lang]?.category, 60),
    alt: cleanText(data.translations?.[lang]?.alt, 240),
  }])));
  return { date, image, translations };
}
const encoder = new TextEncoder();
const toBase64Url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = value => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")), c => c.charCodeAt(0));
function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}
async function sessionKey(env) {
  if (!env.CMS_SESSION_SECRET) return null;
  return crypto.subtle.importKey("raw", fromBase64Url(env.CMS_SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}
async function signedSession(env) {
  const key = await sessionKey(env);
  if (!key) throw new Error("Admin authentication is not configured");
  const payload = toBase64Url(encoder.encode(JSON.stringify({ user: "root", expires: Date.now() + SESSION_MS })));
  const signature = toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
  return `${payload}.${signature}`;
}
async function isAdmin(request, env) {
  try {
    const token = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
    if (!token || token.length > 1024) return false;
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra || !/^[A-Za-z0-9_-]+$/.test(payload + signature)) return false;
    const key = await sessionKey(env);
    if (!key) return false;
    const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
    if (!equalBytes(expected, fromBase64Url(signature))) return false;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return session.user === "root" && Number.isFinite(session.expires) && session.expires > Date.now() && session.expires < Date.now() + SESSION_MS + 60_000;
  } catch { return false; }
}
async function adminAccess(request, env, page = false) {
  if (await isAdmin(request, env)) return null;
  if (page) {
    return new Response(null, { status: 302, headers: { location: new URL("/admin/login", request.url).toString(), ...noStore } });
  }
  return json({ error: "Sign in required" }, 401);
}
async function validAdminPassword(password, env) {
  const [scheme, rounds, salt, expected, extra] = String(env.CMS_ADMIN_PASSWORD_HASH || "").split("$");
  if (scheme !== "pbkdf2_sha256" || rounds !== "210000" || !salt || !expected || extra || typeof password !== "string" || password.length > 256) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromBase64Url(salt), iterations: 210000, hash: "SHA-256" }, key, 256));
  return equalBytes(actual, fromBase64Url(expected));
}
async function loginLimitKey(request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(ip)));
  return `admin-login:${Array.from(digest.slice(0, 12), byte => byte.toString(16).padStart(2, "0")).join("")}`;
}
async function adminLogin(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
  if (!env.CMS_ADMIN_PASSWORD_HASH || !env.CMS_SESSION_SECRET) return json({ error: "Admin authentication is not configured" }, 503);
  const key = await loginLimitKey(request);
  const now = Date.now();
  const attempts = await env.DB.prepare("SELECT count, reset_at FROM cms_rate_limits WHERE key = ?").bind(key).first();
  if (attempts && attempts.reset_at > now && attempts.count >= 5) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  let input;
  try { input = await bodyJson(request); } catch { return json({ error: "Invalid request" }, 400); }
  if (input?.username !== "root" || !await validAdminPassword(input?.password, env)) {
    const reset = now + 15 * 60_000;
    if (attempts && attempts.reset_at > now) await env.DB.prepare("UPDATE cms_rate_limits SET count = count + 1 WHERE key = ?").bind(key).run();
    else await env.DB.prepare("INSERT INTO cms_rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at").bind(key, reset).run();
    return json({ error: "Incorrect username or password" }, 401);
  }
  await env.DB.prepare("DELETE FROM cms_rate_limits WHERE key = ?").bind(key).run();
  const response = json({ ok: true });
  response.headers.set("set-cookie", `${ADMIN_COOKIE}=${await signedSession(env)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
  return response;
}
async function adminLogout(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
  const response = json({ ok: true });
  response.headers.set("set-cookie", `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
  return response;
}
function sameOrigin(request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  if (origin === url.origin) return true;
  return url.protocol === "http:"
    && request.headers.get("x-forwarded-proto") === "https"
    && origin === `https://${url.host}`;
}
function safeSvg(source) {
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>][\s\S]*<\/svg>\s*$/i.test(source)) return false;
  if (/<\s*\/?\s*(?:script|foreignObject|iframe|object|embed|image|animate|set)\b/i.test(source)) return false;
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet|\bon[a-z]+\s*=|javascript:|data:|@import/i.test(source)) return false;
  const references = [...source.matchAll(/\b(?:href|xlink:href)\s*=\s*(["'])(.*?)\1/gi)];
  if ([...source.matchAll(/\b(?:href|xlink:href)\s*=/gi)].length !== references.length) return false;
  if (references.some(([, , value]) => !/^#[a-zA-Z_][\w:.-]*$/.test(value))) return false;
  const urls = [...source.matchAll(/url\s*\(\s*(["']?)(.*?)\1\s*\)/gi)];
  if (urls.some(([, , value]) => !/^#[a-zA-Z_][\w:.-]*$/.test(value))) return false;
  return true;
}
async function bodyJson(request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("JSON required");
  if (Number(request.headers.get("content-length") || 0) > MAX_JSON) throw new Error("Request too large");
  const source = await request.text();
  if (source.length > MAX_JSON) throw new Error("Request too large");
  return JSON.parse(source);
}
async function normalizedPage(input, builtin) {
  const data = input && typeof input === "object" ? input : {};
  const translations = {};
  for (const lang of LANGS) translations[lang] = {
    title: cleanText(data.translations?.[lang]?.title, 180),
    description: cleanText(data.translations?.[lang]?.description, 400),
    ogTitle: cleanText(data.translations?.[lang]?.ogTitle, 180),
    ogDescription: cleanText(data.translations?.[lang]?.ogDescription, 400),
    ogImage: /^\/(?:media|assets)\/[a-zA-Z0-9._/-]+$/.test(data.translations?.[lang]?.ogImage || "") ? data.translations[lang].ogImage : "",
  };
  const fields = {};
  if (builtin && data.fields && typeof data.fields === "object") {
    for (const [id, values] of Object.entries(data.fields)) {
      if (!/^\d{1,4}$/.test(id) || !values || typeof values !== "object") continue;
      fields[id] = Object.fromEntries(LANGS.map(lang => [lang, cleanText(values[lang], 20000)]));
    }
  }
  const images = {};
  if (builtin && data.images && typeof data.images === "object") {
    for (const [id, image] of Object.entries(data.images)) {
      if (!/^\d{1,4}$/.test(id) || !image || typeof image !== "object") continue;
      const src = cleanText(image.src, 300);
      if (src && !/^\/(?:media|assets)\/[a-zA-Z0-9._/-]+$/.test(src)) continue;
      images[id] = { src, alt: Object.fromEntries(LANGS.map(lang => [lang, cleanText(image.alt?.[lang], 240)])) };
    }
  }
  const hiddenSections = builtin && Array.isArray(data.hiddenSections) ? data.hiddenSections.filter(x => /^\d{1,3}$/.test(String(x))).map(String) : [];
  const blocks = Array.isArray(data.blocks) ? await Promise.all(data.blocks.slice(0, 40).map(async block => {
    const legacyImage = imageUrlValid(block.image || "") ? [{ id: crypto.randomUUID(), src: block.image, alt: block.alt || {} }] : [];
    const sourceImages = Array.isArray(block.images) ? block.images : legacyImage;
    const images = sourceImages.slice(0, 16).filter(image => image && imageUrlValid(image.src || "")).map(image => ({
      id: /^[a-z0-9-]{1,40}$/.test(image.id || "") ? image.id : crypto.randomUUID(),
      src: image.src,
      alt: Object.fromEntries(LANGS.map(lang => [lang, cleanText(image.alt?.[lang], 240)])),
    }));
    return {
      id: /^[a-z0-9-]{1,40}$/.test(block.id || "") ? block.id : crypto.randomUUID(),
      title: Object.fromEntries(LANGS.map(lang => [lang, cleanText(block.title?.[lang], 180)])),
      body: Object.fromEntries(LANGS.map(lang => [lang, cleanText(block.body?.[lang], 12000)])),
      bodyHtml: Object.fromEntries(await Promise.all(LANGS.map(async lang => [lang, await sanitizeArticleHtml(block.bodyHtml?.[lang] || "")]))),
      images,
      primaryImageId: images.some(image => image.id === block.primaryImageId) ? block.primaryImageId : images[0]?.id || "",
      imageLayout: IMAGE_LAYOUTS.has(block.imageLayout) ? block.imageLayout : "under-caption-left",
      galleryMode: GALLERY_MODES.has(block.galleryMode) ? block.galleryMode : "auto",
    };
  })) : [];
  return { translations, fields, images, hiddenSections, blocks };
}
function blockImages(block) {
  if (Array.isArray(block.images)) return block.images.filter(image => imageUrlValid(image.src || ""));
  return imageUrlValid(block.image || "") ? [{ id: "legacy", src: block.image, alt: block.alt || {} }] : [];
}
function renderBlock(block, lang, index = 0) {
  const title = esc(block.title?.[lang] || block.title?.en || "");
  const rich = block.bodyHtml?.[lang] || block.bodyHtml?.en || "";
  const legacy = esc(block.body?.[lang] || block.body?.en || "").replace(/\n/g, "<br>");
  const body = rich || (legacy ? `<p>${legacy}</p>` : "");
  const allImages = blockImages(block);
  const primary = allImages.find(image => image.id === block.primaryImageId);
  const images = primary ? [primary, ...allImages.filter(image => image !== primary)] : allImages;
  const mode = block.galleryMode === "slider" || (block.galleryMode !== "gallery" && images.length >= 5) ? "slider" : "gallery";
  const layout = IMAGE_LAYOUTS.has(block.imageLayout) ? block.imageLayout : "under-caption-left";
  const figures = images.map(image => `<figure><img src="${esc(image.src)}" alt="${esc(image.alt?.[lang] || image.alt?.en || "")}" loading="lazy"></figure>`).join("");
  const labels = { en: ["Previous image", "Next image"], ru: ["Предыдущее изображение", "Следующее изображение"], uz: ["Oldingi rasm", "Keyingi rasm"] }[lang];
  const media = images.length ? `<div class="cms-block-media cms-block-media--${mode}">${mode === "slider" && images.length > 1 ? `<div class="cms-slider-controls"><button type="button" data-slider-prev aria-label="${labels[0]}">←</button><button type="button" data-slider-next aria-label="${labels[1]}">→</button></div>` : ""}<div class="cms-block-media-track">${figures}</div></div>` : "";
  const underCaption = layout === "under-caption-left";
  return `<section class="content-section cms-block ${index % 2 ? "cms-block--soft" : ""} cms-block--${layout}"><div class="wrap"><div class="cms-block-grid"><div class="cms-block-heading"><h2 class="subsection-title">${title}</h2>${underCaption ? media : ""}</div><div class="cms-block-copy">${body}</div></div>${underCaption ? "" : media}</div></section>`;
}
function renderCustomPage(slug, page, lang) {
  const data = page.data;
  const title = esc(data.translations?.[lang]?.title || data.translations?.en?.title || slug);
  const lead = esc(data.translations?.[lang]?.description || data.translations?.en?.description || "");
  const shell = STATIC["/about.html"].text;
  const main = `<main class="subpage"><section class="subhero section-pad"><div class="wrap subhero-grid"><div class="subhero-copy"><div class="kicker">Strategic Security Systems</div><h1 class="subhero-title">${title}</h1><p class="subhero-lead">${lead}</p></div></div></section>${data.blocks.map((block, index) => renderBlock(block, lang, index)).join("")}</main>`;
  return shell.replace(/<main class="subpage">[\s\S]*?<\/main>/, main);
}
function renderArticlePage(request, article, lang, settings) {
  const title = articleText(article, lang, "title");
  const summary = articleText(article, lang, "summary");
  const category = articleText(article, lang, "category") || ({ en: "News", ru: "Новости", uz: "Yangiliklar" }[lang]);
  const body = articleText(article, lang, "bodyHtml");
  const image = article.data.image ? `<div class="subhero-media"><img src="${esc(article.data.image)}" alt="${esc(articleText(article, lang, "alt"))}"></div>` : "";
  const path = articleLink(lang, article.slug), origin = new URL(request.url).origin;
  const back = { en: "All news & publications", ru: "Все новости и публикации", uz: "Barcha yangiliklar va maqolalar" }[lang];
  const main = `<main class="subpage article-page"><section class="subhero section-pad"><div class="wrap subhero-grid"><div class="subhero-copy"><div class="kicker">${esc(category)} · <time datetime="${esc(article.data.date)}">${esc(article.data.date)}</time></div><h1 class="subhero-title">${esc(title)}</h1><p class="subhero-lead">${esc(summary)}</p></div>${image}</div></section><section class="content-section section-pad"><div class="wrap article-layout"><a class="text-link" href="/${lang}/news.html">← ${back}</a><div class="article-body">${body}</div></div></section></main>`;
  const template = STATIC["/news.html"].text.replace(/<main class="subpage">[\s\S]*?<\/main>/, main);
  return new HTMLRewriter()
    .on("html", { element(el) { el.setAttribute("lang", lang); el.setAttribute("data-server-localized", "true"); } })
    .on("title", { element(el) { el.setInnerContent(`${title} | Strategic Security Systems`); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute("content", summary); } })
    .on("head", { element(el) {
      const alternate = LANGS.map(code => `<link rel="alternate" hreflang="${code}" href="${origin}${articleLink(code, article.slug)}">`).join("");
      el.append(`<link rel="canonical" href="${origin}${path}">${alternate}<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(summary)}"><meta property="og:image" content="${origin}${esc(article.data.image || "/assets/engineering-workshop.webp")}"><meta property="og:url" content="${origin}${path}">`, { html: true });
    } })
    .on("[data-ru]", { element(el) { if (lang !== "en") el.setInnerContent(el.getAttribute(`data-${lang}`) || el.getAttribute("data-ru") || ""); } })
    .on("a[href]", { element(el) {
      const href = el.getAttribute("href");
      if (href?.startsWith("mailto:")) el.setAttribute("href", `mailto:${settings.contactEmail}`);
      else if (/^[a-z0-9-]+\.html(?:[?#].*)?$/.test(href || "")) el.setAttribute("href", `/${lang}/${href}`);
    } })
    .on('link[href^="assets/"],script[src^="assets/"],img[src^="assets/"]', { element(el) {
      const key = el.getAttribute("href") ? "href" : "src";
      el.setAttribute(key, "/" + el.getAttribute(key));
    } })
    .transform(new Response(template, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60", "x-content-type-options": "nosniff" } }));
}
function fallbackTitle(slug, lang) {
  if (slug === "index.html") return { en: "Systems Integration in Uzbekistan", ru: "Системная интеграция в Узбекистане", uz: "O‘zbekistonda tizim integratsiyasi" }[lang];
  const name = TEMPLATE_INFO[slug]?.titles?.[lang] || TEMPLATE_INFO[slug]?.title || slug.replace(/\.html$/, "");
  return name;
}
function localizedMetadata(page, slug, lang) {
  const metadata = page?.data?.translations?.[lang] || {};
  const fallback = page?.data?.translations?.en || {};
  const defaultDescription = TEMPLATE_INFO[slug]?.descriptions?.[lang] || TEMPLATE_INFO[slug]?.description || "";
  return {
    title: metadata.title || fallback.title || fallbackTitle(slug, lang),
    description: metadata.description || fallback.description || defaultDescription,
    ogTitle: metadata.ogTitle || metadata.title || fallback.ogTitle || fallback.title || fallbackTitle(slug, lang),
    ogDescription: metadata.ogDescription || metadata.description || fallback.ogDescription || fallback.description || defaultDescription,
    ogImage: metadata.ogImage || fallback.ogImage || "/assets/engineering-workshop.webp",
  };
}
function renderHtml(request, template, slug, lang, page, settings, articles = []) {
  const info = TEMPLATE_INFO[slug];
  const metadata = localizedMetadata(page, slug, lang);
  const origin = new URL(request.url).origin;
  const canonical = `${origin}${pathFor(lang, slug)}`;
  let fieldIndex = 0, imageIndex = 0, sectionIndex = 0;
  const hidden = new Set(page?.data?.hiddenSections || []);
  const blocks = page?.data?.blocks || [];
  const rewriter = new HTMLRewriter()
    .on("html", { element(el) { el.setAttribute("lang", lang); el.setAttribute("data-server-localized", "true"); } })
    .on("title", { element(el) { el.setInnerContent(`${metadata.title} | Strategic Security Systems`); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute("content", metadata.description); } })
    .on("head", { element(el) {
      const alternate = LANGS.map(code => `<link rel="alternate" hreflang="${code}" href="${origin}${pathFor(code, slug)}">`).join("");
      const verification = [["google-site-verification", settings.googleVerification], ["msvalidate.01", settings.bingVerification], ["yandex-verification", settings.yandexVerification]].filter(([, value]) => value).map(([name, value]) => `<meta name="${name}" content="${esc(value)}">`).join("");
      el.append(`<link rel="canonical" href="${esc(canonical)}">${alternate}<link rel="alternate" hreflang="x-default" href="${origin}${pathFor("en", slug)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(metadata.ogTitle)}"><meta property="og:description" content="${esc(metadata.ogDescription)}"><meta property="og:image" content="${origin}${esc(metadata.ogImage)}"><meta property="og:url" content="${esc(canonical)}"><meta name="twitter:card" content="summary_large_image">${verification}<link rel="stylesheet" href="/assets/cms-blocks.css?v=15"><script defer src="/assets/cms-public.js?v=15"></script>`, { html: true });
    } })
    .on("body", { element(el) { el.setAttribute("data-title-uz", metadata.title); } })
    .on("[data-i18n],[data-ru]", { element(el) {
      const index = String(fieldIndex++);
      const field = info?.fields?.[Number(index)];
      if (!field) {
        const fallback = lang === "en" ? null : el.getAttribute(`data-${lang}`);
        if (fallback) el.setInnerContent(fallback, { html: true });
        return;
      }
      const custom = page?.data?.fields?.[index]?.[lang];
      const value = custom || field[lang] || field.en;
      el.setInnerContent(custom ? esc(value).replace(/\n/g, "<br>") : value, { html: true });
    } })
    .on("img", { element(el) {
      const index = String(imageIndex++);
      const override = page?.data?.images?.[index];
      const src = override?.src || el.getAttribute("src");
      if (src?.startsWith("assets/")) el.setAttribute("src", "/" + src);
      else if (src) el.setAttribute("src", src);
      if (override?.alt?.[lang]) el.setAttribute("alt", override.alt[lang]);
    } })
    .on("section", { element(el) { if (hidden.has(String(sectionIndex++))) el.remove(); } })
    .on("main", { element(el) { if (blocks.length && info) el.append(blocks.map((block, index) => renderBlock(block, lang, index)).join(""), { html: true }); } })
    .on(slug === "index.html" ? ".news-grid" : ".publication-grid", { element(el) { if (articles.length) el.prepend(articles.map(article => articleCard(article, lang, slug === "index.html")).join(""), { html: true }); } })
    .on("a[href]", { element(el) {
      const href = el.getAttribute("href");
      if (!href) return;
      if (href.startsWith("mailto:")) {
        el.setAttribute("href", `mailto:${settings.contactEmail}`);
      } else if (/^[a-z0-9-]+\.html(?:[?#].*)?$/.test(href)) {
        const [, name, suffix = ""] = href.match(/^([a-z0-9-]+\.html)(.*)$/);
        el.setAttribute("href", pathFor(lang, name) + suffix);
      }
    } })
    .on('link[href^="assets/"],script[src^="assets/"]', { element(el) {
      const key = el.getAttribute("href") ? "href" : "src";
      el.setAttribute(key, "/" + el.getAttribute(key));
    } });
  return rewriter.transform(new Response(template, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } }));
}

async function limitContact(env, request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const bytes = new TextEncoder().encode(ip);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).slice(0, 12).map(x => x.toString(16).padStart(2, "0")).join("");
  const key = `contact:${hash}`;
  const now = Date.now(), reset = now + 10 * 60_000;
  const row = await env.DB.prepare("SELECT count, reset_at FROM cms_rate_limits WHERE key = ?").bind(key).first();
  if (row && row.reset_at > now && row.count >= 5) return false;
  if (row && row.reset_at > now) await env.DB.prepare("UPDATE cms_rate_limits SET count = count + 1 WHERE key = ?").bind(key).run();
  else await env.DB.prepare("INSERT INTO cms_rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at").bind(key, reset).run();
  return true;
}
async function sendViaSmtp(env, payload, recipient) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) throw new Error("mail_not_configured");
  const port = Number(env.SMTP_PORT || 465);
  if (port !== 465 && port !== 587) throw new Error("mail_invalid_port");
  let socket = connect({ hostname: env.SMTP_HOST, port }, { secureTransport: port === 465 ? "on" : "starttls" });
  await socket.opened;
  let reader = socket.readable.getReader();
  let writer = socket.writable.getWriter();
  const encoder = new TextEncoder(), decoder = new TextDecoder();
  let buffer = "";
  const readLine = async () => {
    while (!buffer.includes("\n")) {
      const { value, done } = await reader.read();
      if (done) throw new Error("smtp_connection_closed");
      buffer += decoder.decode(value, { stream: true });
      if (buffer.length > 64000) throw new Error("smtp_response_too_long");
    }
    const index = buffer.indexOf("\n");
    const line = buffer.slice(0, index).replace(/\r$/, "");
    buffer = buffer.slice(index + 1);
    return line;
  };
  const response = async expected => {
    let line;
    do { line = await readLine(); } while (/^\d{3}-/.test(line));
    const code = Number(line.slice(0, 3));
    if (!expected.includes(code)) throw new Error(`smtp_${code || "invalid"}`);
    return line;
  };
  const command = async (line, expected) => {
    await writer.write(encoder.encode(line + "\r\n"));
    return response(expected);
  };
  const base64 = text => {
    const bytes = encoder.encode(text);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  };
  const safeAddress = text => /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(text) ? text : null;
  const sender = safeAddress(env.SMTP_FROM || env.SMTP_USER);
  const to = safeAddress(recipient);
  if (!sender || !to) throw new Error("mail_invalid_address");
  try {
    await response([220]);
    await command("EHLO stsec.uz", [250]);
    if (port === 587) {
      await command("STARTTLS", [220]);
      reader.releaseLock(); writer.releaseLock();
      socket = socket.startTls();
      await socket.opened;
      reader = socket.readable.getReader(); writer = socket.writable.getWriter(); buffer = "";
      await command("EHLO stsec.uz", [250]);
    }
    await command("AUTH LOGIN", [334]);
    await command(base64(env.SMTP_USER), [334]);
    await command(base64(env.SMTP_PASSWORD), [235]);
    await command(`MAIL FROM:<${sender}>`, [250]);
    await command(`RCPT TO:<${to}>`, [250, 251]);
    await command("DATA", [354]);
    const body = `Name: ${payload.name}\nOrganization: ${payload.organization}\nEmail: ${payload.email}\nPhone: ${payload.phone || "—"}\nInterest: ${payload.interest}\nLanguage: ${payload.locale}\n\n${payload.message}`;
    const wrapped = base64(body).match(/.{1,76}/g).join("\r\n");
    const message = `From: S3 Website <${sender}>\r\nTo: <${to}>\r\nReply-To: <${payload.email}>\r\nSubject: S3 website enquiry\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrapped}\r\n.\r\n`;
    await writer.write(encoder.encode(message));
    await response([250]);
    await command("QUIT", [221]).catch(() => {});
  } finally {
    reader.releaseLock(); writer.releaseLock();
    await socket.close().catch(() => {});
  }
}
async function contact(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
  let input;
  try { input = await bodyJson(request); } catch { return json({ error: "Invalid request" }, 400); }
  if (input.website) return json({ ok: true });
  const payload = {
    name: cleanText(input.name, 120), organization: cleanText(input.organization, 180), email: cleanText(input.email, 254),
    phone: cleanText(input.phone, 80), interest: cleanText(input.interest, 120), message: cleanText(input.message, 6000),
    locale: LANGS.includes(input.locale) ? input.locale : "en",
  };
  const errors = {};
  if (payload.name.length < 2) errors.name = "required";
  if (payload.organization.length < 2) errors.organization = "required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = "invalid";
  if (!payload.interest) errors.interest = "required";
  if (payload.message.length < 10) errors.message = "required";
  if (Object.keys(errors).length) return json({ error: "validation", fields: errors }, 400);
  try { if (!await limitContact(env, request)) return json({ error: "rate_limit" }, 429); }
  catch { return json({ error: "storage_unavailable" }, 503); }
  const id = crypto.randomUUID(), now = new Date().toISOString();
  try { await env.DB.prepare("INSERT INTO cms_submissions (id,name,organization,email,phone,interest,message,locale,delivery_status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .bind(id, payload.name, payload.organization, payload.email, payload.phone, payload.interest, payload.message, payload.locale, "pending", now).run(); }
  catch { return json({ error: "storage_unavailable" }, 503); }
  const settings = await getSettings(env);
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) return json({ ok: true, id, delivery: "pending" }, 202);
  try {
    await sendViaSmtp(env, payload, settings.contactEmail);
    await env.DB.prepare("UPDATE cms_submissions SET delivery_status = 'sent' WHERE id = ?").bind(id).run();
    return json({ ok: true, id });
  } catch (error) {
    await env.DB.prepare("UPDATE cms_submissions SET delivery_status = 'failed' WHERE id = ?").bind(id).run().catch(() => {});
    console.error("Contact delivery failed", String(error));
    return json({ error: error.message === "mail_not_configured" ? "mail_not_configured" : "delivery_failed" }, 503);
  }
}

async function adminApi(request, env, route) {
  const denied = await adminAccess(request, env);
  if (denied) return denied;
  if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
  const method = request.method;
  if (route === "/api/admin/bootstrap" && method === "GET") {
    const settings = await getSettings(env);
    const rows = await env.DB.prepare("SELECT slug, status, updated_at, data FROM cms_pages ORDER BY slug").all();
    const custom = rows.results.filter(row => !isBuiltin(row.slug) && !RETIRED_SLUGS.has(row.slug) && !row.status.startsWith("redirect:"));
    const pages = [
      ...Object.keys(TEMPLATE_INFO).map(slug => {
        const row = rows.results.find(item => item.slug === slug);
        return { slug, builtin: true, title: TEMPLATE_INFO[slug].title, status: row?.status || "published", updatedAt: row?.updated_at || null };
      }),
      ...custom.map(row => ({ slug: row.slug, builtin: false, title: JSON.parse(row.data).translations?.en?.title || row.slug, status: row.status, updatedAt: row.updated_at })),
    ];
    return json({ pages, settings, emailConfigured: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) });
  }
  if (route === "/api/admin/settings") {
    if (method === "GET") return json(await getSettings(env));
    if (method === "PUT") {
      let input; try { input = await bodyJson(request); } catch { return json({ error: "Invalid data" }, 400); }
      const contactEmail = cleanText(input.contactEmail, 254);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return json({ error: "Invalid contact email" }, 400);
      const nav = Array.isArray(input.nav) ? input.nav.slice(0, 20).map(item => ({
        en: cleanText(item.en, 80), ru: cleanText(item.ru, 80), uz: cleanText(item.uz, 80), href: cleanText(item.href, 100),
      })).filter(item => item.en && validSlug(item.href)) : DEFAULT_NAV;
      const verification = Object.fromEntries(["googleVerification", "bingVerification", "yandexVerification"].map(key => [key, cleanText(input[key], 200)]));
      if (Object.values(verification).some(value => !/^[a-zA-Z0-9_=-]*$/.test(value))) return json({ error: "Invalid verification code" }, 400);
      const settings = { contactEmail, nav, ...verification };
      await env.DB.prepare("INSERT INTO cms_settings (key,value) VALUES ('site',?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(JSON.stringify(settings)).run();
      return json({ ok: true, settings });
    }
  }
  if (route === "/api/admin/submissions" && method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM cms_submissions ORDER BY created_at DESC LIMIT 200").all();
    return json(rows.results);
  }
  if (route === "/api/admin/articles") {
    if (method === "GET") {
      const rows = await env.DB.prepare("SELECT id,slug,data,status,published_at,updated_at FROM cms_articles ORDER BY updated_at DESC LIMIT 200").all();
      return json(rows.results.map(row => ({ id: row.id, slug: row.slug, title: JSON.parse(row.data).translations?.en?.title || row.slug, status: row.status, date: JSON.parse(row.data).date, publishedAt: row.published_at, updatedAt: row.updated_at })));
    }
    if (method === "POST") {
      let input; try { input = await bodyJson(request); } catch { return json({ error: "Invalid data" }, 400); }
      const slug = cleanText(input.slug, 80);
      if (!articleSlugValid(slug)) return json({ error: "Use a short URL with lowercase letters, numbers and hyphens" }, 400);
      const data = await normalizeArticle(input.data);
      if (!data.translations.en.title) return json({ error: "English title is required" }, 400);
      const status = input.status === "published" ? "published" : "draft";
      if (status === "published" && (!data.translations.en.summary || !data.translations.en.bodyHtml)) return json({ error: "Add an English summary and article body before publishing" }, 400);
      const now = new Date().toISOString(), id = crypto.randomUUID();
      try { await env.DB.prepare("INSERT INTO cms_articles (id,slug,data,status,published_at,updated_at) VALUES (?,?,?,?,?,?)").bind(id, slug, JSON.stringify(data), status, status === "published" ? now : null, now).run(); }
      catch (error) { if (String(error).includes("UNIQUE")) return json({ error: "This URL is already in use" }, 409); throw error; }
      return json({ ok: true, id, slug, status }, 201);
    }
  }
  if (route.startsWith("/api/admin/articles/")) {
    const id = route.slice("/api/admin/articles/".length);
    if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: "Invalid article" }, 400);
    const row = await env.DB.prepare("SELECT id,slug,data,status,published_at,updated_at FROM cms_articles WHERE id = ?").bind(id).first();
    if (!row) return json({ error: "Article not found" }, 404);
    if (method === "GET") return json({ id: row.id, slug: row.slug, data: JSON.parse(row.data), status: row.status, publishedAt: row.published_at, updatedAt: row.updated_at });
    if (method === "PUT") {
      let input; try { input = await bodyJson(request); } catch { return json({ error: "Invalid data" }, 400); }
      const data = await normalizeArticle(input.data);
      if (!data.translations.en.title) return json({ error: "English title is required" }, 400);
      const status = input.status === "published" ? "published" : "draft";
      if (status === "published" && (!data.translations.en.summary || !data.translations.en.bodyHtml)) return json({ error: "Add an English summary and article body before publishing" }, 400);
      const now = new Date().toISOString();
      await env.DB.prepare("UPDATE cms_articles SET data = ?, status = ?, published_at = ?, updated_at = ? WHERE id = ?")
        .bind(JSON.stringify(data), status, status === "published" ? row.published_at || now : null, now, id).run();
      return json({ ok: true, id, slug: row.slug, status });
    }
    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM cms_articles WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  }
  if (route.startsWith("/api/admin/submissions/") && route.endsWith("/retry") && method === "POST") {
    const id = route.slice("/api/admin/submissions/".length, -"/retry".length);
    if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: "Invalid enquiry" }, 400);
    const row = await env.DB.prepare("SELECT * FROM cms_submissions WHERE id = ?").bind(id).first();
    if (!row) return json({ error: "Enquiry not found" }, 404);
    if (row.delivery_status === "sent") return json({ error: "Already sent" }, 409);
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) return json({ error: "Mail delivery needs setup" }, 503);
    try {
      await sendViaSmtp(env, row, (await getSettings(env)).contactEmail);
      await env.DB.prepare("UPDATE cms_submissions SET delivery_status = 'sent' WHERE id = ?").bind(id).run();
      return json({ ok: true });
    } catch (error) { console.error("Contact retry failed", String(error)); return json({ error: "Delivery failed" }, 503); }
  }
  if (route === "/api/admin/media") {
    if (method === "GET") {
      const rows = await env.DB.prepare("SELECT * FROM cms_media ORDER BY uploaded_at DESC LIMIT 200").all();
      const original = Object.entries(STATIC).filter(([path, asset]) => path.startsWith("/assets/") && asset.type.startsWith("image/")).map(([url, asset]) => ({
        id: url, filename: url.slice("/assets/".length), mime: asset.type, bytes: asset.text ? encoder.encode(asset.text).length : Math.floor(asset.base64.length * 3 / 4), uploaded_at: null, source: "site", url,
      }));
      return json([...rows.results.map(row => ({ ...row, source: "upload", url: `/media/${row.id}` })), ...original]);
    }
    if (method === "POST") {
      const data = await request.formData();
      const file = data.get("file");
      if (!file || typeof file === "string") return json({ error: "Choose a file" }, 400);
      const svg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
      const type = svg ? "image/svg+xml" : file.type;
      const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "application/pdf"];
      if (!allowed.includes(type) || file.size > 12_000_000 || (svg && file.size > 2_000_000)) return json({ error: "Use PNG, JPG, WebP, GIF, SVG (up to 2 MB) or PDF (up to 12 MB)" }, 400);
      let body = file.stream();
      if (svg) {
        const source = await file.text();
        if (!safeSvg(source)) return json({ error: "This SVG contains unsupported or unsafe content. Export it as a plain SVG and try again." }, 400);
        body = source;
      }
      const id = crypto.randomUUID();
      await env.BUCKET.put(id, body, { httpMetadata: { contentType: type } });
      await env.DB.prepare("INSERT INTO cms_media (id,filename,mime,bytes,uploaded_at) VALUES (?,?,?,?,?)").bind(id, cleanText(file.name, 220), type, file.size, new Date().toISOString()).run();
      return json({ id, filename: file.name, mime: type, bytes: file.size, url: `/media/${id}` }, 201);
    }
  }
  if (route.startsWith("/api/admin/media/") && method === "DELETE") {
    const id = route.split("/").pop();
    if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: "Invalid media" }, 400);
    await env.BUCKET.delete(id);
    await env.DB.prepare("DELETE FROM cms_media WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }
  if (route.startsWith("/api/admin/page/")) {
    const slug = decodeURIComponent(route.slice("/api/admin/page/".length));
    if (!validSlug(slug)) return json({ error: "Invalid slug" }, 400);
    if (method === "GET") {
      const page = await getPage(env, slug);
      if (!isBuiltin(slug) && !page) return json({ error: "Page not found" }, 404);
      return json({ slug, builtin: isBuiltin(slug), manifest: TEMPLATE_INFO[slug] || null, page: page?.data || null, status: page?.status || "published" });
    }
    if (method === "PUT") {
      let input; try { input = await bodyJson(request); } catch { return json({ error: "Invalid data" }, 400); }
      const status = input.status === "draft" ? "draft" : "published";
      const data = await normalizedPage(input.data, isBuiltin(slug));
      if (!isBuiltin(slug) && !data.translations.en.title) return json({ error: "English title is required" }, 400);
      const nextSlug = input.newSlug || slug;
      if (nextSlug !== slug) {
        if (isBuiltin(slug) || !validSlug(nextSlug) || isBuiltin(nextSlug)) return json({ error: "This page URL cannot be changed" }, 400);
        if (!await getPage(env, slug)) return json({ error: "Page not found" }, 404);
        if (await getPage(env, nextSlug)) return json({ error: "That URL is already used" }, 409);
        const now = new Date().toISOString();
        await env.DB.batch([
          env.DB.prepare("INSERT INTO cms_pages (slug,data,status,updated_at) VALUES (?,?,?,?)").bind(nextSlug, JSON.stringify(data), status, now),
          env.DB.prepare("UPDATE cms_pages SET status = ?, updated_at = ? WHERE slug = ?").bind(`redirect:${nextSlug}`, now, slug),
        ]);
        const settings = await getSettings(env);
        settings.nav = settings.nav.map(item => item.href === slug ? { ...item, href: nextSlug } : item);
        await env.DB.prepare("INSERT INTO cms_settings (key,value) VALUES ('site',?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(JSON.stringify(settings)).run();
        return json({ ok: true, slug: nextSlug, status });
      }
      await env.DB.prepare("INSERT INTO cms_pages (slug,data,status,updated_at) VALUES (?,?,?,?) ON CONFLICT(slug) DO UPDATE SET data=excluded.data,status=excluded.status,updated_at=excluded.updated_at")
        .bind(slug, JSON.stringify(data), status, new Date().toISOString()).run();
      return json({ ok: true, slug, status });
    }
    if (method === "DELETE") {
      if (slug === "index.html") return json({ error: "The homepage cannot be deleted" }, 400);
      if (isBuiltin(slug)) {
        const page = await getPage(env, slug);
        const data = page?.data || await normalizedPage({}, true);
        await env.DB.prepare("INSERT INTO cms_pages (slug,data,status,updated_at) VALUES (?,?,'draft',?) ON CONFLICT(slug) DO UPDATE SET status='draft',updated_at=excluded.updated_at")
          .bind(slug, JSON.stringify(data), new Date().toISOString()).run();
      } else await env.DB.prepare("DELETE FROM cms_pages WHERE slug = ?").bind(slug).run();
      return json({ ok: true });
    }
  }
  return json({ error: "Not found" }, 404);
}
async function siteSettings(request, env) {
  const settings = await getSettings(env);
  return json({ contactEmail: settings.contactEmail, nav: settings.nav });
}
async function sitemap(request, env) {
  let slugs = Object.keys(TEMPLATE_INFO);
  try {
    const rows = await env.DB.prepare("SELECT slug,status FROM cms_pages").all();
    const draft = new Set(rows.results.filter(row => row.status !== "published").map(row => row.slug));
    slugs = [...slugs.filter(slug => !draft.has(slug)), ...rows.results.filter(row => !isBuiltin(row.slug) && !RETIRED_SLUGS.has(row.slug) && row.status === "published").map(row => row.slug)];
  } catch { /* Built-in pages remain indexable during a temporary database outage. */ }
  const origin = new URL(request.url).origin;
  const articles = await publishedArticles(env, 500);
  const items = slugs.flatMap(slug => LANGS.map(lang => `<url><loc>${esc(origin + pathFor(lang, slug))}</loc></url>`)).join("") + articles.flatMap(article => LANGS.map(lang => `<url><loc>${esc(origin + articleLink(lang, article.slug))}</loc></url>`)).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url), route = decodeURIComponent(url.pathname);
    if (route === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (route === "/sitemap.xml") return sitemap(request, env);
    if (route === "/api/contact") return contact(request, env);
    if (route === "/api/site-settings") return siteSettings(request, env);
    if (route === "/admin" || route === "/admin/") {
      const denied = await adminAccess(request, env, true);
      if (denied) return denied;
      const admin = assetResponse("/admin.html");
      admin.headers.set("cache-control", "no-store");
      return admin;
    }
    if (route === "/admin/login") {
      if (await isAdmin(request, env)) return Response.redirect(new URL("/admin", request.url), 302);
      const login = assetResponse("/admin-login.html");
      login.headers.set("cache-control", "no-store");
      return login;
    }
    if (route === "/api/admin/login" || route === "/api/admin/logout") {
      try { return route.endsWith("/login") ? await adminLogin(request, env) : await adminLogout(request); }
      catch (error) { console.error("Admin authentication error", String(error)); return json({ error: "Service unavailable" }, 503); }
    }
    if (route.startsWith("/api/admin/")) {
      try { return await adminApi(request, env, route); }
      catch (error) { console.error("Admin API error", String(error)); return json({ error: "Service unavailable" }, 503); }
    }
    if (route.startsWith("/media/")) {
      const id = route.slice(7);
      if (!/^[a-f0-9-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
      const object = await env.BUCKET.get(id);
      if (!object) return new Response("Not found", { status: 404 });
      const type = object.httpMetadata?.contentType || "application/octet-stream";
      const headers = { "content-type": type, "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff", "content-disposition": type === "application/pdf" ? "attachment" : "inline" };
      if (type === "image/svg+xml") headers["content-security-policy"] = "sandbox; default-src 'none'; style-src 'unsafe-inline'";
      return new Response(object.body, { headers });
    }
    if (route.startsWith("/assets/")) return assetResponse(route) || new Response("Not found", { status: 404 });
    if (route === "/favicon.ico") return assetResponse("/assets/strategic-logo.svg") || new Response("Not found", { status: 404 });
    const articleMatch = route.match(/^\/(en|ru|uz)\/news\/([a-z0-9-]+)$/);
    if (articleMatch) {
      const [, articleLang, articleSlug] = articleMatch;
      if (!articleSlugValid(articleSlug)) return new Response("Not found", { status: 404 });
      const row = await env.DB.prepare("SELECT slug,data,published_at FROM cms_articles WHERE slug = ? AND status = 'published'").bind(articleSlug).first();
      if (!row) return new Response("Not found", { status: 404 });
      return renderArticlePage(request, { slug: row.slug, data: JSON.parse(row.data), publishedAt: row.published_at }, articleLang, await getSettings(env));
    }
    const match = route.match(/^\/(en|ru|uz)(?:\/(.*))?$/);
    const lang = match ? match[1] : "en";
    const path = match ? match[2] || "" : route.replace(/^\//, "");
    const slug = path === "" ? "index.html" : path;
    if (!validSlug(slug)) return new Response("Not found", { status: 404 });
    const page = await getPage(env, slug);
    if (page?.status.startsWith("redirect:")) return Response.redirect(new URL(pathFor(lang, page.status.slice(9)), request.url), 301);
    if (page?.status === "draft") return new Response("Not found", { status: 404 });
    if (!isBuiltin(slug) && !page) return new Response("Not found", { status: 404 });
    const settings = await getSettings(env);
    const template = isBuiltin(slug) ? STATIC[`/${slug}`]?.text : renderCustomPage(slug, page, lang);
    if (!template) return new Response("Not found", { status: 404 });
    const articles = slug === "index.html" || slug === "news.html" ? await publishedArticles(env, slug === "index.html" ? 3 : 24) : [];
    return renderHtml(request, template, slug, lang, page, settings, articles);
  },
};
