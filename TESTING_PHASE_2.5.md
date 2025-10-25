# Phase 2.5 阶段 1 测试指南

## 测试目标

验证 WorkflowBuilder 能根据不同模型能力生成正确的工作流节点。

---

## 测试准备

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器控制台**
   - 按 F12 打开开发者工具
   - 切换到 Console 标签

---

## 测试场景 1: Kling V1（无音频模型）

### 操作步骤

1. 访问首页 `http://localhost:3000`
2. 输入测试提示词：
   ```
   A golden retriever running on the beach at sunset
   ```
3. 选择参数：
   - 时长：15秒
   - 平台：TikTok
   - 配音：女声（Female）
4. 点击"生成视频"

### 预期结果

**控制台输出应显示：**

```
=== Generated Workflow Nodes ===
Total nodes: 8-10

场景节点（每个场景 2 个节点）：
- t2i-0 (t2i): fal-ai/flux-dev
  Metadata: { sceneIndex: 0 }
- i2v-0 (i2v): fal-ai/kling-v1
  Dependencies: t2i-0
  Metadata: { sceneIndex: 0 }

- t2i-1 (t2i): fal-ai/flux-dev
  Metadata: { sceneIndex: 1 }
- i2v-1 (i2v): fal-ai/kling-v1
  Dependencies: t2i-1
  Metadata: { sceneIndex: 1 }

... (更多场景节点)

音频节点（因为选择了配音）：
- tts (tts): elevenlabs/turbo-v2

合并节点：
- merge (merge): internal/video-merger
  Dependencies: i2v-0, i2v-1, ...
================================
```

**验证要点：**
- ✅ 每个场景有 `t2i` 和 `i2v` 两个节点（Kling V1 仅支持 I2V）
- ✅ `i2v` 节点依赖对应的 `t2i` 节点
- ✅ 有独立的 `tts` 节点（因为 Kling V1 无音频生成能力）
- ✅ `merge` 节点依赖所有 `i2v` 节点

---

## 测试场景 2: Veo 3（带音频模型）

### 操作步骤

1. 访问首页
2. 输入相同的提示词
3. **手动修改模型**：
   - 在画布页面，点击 I2V 节点的模型下拉框
   - 选择 "Veo 3"
4. 选择配音：女声
5. 点击"生成视频"

### 预期结果

**控制台输出应显示：**

```
=== Generated Workflow Nodes ===
Total nodes: 5-7

场景节点（每个场景 1 个节点）：
- t2v-0 (t2v): fal-ai/veo-3
  Metadata: { sceneIndex: 0, audioSource: 'model' }
- t2v-1 (t2v): fal-ai/veo-3
  Metadata: { sceneIndex: 1, audioSource: 'model' }

... (更多场景节点)

音频节点（混音策略）：
- tts (tts): elevenlabs/turbo-v2

合并节点：
- merge (merge): internal/video-merger
  Dependencies: i2v-0, i2v-1, ...
================================
```

**验证要点：**
- ✅ 每个场景只有 1 个 `t2v` 节点（Veo 3 支持直接 T2V）
- ✅ 没有 `t2i` 节点（不需要先生成图片）
- ✅ `t2v` 节点的 `audioSource` 为 `'model'`（视频自带音频）
- ✅ 仍然有 `tts` 节点（混音策略：30% 视频音效 + 70% 配音）

---

## 测试场景 3: 无配音模式

### 操作步骤

1. 访问首页
2. 输入提示词
3. 选择参数：
   - 时长：15秒
   - 配音：**无配音（None）**
4. 点击"生成视频"

### 预期结果

**使用 Kling V1**：
```
Total nodes: 7-9

- t2i-0, i2v-0 (场景节点)
- t2i-1, i2v-1
...
- merge (无音频输入)
```

**验证要点：**
- ✅ **没有 `tts` 节点**（用户不要配音）
- ✅ Kling V1 无音频，最终视频也无音频

**使用 Veo 3**：
```
Total nodes: 4-6

- t2v-0 (audioSource: 'model')
- t2v-1
...
- merge (使用视频自带音频)
```

**验证要点：**
- ✅ **没有 `tts` 节点**
- ✅ Veo 3 生成的视频自带音效，保留使用

---

## 测试场景 4: Sora 2（自带配音）

### 操作步骤

1. 在画布页面选择 "Sora 2" 模型
2. 选择配音：女声
3. 点击"生成视频"

### 预期结果

```
=== Generated Workflow Nodes ===
Total nodes: 4-6

- t2v-0 (t2v): fal-ai/sora-2
  Metadata: { audioSource: 'model' }

... (更多场景节点)

合并节点：
- merge (使用 Sora 2 自带的配音)
================================
```

**验证要点：**
- ✅ **没有 `tts` 节点**（Sora 2 自动生成配音）
- ✅ 每个场景只有 1 个 `t2v` 节点
- ✅ `audioSource` 为 `'model'`

---

## 常见问题排查

### 问题 1: 控制台没有显示节点信息

**可能原因**：
- WorkflowBuilder 生成失败
- 检查浏览器控制台的错误信息

**排查步骤**：
1. 查看是否有红色错误信息
2. 检查 `workflowPlan.workflowNodes` 是否为空
3. 检查 AI Planner 是否正确调用 WorkflowBuilder

### 问题 2: 节点类型不符合预期

**可能原因**：
- 模型能力配置错误
- WorkflowBuilder 逻辑问题

**排查步骤**：
1. 检查 `src/config/models.ts` 中的 `capabilities` 配置
2. 查看控制台输出的模型 ID 是否正确
3. 确认选择的模型与预期一致

### 问题 3: 依赖关系不正确

**可能原因**：
- WorkflowBuilder 的 `buildSceneNodes` 逻辑问题

**排查步骤**：
1. 查看控制台输出的 `Dependencies` 字段
2. 验证 `i2v` 节点是否依赖对应的 `t2i` 节点
3. 验证 `merge` 节点是否依赖所有视频节点

---

## 测试通过标准

所有 4 个测试场景的控制台输出都符合预期：

- ✅ 场景 1: Kling V1 + 配音 → T2I→I2V 流程 + TTS
- ✅ 场景 2: Veo 3 + 配音 → T2V 流程 + TTS（混音）
- ✅ 场景 3: 无配音 → 无 TTS 节点
- ✅ 场景 4: Sora 2 + 配音 → T2V 流程，无 TTS（自带配音）

---

## 测试完成后

如果所有测试通过，告诉 Claude：

```
测试通过，可以备份推送
```

如果有问题，提供：
1. 控制台截图
2. 错误信息
3. 使用的测试参数
