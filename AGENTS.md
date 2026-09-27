# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Backend Functions

- `autonomousOrchestrator` — 24/7 assembly-line tick: advances projects one stage, runs validation gates, writes audit receipts.
- `reconciler` — deterministic reconciliation heartbeat: compares expected state (validation plans, packet statuses, session readiness) against actual state (benchmark evidence, receipt statuses). Updates receipts from real evidence, recalculates readiness scores, detects drift, emits intelligence signals.
- `capabilityDispatcher` — capability wiring: maps registered Capabilities to executors (BASE44, CODEX, GITHUB_AGENT, VERCEL, SUPABASE, etc.), dispatches ready work packets to swarm agents, blocks packets with missing capabilities, creates discovery jobs for gaps.
- `metaAgentAnalyze` — LLM-powered goal decomposition: classifies intent/system type, matches arsenal assets, detects capability gaps, generates ordered work packets with validation plans.
- `benchmarkRunner` — deterministic URL benchmarking against 5 quality gates (static, functional, security, visual, operational).
- `supabaseExec` — runs SQL against the connected Supabase project (admin-only).
- `webScraper` — scrapes a public URL for research and lead generation.
- `chatCompletion` — LLM chat completion.
- `driveManager` — Google Drive file operations.
- `mcpGenerator` — generates MCP server configuration.

## Scheduled Workflows

- `Autonomous Tick` (every 5 min) — chains: orchestrator → reconciler → capabilityDispatcher.
- `Reconciliation Heartbeat` (every 5 min) — standalone reconciler cycle.
- `Capability Dispatch` (every 5 min) — standalone capability dispatch cycle.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

## Operating Contract

- `base44/entities/OperatingContract.jsonc` defines governance contracts; `base44/data/OperatingContract.json` holds the requested verbatim v1.0.0 record as import-ready data, NOT an automatically applied seed. No live insertion has been verified.
- Once the entity is deployed and an authorized backend is connected, query `base44.entities.OperatingContract.filter({ contract_id: 'SM-CAPABILITY-EXTENSION-2026-09-27', version: '1.0.0' })` before inserting the single data record. If an identical record exists, skip insertion; if it differs or duplicates exist, stop for review rather than overwrite governance history. Re-fetch and compare every field after insertion.
- Hub agents, authorized GPT handoffs, and control-plane code can query the standard entity API by `contract_id` and `status: 'ACTIVE'`. The autonomous operator has read-only entity tool access. This adds query access, not new execution authority or automatic policy enforcement.
- `tags` is deliberately a comma-separated string to match the requested schema.

## Sandbox Verification

- The existing Base44 compose runs bind-mounted source through Vite on port 3000. `curl http://localhost:3000/src/main.jsx` verifies live source delivery.
- This sandbox currently renders the frontend but lacks `VITE_BASE44_APP_ID` and `VITE_BASE44_APP_BASE_URL`; the public-settings request uses `undefined` and returns 404. A rendered home page is not evidence of a connected backend. Do not claim entity persistence based on repository JSON alone.
