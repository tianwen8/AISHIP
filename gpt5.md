# GPT-5 对本项目的理解（用于对齐 Gemini 最�?MVP 数据库）

本文件用于把 `aishipup.md` 的“PromptShip 提示词站 / 可复�?SaaS 模板”目标，和当前代码仓库的**真实实现**对齐，方便你�?Gemini 侧配置最小可用的数据库与联调路径�?
## 1. 产品目标（从 AI 视频项目 �?提示�?SaaS 模板�?
当前项目正在从“AI 视频生成/工作流”转向一个更轻、更可复用的 Micro‑SaaS 模板�?
- **免费层（SEO 引流�?*：Prompt Library（提示词广场），提供可复制的成品提示词与分镜示例�?- **付费层（核心变现�?*：Video Storyboard 生成器，把用户的故事想法转成结构化分�?+ 可直接复制到 Sora/Kling/Veo/Runway 的提示词（并记录到历史）�?- **模板化核�?*：平台层（Auth/支付/Credits/历史/Runner）只做一次；以后新增工具应尽量只新增一�?Tool 文件并注册�?
对应 `aishipup.md` 的最小站点结构：
- `/` Landing
- `/library` 提示词库
- `/prompt/[slug]` 提示词详情（SEO�?- `/tools/video-storyboard` 付费工具�?- `/pricing` 充�?订阅
- `/account` 用户中心（余�?历史�?- `/runs`（计划中：独立历史页；当前用 `/account` 承担�?
## 2. 当前本地运行后你会看到什么（现实状态）

### 2.1 不依�?DB 也能看的（目前主要是 mock�?- 首页：`src/app/page.tsx`
- Library 列表：`src/app/library/page.tsx`
- Prompt 详情：`src/app/prompt/[slug]/page.tsx`

### 2.2 依赖 DB/登录/密钥才能跑通的链路
- 登录态（NextAuth）：`src/auth/config.ts`
- 用户中心（会�?DB）：`src/app/account/page.tsx`
- 付费工具页（调用 Tool Runner）：`src/app/tools/video-storyboard/page.tsx`
- Tool Runner API：`src/app/api/tools/run/route.ts`
- 查询余额 API：`src/app/api/user/credits/route.ts`
- 支付：`src/app/api/checkout/route.ts` + `src/app/api/pay/notify/creem/route.ts`

### 2.3 遗留的“AI 视频工作�?画布”链路（可忽略，不是 PromptShip MVP 必需�?- `/api/generate`：`src/app/api/generate/route.ts`
- `/workspace/[runId]`：`src/app/workspace/[runId]/page.tsx`
- 这条链路�?PromptShip（`/tools/video-storyboard`）是两套产品线并存�?
## 3. PromptShip MVP 的“平台层”在代码里对应什�?
### 3.1 Auth（登录）
- 使用 NextAuth v5（JWT session）；用户信息会落库到 `users`（推荐与 ShipAny 2.6 基座一致：`uuid/email/nickname/avatar_url/signin_*...`�?- 登录后会�?JWT/session 里写�?`user.uuid/email/...`（见 `src/auth/config.ts`�?- 用户落库入口：`src/auth/handler.ts` �?`src/services/user.ts` �?`src/models/user.ts`

### 3.2 Credits（账�?余额�?- 账本表：`credits`
- 获取余额：`src/models/credit.ts#getCreditBalance`（注意：该层假设 DB 存的是“微单位”，见第 6 节）
- API：`src/app/api/user/credits/route.ts`

### 3.3 Billing（Creem�?- 创建 checkout：`src/app/api/checkout/route.ts`
- Webhook 入账：`src/app/api/pay/notify/creem/route.ts` �?`src/services/order.ts#updateOrder` �?`src/services/credit.ts#updateCreditForOrder`

### 3.4 Tool Runner + 历史
- Tool 注册：`src/tools/registry.ts`
- Runner API：`src/app/api/tools/run/route.ts`
- 执行历史：`tool_runs` �?+ `/account` 页面展示：`src/app/account/page.tsx`

## 4. “Tool Contract”与当前实现的差异（对齐点）

`aishipup.md` 期望�?Tool Contract（理想态）�?- `estimateCredits(input)` 动态计�?- `/tools/[toolId]` 通用工具�?+ `/api/tools/[toolId]/run` 通用 API
- `run(ctx,input) -> { output, usage, artifacts }`

