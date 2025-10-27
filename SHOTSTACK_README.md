# Shotstack Video Merging Integration

**Shotstack** 是一个云端视频编辑 REST API，用于将多个视频片段拼接成一个完整视频。

## 🎯 功能

- ✅ **多场景视频拼接**：将多个 AI 生成的视频片段按顺序合并
- ✅ **转场效果**：支持 fade（淡入淡出）、wipe、slide 等转场效果
- ✅ **音频混合**：支持视频原声 + TTS 配音叠加
- ✅ **自动优化**：单视频无需拼接，直接返回原视频
- ✅ **异步渲染**：轮询状态直到渲染完成（最多 5 分钟）

## 🚀 快速开始

### 1. 配置 API Key

已在 `.env.local` 中配置：

```bash
# Shotstack API (Video Merging)
SHOTSTACK_API_KEY=0BMK31ipGPPcKYrS5JcqhGvF8XbWBBIoK02lNNZx
SHOTSTACK_ENV=stage  # stage (free/sandbox) or v1 (production)
```

### 2. 环境说明

- **Stage**：免费测试环境，渲染速度较慢，视频带水印
- **Production (v1)**：付费生产环境，渲染速度快，无水印

开发阶段使用 `stage`，部署后切换到 `v1`。

### 3. 测试视频拼接

访问 http://localhost:3000，创建一个多场景视频：

- **15 秒视频** → 自动分配 2 个场景
- **30 秒视频** → 自动分配 3 个场景
- **60 秒视频** → 自动分配 5-6 个场景

生成完成后，Shotstack 会自动：
1. 将所有视频片段拼接起来
2. 在场景之间添加 0.5 秒淡入淡出转场
3. 如果有 TTS 配音，混合到视频中

控制台会显示：
```
[Merge] Videos to merge: 3
[Merge] Has audio overlay: false
[Merge] Using Shotstack for video merging...
[Shotstack] Merging videos: { clipCount: 3, hasAudio: false, transition: 'fade' }
[Shotstack] Submitting render job...
[Shotstack] Render job submitted: abc-123-def-456
[Shotstack] Polling render status...
[Shotstack] Attempt 1/60 - Status: queued
[Shotstack] Attempt 2/60 - Status: rendering
[Shotstack] Attempt 3/60 - Status: done
[Shotstack] Render completed: https://shotstack.io/output/abc123.mp4
[Merge] Shotstack render completed: https://shotstack.io/output/abc123.mp4
```

## 📁 文件结构

```
src/integrations/shotstack/
├── types.ts      # TypeScript 类型定义
├── adapter.ts    # Shotstack API 封装
└── index.ts      # 导出接口
```

### `ShotstackAdapter` 主要方法

```typescript
class ShotstackAdapter {
  async mergeVideos(request: ShotstackMergeRequest): Promise<ShotstackMergeResponse>
}
```

**输入参数**：
```typescript
{
  videos: [
    { url: 'https://...', duration: 8, hasAudio: true },
    { url: 'https://...', duration: 7, hasAudio: true },
  ],
  audioUrl?: 'https://...', // 可选 TTS 配音
  transitions: {
    type: 'fade', // 转场类型
    duration: 0.5 // 转场时长（秒）
  },
  output: {
    format: 'mp4',
    resolution: 'hd', // 1280x720
    fps: 30,
    quality: 'high'
  }
}
```

**输出结果**：
```typescript
{
  finalVideoUrl: 'https://shotstack.io/output/abc123.mp4',
  duration: 15,
  width: 1280,
  height: 720,
  metadata: {
    renderId: 'abc-123-def-456',
    renderTime: 12345, // 毫秒
    clipCount: 2
  }
}
```

## 🔧 工作原理

### Timeline 结构

Shotstack 使用 **Timeline** 概念描述视频编辑：

```json
{
  "timeline": {
    "background": "#000000",
    "tracks": [
      {
        "clips": [
          {
            "asset": { "type": "video", "src": "https://..." },
            "start": 0,
            "length": 8,
            "transition": { "in": "fade", "out": "fade" }
          },
          {
            "asset": { "type": "video", "src": "https://..." },
            "start": 8,
            "length": 7,
            "transition": { "in": "fade", "out": "fade" }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": { "type": "audio", "src": "https://..." },
            "start": 0,
            "length": "end",
            "volume": 0.8
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd",
    "fps": 30,
    "quality": "high"
  }
}
```

### 渲染流程

1. **提交任务**：`POST /render` → 返回 `renderId`
2. **轮询状态**：每 5 秒调用 `GET /render/{renderId}`
3. **状态变化**：`queued` → `fetching` → `rendering` → `saving` → `done`
4. **获取结果**：从 `response.url` 获取最终视频 URL

### Merge 节点集成

在 `src/app/api/runs/[runId]/execute/route.ts` 的 `merge` 节点中：

