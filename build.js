// Tiny hand-rolled static site builder.
// - Wraps hand-written page bodies (src/pages/*.html) in src/layout.html
// - Converts Markdown posts (posts/*.md) to HTML blog pages
// Output goes to dist/, which is what gets deployed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import matter from "gray-matter";

const root = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(root, "src");
const PAGES = path.join(SRC, "pages");
const POSTS = path.join(root, "posts");
const DIST = path.join(root, "dist");

const layout = fs.readFileSync(path.join(SRC, "layout.html"), "utf8");
const postTemplate = fs.readFileSync(path.join(SRC, "post.html"), "utf8");
const YEAR = String(new Date().getFullYear());

// Fill {{token}} placeholders. Unreplaced tokens are stripped at the end.
function render(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value ?? "");
  }
  return out;
}

function applyLayout(content, { title, description }) {
  return render(layout, {
    title: title || "Your Name",
    description: description || "",
    content,
    year: YEAR,
  });
}

// Read `<!-- title: ... -->` / `<!-- description: ... -->` hints from a page.
function extractMeta(html) {
  const meta = {};
  const get = (name) => {
    const m = html.match(new RegExp(`<!--\\s*${name}:\\s*(.*?)\\s*-->`, "i"));
    return m ? m[1] : undefined;
  };
  meta.title = get("title");
  meta.description = get("description");
  const body = html.replace(/<!--\s*(title|description):.*?-->\s*/gi, "");
  return { meta, body };
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ----- Reset output -----
fs.rmSync(DIST, { recursive: true, force: true });
ensureDir(DIST);

// ----- Copy static assets -----
const assetsSrc = path.join(SRC, "assets");
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, path.join(DIST, "assets"), { recursive: true });
}

// ----- Build hand-written pages -----
let pageCount = 0;
for (const file of fs.readdirSync(PAGES)) {
  if (!file.endsWith(".html")) continue;
  const raw = fs.readFileSync(path.join(PAGES, file), "utf8");
  const { meta, body } = extractMeta(raw);
  fs.writeFileSync(path.join(DIST, file), applyLayout(body, meta));
  pageCount++;
}

// ----- Build blog -----
const blogDir = path.join(DIST, "blog");
ensureDir(blogDir);

let posts = [];
if (fs.existsSync(POSTS)) {
  for (const file of fs.readdirSync(POSTS)) {
    if (!file.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(POSTS, file), "utf8");
    const { data, content } = matter(raw);

    // slug: front-matter override, else filename minus optional date prefix
    const slug =
      data.slug ||
      file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    // YAML turns an unquoted `date: 2026-06-30` into a Date object; handle both
    // that and a quoted string, falling back to a date prefix on the filename.
    let dateStr;
    if (data.date instanceof Date) {
      dateStr = data.date.toISOString().slice(0, 10);
    } else if (data.date) {
      dateStr = String(data.date).slice(0, 10);
    } else {
      dateStr = (file.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || "1970-01-01";
    }

    posts.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      dateStr,
      date: formatDate(dateStr),
      html: marked.parse(content),
    });
  }
}

// newest first
posts.sort((a, b) => (a.dateStr < b.dateStr ? 1 : -1));

// individual post pages -> dist/blog/<slug>/index.html
for (const post of posts) {
  const article = render(postTemplate, {
    title: post.title,
    date: post.date,
    isoDate: post.dateStr,
    content: post.html,
  });
  const dir = path.join(blogDir, post.slug);
  ensureDir(dir);
  fs.writeFileSync(
    path.join(dir, "index.html"),
    applyLayout(article, {
      title: `${post.title} — Your Name`,
      description: post.description,
    }),
  );
}

// blog index -> dist/blog/index.html
const items = posts
  .map(
    (p) => `      <li>
        <a class="post-title" href="/blog/${p.slug}/">${p.title}</a>
        <p class="post-meta"><time datetime="${p.dateStr}">${p.date}</time></p>
        ${p.description ? `<p class="post-excerpt">${p.description}</p>` : ""}
      </li>`,
  )
  .join("\n");

const blogIndexBody = `<section class="section">
  <h1>Blog</h1>
  <p class="lead">Written locally in Markdown, published as static HTML.</p>
  <ul class="post-list">
${items || "      <li>No posts yet.</li>"}
  </ul>
</section>`;

fs.writeFileSync(
  path.join(blogDir, "index.html"),
  applyLayout(blogIndexBody, {
    title: "Blog — Your Name",
    description: "Writing by Your Name.",
  }),
);

// ----- Strip any leftover placeholders -----
// (kept simple: pages/posts above already supply all tokens)

console.log(
  `Built ${pageCount} page(s) and ${posts.length} post(s) -> ${path.relative(root, DIST)}/`,
);