当前代码的现实态：
- `ToolDefinition` 只有静�?`price`，没�?`estimateCredits`（`src/tools/registry.ts`�?- 只有一个统一 API：`POST /api/tools/run`（`src/app/api/tools/run/route.ts`�?- 工具页目前只实现�?`video-storyboard`：`/tools/video-storyboard`（`src/app/tools/video-storyboard/page.tsx`�?
结论：PromptShip MVP 可以先跑通闭环，但“可复用模板”还需要把 Tool Contract 补齐（后续迭代点）�?
## 5. 最�?MVP 的数据库：建议“最少要有哪些表�?
为了跑�?PromptShip 的最小闭环（登录→余额→生成→扣费→历史→支付回补），建�?Gemini 侧至少准备这些表�?
**必须（PromptShip MVP 主链路）**
- `users`：登录后落库的用户（�?ShipAny 2.6 基座为准，避�?NextAuth 标准表与自定�?users 混用�?- `credits`：积�?Power Units 账本（入�?扣减都写这里�?- `orders`：支付订单（Creem webhook 更新此表并触发入账）
- `tool_runs`：工具运行历史（`/account` 会读取）

**可选（SEO Prompt Plaza �?DB 时再加）**
- `public_prompts`：`/library`、`/prompt/[slug]` 未来从这里读（当前页面为 mock�?
**可忽略（PromptShip MVP 不需要）**
- `runs/graphs/jobs/artifacts/...`：属于旧 AI 视频工作流线（在 `src/db/schema-extended.ts` 中）

## 6. 重要提醒：credits/Power Units 的“单位体系”与本项目当前口�?
代码里同时存在两种用法：

- **A：Power Units 微单位体系（SCALE=10�?*：模型层明确写了“DB �?micro-units，展示层换算”（`src/models/credit.ts` + `src/services/pricing.ts`）�?
PromptShip MVP（提示词站）链路目前已对齐为�?- DB `credits.credits` �?micro-units（SCALE=10�?- 页面/接口展示�?`src/models/credit.ts#getCreditBalance` 换算为展示单�?- `/api/tools/run` 扣费写入 micro-units（`creditsToUnits(-tool.price)`�?
仍可能存在“旧 AI 视频工作流链路”的口径差异（例�?`/api/generate` / orchestrator / workspace 相关），如果你只�?PromptShip MVP，可先不启用那条链路�?
## 7. DB baseline (Route B): ShipAny base + PromptShip add-ons
- Use the combined schema in this repo: `schema_bootstrap.sql`
- It creates 9 tables: `affiliates`, `apikeys`, `credits`, `feedbacks`, `orders`, `posts`, `users`, `tool_runs`, `public_prompts`
- `MVP_SETUP.sql` is removed; do not reintroduce it (NextAuth default tables conflict with ShipAny users schema)
- Clean rebuild (testing DB only): `drop schema if exists public cascade; create schema public;`## 8. 最小联调用例（建议你在 Gemini 配好 DB 后按这个验证�?
1) `npm run dev` 打开 `/`、`/library`、`/prompt/[slug]`（确认基础 UI�?2) 打开 `/login`，用 Google/GitHub 登录成功（确�?`users` 表有记录，session 里有 `user.uuid`�?3) 给该 `user_uuid` 写入一�?credits（余�?> 工具价格），然后访问�?   - `/account`：能看到余额与空历史/历史列表
4) 打开 `/tools/video-storyboard` 输入 prompt 点击 Generate�?   - 成功：`tool_runs` 新增一条记录，`credits` 新增一条扣减记�?   - 失败（余额不足）：前端会提示并引导去 `/pricing`
5) �?`/pricing` 点击购买，确认：
   - `/api/checkout` 返回 checkout_url
   - Creem webhook 到达后，`orders` 状态更�?+ `credits` 入账（并确保幂等�?
## 9. 当前已知缺口（不阻塞你先建库，但需要明确）

- `tool_runs/public_prompts` 目前不在 `supabase/migrations/0000...` 里，Gemini 建库需要额外补表�?- credits 单位不一致：短期可通过“给足够大的余额”绕过，长期需要统一扣费/展示逻辑�?- `/runs` 独立历史页未实现：当前使�?`/account` 展示历史�?
## 10. Supabase 本地连接注意事项�?025-12 实测�?
### 10.1 Direct connection 可能�?IPv6-only