```typescript
case 'merge':
  if (videos.length === 1 && !audioUrl) {
    // 单视频，无需拼接
    finalVideoUrl = videos[0]
  } else {
    // 多视频或有配音 → 使用 Shotstack
    const mergeResult = await shotstackAdapter.mergeVideos({
      videos: videoClips,
      audioUrl,
      transitions: { type: 'fade', duration: 0.5 },
      output: { format: 'mp4', resolution: 'hd', fps: 30, quality: 'high' }
    })
    finalVideoUrl = mergeResult.finalVideoUrl
  }
```

## ⚙️ 配置选项

### 转场类型

支持的转场效果（`transitions.type`）：
- `fade`：淡入淡出（默认）
- `wipe`：擦除
- `slideLeft`：左滑
- `slideRight`：右滑

### 分辨率预设

支持的分辨率（`output.resolution`）：
- `preview`：512x288
- `mobile`：640x360
- `sd`：1024x576
- `hd`：1280x720（默认）
- `high` / `1080`：1920x1080

### 质量选项

- `low`：低质量（文件小）
- `medium`：中等质量
- `high`：高质量（默认）

## 💰 成本

### Stage 环境（免费）
- ✅ 无限次渲染
- ❌ 渲染速度较慢
- ❌ 视频带水印

### Production 环境（付费）
- ✅ 快速渲染
- ✅ 无水印
- 💵 按渲染时长计费：
  - SD (1024x576): $0.05/分钟
  - HD (1280x720): $0.08/分钟
  - 1080p: $0.12/分钟

**示例成本**：
```
15 秒视频（2 场景拼接）：
  HD 分辨率 → 15s / 60s × $0.08 = $0.02

60 秒视频（6 场景拼接）：
  HD 分辨率 → 60s / 60s × $0.08 = $0.08
```

## ⚠️ 注意事项

### 渲染时间

- **Stage**：1-5 分钟（取决于队列）
- **Production**：10-30 秒

### 超时设置

当前设置：
- 最大轮询次数：60 次
- 轮询间隔：5 秒
- 总超时时间：5 分钟

如果超时，会抛出异常：
```
Error: Shotstack render timeout after 300s
```

### 音频混合策略

- **视频有内嵌音频**：Shotstack 会自动保留
- **额外 TTS 配音**：以 0.8 音量叠加到视频音轨上
- **纯 TTS 配音**：如果视频无音频，TTS 成为唯一音轨

## 🐛 故障排查

### 错误：API Key 未配置

```
Error: SHOTSTACK_API_KEY is not configured in environment variables
```

**解决方案**：检查 `.env.local` 是否包含 `SHOTSTACK_API_KEY`

### 错误：渲染失败

```
Error: Shotstack render failed: Invalid video URL
```

**可能原因**：
1. 视频 URL 无法访问（Fal.ai 临时链接过期）
2. 视频格式不支持（需要 MP4）
3. 视频时长为 0

**解决方案**：
1. 确保视频 URL 在渲染前有效
2. 检查 Fal.ai 生成的视频是否正常
3. 添加日志查看具体错误信息

### 错误：渲染超时

```
Error: Shotstack render timeout after 300s
```

**可能原因**：
1. Stage 环境队列过长
2. 视频片段过多（>10 个）
3. 视频分辨率过高

**解决方案**：
1. 切换到 Production 环境（付费但更快）
2. 减少场景数量
3. 降低输出分辨率

### 错误：视频无音频

**检查清单**：
1. Sora 2 生成的视频是否有音频？（检查 `hasAudio: true`）
2. TTS 配音是否正确传递到 merge 节点？
3. Shotstack 音频轨道配置是否正确？

## 📊 监控日志

Shotstack 集成会输出详细日志：

```
[Merge] Videos to merge: 3
[Merge] Has audio overlay: false
[Merge] Using Shotstack for video merging...
[Shotstack] Merging videos: { clipCount: 3, hasAudio: false, transition: 'fade' }
[Shotstack] Submitting render job...
[Shotstack] Render job submitted: abc-123-def-456
[Shotstack] Polling render status...
[Shotstack] Attempt 1/60 - Status: queued
[Shotstack] Attempt 5/60 - Status: rendering
[Shotstack] Attempt 8/60 - Status: done
[Shotstack] Render completed: https://shotstack.io/output/abc123.mp4
[Merge] Shotstack render completed: https://shotstack.io/output/abc123.mp4
```

## 🎓 最佳实践

1. **开发时使用 Stage**：免费但有水印
2. **生产环境用 Production**：快速无水印
3. **合理控制场景数量**：2-6 个场景最佳
4. **优化视频时长**：每个场景 5-12 秒
5. **监控渲染时间**：如果经常超时，考虑优化流程

## 🔗 相关文档

- [Shotstack API 文档](https://shotstack.io/docs/api/)
- [Shotstack 核心概念](https://shotstack.io/docs/guide/getting-started/core-concepts/)
- [Shotstack Dashboard](https://dashboard.shotstack.io/)

## 📞 支持

如有问题，检查：
1. API Key 是否正确配置
2. 视频 URL 是否可访问
3. 渲染状态日志
4. Shotstack Dashboard 中的任务详情
