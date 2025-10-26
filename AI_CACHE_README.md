# AI API Cache System

录制-回放（Record-Replay）缓存系统，用于开发环境省钱测试。

## 🎯 功能

- ✅ **第一次调用**：真实 API → 保存响应到 `.ai-cache/`
- ✅ **后续调用**：读取缓存 → 费用 = $0
- ✅ **生产环境**：自动禁用缓存，始终调用真实 API
- ✅ **版本管理**：缓存有版本号，API 变化时自动失效

## 🚀 快速开始

### 1. 启用缓存（开发环境）

在 `.env.local` 中添加：

```bash
USE_AI_CACHE=true
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试视频生成

访问 http://localhost:3000，生成视频：

- **第一次**：调用真实 Sora 2 API（8秒 ~$2.40）
- **第二次**：读取缓存（费用 $0）
- **第三次及以后**：读取缓存（费用 $0）

控制台会显示：
```
[Cache MISS] Sora 2: 8s - Dynamic tracking shot...
[Cache] Calling real API (this will incur costs)
[Cache] Saved to: .ai-cache/v1-sora-2-8s-abc12345.json
```

下次相同参数：
```
[Cache HIT] Sora 2: 8s - Dynamic tracking shot...
[Cache] Reading from: .ai-cache/v1-sora-2-8s-abc12345.json
[Cache] Age: 5 minutes
```

## 📁 缓存文件结构

```
.ai-cache/
├── v1-sora-2-8s-abc12345.json     # Sora 2, 8秒
├── v1-sora-2-12s-def67890.json    # Sora 2, 12秒
├── v1-flux-dev-ghi34567.json      # FLUX Dev T2I
└── v1-vibevoice-jkl90123.json     # VibeVoice TTS
```

每个文件包含：
```json
{
  "version": "v1",
  "timestamp": 1234567890,
  "cacheKey": "v1-sora-2-8s-abc12345",
  "description": "Sora 2: 8s - Dynamic tracking shot...",
  "data": {
    "videoUrl": "https://...",
    "duration": 8,
    "width": 1280,
    "height": 720,
    ...
  }
}
```

## 🛠️ 缓存管理命令

### 查看缓存列表

```bash
npm run cache:list
```

输出：
```
v1-sora-2-8s-abc12345.json  12.5 KB  5 min ago
v1-flux-dev-def67890.json   3.2 KB   10 min ago
```

### 清除所有缓存

```bash
npm run cache:clear
```

### 清除特定模型缓存

```bash
# 清除所有 Sora 2 缓存
npm run cache:clear:sora2

