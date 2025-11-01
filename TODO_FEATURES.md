# 待实现功能清单

## ✅ 已完成

### 1. 定价系统重构（5倍利润）
- ✅ 更新定价页面：2000/3330/9800算力
- ✅ 更新checkout API
- ✅ 更新主页提示文案
- ✅ 新用户注册自动赠送306算力

**定价详情**：
```
成本: Kling v1.6 $0.771 → 售价: $3.855 (5倍)
算力: 400/视频（高质量）, 306/视频（经济）

Starter: $18 = 2000算力 ≈ 5条视频
Pro: $30 = 3330算力 ≈ 8条视频
Business: $88 = 9800算力 ≈ 24条视频
```

---

## 🔧 待实现功能

### 2. 每日签到+分享系统 ⏳

**需求**：
- 用户每日登录可领取306算力
- 分享到社交媒体（Twitter/Facebook/TikTok）可额外获得306算力
- 每日限领一次

**实现步骤**：

#### 2.1 创建每日签到API
创建 `src/app/api/checkin/route.ts`：
```typescript
import { getUserUuid } from "@/services/user"
import { increaseCredits, CreditsTransType, CreditsAmount } from "@/services/credit"
import { respData, respErr } from "@/lib/resp"

export async function POST(req: Request) {
  const user_uuid = await getUserUuid()
  if (!user_uuid) {
    return respErr("Not authenticated")
  }

  // TODO: 检查今日是否已签到（查询credits表，trans_type=daily_checkin，created_at为今日）

  // 赠送306算力
  await increaseCredits({
    user_uuid,
    trans_type: "daily_checkin",
    credits: CreditsAmount.DailyCheckIn,
  })

  return respData({ credits: CreditsAmount.DailyCheckIn })
}
```

#### 2.2 创建分享奖励API
创建 `src/app/api/share-reward/route.ts`：
```typescript
export async function POST(req: Request) {
  const { platform } = await req.json() // twitter, facebook, tiktok

  // TODO: 验证分享（可选）
  // TODO: 检查今日是否已领取分享奖励

  // 赠送306算力
  await increaseCredits({
    user_uuid,
    trans_type: "share_reward",
    credits: CreditsAmount.DailyCheckIn,
  })

  return respData({ credits: CreditsAmount.DailyCheckIn })
}
```

#### 2.3 添加签到UI组件
在主页或用户中心添加签到按钮：
```tsx
<button onClick={handleCheckIn}>
  每日签到 +306算力
</button>

<div className="share-buttons">
  <button onClick={() => shareToTwitter()}>
    分享到Twitter +306算力
  </button>
</div>
```

---

### 3. 免费积分视频水印 ⏳

**需求**：
- 使用免费赠送的306算力生成的视频带水印
- 付费购买的算力生成的视频无水印

**实现步骤**：

#### 3.1 数据库记录积分来源
修改 `credits` 表，添加 `is_free` 字段：
```sql
ALTER TABLE credits ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
```

更新赠送逻辑：
```typescript
// src/services/credit.ts
await addCreditTransaction({
  ...
  is_free: true, // 标记为免费积分
})
```

#### 3.2 生成时检查积分类型
修改 `src/app/api/generate/route.ts`：
```typescript
// 获取用户积分来源
const freeCredits = await getFreeCreditsBalance(userUuid)
const paidCredits = await getPaidCreditsBalance(userUuid)

let shouldAddWatermark = false
if (estimatedCost <= freeCredits) {
  // 完全使用免费积分，添加水印
  shouldAddWatermark = true
}

// 传递水印标记到workflow
const workflowPlan = await planner.generateWorkflow({
  ...input,
  addWatermark: shouldAddWatermark,
})
```

#### 3.3 视频后处理添加水印
创建 `src/services/watermark.ts`：
```typescript
import ffmpeg from 'fluent-ffmpeg'

export async function addWatermark(videoPath: string): Promise<string> {
  const outputPath = videoPath.replace('.mp4', '_watermarked.mp4')

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input('watermark.png')
      .complexFilter([
        '[0:v][1:v] overlay=W-w-10:H-h-10'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })

  return outputPath
}
```

在视频生成完成后调用：
```typescript
if (shouldAddWatermark) {
  finalVideoPath = await addWatermark(videoPath)
}
```

---

## 📋 优先级

1. **高优先级**：每日签到系统（提高用户留存）
2. **中优先级**：免费视频水印（保护收入）
3. **低优先级**：社交分享奖励（增长功能）

---

## 🔍 技术依赖

### 每日签到系统
- 需要：日期判断逻辑、防重复领取
- 依赖：现有credits系统

### 水印系统
- 需要：FFmpeg、水印图片素材
- 依赖：视频后处理pipeline

---

## 测试清单

### 每日签到
- [ ] 首次签到成功赠送306算力
- [ ] 同一天重复签到被拒绝
- [ ] 跨天签到重置
- [ ] 分享奖励独立计数

### 水印系统
- [ ] 免费积分生成视频有水印
- [ ] 付费积分生成视频无水印
- [ ] 混合使用（免费+付费）按优先级扣除

---

**创建时间**: 2025-01-XX
**预计完成时间**: 1-2天（MVP版本）
