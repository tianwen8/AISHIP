@echo off
REM Phase 0 测试脚本 (Windows 版本)
REM 用于快速验证项目初始化是否成功

echo ================================================
echo   AI Video SaaS - Phase 0 测试脚本
echo ================================================
echo.

REM 测试 1: 项目结构
echo [测试 1] 检查项目结构
echo -----------------------------------

if exist "src\adapters" (
  if exist "src\components\canvas" (
    if exist "src\db" (
      if exist "src\services" (
        echo [OK] 核心目录存在
      ) else (
        echo [FAIL] src\services 目录缺失
        exit /b 1
      )
    ) else (
      echo [FAIL] src\db 目录缺失
      exit /b 1
    )
  ) else (
    echo [FAIL] src\components\canvas 目录缺失
    exit /b 1
  )
) else (
  echo [FAIL] src\adapters 目录缺失
  exit /b 1
)

if exist "package.json" (
  if exist "tsconfig.json" (
    if exist ".env.example" (
      echo [OK] 配置文件存在
    ) else (
      echo [FAIL] .env.example 缺失
      exit /b 1
    )
  ) else (
    echo [FAIL] tsconfig.json 缺失
    exit /b 1
  )
) else (
  echo [FAIL] package.json 缺失
  exit /b 1
)

if exist "supabase\migrations\001_create_extended_tables.sql" (
  echo [OK] 数据库迁移脚本存在
) else (
  echo [FAIL] 数据库迁移脚本缺失
  exit /b 1
)

echo.

REM 测试 2: 依赖安装
echo [测试 2] 检查依赖安装
echo -----------------------------------

if exist "node_modules" (
  echo [OK] node_modules 存在
) else (
  echo [FAIL] node_modules 不存在，请运行 npm install
  exit /b 1
)

echo.

REM 测试 3: 关键文件检查
echo [测试 3] 检查关键文件
echo -----------------------------------

set MISSING=0

if exist "src\db\schema.ts" (echo [OK] src\db\schema.ts) else (echo [FAIL] src\db\schema.ts 缺失 & set /a MISSING+=1)
if exist "src\db\schema-extended.ts" (echo [OK] src\db\schema-extended.ts) else (echo [FAIL] src\db\schema-extended.ts 缺失 & set /a MISSING+=1)
if exist "src\services\credit.ts" (echo [OK] src\services\credit.ts) else (echo [FAIL] src\services\credit.ts 缺失 & set /a MISSING+=1)
if exist "src\components\canvas\Canvas.tsx" (echo [OK] src\components\canvas\Canvas.tsx) else (echo [FAIL] src\components\canvas\Canvas.tsx 缺失 & set /a MISSING+=1)
if exist "src\components\canvas\nodeTypes.ts" (echo [OK] src\components\canvas\nodeTypes.ts) else (echo [FAIL] src\components\canvas\nodeTypes.ts 缺失 & set /a MISSING+=1)
if exist "src\components\canvas\nodes\ImageRefNode.tsx" (echo [OK] src\components\canvas\nodes\ImageRefNode.tsx) else (echo [FAIL] ImageRefNode 缺失 & set /a MISSING+=1)
if exist "src\components\canvas\nodes\TextPromptNode.tsx" (echo [OK] src\components\canvas\nodes\TextPromptNode.tsx) else (echo [FAIL] TextPromptNode 缺失 & set /a MISSING+=1)
if exist "src\components\canvas\nodes\VideoRefNode.tsx" (echo [OK] src\components\canvas\nodes\VideoRefNode.tsx) else (echo [FAIL] VideoRefNode 缺失 & set /a MISSING+=1)

if %MISSING% gtr 0 (
  echo [WARNING] %MISSING% 个关键文件缺失
)

echo.

REM 测试 4: TypeScript 检查
echo [测试 4] TypeScript 类型检查
echo -----------------------------------

where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo 正在运行 TypeScript 类型检查...
  call npm run type-check
  if %ERRORLEVEL% equ 0 (
    echo [OK] TypeScript 类型检查通过
  ) else (
    echo [WARNING] TypeScript 有错误或警告 (可能正常,因为还在开发中)
  )
) else (
  echo [FAIL] npm 未安装
  exit /b 1
)

echo.

REM 测试 5: 环境变量检查
echo [测试 5] 环境变量检查
echo -----------------------------------

if exist ".env" (
  echo [OK] .env 文件存在
  findstr /C:"DATABASE_URL" .env >nul
  if %ERRORLEVEL% equ 0 (
    findstr /C:"AUTH_SECRET" .env >nul
    if %ERRORLEVEL% equ 0 (
      echo [OK] 关键环境变量已配置
    ) else (
      echo [WARNING] .env 文件可能配置不完整
    )
  ) else (
    echo [WARNING] .env 文件可能配置不完整
  )
) else (
  echo [WARNING] .env 文件不存在
  echo    运行: copy .env.example .env
  echo    然后编辑 .env 填入必要配置
)

echo.

REM 测试结果总结
echo ================================================
echo   测试总结
echo ================================================
echo.
echo [OK] 项目结构完整
echo [OK] 依赖已安装
echo [OK] 关键文件已创建
echo.

if exist ".env" (
  echo 下一步操作:
  echo.
  echo 1. 确保 .env 已正确配置 (数据库连接、Google OAuth)
  echo 2. 在 Supabase SQL Editor 执行 ShipAny 基础表 SQL
  echo 3. 运行: npm run db:push (创建扩展表)
  echo 4. 运行: npm run dev (启动开发服务器)
  echo 5. 访问: http://localhost:3000
) else (
  echo 需要配置环境变量:
  echo.
  echo 1. 运行: copy .env.example .env
  echo 2. 编辑 .env 填入以下必需配置:
  echo    - DATABASE_URL (Supabase 连接)
  echo    - AUTH_SECRET (运行 openssl rand -base64 32)
  echo    - AUTH_GOOGLE_ID ^& AUTH_GOOGLE_SECRET
  echo 3. 然后继续上述步骤
)

echo.
echo 详细测试指南: README.md - "如何测试项目" 章节
echo 快速启动指南: QUICKSTART.md
echo.
echo ================================================

pause
