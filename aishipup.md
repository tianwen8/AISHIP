# 项目名称：Cineprompt（AI 视频分镜提示词工厂,面向英文用户
目标：用一个“视频分镜提示词生成器”跑通【会员/支付/credits】闭环，并把 AISHIP 变成可复用的“微工具模板”（以后上新工具只加一个 Tool 文件 + SEO 页面，不重写支付/用户/计费/记录）。

---

## 1. 产品定义（我们要做什么网站）
### 1.1 一句话定位
Cineprompt 是一个“按模型输出”的 AI 视频分镜提示词生成器：
- 输入：故事概要 + 人物设定 + 风格 + 时长/镜头数
- 输出：可直接复制到 Sora / Veo / Kling / Runway 的【分镜 Shot List + Master Prompt + Consistency Pack(人物一致性包)】

### 1.2 目标用户（付费人群）
- AI 视频创作者（短视频、广告、频道内容）
- 营销团队/自由职业者（需要快速出分镜/脚本）
- 玩 AI 视频但不会写 prompt 的普通用户（“想要结果”）

### 1.3 核心差异化（为什么付费）
免费 prompt 库谁都有，付费点必须是“省试错”：
- 生成【结构化分镜】（每镜头时长、景别、运镜、动作、光线、音效/对白）
- 生成【人物一致性包】（角色卡/场景卡/风格卡/负面约束）
- 同一需求一键输出多模型版本（Sora/Veo/Kling 各自格式不同）
- 导出：Copy / Download Markdown / Download JSON

---

## 2. 对标网站（看它们的设计与信息架构）
（你们不要照抄功能，重点看：页面结构、CTA、付费墙、结果展示）
- PromptHero: https://prompthero.com/   （大搜索框 + 按模型筛选 + 内容库）
- PromptBase: https://promptbase.com/   （提示词商品化 + Custom prompt 服务）
- FlowGPT:    https://flowgpt.com/      （社区型，结构可参考但不建议走社区重运营）
- Sora prompt generator（参考“表单->生成->复制”的闭环形态）：
  https://www.sora2promptgenerator.org/

---

## 3. 页面设计（做成什么样子）
### 3.1 全站信息架构（最小 MVP）
- / （Landing）
- /library （免费提示词库/SEO入口）
- /tools/video-storyboard （付费：视频分镜生成器）
- /pricing （购买 credits / 会员）
- /account （账户/订单/积分/历史记录）
- /runs （我的生成历史：可复用资产）

### 3.2 Landing（/）
目的：让用户 10 秒明白“你能帮我把模糊想法变成可用分镜提示词”
结构：
1) Hero 标题 + 子标题 + CTA（Try Free / Generate storyboard）
2) 三张示例卡片（Before: 粗糙需求 -> After: 分镜prompt）
3) “支持模型”logo条（Sora/Veo/Kling/Runway…）
4) 价格入口（Free / Pro）
5) FAQ：人物一致性怎么做？不同模型怎么输出？

### 3.3 Library（/library）
目的：吃 SEO + 让用户先白嫖再转化
组件：
- 顶部：搜索框（按关键词）
- 左侧筛选：Model / Use-case / Style / Duration
- 列表卡片：标题、标签、预览、Copy按钮、CTA：Customize -> 跳到生成器并预填
注意：Library 全部免费可复制（你说的“基础prompt免费”），但“定制/分镜/一致性包/多模型输出”才收费。

### 3.4 生成器（/tools/video-storyboard）
目的：这是收钱页
页面布局（建议左右两栏）：
- 左栏：表单（10个字段以内，避免复杂）
- 右栏：结果区（生成后出现三块输出 + Copy/Download）
表单字段（MVP）：
1) Target Model: Sora / Veo / Kling / Runway（可多选）
2) Total Duration (sec) + Shot Count（例如 8秒/4镜头）
3) Story Summary（1-3句）
4) Main Character（外观/衣服/标志物）
5) Setting（地点/时间/氛围）
6) Style（写实/动画/胶片/赛博…）
7) Consistency Anchors（必须保持的3-5条）
8) Dialogue/Voiceover（可选）
9) Avoid（不要出现）
10) Output Language（EN/中文）
结果区输出三块：
A) Shot List（每镜头：秒数+景别+运镜+动作+环境+光线+音效/对白）
B) Master Prompt（模型可直接复制）
C) Consistency Pack（角色卡/场景卡/风格卡/负面约束）
按钮：
- Copy Sora version / Copy Veo version / Copy All
- Download JSON / Download Markdown
付费墙：
- 未登录：只给 1 次试用（或只显示示例输出）
- 已登录但 credits 不足：弹出 pricing modal（Creem购买）

---

## 4. 商业模式（Creem + credits）
### 4.1 为什么用 credits（而不是“纯会员”）
因为未来你会做多个微工具（图像、音频、视频），统一计费单位最省事：
- credits 代表“可消耗额度”
- 具体工具内部决定要扣多少 credits（按镜头数/输出模型数/时长等）

### 4.2 建议定价（MVP）
- Free：每天 1 次生成（限制镜头数<=4、仅单模型输出、无一致性包）
- Credits Pack（一次性）：$4.99 / 50 credits；$9.99 / 120 credits；$19.99 / 300 credits
- Pro（月订阅可后做）：每月给固定 credits + 更高上限

