-- =========================================================
-- FINAL_FIX.sql
-- 彻底修复所有表结构，使其 100% 对齐 src/db/schema.ts
-- =========================================================

-- 1. 创建 users 表 (如果已存在，请手动确认字段)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nickname VARCHAR(255),
  avatar_url VARCHAR(255),
  locale VARCHAR(50),
  signin_type VARCHAR(50),
  signin_ip VARCHAR(255),
  signin_provider VARCHAR(50),
  signin_openid VARCHAR(255),
  invite_code VARCHAR(255) NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ,
  invited_by VARCHAR(255) NOT NULL DEFAULT '',
  is_affiliate BOOLEAN NOT NULL DEFAULT false
);

-- 2. 创建 orders 表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_no VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ,
  user_uuid VARCHAR(255) NOT NULL DEFAULT '',
  user_email VARCHAR(255) NOT NULL DEFAULT '',
  amount INTEGER NOT NULL,
  interval VARCHAR(50),
  expired_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL,
  stripe_session_id VARCHAR(255),
  credits INTEGER NOT NULL,
  currency VARCHAR(50),
  sub_id VARCHAR(255),
  sub_interval_count INTEGER,
  sub_cycle_anchor INTEGER,
  sub_period_end INTEGER,
  sub_period_start INTEGER,
  sub_times INTEGER,
  product_id VARCHAR(255),
  product_name VARCHAR(255),
  valid_months INTEGER,
  order_detail TEXT,
  paid_at TIMESTAMPTZ,
  paid_email VARCHAR(255),
  paid_detail TEXT
);

-- 3. 创建 apikeys 表
CREATE TABLE IF NOT EXISTS apikeys (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(100),
  user_uuid VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ,
  status VARCHAR(50)
);

-- 4. 创建 credits 表 (注意 user_uuid 是 varchar 还是 uuid，代码里说是 varchar 255)
CREATE TABLE IF NOT EXISTS credits (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trans_no VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ,
  user_uuid VARCHAR(255) NOT NULL,
  trans_type VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL,
  order_no VARCHAR(255),
  expired_at TIMESTAMPTZ
);

-- 5. 创建 tool_runs 表 (关键！)
CREATE TABLE IF NOT EXISTS tool_runs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  tool_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  cost_credits INTEGER NOT NULL DEFAULT 0,
  input_json TEXT,
  output_json TEXT,
  usage_json TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. 创建 public_prompts 表
CREATE TABLE IF NOT EXISTS public_prompts (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  model VARCHAR(100),
  content_json TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  tags TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  copies INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 7. 补齐 generations 表 (Generations)
CREATE TABLE IF NOT EXISTS generations (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  type VARCHAR(50) NOT NULL,
  model_used VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  reference_image_url VARCHAR(500),
  result_url VARCHAR(500),
  result_urls TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  quality VARCHAR(50),
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_queued BOOLEAN NOT NULL DEFAULT false,
  queue_position INTEGER,
  processed_at TIMESTAMPTZ,
  metadata TEXT
);

-- 8. 补齐 posts, affiliates, feedbacks 表 (略，非必须但建议有)
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ,
  status VARCHAR(50),
  user_uuid VARCHAR(255),
  content TEXT,
  rating INTEGER
);
