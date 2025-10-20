-- AI Video SaaS Extended Schema Migration
-- Creates new tables for templates, graphs, runs, jobs, artifacts, publishing, consents
-- Date: 2025-10-16

-- ============================================
-- Templates Table
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  tags TEXT, -- JSON array
  thumbnail_url VARCHAR(500),
  graph_definition JSONB NOT NULL,
  estimated_credits INTEGER NOT NULL DEFAULT 50,
  estimated_duration INTEGER NOT NULL DEFAULT 60,
  required_tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_featured ON templates(is_featured);

-- ============================================
-- Graphs Table (User Projects)
-- ============================================
CREATE TABLE IF NOT EXISTS graphs (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_uuid VARCHAR(255),
  graph_definition JSONB NOT NULL,
  thumbnail_url VARCHAR(500),
  last_run_uuid VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
);

CREATE INDEX idx_graphs_user ON graphs(user_uuid);
CREATE INDEX idx_graphs_template ON graphs(template_uuid);

-- ============================================
-- Runs Table (Execution Records)
-- ============================================
CREATE TABLE IF NOT EXISTS runs (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  graph_uuid VARCHAR(255) NOT NULL,
  graph_snapshot JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_credits_deducted INTEGER NOT NULL DEFAULT 0,
  total_credits_refunded INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runs_user ON runs(user_uuid);
CREATE INDEX idx_runs_graph ON runs(graph_uuid);
CREATE INDEX idx_runs_status ON runs(status);

-- ============================================
-- Jobs Table (Individual Node Executions)
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  run_uuid VARCHAR(255) NOT NULL,
  node_id VARCHAR(255) NOT NULL,
  node_type VARCHAR(100) NOT NULL,
  adapter VARCHAR(100) NOT NULL,
  input_params JSONB NOT NULL,
  output_artifact_uuid VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  credits_used INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  cache_hit BOOLEAN NOT NULL DEFAULT false,
  provider_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_run ON jobs(run_uuid);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ============================================
-- Artifacts Table (Generated Media)
-- ============================================
CREATE TABLE IF NOT EXISTS artifacts (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  run_uuid VARCHAR(255) NOT NULL,
  job_uuid VARCHAR(255) NOT NULL,
  artifact_type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  duration INTEGER,
  width INTEGER,
  height INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_artifacts_user ON artifacts(user_uuid);
CREATE INDEX idx_artifacts_run ON artifacts(run_uuid);
CREATE INDEX idx_artifacts_job ON artifacts(job_uuid);

-- ============================================
-- Node Cache Table
-- ============================================
CREATE TABLE IF NOT EXISTS node_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  node_type VARCHAR(100) NOT NULL,
  adapter VARCHAR(100) NOT NULL,
  input_params_hash VARCHAR(64) NOT NULL,
  output_artifact_uuid VARCHAR(255) NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_hit_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_node_cache_key ON node_cache(cache_key);

-- ============================================
-- Publishing Accounts Table
-- ============================================
CREATE TABLE IF NOT EXISTS publishing_accounts (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  account_name VARCHAR(255),
  account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX idx_publishing_accounts_user ON publishing_accounts(user_uuid);

-- ============================================
-- Publishing Tasks Table
-- ============================================
CREATE TABLE IF NOT EXISTS publishing_tasks (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  run_uuid VARCHAR(255) NOT NULL,
  artifact_uuid VARCHAR(255) NOT NULL,
  account_uuid VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  title VARCHAR(500),
  description TEXT,
  tags TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  platform_post_id VARCHAR(255),
  platform_post_url VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_publishing_tasks_user ON publishing_tasks(user_uuid);
CREATE INDEX idx_publishing_tasks_run ON publishing_tasks(run_uuid);
CREATE INDEX idx_publishing_tasks_status ON publishing_tasks(status);

-- ============================================
-- Consents Table
-- ============================================
CREATE TABLE IF NOT EXISTS consents (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  user_uuid VARCHAR(255) NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  subject_name VARCHAR(255),
  relationship VARCHAR(100),
  proof_file_url VARCHAR(500),
  approved_use_cases TEXT,
  restrictions TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consents_user ON consents(user_uuid);
CREATE INDEX idx_consents_type ON consents(consent_type);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE templates IS 'System-provided workflow templates for quick start';
COMMENT ON TABLE graphs IS 'User custom node canvas projects';
COMMENT ON TABLE runs IS 'Execution records of a graph (one graph can have multiple runs)';
COMMENT ON TABLE jobs IS 'Individual node execution within a run';
COMMENT ON TABLE artifacts IS 'Generated media files (video, image, audio, text)';
COMMENT ON TABLE node_cache IS 'Intelligent cache for node execution results';
COMMENT ON TABLE publishing_accounts IS 'User connected social media accounts for publishing';
COMMENT ON TABLE publishing_tasks IS 'Video publishing tasks to social platforms';
COMMENT ON TABLE consents IS 'User authorization for digital human/voice cloning';