### 4.3 Creem 支付流程（你现有模板已接好）
流程：
1) /pricing 点击购买 -> 调用后端 createCheckout
2) Creem checkout 完成 -> webhook 回调 -> 给 user 增加 credits
3) 用户回到工具页继续生成

要求（必须做到）：
- webhook 幂等：同一订单只加一次 credits
- 订单与 credits ledger 可对账

---

## 5. 技术架构（基于 AISHIP 模板的可复用“微工具平台”）
### 5.1 部署约束（必须满足）
- 代码托管 GitHub
- 部署：Vercel 或 Cloudflare Pages（免费）
- 不自建服务器
- 不依赖大文件上传（本工具 MVP 不上传文件）

### 5.2 平台层 vs 工具层（复用的核心思想）
平台层（所有工具共用，不因工具而改）：
- Auth（NextAuth）
- Billing（Creem）
- Credits ledger（增减、冻结、退款）
- Tool Runner（统一执行入口）
- Runs/History（输入输出记录）
- UI Shell（导航、账号、付费墙）

工具层（每个工具不同，只在这里写差异）：
- inputSchema（表单字段）
- estimateCredits（计费规则）
- run（调用哪个API：OpenRouter/自定义LLM等）
- outputSchema（输出格式）

---

## 6. 模板复用设计：Tool Contract（关键）
### 6.1 Tool Definition 接口（每个工具实现它）
定义一个 ToolDef：
- id: string
- name/description
- inputSchema: zod
- ui: fields配置（用于自动渲染表单）
- estimateCredits(input) -> number
- run(ctx,input) -> { output, usage?, artifacts? }

重要：平台不关心你调用什么API，只关心：
- 你要扣多少 credits
- 你输出什么JSON
- 你是否产生 artifact（文件URL）

### 6.2 Tool Registry（工具注册表）
- src/tools/registry.ts 维护一个 map：{ [toolId]: ToolDef }
新增工具步骤（未来复用目标）：
1) 新增一个 tools/xxx.ts（实现 ToolDef）
2) 在 registry 注册
3) 自动获得页面 /tools/[toolId] + API /api/tools/[toolId]/run
4) 可选：新增 SEO 落地页 /xxx-prompt-generator -> 引流到工具页

### 6.3 通用 Tool Runner（只写一次）
流程：
1) 校验 toolId -> 获取 ToolDef
2) 校验 inputSchema
3) cost = estimateCredits
4) 校验余额
5) 创建 run 记录（status=running）
6) 扣/冻结 credits（建议先冻结，成功后确认）
7) 执行 tool.run（调用 LLM）
8) 写 output_json + usage_json，status=success
9) 返回结果

---

## 7. 数据库设计（尽量一次到位，后续工具不加表）
原则：微工具输出都可以存 JSON，避免每个工具建新表
必需表（如果你已有同类表就复用，不重复造）：
- users
- credit_ledger（记录每次增减 credits）
- tool_runs（通用运行记录）
  字段：id,user_id,tool_id,status,cost_credits,input_json,output_json,usage_json,created_at
- purchases/orders（Creem订单记录，含 provider_order_id 幂等键）

只有当你做“长期对象”（例如团队协作、项目管理）才需要加新表；微工具不需要。

---

## 8. LLM 调用（Prompt 生成的实现）
- Provider：优先用你模板里已有的 OpenRouter（README提到你用它做多模型调用）
- 输出必须强制 JSON（system prompt 约束），避免不可控文本
- 输出格式（MVP）：
{
  "model_variants": {
    "sora": { "shot_list": [...], "master_prompt": "...", "negative_prompt": "...", "consistency_pack": "..." },
    "veo":  { ... }
  },
  "tips": ["...","..."]
}

---

## 9. MVP 开发里程碑（按天拆）
Day 1-2：平台改造
- Tool Contract + Registry + Tool Runner + tool_runs落库
- API: POST /api/tools/[toolId]/run
- 通用工具页：/tools/[toolId]

Day 3-4：第一个工具 video-storyboard
- 表单 + 结果区 + Copy/Download
- credits扣减 + 余额不足付费墙

Day 5：Library（SEO）
- /library 列表 + 详情页（静态数据即可）
- CTA 预填跳转到生成器

Day 6：Creem闭环检查
- pricing页 + checkout + webhook入账 + 幂等
- 生成器里购买后返回继续生成

Day 7：复用性验收（必须做）
- 再加一个超小工具 prompt-refiner（只新增一个 Tool 文件）
- 验收：不改支付、不改runner、不改DB，只新增 ToolDef 即上线

---

## 10. 验收标准（确保和你模板复用目标对齐）
- ✅ 生成器能稳定输出 JSON + 可复制文本
- ✅ credits 扣减正确；不足会跳到 Creem 支付；支付成功立即到账
- ✅ tool_runs 能看到历史记录、可复用输出
- ✅ 新增第二个工具只需新增 ToolDef 文件（不改核心代码）
- ✅ 部署在 Vercel/CF Pages 可运行（无大文件上传）

