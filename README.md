# AISHIP: PromptShip (Video Edition)

> **Build Fast. Ship AI SaaS.**
>
> 当前版本�?*PromptShip MVP** - 专注�?AI 视频分镜提示词生成的垂直 SaaS 模板�?
## 🎯 项目定位

PromptShip 是一�?**"AI 视频提示词广�?+ 智能分镜导演"** 平台�?它旨在帮助用户将模糊的创意转化为好莱坞级的视频分镜脚本，适用�?Sora, Kling, Runway, Veo 等主流视频生成模型�?
**核心价值：**
1.  **Free Prompt Plaza (SEO 引流)**: 高质量的视频提示词库，配�?Flux 生成的电影级预览图，吸引用户点击复制�?2.  **AI Director Studio (付费核心)**: 智能编剧与分镜工具。输入一个想法，输出一套包含运镜、光影、音效的完整拍摄脚本。支持长篇连载模式�?
---

## 🏗�?核心架构

基于 Next.js 全栈架构，旨在实�?**"一次开发，无限复用"** �?Micro-SaaS 模板�?
- **Frontend**: Next.js 15 (App Router) + TailwindCSS + Shadcn/UI
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Auth**: NextAuth.js (Google / Email)
- **Payment**: Creem / Stripe (支持 Credits 积分�?
- **AI Engine**:
  - **Logic**: LLM (DeepSeek/OpenAI via OpenRouter) - 负责编剧与分镜拆�?  - **Vision**: Fal.ai (Flux) - 负责生成分镜预览�?(Keyframes)
- **Storage**: Cloudflare R2 (用于存储预览图，降低流量成本)

---

## 🚦 当前状�?(Status)

DB schema: schema_bootstrap.sql applied (9 tables).
**�?代码开发完�?*�?- 前端页面 (首页, 详情�? 工作�? 用户中心) 已就绪�?- 后端 API (`/api/tools/run`) 已连接真�?AI 模型�?- 数据库基座建议以 ShipAny 2.6 �?schema 为准（更适合做可复用 SaaS 模板验证）�?
**�?等待配置**�?- 需要连接一个新�?Supabase 数据库�?- 需要在 `.env.local` 中填�?API Keys�?
---

## 🛠�?从零开始配置指�?## �ƻ�����\r\n\r\n\r\nEnglish-only UI: all user-facing text and messages must be in English (target market is EU/US).\r\nһ�仰Ŀ�꣺��һ����ʾ�ʷ־� SaaS ����վ��������֤�ջ������ѻ�Ա/֧��/����/���м�¼����Ϊ�ɸ���ģ�塣

ģ�廯������ͨ�ò㸴�ã���¼/��Ա/����/֧��/���м�¼/ͨ��ҳ�棩��ҵ�����滻�������߼�/�۷ֹ���/ҳ�沼��/��Ҫ�±�����

## �����

- ����ִ�бջ�����ͨ��/api/tools/run 200��
- B ·�����ݿ��������أ�schema_bootstrap.sql / 9 �ű���
- ��¼д�⣨ShipAny users �ṹ��
- /account ��ȡ��������
- ��Ҫҳ��ɷ��ʣ�/ /login /account /pricing /library��

## �������ƻ�`r`n`r`n1. ����Ȩ����۷ѣ�Basic ���ı���Pro ������ Flux Ԥ�����۷ѹ�����أ�20 + 30��`r`n2. �����������ˣ�Webhook �������ڸ��������׷��`r`n3. ��ʾ�ʿ����ݻ���`public_prompts` ���� + `/library` ��ʵ����`r`n4. ģ�廯���󣺹��߲���� + ��ѡ�±� + ���컯�Ʒ�`r`n`r`n### Step 3: 配置 Google 登录 (NextAuth)
1. 访问 [Google Cloud Console](https://console.cloud.google.com/) -> API & Services -> Credentials�?2. 创建 "OAuth Client ID" (Web Application):
   - **Authorized Origins**: `http://localhost:3000`
   - **Authorized Redirect URIs**: `http://localhost:3000/api/auth/callback/google`
3. 获取 Client ID �?Secret，填�?`.env.local`�?   - *注意：本项目使用 NextAuth.js 独立处理登录，无需�?Supabase Authentication 菜单中开�?Google 登录�?

### Step 4: 配置环境变量 (.env.local)
复制 `.env.example` �?`.env.local`，并填入�?
```bash
# Database (推荐使用 6543 Pooler 端口)
DATABASE_URL="postgresql://postgres:[user]:[pass]@[host]:6543/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[user]:[pass]@[host]:6543/postgres?sslmode=require"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<运行 openssl rand -base64 32 生成>"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

\r\n# Payment (Creem)
PAY_PROVIDER="creem"
CREEM_ENV="test"
CREEM_API_KEY="..."
CREEM_WEBHOOK_SECRET="..."
CREEM_PRODUCT_BASIC_ID="prod_basic_id"
CREEM_PRODUCT_PRO_ID="prod_pro_id"
# Allowlist product IDs (optional)
CREEM_PRODUCTS='["prod_basic_id","prod_pro_id"]'
NEXT_PUBLIC_PAY_SUCCESS_URL="/tools/video-storyboard"
NEXT_PUBLIC_PAY_FAIL_URL="/pricing"
NEXT_PUBLIC_PAY_CANCEL_URL="/pricing"
NEXT_PUBLIC_WEB_URL="http://localhost:3000" 用于生成预览�?```

### Step 5: 启动与测�?1. 安装依赖：`npm install`
2. 启动服务：`npm run dev` (如需代理：`$env:HTTP_PROXY="http://127.0.0.1:7890"; npm run dev`)
3. **测试流程**�?   - 访问 `http://localhost:3000/api/health/db` 确认数据库连通�?   - 访问 `/login` �?Google 登录�?   - 登录成功后跳转到 `/account`，Header 顶部会显示当�?credits�?   - �?Supabase SQL Editor 给自己加点分�?     ```sql
     INSERT INTO credits (user_uuid, trans_no, trans_type, credits) 
     -- 注意：credits 在数据库里按 micro-units 存储（SCALE=10�?     -- 例如给用户加 1000 credits，写�?10000
     VALUES ((SELECT uuid FROM users LIMIT 1), 'TEST_GIFT', 'bonus', 10000);
     ```
   - �?`/tools/video-storyboard` 生成第一个分镜�?
> 如果你使�?Clash Verge 且必须开启“虚拟网�?TUN”，请避�?`*.supabase.co`/`*.pooler.supabase.com` 被解析到 `198.18.0.x`（Fake-IP）。推荐：DNS 增强模式�?`redir-host`，并�?`*.supabase.co`、`*.supabase.com`、`*.pooler.supabase.com` 加入 Fake IP 过滤�?>
> 注意：Pooler 的主机名通常�?`aws-...pooler.supabase.com:6543`，不�?`db.<project-ref>.supabase.co:6543`�?
---

## 📂 目录结构说明

```
src/
├── app/
�?  ├── api/            # 后端 API 路由
�?  ├── account/        # 用户中心 (Dashboard)
�?  ├── prompt/         # 提示词详情页 [slug]
�?  ├── tools/          # 工具前端页面 (�?video-storyboard)
�?  ├── page.tsx        # 首页 (SaaS Landing Page)
�?  └── layout.tsx      # 全局布局 (�?Header)
├── components/         # UI 组件
├── db/                 # 数据�?Schema & Config
├── tools/              # AI 工具核心逻辑 (Registry & Definitions)
�?  ├── registry.ts     # 工具注册�?�?  └── video-storyboard.ts # AI 导演逻辑
└── lib/                # 通用工具函数
```

---

## 📝 License

Private Repository. All rights reserved.








## ֧���ջ����Լ�¼��Creem / product_id��

### �ؼ�����
- Creem REST API ֧�� `product_id` ֱ�Ӵ��� checkout������Ҫ `price_id`
- `cancel_url` �� Creem REST �����ӿڻᱨ����`property cancel_url should not exist`
- `CREEM_ENV` ֻ���� `test` �� `production`
- `product_id` ӳ�����׷������� Creem ���ص� `product.name` �� `price` Ϊ׼У��

### ��Ҫ��������
```
PAY_PROVIDER="creem"
CREEM_ENV="test"
CREEM_API_KEY="..."
CREEM_WEBHOOK_SECRET="..."
CREEM_PRODUCT_BASIC_ID="prod_basic_id"
CREEM_PRODUCT_PRO_ID="prod_pro_id"
CREEM_PRODUCTS='["prod_basic_id","prod_pro_id"]'
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_PAY_SUCCESS_URL="/tools/video-storyboard"
NEXT_PUBLIC_PAY_FAIL_URL="/pricing"
NEXT_PUBLIC_PAY_CANCEL_URL="/pricing"
```

### �ؼ�ʵ�ֵ�
- `createCheckout` ʹ�� REST��`POST https://test-api.creem.io/v1/checkouts`��ֻ�� `product_id`
- �ص�·��ʹ�ã�`/api/pay/callback/creem?request_id=...`
- �ص��׶β�ǿУ�� `request_id` ����Ӧһ�£����� Creem �����Ե���ʧ��
- �������� webhook��`/api/pay/notify/creem`���������ù����ص���

### ������
- �� `cancel_url` �� 400��ɾ�����ֶ�
- `CREEM_ENV=development` ��Ч������ `test` / `production`
- `product_id` ����ӳ�䣺���� `paid_detail.product.name` ��۸������У��
- ȱʧ `@/models/affiliate` ���»ص� 500���Ѳ�

Pro preview verified: Pro can generate Flux preview image, total cost 50 (20 + 30), credits deducted correctly.

Webhook test events: Creem test webhooks return sample data and do not create credits; only real paid webhooks with metadata will insert records.

Tool metadata: shared definitions live in src/tools/definitions.ts (pricing, preview permissions, plan gating).
