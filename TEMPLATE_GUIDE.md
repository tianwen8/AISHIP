# Cineprompt Template Guide (Reusable SaaS Baseline)

This guide documents how to extend the template with new tools and optional tables.

## 1) Tool Registry

Location:
- Tool metadata: `src/tools/definitions.ts`
- Tool registry: `src/tools/registry.ts`
- Tool UI: `src/app/tools/[toolId]/page.tsx`
- Runner API: `src/app/api/tools/run/route.ts`

Steps to add a new tool:
1) Add metadata to `TOOL_DEFINITIONS` with pricing and preview rules.
2) Implement a tool class (e.g. `src/tools/my-tool.ts`) with `run()` logic.
3) Register the tool in `TOOL_REGISTRY`.
4) Add a UI page under `src/app/tools/<toolId>/page.tsx`.

## 2) Pricing and Plan Gating

Current logic:
- Plan tier is derived from latest paid order (Basic or Pro).
- Preview images are gated to Pro.
- Cost uses base + preview cost (see `src/tools/definitions.ts`).

Update rules:
- Change base/preview costs in tool metadata.
- If a tool should be free or Pro-only, handle it in `getToolCost()`.

## 3) Prompt Spec (Video Storyboard)

We store model-neutral JSON in `public_prompts.content_json`:
- `title`, `logline`, `style_lock`, `characters`, `scene_prompt`
- `shots[]` with `duration`, `transition`, `camera_movement`, `prompt_en`
- `master_prompt`, `negative_prompt`, `continuity_notes`

This keeps prompts reusable across video models.

## 4) Optional Schema Add-ons

Required tables (MVP):
- `users`, `credits`, `orders`, `tool_runs`, `public_prompts`

Optional add-ons:
- `affiliates`, `apikeys`, `feedbacks`, `posts`

If you need new features, add tables to `schema_bootstrap.sql` and `src/db/schema.ts`.

## 5) Content Seeding

Seed script:
- `seed_public_prompts.sql`

Use this to preload video storyboard prompts for SEO and onboarding.
