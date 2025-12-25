-- ==========================================
-- 对齐代码 schema 的最新建表语句
-- ==========================================

-- 1. 彻底清空旧表 (谨慎操作)
DROP TABLE IF EXISTS users CASCADE;

-- 2. 创建对齐代码的 users 表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  nickname VARCHAR(255),
  avatar_url TEXT,
  locale VARCHAR(50) DEFAULT 'en',
  signin_type VARCHAR(50),
  signin_ip VARCHAR(50),
  signin_provider VARCHAR(50),
  signin_openid VARCHAR(255),
  invite_code VARCHAR(100),
  invited_by VARCHAR(100),
  is_affiliate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 其他表通常没问题，但为了保险也检查一下 credits
ALTER TABLE credits ALTER COLUMN user_uuid TYPE UUID USING user_uuid::UUID;
