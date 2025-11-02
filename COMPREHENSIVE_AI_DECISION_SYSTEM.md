# 全面AI决策系统 - 覆盖全部21个模型

## 🎯 系统特点

**之前**: 只考虑3个模型 (Seedance, Kling, Sora 2)
**现在**: 智能考虑所有21个模型，根据场景选择最优解

---

## 📊 所有21个模型概览

### T2V (Text-to-Video) - 8个模型

| 模型 | 成本(15s) | 速度 | 质量 | 音频 | 特点 |
|------|-----------|------|------|------|------|
| **LTX Video** | 23 PU | 慢 | Premium | ❌ | 最便宜！测试首选 |
| **Vidu Q1 T2V** | 121 PU | 超快 | High | ❌ | 速度优先 |
| **Veo 3.1 Fast T2V** | 226 PU | 快 | High | ✅ | 快速+音频 |
| **Seedance T2V** | 307 PU | 超快 | Good | ❌ | 新用户友好 |
| **Kling V1.6 T2V** | 401 PU | 中 | Very High | ❌ | 平衡选择 |
| **Veo 3.1 T2V** | 601 PU | 中 | Premium | ✅ | Google顶级 |
| **Sora 2 T2V** | 751 PU | 中 | Premium | ✅ | 配音首选 |
| **Kling V1.6 Pro T2V** | 1001 PU | 慢 | Premium | ❌ | 极致质量 |
| **Sora 2 T2V Pro** | 2251 PU | 中 | Ultra | ✅ | 顶级配音 |

### I2V (Image-to-Video) - 10个模型

| 模型 | 成本(15s) | 特点 |
|------|-----------|------|
| **Vidu Q2 I2V Pro** | 76 PU | 超便宜I2V |
| **Wan 2.5 I2V** | 76 PU | 阿里巴巴，有音乐 |
| **Vidu Reference** | 121 PU | 多图参考 |
| **Veo 3.1 Fast I2V** | 226 PU | 快速I2V |
| **Veo 3.1 Fast First/Last Frame** | 226 PU | **场景连贯关键** |
| **Seedance I2V** | 307 PU | 经济I2V |
| **Kling V1.6 I2V** | 401 PU | 平衡I2V |
| **Veo 3.1 I2V** | 601 PU | Google I2V |
| **Veo 3.1 Reference** | 601 PU | 多图+音频 |
| **Veo 3.1 First/Last Frame** | 601 PU | **多场景连贯最佳** |
| **Sora 2 I2V** | 751 PU | 顶级I2V |
| **Sora 2 I2V Pro** | 2251 PU | 极致I2V |

### Both (T2V + I2V) - 3个模型

| 模型 | 成本(15s) | 特点 |
|------|-----------|------|
| **MiniMax Video** | 181 PU | 独立音轨 |
| **Sora 2 Remix** | 751 PU | 视频转视频 |

---

## 🎯 决策优先级 (5层)

### 🥇 Priority 1: 多场景连贯性 (最关键！)

**问题**: 15s+视频通常需要2个以上场景，场景之间如何保持连贯？

**解决方案**: **Veo 3.1 First/Last Frame** 模型
- 可以控制每个场景的首帧和尾帧
- 下一个场景的首帧 = 上一个场景的尾帧
- 完美解决场景跳跃问题

**决策**:
```
多场景(15s+) + 无参考图:
  ├─ 高质量/配音 → Veo 3.1 First/Last Frame (601 PU)
  └─ 经济/速度   → Veo 3.1 Fast First/Last Frame (226 PU)
```

---

### 🥈 Priority 2: 音频生成需求

**有配音需求时，优先选择内置音频生成的模型**:

```
配音需求:
  ├─ 顶级质量 → Sora 2 T2V Pro (2251 PU, 最佳音质)
  ├─ 标准质量 → Veo 3.1 T2V (601 PU, Google音频)
  └─ 经济选择 → Veo 3.1 Fast T2V (226 PU, 有音频)
```

**带音频的模型**:
- ✅ Sora 2 系列: 配音 + 音效
- ✅ Veo 3.1 系列: 音乐 + 音效
- ✅ MiniMax: 独立音轨
- ✅ Wan 2.5: 背景音乐

---

