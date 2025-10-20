# AI Video SaaS - AI 视频生成 SaaS 平台

基于 Next.js 15 + React Flow + ShipAny 模板构建的 AI 视频生成平台。

## 项目状态

### Phase 0: 项目初始化 ✅ 已完成（2025-10-16）

- [x] 创建项目基础目录结构（20+ 目录）
- [x] 从 ShipAny 复制核心文件（认证、积分、数据库）
  - ✅ NextAuth v5 + Google OAuth
  - ✅ 积分系统 (credit.ts)
  - ✅ Drizzle ORM + 7 张基础表
  - ✅ shadcn/ui 完整组件库 (40+)
  - ✅ Stripe 支付集成
- [x] 从节点 MVP 迁移 React Flow 画布代码
  - ✅ Canvas.tsx 可复用组件
  - ✅ 3 个示例节点 (ImageRef, TextPrompt, VideoRef)
  - ✅ 节点类型注册系统
- [x] 配置数据库迁移脚本
  - ✅ schema-extended.ts (9 张新表)
  - ✅ 001_create_extended_tables.sql
- [x] 设置环境变量模板
  - ✅ 完整 .env.example (11+ AI 服务)
- [x] 安装并配置依赖包
  - ✅ 494 个包安装成功
  - ✅ 所有配置文件完成

**📊 统计：** 100+ 文件 | 5000+ 行代码 | 16 张数据表

**📖 详细报告：** `docs/Phase_0_Completion_Report.md`

### Phase 1: MVP 核心功能 🚧 待开始

详见 `docs/11_Final_Development_Plan.md`

## 🌍 Language Requirement

**⚠️ IMPORTANT: This is an ENGLISH SaaS product targeting global markets.**

- ✅ **ALL user-facing interfaces MUST be in English**
- ✅ Code comments and internal docs can be in Chinese
- ✅ Developer communication can be in Chinese
- ❌ **NO Chinese text in any user interface**

See `docs/ENGLISH_UI_REQUIREMENT.md` for detailed guidelines.

---

## 技术栈

### 前端
- **Next.js 15** - React 框架（App Router）
- **React Flow 11** - 可视化节点编辑器
- **Tailwind CSS v4** - 样式框架
- **shadcn/ui** - UI 组件库
- **Zustand** - 状态管理

### 后端
- **Next.js API Routes** - API 后端
- **Drizzle ORM** - 数据库 ORM
- **Supabase** - PostgreSQL 数据库
- **NextAuth v5** - 认证系统

### AI 服务
- **OpenRouter** - LLM & 图像模型聚合
- **Runway/Luma/Pika** - 文生视频
- **Replicate** - AI 模型托管
- **Fal.ai** - 快速推理
- **ElevenLabs** - 文本转语音
- **HeyGen** - 数字人（Phase 3）

### 存储 & 支付
- **Cloudflare R2** - 对象存储
- **Stripe** - 支付处理
- **Creem** - 支付网关（备选）

## 项目结构

\`\`\`
├── docs/                      # 设计文档
│   ├── 11_Final_Development_Plan.md  # 最终开发计划
│   └── ...
├── src/
│   ├── adapters/              # AI 服务适配器
│   │   ├── llm/              # LLM 适配器 (GPT-4, Claude, etc)
│   │   ├── t2i/              # 文生图适配器 (FLUX, DALL-E, etc)
│   │   ├── t2v/              # 文生视频 (Runway, Luma, Pika)
│   │   ├── i2v/              # 图生视频
│   │   ├── v2v/              # 视频转视频
│   │   ├── audio/            # 音频生成 (TTS, BGM)
│   │   └── dh/               # 数字人 (HeyGen, D-ID)
│   ├── app/                   # Next.js App Router 页面
│   ├── components/
│   │   ├── canvas/           # React Flow 画布组件
│   │   │   ├── nodes/        # 自定义节点组件
│   │   │   └── edges/        # 自定义边组件
│   │   └── ui/               # shadcn/ui 组件
│   ├── db/                    # 数据库
│   │   ├── schema.ts         # ShipAny 基础表
│   │   └── schema-extended.ts # 扩展表（templates, graphs, runs, jobs, artifacts）
│   ├── services/              # 业务逻辑服务
│   │   ├── credit.ts         # 积分服务
│   │   ├── order.ts          # 订单服务
│   │   └── user.ts           # 用户服务
│   ├── lib/                   # 工具库
│   └── config/                # 配置文件（待创建节点注册表）
├── supabase/
│   └── migrations/           # 数据库迁移脚本
├── public/
│   ├── templates/            # 模板缩略图
│   └── examples/             # 示例视频
└── scripts/                  # 工具脚本
\`\`\`

## 快速开始

**详细步骤请查看：** `QUICKSTART.md`（5 分钟快速启动指南）

### 简要步骤

#### 1. 环境配置

```bash
cp .env.example .env
# 编辑 .env 填入以下必需配置
```

**必需配置（最小可运行）：**
- `DATABASE_URL` - Supabase 数据库连接
- `AUTH_SECRET` - NextAuth 密钥（运行 `openssl rand -base64 32` 生成）
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` - Google OAuth
- `OPENROUTER_API_KEY` - LLM 和图像生成（推荐，充值 $5 即可测试）

