// Scaffold a new blog post: `npm run new -- "My Post Title"`
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const POSTS = path.join(root, "posts");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new -- "My Post Title"');
  process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const filename = `${date}-${slug}.md`;
const filepath = path.join(POSTS, filename);

if (fs.existsSync(filepath)) {
  console.error(`Already exists: posts/${filename}`);
  process.exit(1);
}

const template = `---
title: "${title}"
date: ${date}
description: "One-line summary shown on the blog index."
---

Write your post here in Markdown. Then run \`npm run build\`.
`;

fs.mkdirSync(POSTS, { recursive: true });
fs.writeFileSync(filepath, template);
console.log(`Created posts/${filename}`);
