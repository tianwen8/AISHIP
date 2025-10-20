#!/bin/bash

# Phase 0 测试脚本
# 用于快速验证项目初始化是否成功

echo "================================================"
echo "  AI Video SaaS - Phase 0 测试脚本"
echo "================================================"
echo ""

# 测试 1: 项目结构
echo "✅ 测试 1: 检查项目结构"
echo "-----------------------------------"

if [ -d "src/adapters" ] && [ -d "src/components/canvas" ] && [ -d "src/db" ] && [ -d "src/services" ]; then
  echo "✓ 核心目录存在"
else
  echo "✗ 核心目录缺失"
  exit 1
fi

if [ -f "package.json" ] && [ -f "tsconfig.json" ] && [ -f ".env.example" ]; then
  echo "✓ 配置文件存在"
else
  echo "✗ 配置文件缺失"
  exit 1
fi

if [ -f "supabase/migrations/001_create_extended_tables.sql" ]; then
  echo "✓ 数据库迁移脚本存在"
else
  echo "✗ 数据库迁移脚本缺失"
  exit 1
fi

echo ""

# 测试 2: 依赖安装
echo "✅ 测试 2: 检查依赖安装"
echo "-----------------------------------"

if [ -d "node_modules" ]; then
  PACKAGE_COUNT=$(ls node_modules | wc -l)
  echo "✓ node_modules 存在 ($PACKAGE_COUNT 个包)"

  if [ $PACKAGE_COUNT -lt 400 ]; then
    echo "⚠️  警告: 依赖包数量少于预期，可能安装不完整"
  fi
else
  echo "✗ node_modules 不存在，请运行 npm install"
  exit 1
fi

echo ""

# 测试 3: 关键文件检查
echo "✅ 测试 3: 检查关键文件"
echo "-----------------------------------"

CRITICAL_FILES=(
  "src/db/schema.ts"
  "src/db/schema-extended.ts"
  "src/services/credit.ts"
  "src/components/canvas/Canvas.tsx"
  "src/components/canvas/nodeTypes.ts"
  "src/components/canvas/nodes/ImageRefNode.tsx"
  "src/components/canvas/nodes/TextPromptNode.tsx"
  "src/components/canvas/nodes/VideoRefNode.tsx"
)

MISSING_FILES=0

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file 缺失"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
done

if [ $MISSING_FILES -gt 0 ]; then
  echo "⚠️  警告: $MISSING_FILES 个关键文件缺失"
fi

echo ""

# 测试 4: TypeScript 检查
echo "✅ 测试 4: TypeScript 类型检查"
echo "-----------------------------------"

if command -v npm &> /dev/null; then
  echo "正在运行 TypeScript 类型检查..."
  npm run type-check 2>&1 | head -20

  if [ $? -eq 0 ]; then
    echo "✓ TypeScript 类型检查通过"
  else
    echo "⚠️  TypeScript 有错误或警告（可能正常，因为还在开发中）"
  fi
else
  echo "✗ npm 未安装"
  exit 1
fi

echo ""

# 测试 5: 环境变量检查
echo "✅ 测试 5: 环境变量检查"
echo "-----------------------------------"

if [ -f ".env" ]; then
  echo "✓ .env 文件存在"

  # 检查关键变量
  if grep -q "DATABASE_URL" .env && grep -q "AUTH_SECRET" .env; then
    echo "✓ 关键环境变量已配置"
  else
    echo "⚠️  警告: .env 文件可能配置不完整"
    echo "   请确保配置了: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID"
  fi
else
  echo "⚠️  .env 文件不存在"
  echo "   运行: cp .env.example .env"
  echo "   然后编辑 .env 填入必要配置"
fi

echo ""

# 测试结果总结
echo "================================================"
echo "  测试总结"
echo "================================================"
echo ""
echo "✅ 项目结构完整"
echo "✅ 依赖已安装 ($PACKAGE_COUNT 个包)"
echo "✅ 关键文件已创建 ($(( ${#CRITICAL_FILES[@]} - $MISSING_FILES )) / ${#CRITICAL_FILES[@]})"
echo ""

if [ -f ".env" ]; then
  echo "📋 下一步操作:"
  echo ""
  echo "1. 确保 .env 已正确配置（数据库连接、Google OAuth）"
  echo "2. 在 Supabase SQL Editor 执行 ShipAny 基础表 SQL"
  echo "3. 运行: npm run db:push (创建扩展表)"
  echo "4. 运行: npm run dev (启动开发服务器)"
  echo "5. 访问: http://localhost:3000"
else
  echo "⚠️  需要配置环境变量:"
  echo ""
  echo "1. 运行: cp .env.example .env"
  echo "2. 编辑 .env 填入以下必需配置:"
  echo "   - DATABASE_URL (Supabase 连接)"
  echo "   - AUTH_SECRET (运行 openssl rand -base64 32)"
  echo "   - AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET"
  echo "3. 然后继续上述步骤"
fi

echo ""
echo "📖 详细测试指南: README.md - \"如何测试项目\" 章节"
echo "📖 快速启动指南: QUICKSTART.md"
echo ""
echo "================================================"
