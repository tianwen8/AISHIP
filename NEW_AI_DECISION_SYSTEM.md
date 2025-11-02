# 新AI决策系统 - 多因素智能推荐

## 🎯 核心理念

**不再仅基于"有无参考图"决策，而是综合考虑多个因素，智能推荐最合适的模型和工作流。**

---

## 📊 决策因素优先级

### 1️⃣ **配音需求** (最高优先级)
- 如果用户请求配音 → **Sora 2 T2V** (内置音频生成)
- 理由: 避免额外TTS成本，音频与视频自然同步

### 2️⃣ **参考图 + 一致性需求**
- 如果有参考图 → **Kling V1.6 I2V** (保证角色/风格一致)
- 理由: I2V工作流能严格控制第一帧，确保角色一致性

### 3️⃣ **质量等级** (从提示词推断)
用户提示词包含质量关键词时:

**高质量关键词**: `high quality`, `premium`, `professional`, `cinematic`
→ **Kling V1.6 T2V** (400 PU, 高质量)

**经济关键词**: `quick`, `fast`, `simple`, `test`
→ **Seedance T2V** (306 PU, 经济快速)

### 4️⃣ **视频时长**
- **8-15秒**: Seedance T2V (经济)
- **16-30秒**: Kling V1.6 T2V (平衡质量)
- **31-60秒**: Kling V1.6 T2V (保持长视频连贯性)

### 5️⃣ **默认推荐**
- 无特殊需求 → **Seedance T2V** (最佳性价比)

---

## 🔄 完整决策流程图

```
用户输入
   ↓
┌─────────────────────────────┐
│ 是否需要配音？              │
│ (voice != "none")           │
└────┬─────────────────┬──────┘
     │ 是               │ 否
     ↓                  ↓
 Sora 2 T2V      ┌──────────────────┐
 (750 PU)        │ 是否有参考图？    │
                 └─────┬────────┬────┘
                       │ 是      │ 否
                       ↓         ↓
                 Kling V1.6   ┌─────────────────────┐
                 I2V          │ 提示词包含质量关键词？│
                 (404 PU)     └──┬──────────┬────────┘
                                 │ 高质量    │ 经济/默认
                                 ↓           ↓
                          Kling V1.6 T2V  Seedance T2V
                          (401 PU)        (307 PU)
                                 ↓           ↓
                          ┌──────────────────────────┐
                          │ 根据时长微调:             │
                          │ 8-15s: 优先经济          │
                          │ 16-30s: 平衡质量         │
                          │ 31-60s: 保持高质量       │
                          └──────────────────────────┘
```

---

## 📋 决策矩阵 (所有可能场景)

| 场景 | 配音 | 参考图 | 提示词质量 | 时长 | 推荐模型 | 成本(15s) | 工作流 |
|------|------|--------|-----------|------|----------|-----------|--------|
| 1 | ✅ | ❌ | 任意 | 任意 | Sora 2 T2V | 751 PU | T2V |
| 2 | ✅ | ✅ | 任意 | 任意 | Sora 2 T2V | 751 PU | T2V (支持图片输入) |
| 3 | ❌ | ✅ | 任意 | 任意 | Kling V1.6 I2V | 404 PU | T2I→I2V |
| 4 | ❌ | ❌ | 高质量 | 任意 | Kling V1.6 T2V | 401 PU | T2V |
| 5 | ❌ | ❌ | 经济 | 任意 | Seedance T2V | 307 PU | T2V |
| 6 | ❌ | ❌ | 普通 | ≤15s | Seedance T2V | 307 PU | T2V |
| 7 | ❌ | ❌ | 普通 | 16-30s | Kling V1.6 T2V | 801 PU | T2V |
| 8 | ❌ | ❌ | 普通 | 31-60s | Kling V1.6 T2V | 1601 PU | T2V |

---

## 🎬 实际案例

### 案例1: 新用户测试 (最常见)
```
输入:
- Prompt: "Create a 15s TikTok video of a cat playing"
- Duration: 15s
- Voice: none
- Reference Image: none

AI决策:
✓ 无配音
✓ 无参考图
✓ 提示词无质量关键词
✓ 短视频(15s)
→ 推荐: Seedance T2V

成本: 307 PU (306 T2V + 1 Merge)
工作流: [T2V] → [Merge]
```

### 案例2: 高质量商业视频
```
输入:
- Prompt: "Create a professional cinematic 30s product showcase"
- Duration: 30s
- Voice: none
- Reference Image: none

AI决策:
✓ 无配音
✓ 无参考图
✓ 提示词包含 "professional", "cinematic" → 高质量需求
✓ 中等时长(30s)
→ 推荐: Kling V1.6 T2V

成本: 801 PU (800 T2V + 1 Merge)
工作流: [T2V] → [Merge]
```

### 案例3: 角色一致性视频
```
输入:
- Prompt: "Create a 15s video of this character walking"
- Duration: 15s
- Voice: none
- Reference Image: [uploaded character image]

AI决策:
✓ 无配音
✓ 有参考图 → 需要角色一致性
→ 推荐: Kling V1.6 I2V

成本: 404 PU (3 T2I + 400 I2V + 1 Merge)
工作流: [T2I] → [I2V] → [Merge]
```

