---
title: "Hello, world"
date: 2026-06-30
description: "The first post — how this site works and what's coming."
---

Welcome to the blog. This post was written locally in Markdown, converted to
HTML by the build script, and deployed as a static file. Nothing here is edited
through a web page.

## How I write posts

1. Run `npm run new -- "My Post Title"` to create a dated Markdown file in `posts/`.
2. Write the post in Markdown.
3. Run `npm run build` to regenerate the site into `dist/`.
4. Deploy `dist/` to Hostinger.

## Markdown works as you'd expect

You can use **bold**, *italic*, `inline code`, and [links](/about.html).

> Block quotes look like this.

```js
// Code blocks are supported too.
console.log("hello");
```

That's it. Delete this post whenever you're ready to make it your own.