### 🥉 Priority 3: 参考图一致性

**有参考图时的决策树**:

```
有参考图:
  ├─ 多场景 → Veo 3.1 Reference (601 PU, 多图支持)
  ├─ 高质量 → Sora 2 I2V (751 PU)
  ├─ 经济+快速 → Wan 2.5 I2V (76 PU, 有音乐)
  └─ 平衡选择 → Kling V1.6 I2V (401 PU)
```

---

### 4️⃣ Priority 4: 质量等级 + 速度 + 预算

**关键词识别**:
- **高质量**: `professional`, `cinematic`, `high quality`, `premium`
- **经济**: `quick`, `cheap`, `budget`, `test`
- **速度**: `fast`, `urgent`, `rapid`

**决策矩阵**:

| 需求 | 推荐模型 | 成本 | 理由 |
|------|----------|------|------|
| 测试/超便宜 | LTX Video | 23 PU | 最便宜 |
| 速度优先 | Vidu Q1 T2V | 121 PU | 10-20s生成 |
| 平衡质量 | Kling V1.6 T2V | 401 PU | 性价比高 |
| 高质量+长视频 | Veo 3.1 T2V | 601 PU | Google品质 |
| 极致质量 | Kling V1.6 Pro | 1001 PU | 顶级细节 |

---

### 5️⃣ Priority 5: 时长优化

```
时长分级:
  ├─ ≤8s   → LTX Video (23 PU, 超短视频)
  ├─ 8-15s → Seedance T2V (307 PU, 新用户友好)
  ├─ 16-30s → Veo 3.1 Fast (226 PU, 平衡)
  └─ 31-60s → Veo 3.1 (601 PU, 长视频连贯)
```

---

## 🎬 实际场景决策案例

### 案例1: 新用户测试 (最常见)
```yaml
输入:
  prompt: "Create a 15s TikTok video of a cat"
  duration: 15s
  voice: none
  reference: none

AI决策路径:
  ✓ 无多场景需求 (15s)
  ✓ 无配音
  ✓ 无参考图
  ✓ 短视频 ≤15s
  → 推荐: Seedance T2V

成本: 307 PU
工作流: [T2V] → [Merge]
Console: "[AI Planner] Short video → Seedance T2V (307 PU, new user friendly)"
```

---

### 案例2: 30s多场景TikTok (关键场景！)
```yaml
输入:
  prompt: "Create a 30s TikTok story about a day in the life"
  duration: 30s (会生成3个场景，每个10s)
  voice: none
  reference: none

AI决策路径:
  ✓ 多场景需求 (30s = 3 scenes)
  ✓ 场景连贯性最关键
  ✓ 无配音，经济需求
  → 推荐: Veo 3.1 Fast First/Last Frame

成本: 452 PU (226×2 scenes + 1 merge)
工作流: [T2V Scene 1] → [T2V Scene 2] → [T2V Scene 3] → [Merge]
Console: "[AI Planner] Multi-scene economy → Veo 3.1 Fast First/Last Frame (226 PU, fast + continuity)"

关键优势:
- 每个场景的尾帧自动匹配下个场景的首帧
- 完美的场景过渡，无跳跃感
- 比纯Seedance质量更好，比标准Veo便宜62.5%
```

---

### 案例3: 高质量商业视频 + 配音
```yaml
输入:
  prompt: "Create a professional 30s product showcase"
  duration: 30s
  voice: "male"
  reference: none

AI决策路径:
  ✓ 多场景 (30s)
  ✓ 配音需求 → 最高优先级
  ✓ 高质量关键词 "professional"
  → 推荐: Veo 3.1 T2V (有内置音频)

成本: 1203 PU (601×2 scenes + 1 merge)
工作流: [T2V Scene 1] → [T2V Scene 2] → [T2V Scene 3] → [Merge]
Console: "[AI Planner] Voiceover + standard → Veo 3.1 T2V (Google quality, 601 PU)"

为什么不用Sora 2?
- Veo 3.1更适合30s多场景（Sora限制4-12s）
- Google音频质量也很好
- 成本比Sora 2便宜20%
```

---

