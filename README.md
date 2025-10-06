# Mastra + Cloudflare Workers — Multi-Agent Example

This repository is a small example showing how to wire Mastra agents into a Cloudflare Worker using the `workers-ai-provider` and `hono` for routing. It demonstrates a small multi-agent workflow with three agents that collaborate to produce polished blog copy.

## Highlights

- Cloudflare Workers runtime (Wrangler)
- Agent pattern using `@mastra/core`
- `workers-ai-provider` for model integration (configured to use a Mistral model by default)
-- Simple REST routes with `hono` (health + publisher endpoint)

## Project layout (key files)

```
src/
 ├─ mastra/
 │   ├─ agents/
 │   │   ├─ copywriterAgent.ts   # Copywriter agent factory (writes blog copy)
 │   │   ├─ editorAgent.ts       # Editor agent factory (edits blog copy)
 │   │   └─ publisherAgent.ts    # Publisher agent (coordinates tools/agents)
 │   └─ providers/
 │       └─ workersai.ts         # Worker AI model factory
 ├─ routes/
 │   ├─ health.ts                # Health check route
 │   └─ publisher.ts             # /publisher route that calls the publisher agent
 ├─ app.ts                       # Hono app wiring
 └─ index.ts                     # Worker entry (bindings)
```

## Requirements

- Node.js (LTS recommended)
- pnpm (used for scripts in this project)
- Wrangler (Cloudflare CLI) for local development and deploy

## Install

```bash
pnpm install
```

## Environment

This project expects a Workers binding named `AI` which points to the Cloudflare AI Gateway or model binding. Typical environment variables / bindings you will want to set in your Wrangler configuration or Cloudflare dashboard:

- AI (Workers AI binding) — required. Example binding name: `AI`.
- CLOUDFLARE_ACCOUNT_ID — optional for some Wrangler commands.

Note: `src/mastra/providers/workersai.ts` uses the `AI` binding and returns a model handle for `@hf/nousresearch/hermes-2-pro-mistral-7b` by default. Change the model id or options there if you need a different model.

## Scripts

From `package.json`:

- pnpm dev — run `wrangler dev` (local dev server)
- pnpm deploy — run `wrangler deploy` (publish)
- pnpm test — run `vitest`
- pnpm tail — `wrangler tail`

## Routes

Health check

```
GET /health
```

Publisher (multi-agent workflow)

```
POST /publisher
Content-Type: application/json

{
	"message": "Write a blog post about React JavaScript frameworks. Only return the final edited copy."
}
```

What happens

- `publisher` creates a Publisher agent that has two tools: `copywriterTool` and `editorTool`.
- Internally the Publisher agent calls the Copywriter agent (via `copywriterTool`) to generate a draft, then calls the Editor agent (via `editorTool`) to edit/refine the draft, and finally returns the edited copy.

Response (example):

```json
{
	"reply": "<final edited blog post copy>",
	"message": "Write a blog post about React JavaScript frameworks. Only return the final edited copy."
}
```

## Provider details

The model factory is in `src/mastra/providers/workersai.ts` which uses `workers-ai-provider`:

- It expects to be passed the Worker binding `AI` (via Hono context env: `c.env.AI`).
- The factory currently returns `workersai('@hf/nousresearch/hermes-2-pro-mistral-7b', { safePrompt: true })`.

If you need to use a different provider or model, update that file.

## Development tips

- Start local dev: `pnpm dev` (this runs `wrangler dev`)
- Test the route locally with curl or an HTTP client against the dev server (default port 8787)

Example curl (publisher):

```bash
curl -X POST http://localhost:8787/publisher \
	-H "Content-Type: application/json" \
	-d '{"message":"Write a blog post about React JavaScript frameworks. Only return the final edited copy."}'
```

## Troubleshooting

 - If you see errors about unsupported providers like `workersai.chat`, switch to the direct `workersai` binding or configure a supported provider.
 - Ensure your Worker `AI` binding is present in `wrangler.toml` or your Cloudflare dashboard.

## License

MIT
