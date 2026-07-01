# Personal site

A hand-written static personal site with a Markdown blog. No framework — plain
HTML and CSS, plus a tiny build script that wraps pages in a shared layout and
converts Markdown posts to HTML. Everything is authored locally and deployed as
static files; nothing is edited through a web page.

## Layout

```
src/
  layout.html        # the one shared shell (head, nav, footer) every page uses
  post.html          # template for a single blog post
  pages/             # hand-written page bodies (home, projects, about)
  assets/styles.css  # hand-written CSS
posts/               # blog posts in Markdown (you author these)
build.js             # converts everything into dist/
new-post.js          # helper to scaffold a new post
dist/                # build output — this is what gets deployed (gitignored)
```

## Everyday workflow

```bash
npm install                      # first time only

npm run new -- "My Post Title"   # scaffolds posts/YYYY-MM-DD-my-post-title.md
# ...write the post in Markdown...

npm run build                    # regenerate the site into dist/
```

Preview locally by serving `dist/` with any static server, e.g.:

```bash
npx --yes serve dist    # or: python3 -m http.server -d dist 8099
```

## Adding a new section (e.g. a new feature page)

1. Create `src/pages/whatever.html` with a body and optional metadata comments:
   ```html
   <!-- title: Whatever — Your Name -->
   <!-- description: Short description for search engines. -->
   <section class="section">
     <h1>Whatever</h1>
     ...
   </section>
   ```
2. Add a link to it in the nav inside `src/layout.html`.
3. `npm run build`.

The blog is just one such section; the site is built to grow this way.

## Deploying to Hostinger

The site is fully static, so it deploys with Hostinger's **static website** tool
(via the Hostinger MCP server configured in `.mcp.json`).

1. `npm run build`
2. Ask Claude to deploy: it zips `dist/` and calls the Hostinger
   `deploy static website` tool with your domain. (Requires a website/domain on
   your Hostinger account — a free `*.hostingersite.com` subdomain works.)

### MCP prerequisites (see git history for details)

- `HOSTINGER_API_TOKEN` must be set — locally via `export`, and in the web
  environment config for Claude Code on the web.
- For web sessions, add `api.hostinger.com` to a **Custom** network allowlist.