�?Supabase �?“Connect to your project�?弹窗中，如果 `Method = Direct connection` 出现 “Not IPv4 compatible / Some platforms are IPv4-only�?提示，说明该项目的直连地址可能只提�?IPv6（端�?`5432`）�?
本地网络/代理环境如果�?IPv6 不稳定，会导致应用侧出现 `CONNECT_TIMEOUT` �?“Name resolution failed”�?
**建议：优先使�?Pooler（IPv4 更友好）**
- �?`.env.local` �?`DATABASE_URL` 改为 Supabase 提供�?Pooler 连接串（通常端口 `6543`�?- 例如（示例，不要照抄密码）：`postgresql://postgres.<project-ref>:<PASSWORD>@aws-1-<region>.pooler.supabase.com:6543/postgres?sslmode=require`
- 注意：Pooler �?host �?Direct connection 不同；不要把 `db.<project-ref>.supabase.co` 直接换成 `:6543`

### [Gemini:] 10.2 代理/Clash 相关�?DNS/Fake-IP 会影响数据库域名解析

**实测有效配置�?025-12-18 验证�?*
- **连接方式**：必须使�?**Transaction Pooler (Port 6543)**�?- **Host 格式**：`aws-0-<region>.pooler.supabase.com`（具体在 Supabase Dashboard -> Settings -> Database -> Connection String -> Pooler 获取）�?  - �?错误：`db.<project-ref>.supabase.co:6543`（此域名通常不监�?6543�?- **环境变量**�?  ```bash
  DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
  ```
- **代理设置**：本地开发必须配置代理环境变量（�?`$env:HTTP_PROXY`），且代理软件需确保正确解析 `pooler.supabase.com` 域名（避�?Fake-IP 污染）�?
## [Gemini:] 11. Google 登录配置真相（NextAuth vs Supabase Auth�?
这是一个常见的混淆点：
- **本项目模�?*�?*仅使�?NextAuth.js** 处理 OAuth 握手�?- **Supabase 角色**：仅作为**纯数据库**存储 `users` 表�?- **配置要求**�?  1.  **不需�?* �?Supabase Authentication -> Providers 开�?Google�?  2.  **必须** �?Google Cloud Console 配置 Redirect URI: `.../api/auth/callback/google`�?  3.  **必须** �?`.env.local` 填入 `AUTH_GOOGLE_ID` �?`SECRET`�?  4.  登录成功后，NextAuth 会自动通过 Adapter 将用户信息写�?Supabase `users` 表�?
## [Gemini:] 12. 确认登录成功的排查方�?
如果前端显示登录了但数据库没记录�?1. **检�?Adapter 配置**：确�?`src/auth/index.ts` 中正确配置了 Drizzle Adapter�?2. **检查环境变�?*：确�?`DATABASE_URL` 在服务端运行环境（NextAuth 运行处）是生效的�?3. **手动验证 API**：访�?`/api/user/credits`，如果不返回 401 且返回了用户数据，说�?Session 握手成功�?4. **[重要] 重启服务**：修�?`.env.local`（如更换数据库）后，必须停止并重�?`npm run dev`，否则应用仍会连接旧数据库，导致“前端能登录但后台查不到数据”的怪相�?

\r\n## ֧�����ã�Creem / product_id ģʽ��
- PAY_PROVIDER=creem
- CREEM_ENV=test
- CREEM_API_KEY=...
- CREEM_WEBHOOK_SECRET=...
- CREEM_PRODUCT_BASIC_ID=prod_basic_id
- CREEM_PRODUCT_PRO_ID=prod_pro_id
- CREEM_PRODUCTS=["prod_basic_id","prod_pro_id"] (allowlist, optional)
- NEXT_PUBLIC_WEB_URL=http://localhost:3000
- NEXT_PUBLIC_PAY_SUCCESS_URL=/tools/video-storyboard
- NEXT_PUBLIC_PAY_FAIL_URL=/pricing
- NEXT_PUBLIC_PAY_CANCEL_URL=/pricing
## ֧���ջ����Լ�¼��Creem / product_id��
- REST ���� checkout ֱ�Ӵ� `product_id`������Ҫ `price_id`
- `cancel_url` ���ܴ���Creem �� 400
- `CREEM_ENV` ���� `test` / `production`
- `product_id` ӳ����˶� Creem ���ص� product.name/price
- �ص�ʹ�� `/api/pay/callback/creem?request_id=...`����ǿУ�� requestId ����
- ������ webhook `/api/pay/notify/creem` ���
Pro preview verified: Pro can generate Flux preview image, total cost 50 (20 + 30), credits deducted correctly.
\r\n�������ˣ�Webhook �������� Paid �Ҵ��� subscription.id���ᰴ�������������� credits���ݵȣ���\r\n
Webhook test events: Creem test webhooks return sample data and do not create credits; only real paid webhooks with metadata will insert records.

