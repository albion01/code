# Project notes / handoff

Working state so a fresh session (or future me) can pick up without the chat history.

## What this repo is

A hand-written static personal site for **cmdottie.com** with a Markdown blog.
Framework-free HTML/CSS + a small `build.js`. See `README.md` for the full
structure and the local-authoring → build → deploy workflow.

- Branch: `claude/mcp-server-web-sfadxh` (identical content to the older
  `claude/mcp-server-web-claude-35r9fz`; work continues here)
- Build: `npm install && npm run build` → output in `dist/` (gitignored)
- New posts: `npm run new -- "Title"` then `npm run build`

## Current status

- [x] Site scaffolded (home, projects, about, blog) with placeholder content
- [x] Markdown blog pipeline working (example post: `posts/2026-06-30-hello-world.md`)
- [x] Hostinger MCP declared in `.mcp.json` (uses `${HOSTINGER_API_TOKEN}`)
- [x] Web environment fixed: `HOSTINGER_API_TOKEN` set as an env var, and
      `developers.hostinger.com` + `api.hostinger.com` added to Custom network
      allowlist. (Env vars only load at session start — needs a fresh session.)
- [x] **Website created on the plan** (2026-07-01). See "Hosting account facts".
- [x] **Fetched Hostinger server IP: `82.197.82.96`** (see method below).
- [ ] Point `www.cmdottie.com` at Hostinger (DNS) — user adds the A record.
- [ ] Deploy `dist/` to Hostinger — **blocked by egress**, see "Deploy" below.
- [ ] Enable SSL for cmdottie.com (after DNS resolves).
- [ ] Replace placeholder content with real name/bio/projects.

## Hosting account facts (as of 2026-07-01)

- Plan/order: `hostinger_business`, order id `1006448178`, status active.
- Website: `cmdottie.com` (main vhost), created on datacenter **`boston`**.
- Hosting username: `u151324086`.
- Server: **`srv1718`** → `srv1718.hstgr.io` → **`82.197.82.96`**.
- Doc root: `/home/u151324086/domains/cmdottie.com/public_html`.
- Free preview subdomain generated during setup:
  `goldenrod-hornet-380339.hostingersite.com` (CDN-fronted, *not* the account
  server IP — do not use it for the A record).

## Next step: DNS for www.cmdottie.com

Goal: point **www.cmdottie.com** at the Hostinger site.

- DNS is managed in the **Microsoft 365 admin center** (admin.microsoft.com →
  Settings → Domains → cmdottie.com → DNS records).
- The domain **uses M365 for email** — only ADD the new `www` record; do NOT
  touch existing `MX`, `SPF/TXT`, `autodiscover`, DKIM, or `_dmarc` records.
- User adds the record themselves.

Record to add:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `www` | `82.197.82.96` | 1 hour |

How the IP was obtained: the hosting API exposes no "server IP" field. The
account's server hostname (`srv1718`, revealed by the deploy upload endpoint
`srv1718-files.hstgr.io`) resolves to `82.197.82.96`. Cross-check in hPanel
(Hosting → Manage → Server IP / server details) before relying on it.

(Optional, not requested yet: apex `cmdottie.com` → A record to same IP + a
redirect to www, if the bare domain should also resolve.)

## Deploy (blocked on network allowlist)

Site is fully static and **already builds** (`npm run build` → `dist/`, 3 pages
+ 1 post). Deploy path is ready but the upload is blocked by egress policy:

- `hosting_deployStaticWebsite` uploads to `srv1718-files.hstgr.io`, which the
  session's egress proxy **denies with 403** (host not on the Custom network
  allowlist).
- **Fix:** add `srv1718-files.hstgr.io` (or broaden to `*.hstgr.io`) to the
  Custom network allowlist, then start a **fresh** web session and deploy:
  1. `npm run build`
  2. Zip the **contents** of `dist/` (so `index.html` is at the archive root).
  3. `hosting_deployStaticWebsite` with `domain: cmdottie.com` + the archive.
- Then enable free SSL for cmdottie.com in hPanel (after DNS resolves).

## Note on the web session vs local CLI

The Hostinger MCP only works where it can reach the API AND has the token:
- **Local CLI:** token via `export HOSTINGER_API_TOKEN=...`; no network limits.
- **Claude Code on the web:** token via environment-variable config +
  `developers.hostinger.com` on the Custom network allowlist (both done above).
  A running session must be restarted for a newly-added token to load.