# 清除所有 Kling 缓存
npm run cache:clear:kling
```

## 🆕 添加新模型

### 1. 配置模型能力（models.ts）

```typescript
{
  id: "fal-ai/veo-3",
  name: "Veo 3",
  capabilities: {
    inputType: 'text',
    audioGeneration: {
      enabled: true,
      separateTrack: false
    }
  }
}
```

### 2. 创建 Adapter（fal.ts）

```typescript
export class FalVeo3Adapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      duration: request.duration,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        // 真实 API 调用
        const result = await fal.subscribe('fal-ai/veo-3', { input })
        return parseResponse(result)
      },
      {
        description: `Veo 3: ${request.duration}s - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}
```

### 3. 测试新模型

```bash
# 第一次：调用真实 API，保存缓存
npm run dev
# 选择 Veo 3 模型生成视频 → 费用 ~$2.40

# 第二次：读取缓存
# 再次生成相同参数的视频 → 费用 $0
```

### 4. 验证不同参数

每种参数组合只会调用一次真实 API：

```bash
# 8秒视频 → 第一次调用 API（~$2.40）
# 12秒视频 → 第一次调用 API（~$3.60）
# 再次8秒 → 读缓存（$0）
# 再次12秒 → 读缓存（$0）
```

## 🌐 生产环境部署

### 自动禁用缓存

生产环境会自动禁用缓存，无需额外配置：

```bash
# Vercel/生产部署
NODE_ENV=production npm run build

# 即使 .env.local 有 USE_AI_CACHE=true
# 生产环境也会自动禁用缓存
```

缓存系统代码：
```typescript
const USE_CACHE =
  process.env.USE_AI_CACHE === 'true' &&
  process.env.NODE_ENV !== 'production'  // 生产自动禁用
```

### Vercel 环境变量

可选（已自动处理）：
```
NODE_ENV=production
USE_AI_CACHE=false
```

## ⚙️ 工作原理

### 缓存 Key 生成

```typescript
// 基于所有参数生成唯一 hash
generateCacheKey({
  model: "fal-ai/sora-2/text-to-video",
  prompt: "A dog running in a meadow",
  duration: 8,
  aspectRatio: "16:9",
  resolution: "720p"
})
// → "v1-sora-2-8s-abc12345"
```

### 缓存逻辑

```typescript
if (缓存存在 && 开发环境 && USE_AI_CACHE=true) {
  return 缓存数据  // 费用 = $0
} else {
  调用真实 API    // 费用 = 真实费用
  保存到缓存
  return 真实数据
}
```

## 💰 成本对比

### 无缓存（之前）

```
测试10次 Sora 2（8秒）：
10 × $2.40 = $24.00
```

### 有缓存（现在）

```
第1次测试：$2.40（真实 API）
第2-10次测试：$0（缓存）
总计：$2.40
节省：$21.60（90%）
```

### 开发迭代示例

```
前端 UI 调整：测试20次 → $2.40（仅第一次）
工作流逻辑测试：测试30次 → $2.40（仅第一次）
Merge 节点修复：测试10次 → $2.40（仅第一次）

总计：$7.20
无缓存费用：$144.00
节省：$136.80（95%）
```

## ⚠️ 注意事项

### 缓存失效场景

1. **API 响应格式变化**：升级 `CACHE_VERSION` 到 `v2`
2. **参数变化**：新的参数组合会重新调用 API
3. **手动清除**：运行 `npm run cache:clear`

### 何时重新验证

```bash
# 模型 API 升级后
npm run cache:clear:sora2

# 修改 Adapter 解析逻辑后
npm run cache:clear

# 怀疑缓存数据有问题
npm run cache:clear
```

### Git 管理

✅ `.ai-cache/` 已添加到 `.gitignore`
❌ 不要提交缓存文件到 Git

## 🐛 故障排查

### 缓存未生效

检查环境变量：
```bash
echo $USE_AI_CACHE  # 应该是 "true"
echo $NODE_ENV      # 应该是 "development" 或未设置
```

检查 `.env.local`：
```bash
cat .env.local | grep USE_AI_CACHE
# 应该输出：USE_AI_CACHE=true
```

### 生产环境误用缓存

不会发生！代码有双重保护：
```typescript
process.env.NODE_ENV !== 'production'  // 自动禁用
```

### 缓存文件损坏

系统会自动处理：
```typescript
try {
  return JSON.parse(cachedFile)
} catch {
  删除损坏文件
  重新调用真实 API
}
```

## 📊 监控

控制台会显示详细日志：

```
[Cache] Production mode - calling real API
[Cache HIT] Sora 2: 8s - Dynamic tracking shot...
[Cache MISS] Veo 3: 12s - A cat playing piano...
[Cache] Age: 15 minutes
[Cache] Saved to: .ai-cache/v1-veo-3-12s-xyz789.json
```

## 🎓 最佳实践

1. **开发时始终启用缓存**：`USE_AI_CACHE=true`
2. **新模型第一次用最短时长**：Sora 2 用 4秒（~$1.20）
3. **定期清理缓存**：避免占用磁盘空间
4. **API 升级后清除缓存**：确保使用最新格式
5. **不同参数都测试一次**：建立完整的缓存库

## 📞 支持

如有问题，检查：
1. 环境变量设置
2. 控制台日志
3. `.ai-cache/` 目录权限
4. 缓存文件 JSON 格式