Tool metadata: shared definitions live in src/tools/definitions.ts (pricing, preview permissions, plan gating).

Homepage now renders public_prompts in a masonry grid (PromptHero-style) with search and tags.

Prompt detail now reads public_prompts by slug and renders prompt blocks, shot list, and copy buttons.

Free browsing: prompt detail is public; views/copies tracked via /api/prompts/view and /api/prompts/copy; copy does not require login.

Quick copy: library cards include a copy button that records copies without login.


## Update Log (2025-12-25)
- Next.js 15: server components await searchParams/params to avoid sync dynamic API error.
- Prompt detail copy flow: CopyButton now records copies internally (slug prop), no event handler crossing.
- CRLF literal fix in src/app/tools/video-storyboard/page.tsx.
- UI theme refresh: emerald/teal palette, Manrope + Space Grotesk fonts, hero background shapes.
- Pages normalized to PromptShip branding (login/contact/terms/privacy).

## Next Plan (Short)
1) Prompt library polish: curated tags, preview watermark, copy CTA A/B.
2) Prompt detail: related prompts + next/prev navigation.
3) Pricing clarity: explain Basic vs Pro usage and preview cost.
4) Template hardening: tool registry docs + optional schema add-ons.


## Plan Notes (Clarifications)
- Preview watermark = brand mark on prompt thumbnails/previews to prevent reupload and reinforce branding.
- Tag ops = fixed English tag taxonomy (8-12 tags) + tag landing entry on /library and / for discovery.
- Copy CTA A/B = test copy button text/placement to improve copy rate.
- Template abstraction status = partial (tool registry + pricing + plan gating done; docs + optional schema list still pending).


## Prompt Spec (MVP Template)
This is the model-neutral prompt structure stored in public_prompts.content_json.
```json
{
  "title": "...",
  "logline": "...",
  "style_lock": "...",
  "characters": [
    { "id": "hero", "anchors": "2-3 visual anchors" }
  ],
  "shots": [
    {
      "id": 1,
      "duration": 4,
      "description": "...",
      "camera_movement": "...",
      "composition": "...",
      "lighting": "...",
      "audio_sfx": "...",
      "prompt_en": "..."
    }
  ],
  "master_prompt": "...",
  "negative_prompt": "...",
  "continuity_notes": "..."
}
```

## Tag Taxonomy (Video)
Recommended fixed tags (8-12): cinematic, documentary, advertising, travel, fantasy, sci-fi, thriller, horror, drone, handheld, slow-motion, montage.


## Launch Checklist (Must)
1) Seed content: 20-50 high-quality video storyboard prompts (characters + scene + shots).
2) Copy flow stable: storyboard pack, character, scene, and shot copy all work.
3) Payment loop stable: subscription + renewal + credits deduction display in header/account.
4) SEO baseline: sitemap.xml and robots.txt reachable; prompt pages not empty.
5) English-only UI: scan for non-English strings in user-facing pages.

## Launch Checklist (Should)
- Tag landing pages populated and linked (video tag taxonomy).
- Prompt detail usage guide clear (character/scene first, then shots).
- AI Director outputs not empty for character/scene prompts.
- Safety wording or filter to reduce model rejection.


## Seed Data (Upsert)
Use seed_public_prompts_upsert.sql to safely refresh prompts without duplicate key errors.


## Update Log (2025-12-26)
- Prompt generation now uses fair-use limits (Basic 6/min 60/day, Pro 20/min 300/day).
- Pro preview credits are stored in preview_credits and reset monthly (PRO_PREVIEW_CREDITS).
- New SEO model routes: /sora-prompts, /veo-prompts, /kling-prompts, /seedream-prompts.
- "Copy storyboard JSON" moved into an Advanced exports collapsible.


## Brand (2025-12-26)
- Rename PromptShip to Cineprompt (UI + docs).