### 案例4: 角色一致性多场景
```yaml
输入:
  prompt: "Create a 30s video with this character"
  duration: 30s
  voice: none
  reference: [character_image.jpg]

AI决策路径:
  ✓ 有参考图
  ✓ 多场景需求
  → 推荐: Veo 3.1 Reference (支持多图参考)

成本: 1203 PU (601×2 scenes + 1 merge)
工作流: [I2V Scene 1] → [I2V Scene 2] → [I2V Scene 3] → [Merge]
Console: "[AI Planner] Multi-scene + ref image → Veo 3.1 Reference (multi-image support, 601 PU)"

关键优势:
- 支持多张参考图（每个场景可以不同pose）
- 保持角色一致性
- 内置音频生成
```

---

### 案例5: 测试/原型快速验证
```yaml
输入:
  prompt: "Quick test video for prototype"
  duration: 8s
  voice: none
  reference: none

AI决策路径:
  ✓ "test" 关键词
  ✓ "quick" 速度需求
  ✓ 超短视频 ≤8s
  → 推荐: LTX Video (最便宜)

成本: 24 PU (23 + 1 merge)
工作流: [T2V] → [Merge]
Console: "[AI Planner] Ultra-budget test → LTX Video (23 PU, cheapest!)"
```

---

### 案例6: 需要快速交付
```yaml
输入:
  prompt: "Urgent: need fast turnaround video"
  duration: 15s
  voice: none
  reference: none

AI决策路径:
  ✓ "urgent", "fast" 速度关键词
  → 推荐: Vidu Q1 T2V (10-20s生成)

成本: 122 PU (121 + 1 merge)
工作流: [T2V] → [Merge]
Console: "[AI Planner] Speed priority → Vidu Q1 T2V (121 PU, very fast)"
```

---

## 🆚 与旧系统对比

### ❌ 旧系统 (只考虑3个模型)
```
决策逻辑:
├─ 配音 → Sora 2 T2V (751 PU)
├─ 参考图 → Kling I2V (401 PU)
├─ 高质量 → Kling V1.6 T2V (401 PU)
└─ 默认 → Seedance T2V (307 PU)

覆盖模型: 3/21 (14%)
```

**问题**:
- ❌ 多场景连贯性无解决方案
- ❌ 忽略Veo 3.1的First/Last Frame功能
- ❌ 忽略超便宜的LTX (23 PU)
- ❌ 忽略超快的Vidu (10-20s生成)
- ❌ 忽略Wan 2.5 (76 PU + 音乐)
- ❌ 长视频(30s+)也用短视频模型

---

### ✅ 新系统 (全模型智能决策)
```
决策层级:
1. 多场景连贯 → Veo 3.1 First/Last Frame ⭐
2. 配音需求 → Veo 3.1 / Sora 2
3. 参考图 → Veo/Sora/Wan/Kling I2V系列
4. 质量+速度+预算 → 从21个模型中选最优
5. 时长优化 → 不同时长不同策略

覆盖模型: 21/21 (100%)
```

**优势**:
- ✅ **解决多场景连贯问题** (Veo 3.1 First/Last Frame)
- ✅ 测试场景超省钱 (LTX: 23 PU)
- ✅ 紧急场景超快速 (Vidu: 10-20s生成)
- ✅ 经济参考图方案 (Wan 2.5: 76 PU)
- ✅ 长视频质量保证 (Veo 3.1长视频优化)
- ✅ 多场景音频优化 (Veo系列内置音频)

---

## 📈 模型推荐矩阵

### 按场景分类

| 场景 | 最佳模型 | 备选 | 成本 |
|------|----------|------|------|
| 新用户试用 | Seedance T2V | LTX | 307 PU |
| 快速测试 | LTX Video | Vidu Q1 | 23 PU |
| 多场景TikTok | Veo 3.1 Fast First/Last | Veo 3.1 First/Last | 226 PU |
| 商业视频 | Kling V1.6 T2V | Veo 3.1 | 401 PU |
| 顶级质量 | Veo 3.1 T2V | Sora 2 | 601 PU |
| 配音视频 | Veo 3.1 T2V | Sora 2 | 601 PU |
| 角色一致 | Veo 3.1 Reference | Sora 2 I2V | 601 PU |
| 经济参考图 | Wan 2.5 I2V | Seedance I2V | 76 PU |
| 紧急快速 | Vidu Q1 T2V | Veo 3.1 Fast | 121 PU |

