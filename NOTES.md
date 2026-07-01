# Project notes / handoff

Working state so a fresh session (or future me) can pick up without the chat history.

## What this repo is

A hand-written static personal site for **cmdottie.com** with a Markdown blog.
Framework-free HTML/CSS + a small `build.js`. See `README.md` for the full
structure and the local-authoring → build → deploy workflow.

- Branch: `claude/mcp-server-web-claude-35r9fz`
- Build: `npm install && npm run build` → output in `dist/` (gitignored)
- New posts: `npm run new -- "Title"` then `npm run build`

## Current status

- [x] Site scaffolded (home, projects, about, blog) with placeholder content
- [x] Markdown blog pipeline working (example post: `posts/2026-06-30-hello-world.md`)
- [x] Hostinger MCP declared in `.mcp.json` (uses `${HOSTINGER_API_TOKEN}`)
- [x] Web environment fixed: `HOSTINGER_API_TOKEN` set as an env var, and
      `developers.hostinger.com` + `api.hostinger.com` added to Custom network
      allowlist. (Env vars only load at session start — needs a fresh session.)
- [ ] Fetch Hostinger server IP
- [ ] Point `www.cmdottie.com` at Hostinger (DNS)
- [ ] Deploy `dist/` to Hostinger + enable SSL
- [ ] Replace placeholder content with real name/bio/projects

## Next step: DNS for www.cmdottie.com

Goal: point **www.cmdottie.com** at the Hostinger site.

- DNS is managed in the **Microsoft 365 admin center** (admin.microsoft.com →
  Settings → Domains → cmdottie.com → DNS records).
- The domain **uses M365 for email** — only ADD the new `www` record; do NOT
  touch existing `MX`, `SPF/TXT`, `autodiscover`, DKIM, or `_dmarc` records.
- User will add the record themselves; they just need the IP.

Record to add (once IP is known):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `www` | `<Hostinger server IP>` | 1 hour |

To get the IP: with a fresh session (token now loads), call the Hostinger MCP
`hosting_listWebsitesV1`, or read it from hPanel (Hosting → Manage → Server IP).

(Optional, not requested yet: apex `cmdottie.com` → A record to same IP + a
redirect to www, if the bare domain should also resolve.)

## Deploy (when ready)

Site is fully static → use Hostinger's `deploy static website` tool:
1. `npm run build`
2. Zip `dist/` and deploy via MCP `hosting_deployStaticWebsite` (domain + archive).
   Requires the domain/website to exist on the Hostinger plan first.
3. Enable free SSL for cmdottie.com in hPanel.

## Note on the web session vs local CLI

The Hostinger MCP only works where it can reach the API AND has the token:
- **Local CLI:** token via `export HOSTINGER_API_TOKEN=...`; no network limits.
- **Claude Code on the web:** token via environment-variable config +
  `developers.hostinger.com` on the Custom network allowlist (both done above).
  A running session must be restarted for a newly-added token to load.
