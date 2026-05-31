# Ops scripts

Operational scripts that run outside the Next.js / Strapi apps.

| Script | What it does | Trigger |
|---|---|---|
| `push-openai-feed.sh` | Pushes the OpenAI Agentic Commerce product feed to OpenAI's SFTP server. | Daily via Coolify Scheduled Task or system cron (recommended 03:00 UK) |

See `Docs/OPENAI_AGENTIC_COMMERCE_SETUP.md` for full setup instructions.