---

## 🔍 关键创新点

### 1. **Veo 3.1 First/Last Frame - 多场景连贯的终极方案**

**问题**: 30s TikTok需要3个场景，场景之间如何无缝衔接？

**解决方案**:
```
Scene 1 (0-10s):
  首帧: AI生成
  尾帧: 控制为特定画面

Scene 2 (10-20s):
  首帧: = Scene 1的尾帧  ← 关键！
  尾帧: 控制为下个画面

Scene 3 (20-30s):
  首帧: = Scene 2的尾帧
  尾帧: AI生成
```

**效果**: 完美的场景过渡，无跳跃感 ✨

---

### 2. **预算分级 - 从23 PU到2251 PU**

```
超便宜测试:  LTX (23 PU)
经济选择:    Seedance (307 PU)
平衡方案:    Kling V1.6 (401 PU)
高端质量:    Veo 3.1 (601 PU)
顶级配音:    Sora 2 Pro (2251 PU)
```

---

### 3. **速度优化 - 从10s到90s生成时间**

```
超快 (10-20s): Seedance, Vidu
快速 (15-30s): Veo 3.1 Fast, Wan 2.5
标准 (30-50s): Kling, Sora, Veo 3.1
慢速 (50-90s): Kling Pro, MiniMax, LTX
```

---

## 🧪 测试验证点

### 测试1: 15s普通短视频
```
输入: "Create a 15s video of a sunset"
预期: Seedance T2V, 307 PU
Console: "[AI Planner] Short video → Seedance T2V"
```

### 测试2: 30s多场景视频 ⭐
```
输入: "Create a 30s story video"
预期: Veo 3.1 Fast First/Last Frame, ~452 PU
Console: "[AI Planner] Multi-scene economy → Veo 3.1 Fast First/Last Frame"
```

### 测试3: 配音视频
```
输入: "Create 15s video" + voice: "male"
预期: Veo 3.1 T2V, 602 PU
Console: "[AI Planner] Voiceover + standard → Veo 3.1 T2V"
```

### 测试4: 高质量长视频
```
输入: "Create a professional 60s cinematic video"
预期: Veo 3.1 T2V, ~2404 PU
Console: "[AI Planner] Long premium video → Veo 3.1 T2V"
```

### 测试5: 紧急快速
```
输入: "Urgent: fast turnaround 15s video"
预期: Vidu Q1 T2V, 122 PU
Console: "[AI Planner] Speed priority → Vidu Q1 T2V"
```

### 测试6: 测试原型
```
输入: "Quick test video for prototype"
预期: LTX Video, 24 PU
Console: "[AI Planner] Ultra-budget test → LTX Video"
```

---

## 💡 未来优化方向

1. **用户余额感知**
   - 检测用户剩余Power Units
   - 不足时自动降级推荐
   - 提示充值或升级

2. **学习用户偏好**
   - 记录用户常选模型
   - 记录手动切换的模型
   - 个性化推荐权重

3. **A/B测试优化**
   - 测试不同推荐策略
   - 监控用户满意度
   - 优化决策权重

4. **LLM深度分析**
   - 使用DeepSeek分析提示词复杂度
   - 分析场景切换需求
   - 动态调整质量等级

---

## ✅ 总结

### 核心突破:
1. ✅ **覆盖全部21个模型** (之前只用3个)
2. ✅ **解决多场景连贯问题** (Veo 3.1 First/Last Frame)
3. ✅ **5层决策优先级** (多场景 > 音频 > 参考图 > 质量 > 时长)
4. ✅ **预算全覆盖** (23 PU ~ 2251 PU)
5. ✅ **速度全覆盖** (10s ~ 90s生成)

### 关键模型亮点:
- 🌟 **Veo 3.1 First/Last Frame** - 多场景连贯的终极方案
- ⚡ **Vidu Q1 T2V** - 10-20s超快生成
- 💰 **LTX Video** - 23 PU最便宜测试
- 🎵 **Veo 3.1 系列** - Google顶级质量+音频
- 🎬 **Wan 2.5** - 76 PU经济I2V+音乐

**这才是真正考虑所有模型的智能决策系统！** 🎯
