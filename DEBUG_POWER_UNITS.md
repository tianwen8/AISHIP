# Power Units 余额不显示问题诊断

## 问题现象

用户登录后，主页右上角没有显示Power Units余额。

---

## 诊断步骤

### 1️⃣ 检查浏览器Console

打开浏览器开发者工具（F12），查看Console标签：

**查找错误信息**：
```
Failed to fetch credits
```

如果看到此错误，说明API调用失败。

---

### 2️⃣ 检查Network标签

在浏览器开发者工具中：

1. 切换到 **Network** 标签
2. 刷新页面
3. 查找请求：`/api/user/credits`

**检查响应**：
- **Status 200**：成功，查看响应数据
- **Status 401**：未登录
- **Status 500**：服务器错误

**正确的响应格式**：
```json
{
  "code": 0,
  "data": {
    "left_credits": 306,
    "is_pro": true,
    "is_recharged": false
  }
}
```

---

### 3️⃣ 检查数据库

**登录Supabase**（或你的数据库）：

```sql
-- 查看用户的credits记录
SELECT * FROM credits
WHERE user_uuid = '你的用户UUID'
ORDER BY created_at DESC;
```

**期望结果**：
- 新用户应该有1条记录
- `trans_type` = 'grant'
- `credits` = 306（如果系统使用micro-units，可能是3060）

**如果没有记录**：
说明新用户注册时没有自动赠送306 Power Units。

---

## 可能的原因

### 原因1：API调用失败

**症状**：Console有错误

**解决方法**：
1. 检查 `.env.local` 的 `DATABASE_URL` 是否正确
2. 检查数据库连接是否正常
3. 重启开发服务器

---

### 原因2：新用户没有获得赠送

**症状**：数据库中没有credits记录

**原因**：
- `src/services/user.ts` 的 `saveUser` 函数在新用户注册时应该自动调用 `increaseCredits`
- 可能OAuth回调流程有问题

**临时解决方法（手动添加）**：
```sql
-- 手动给用户添加306 Power Units
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at)
VALUES (
  '手动添加-' || NOW()::text,
  '你的用户UUID',
  'grant',
  3060,  -- 306 × 10 (micro-units)
  NOW()
);
```

---

### 原因3：Micro-units转换问题

**症状**：数据库有记录，但前端显示0

**检查**：
```typescript
// src/services/credit.ts
export enum CreditsAmount {
  NewUserGet = 306,  // 应该是306，不是50
}
```

**检查**：
```typescript
// src/models/credit.ts
// 确保有正确的单位转换函数
export function unitsToCredits(units: number): number {
  return units / SCALE;  // SCALE应该是10
}
```

---

### 原因4：Frontend State 问题

**症状**：API返回正确数据，但UI不显示

**检查代码**：
```typescript
// src/app/page.tsx
useEffect(() => {
  if (status === "authenticated" && session?.user) {
    fetch("/api/user/credits")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 0 && data.data) {
          console.log("Credits data:", data.data);  // 添加此行调试
          setUserCredits(data.data.left_credits || 0);
        }
      })
      .catch((err) => console.error("Failed to fetch credits:", err));
  }
}, [status, session]);
```

---

## 快速测试

**在浏览器Console中运行**：
```javascript
fetch('/api/user/credits')
  .then(r => r.json())
  .then(d => console.log(d))
```

**期望输出**：
```json
{
  "code": 0,
  "data": {
    "left_credits": 306,
    "is_pro": true
  }
}
```

---

## 解决后的验证

1. 刷新主页
2. 右上角应该显示：**💎 306 Power Units**
3. 点击"Generate Video"时不应该提示余额不足

---

**请按照以上步骤诊断，然后告诉我：**
1. Console有什么错误？
2. Network中 `/api/user/credits` 的响应是什么？
3. 数据库中是否有credits记录？