#### 2. 数据库初始化

```bash
# 1. 在 Supabase SQL Editor 执行 ShipAny 基础表 SQL
#    位置: D:\work\ai\cursorauto\cursor\20251002\shipany_2.6-main\supabase_init_complete.sql

# 2. 运行扩展表迁移
npm run db:push

# 或在 Supabase SQL Editor 执行
# supabase/migrations/001_create_extended_tables.sql
```

#### 3. 启动开发服务器

```bash
npm install  # 如果还没安装依赖
npm run dev
```

访问 http://localhost:3000

#### 4. 数据库管理

```bash
npm run db:studio  # 打开 Drizzle Studio
```

### 测试项目

参见下方 **"如何测试项目"** 章节

## 会员体系

| 等级 | 价格 | 月积分 | 功能 |
|-----|------|-------|------|
| **FREE** | $0 | 10 | 720p, 水印, 仅智能模式 |
| **PRO** | $29 | 1000 (~15-20 视频) | 1080p, 无水印, 专业模式 |
| **TEAM** | $99 | 5000 (~80-100 视频) | 4K, 团队协作 |
| **ENTERPRISE** | 定制 | 无限 | API 访问, 私有部署 |

**积分消耗示例：**
- GPT-4o 脚本生成：3 积分
- FLUX 图片生成：5-10 积分
- Runway 5s 视频：30 积分
- ElevenLabs 30s 配音：5 积分
- **完整 15s TikTok 视频：~45-85 积分**

## 开发路线

### Phase 0: 项目初始化 ✅ 已完成
- 目录结构创建
- 代码迁移（ShipAny + 节点 MVP）
- 数据库设计
- 环境配置

### Phase 1: MVP 核心功能（2 周）
**Week 1: 后端核心**
- DAG 执行引擎
- 节点系统框架
- 基础适配器（LLM, T2I, T2V）
- 积分扣减集成

**Week 2: 前端页面**
- 登录/注册
- Dashboard
- 智能模式（表单）
- 项目管理
- SSE 实时进度

### Phase 2: 增强功能（2-4 周）
- 专业模式（React Flow 画布）
- 模板系统
- 时间轴编辑
- 更多 AI 模型

### Phase 3: 高级功能（1-2 月）
- 数字人生成
- 多平台发布
- API 访问
- 团队协作

## 核心设计

### 节点扩展性

添加新模型只需 3 个文件：

\`\`\`typescript
// 1. 适配器实现
// src/adapters/llm/claude.ts
export class ClaudeAdapter implements ProviderAdapter {
  async call(inputs, params, ctx) { /* ... */ }
}

// 2. UI 组件
// src/components/canvas/nodes/ClaudeScriptNode.tsx
export function ClaudeScriptNode({ data }) { /* ... */ }

// 3. 注册
// src/config/node-registry.ts
registerNode({ id: 'SCRIPT.CLAUDE', ... })
\`\`\`

### 数据库扩展

基于 ShipAny 的 \`users\`, \`orders\`, \`credits\` 表，新增：
- \`templates\` - 系统模板
- \`graphs\` - 用户项目
- \`runs\` - 执行记录
- \`jobs\` - 节点任务
- \`artifacts\` - 生成文件
- \`node_cache\` - 智能缓存
- \`publishing_accounts\` - 社交账号
- \`publishing_tasks\` - 发布任务
- \`consents\` - 授权记录

## 如何测试项目

### Phase 0 测试清单

由于当前只完成了项目初始化，以下是可测试的功能：

#### ✅ 测试 1: 项目结构完整性

```bash
# 检查关键目录是否存在
ls -la src/adapters src/components/canvas src/db src/services

# 检查配置文件
ls -la package.json tsconfig.json .env.example tailwind.config.ts

# 检查迁移文件
ls -la supabase/migrations
```

**预期结果：** 所有目录和文件都存在

#### ✅ 测试 2: 依赖包安装

```bash
# 检查 node_modules
ls node_modules | wc -l  # 应该有几百个包

# 检查 package.json 依赖
cat package.json | grep -A 50 "dependencies"

# 尝试运行脚本
npm run type-check  # TypeScript 类型检查
```

**预期结果：**
- `node_modules` 存在且包含 494 个包
- TypeScript 无编译错误（可能有警告）

#### ✅ 测试 3: 数据库连接（需先配置 .env）

```bash
# 1. 复制环境变量
cp .env.example .env

# 2. 编辑 .env 填入 Supabase 连接信息
# DATABASE_URL="postgresql://..."

# 3. 测试数据库连接
npm run db:studio
```

**预期结果：** Drizzle Studio 在浏览器打开（https://local.drizzle.studio）

#### ✅ 测试 4: 数据库迁移

**前提：** 已在 Supabase SQL Editor 执行 ShipAny 基础表 SQL

```bash
# 运行扩展表迁移
npm run db:push
```

**预期结果：**
```
✓ 推送完成！共 9 张新表：
  - templates
  - graphs
  - runs
  - jobs
  - artifacts
  - node_cache
  - publishing_accounts
  - publishing_tasks
  - consents