### 案例4: 配音短视频
```
输入:
- Prompt: "Create a 15s explainer video about AI"
- Duration: 15s
- Voice: "male"
- Reference Image: none

AI决策:
✓ 需要配音 → 最高优先级
→ 推荐: Sora 2 T2V (内置音频生成)

成本: 751 PU (750 T2V + 1 Merge)
工作流: [T2V with Audio] → [Merge]
```

---

## 🔍 与旧系统对比

### ❌ 旧系统 (简单二分法)
```
无参考图 → Seedance T2V (306 PU)
有参考图 → Kling I2V + T2I (404 PU)
```

**问题**:
- ❌ 忽略质量需求 (用户要高质量也给经济模型)
- ❌ 忽略时长因素 (60s长视频也用经济模型)
- ❌ 忽略配音需求 (需要配音还用无音频模型)
- ❌ 有参考图就强制I2V (即使参考图不重要)

### ✅ 新系统 (多因素智能推荐)
```
根据: 配音 + 参考图 + 质量关键词 + 时长
→ 智能推荐最合适的模型
```

**优势**:
- ✅ 配音场景自动选Sora 2 (节省TTS成本)
- ✅ 高质量需求自动升级Kling V1.6
- ✅ 长视频自动使用更好的模型
- ✅ 参考图仅在需要一致性时用I2V
- ✅ 默认经济模型 (新用户友好)

---

## 📈 推荐模型库

### 当前可用的T2V模型

| 模型 | 成本(15s) | 质量 | 速度 | 音频 | 适用场景 |
|------|-----------|------|------|------|----------|
| **Seedance T2V** | 307 PU | Good | 快 | ❌ | 经济首选、新用户、短视频 |
| **Kling V1.6 T2V** | 401 PU | Very High | 中 | ❌ | 高质量、商业内容、中长视频 |
| **Kling V1.6 Pro T2V** | 1001 PU | Premium | 慢 | ❌ | 顶级质量需求 |
| **Sora 2 T2V** | 751 PU | Premium | 中 | ✅ | 配音视频、顶级质量 |
| **Sora 2 T2V Pro** | 2251 PU | Ultra Premium | 中 | ✅ | 超高端内容 |
| **Vidu Q1 T2V** | 601 PU | High | 快 | ❌ | 平衡选择 |

### I2V模型 (仅用于参考图场景)

| 模型 | 成本(15s) | 适用场景 |
|------|-----------|----------|
| **Kling V1.6 I2V** | 404 PU | 角色一致性、品牌素材 |
| **Seedance I2V** | 307 PU | 经济参考图场景 |
| **Sora 2 I2V** | 751 PU | 高质量参考图场景 |

---

## 🎛️ 用户控制权

### 自动推荐 vs 手动选择

**系统行为**:
1. AI自动推荐最优模型
2. 生成工作流后，用户可在画布中手动切换模型
3. 切换模型时，实时显示新的成本

**例子**:
```
AI推荐: Seedance T2V (307 PU)
↓
用户在节点中手动切换
↓
选择: Kling V1.6 T2V (401 PU)
↓
成本实时更新显示: 401 PU
```

---

## 🧪 测试验证点

1. **15s TikTok视频 (无特殊需求)**
   - 预期: Seedance T2V, 307 PU
   - Console: `[AI Planner] Short video (≤15s) → Seedance T2V`

2. **30s 专业视频 (提示词含"professional")**
   - 预期: Kling V1.6 T2V, 801 PU
   - Console: `[AI Planner] Premium quality requested → Kling V1.6 T2V`

3. **15s 配音视频**
   - 预期: Sora 2 T2V, 751 PU
   - Console: `[AI Planner] Voiceover requested → Sora 2 T2V`

4. **15s 视频 + 参考图**
   - 预期: Kling V1.6 I2V, 404 PU (T2I→I2V)
   - Console: `[AI Planner] Reference image detected → Kling V1.6 I2V`

---

## 💡 未来优化方向

1. **用户预算感知**
   - 读取用户剩余Power Units
   - 余额不足时自动降级推荐

2. **用户历史偏好**
   - 记录用户常用模型
   - 学习用户质量偏好

3. **A/B测试**
   - 测试不同推荐策略
   - 优化转化率和用户满意度

4. **更细粒度的提示词分析**
   - 使用LLM分析提示词复杂度
   - 动态调整质量等级

---

## ✅ 总结

**新系统特点**:
- ✅ 多因素智能决策 (不只看参考图)
- ✅ 配音需求自动优化 (Sora 2内置音频)
- ✅ 质量关键词识别 (高质量自动升级)
- ✅ 时长感知推荐 (长视频用更好模型)
- ✅ 经济默认策略 (新用户友好)
- ✅ 保留用户控制权 (可手动切换)

**成本对比**:
- 经济: 307 PU (Seedance T2V)
- 标准: 401 PU (Kling V1.6 T2V)
- 高级: 751 PU (Sora 2 T2V)
- 参考图: 404 PU (T2I + Kling I2V)

**这才是真正的智能推荐系统！** 🎯
