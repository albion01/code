# MCP configuration

This repo declares MCP servers in [`.mcp.json`](./.mcp.json) so they load in both
the Claude Code CLI (project scope) and Claude Code on the web (cloned with the repo).

## Hostinger MCP server

Defined as a stdio server launched via `npx`. The cloud environment ships Node + npx,
so it runs there as well as locally.

### Required setup

1. **API token (do not commit it).** The config reads `${HOSTINGER_API_TOKEN}` instead
   of a hardcoded value.
   - **Local CLI:** export it in your shell, e.g. `export HOSTINGER_API_TOKEN=...`
   - **Claude Code on the web:** add `HOSTINGER_API_TOKEN` as an environment variable in
     the web environment's configuration (claude.ai → environment settings). Note there
     is no dedicated secrets store yet; env vars are visible to anyone who can edit the
     environment.

2. **Network access (web only).** Outbound traffic from cloud sessions goes through
   Anthropic's security proxy. The default **Trusted** policy allows package registries
   (so `npx` can fetch the package) but **not** the Hostinger API. Switch the environment
   to **Custom** network access and add Hostinger's API host to **Allowed domains**:

   ```
   api.hostinger.com
   ```

   (Confirm the exact host the `hostinger-api-mcp` package calls in Hostinger's docs.)