```

验证方法：在 Drizzle Studio 或 Supabase Dashboard 查看表列表

#### ✅ 测试 5: 开发服务器启动

```bash
npm run dev
```

**预期结果：**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in xxxms
```

访问 http://localhost:3000 应该看到页面（可能是 404 或默认页面，因为还没创建路由）

#### ⚠️ 测试 6: Google OAuth 登录（需配置完整）

**前提条件：**
1. `.env` 已配置 `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
2. Google Cloud Console 已设置回调 URL
3. 数据库已初始化

**测试步骤：**
1. 启动服务器 `npm run dev`
2. 访问 http://localhost:3000/api/auth/signin
3. 点击 "Sign in with Google"
4. 完成 Google 登录流程

**预期结果：**
- 成功跳转到 Google 登录页
- 登录后跳回应用
- 数据库 `users` 表新增一条记录

**检查数据库：**
```bash
npm run db:studio
# 查看 users 表是否有新用户
```

#### ⚠️ 测试 7: 积分系统（需完整配置）

**前提：** 测试 6 成功，已有用户登录

在代码中测试积分服务：

```typescript
// 创建测试脚本: scripts/test-credit.ts
import { increaseCreditForUser, decreaseCreditForUser, getUserCredit } from '@/services/credit'

async function testCredit() {
  const userUuid = 'your-user-uuid-from-db'

  // 测试增加积分
  await increaseCreditForUser(userUuid, 100, 'test_credit', null)

  // 查询积分
  const credit = await getUserCredit(userUuid)
  console.log('当前积分:', credit)

  // 测试扣除积分
  await decreaseCreditForUser(userUuid, 10, 'test_usage', null)

  // 再次查询
  const newCredit = await getUserCredit(userUuid)
  console.log('扣除后积分:', newCredit)
}
```

**预期结果：** 积分正确增减，数据库 `credits` 表有记录

#### ✅ 测试 8: React Flow 画布组件

创建测试页面：

```typescript
// src/app/test-canvas/page.tsx
'use client'

import { Canvas } from '@/components/canvas'
import 'reactflow/dist/style.css'

export default function TestCanvasPage() {
  const initialNodes = [
    {
      id: '1',
      type: 'textPrompt',
      position: { x: 100, y: 100 },
      data: { text: '测试提示词' }
    }
  ]

  return (
    <div className="w-screen h-screen">
      <Canvas initialNodes={initialNodes} initialEdges={[]} />
    </div>
  )
}
```

访问 http://localhost:3000/test-canvas

**预期结果：**
- 看到网格背景
- 看到一个文本提示词节点
- 可以拖动节点
- 右侧有 MiniMap 和 Controls

---

### 测试总结表

| 测试项 | 需要配置 | 预期状态 | 说明 |
|-------|---------|---------|------|
| 1. 项目结构 | ❌ | ✅ 通过 | 检查文件和目录 |
| 2. 依赖安装 | ❌ | ✅ 通过 | npm install 成功 |
| 3. 数据库连接 | ✅ .env | ✅ 通过 | Drizzle Studio 可访问 |
| 4. 数据库迁移 | ✅ .env | ✅ 通过 | 16 张表创建成功 |
| 5. 服务器启动 | ❌ | ✅ 通过 | npm run dev 成功 |
| 6. Google OAuth | ✅ 完整配置 | ⚠️ 可选 | 登录功能测试 |
| 7. 积分系统 | ✅ 数据库 + 用户 | ⚠️ 可选 | 后端服务测试 |
| 8. 画布组件 | ❌ | ✅ 通过 | 前端组件测试 |

**图例：**
- ✅ 通过 - 应该能成功
- ⚠️ 可选 - 需要完整配置，不影响开发
- ❌ 无需配置

---

### 快速测试命令

运行自动化测试脚本快速验证项目状态：

**Linux/Mac:**
```bash
bash ./scripts/test-phase0.sh
```

**Windows:**
```bash
./scripts/test-phase0.bat
```

**测试内容：**
- ✅ 项目结构完整性
- ✅ 依赖包安装（494 个包）
- ✅ 关键文件检查（8 个核心文件）
- ✅ TypeScript 类型检查
- ✅ 环境变量配置状态

**详细测试指南：** 查看 `TEST_GUIDE.md` 获取完整的测试步骤和预期结果

---

## 文档

### 开发文档
- `docs/11_Final_Development_Plan.md` - 完整开发计划
- `docs/10_Final_Architecture_And_Design.md` - 架构设计
- `docs/9_Complete_UI_Design.md` - UI 设计
- `docs/Phase_0_Completion_Report.md` - Phase 0 完成报告

### 快速指南
- `QUICKSTART.md` - 5 分钟快速启动指南
- `TEST_GUIDE.md` - 完整测试指南（9 个测试场景）

## 许可证

Private - All Rights Reserved

---

**下一步：** 开始 Phase 1 开发 - 参考 `docs/11_Final_Development_Plan.md`
