/**
 * Extended schema for AI Video SaaS
 * Adds new tables for template, graph, run, job, artifact, publishing, consent
 * Based on design in docs/11_Final_Development_Plan.md
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'

// Templates table - System provided workflow templates
export const templates = pgTable(
  'templates',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    name: varchar({ length: 255 }).notNull(), // "TikTok 产品宣传"
    description: text(),
    category: varchar({ length: 100 }).notNull(), // "ecommerce", "education", "entertainment"
    tags: text(), // JSON array: ["tiktok", "product", "ads"]
    thumbnail_url: varchar({ length: 500 }),
    graph_definition: jsonb().notNull(), // Complete ReactFlow graph JSON
    estimated_credits: integer().notNull().default(50), // Estimated cost
    estimated_duration: integer().notNull().default(60), // Estimated time in seconds
    required_tier: varchar({ length: 50 }).notNull().default('FREE'), // FREE, PRO, TEAM, ENTERPRISE
    is_featured: boolean().notNull().default(false),
    usage_count: integer().notNull().default(0),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
    updated_at: timestamp({ withTimezone: true }),
    status: varchar({ length: 50 }).notNull().default('active'), // active, archived
  },
  (table) => [
    index('templates_category_idx').on(table.category),
    index('templates_featured_idx').on(table.is_featured),
  ]
)

// Graphs table - User custom node canvases (saved as projects)
export const graphs = pgTable(
  'graphs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    user_uuid: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(), // User-defined project name
    description: text(),
    template_uuid: varchar({ length: 255 }), // If forked from template
    graph_definition: jsonb().notNull(), // ReactFlow nodes/edges
    thumbnail_url: varchar({ length: 500 }), // Auto-generated preview
    last_run_uuid: varchar({ length: 255 }), // Link to latest execution
    created_at: timestamp({ withTimezone: true }).defaultNow(),
    updated_at: timestamp({ withTimezone: true }),
    status: varchar({ length: 50 }).notNull().default('draft'), // draft, published, archived
  },
  (table) => [
    index('graphs_user_idx').on(table.user_uuid),
    index('graphs_template_idx').on(table.template_uuid),
  ]
)

// Runs table - Execution records of a graph
export const runs = pgTable(
  'runs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    user_uuid: varchar({ length: 255 }).notNull(),
    graph_uuid: varchar({ length: 255 }).notNull(),
    graph_snapshot: jsonb().notNull(), // Frozen graph definition at run time
    status: varchar({ length: 50 }).notNull().default('pending'), // pending, running, completed, failed, cancelled
    started_at: timestamp({ withTimezone: true }),
    completed_at: timestamp({ withTimezone: true }),
    total_credits_deducted: integer().notNull().default(0),
    total_credits_refunded: integer().notNull().default(0),
    error_message: text(),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('runs_user_idx').on(table.user_uuid),
    index('runs_graph_idx').on(table.graph_uuid),
    index('runs_status_idx').on(table.status),
  ]
)

// Jobs table - Individual node executions within a run
export const jobs = pgTable(
  'jobs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    run_uuid: varchar({ length: 255 }).notNull(),
    node_id: varchar({ length: 255 }).notNull(), // Node ID in graph
    node_type: varchar({ length: 100 }).notNull(), // SCRIPT.LLM, T2V.RUNWAY, etc
    adapter: varchar({ length: 100 }).notNull(), // llm/openrouter, t2v/runway
    input_params: jsonb().notNull(), // Input parameters for this node
    output_artifact_uuid: varchar({ length: 255 }), // Link to generated artifact
    status: varchar({ length: 50 }).notNull().default('pending'), // pending, running, completed, failed, cached
    credits_used: integer().notNull().default(0),
    started_at: timestamp({ withTimezone: true }),
    completed_at: timestamp({ withTimezone: true }),
    error_message: text(),
    cache_hit: boolean().notNull().default(false), // Was result from cache?
    provider_metadata: jsonb(), // Provider-specific response data
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('jobs_run_idx').on(table.run_uuid),
    index('jobs_status_idx').on(table.status),
  ]
)

// Artifacts table - Generated media files (video, image, audio)
export const artifacts = pgTable(
  'artifacts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    user_uuid: varchar({ length: 255 }).notNull(),
    run_uuid: varchar({ length: 255 }).notNull(),
    job_uuid: varchar({ length: 255 }).notNull(),
    artifact_type: varchar({ length: 50 }).notNull(), // video, image, audio, text
    file_url: varchar({ length: 500 }).notNull(), // R2/S3 URL
    file_size: integer(), // In bytes
    mime_type: varchar({ length: 100 }),
    duration: integer(), // For video/audio (seconds)
    width: integer(), // For image/video
    height: integer(), // For image/video
    metadata: jsonb(), // Additional file metadata
    created_at: timestamp({ withTimezone: true }).defaultNow(),
    expires_at: timestamp({ withTimezone: true }), // Free tier may expire after 30 days
  },
  (table) => [
    index('artifacts_user_idx').on(table.user_uuid),
    index('artifacts_run_idx').on(table.run_uuid),
    index('artifacts_job_idx').on(table.job_uuid),
  ]
)

// Node cache table - For intelligent caching of node execution results
export const node_cache = pgTable(
  'node_cache',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    cache_key: varchar({ length: 255 }).notNull().unique(), // SHA256(node_type + adapter + input_params)
    node_type: varchar({ length: 100 }).notNull(),
    adapter: varchar({ length: 100 }).notNull(),
    input_params_hash: varchar({ length: 64 }).notNull(), // SHA256 hash
    output_artifact_uuid: varchar({ length: 255 }).notNull(),
    hit_count: integer().notNull().default(1),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
    last_hit_at: timestamp({ withTimezone: true }).defaultNow(),
    expires_at: timestamp({ withTimezone: true }), // Cache TTL (30 days)
  },
  (table) => [index('node_cache_key_idx').on(table.cache_key)]
)

// Publishing accounts table - User connected social media accounts
export const publishing_accounts = pgTable(
  'publishing_accounts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    user_uuid: varchar({ length: 255 }).notNull(),
    platform: varchar({ length: 50 }).notNull(), // tiktok, youtube, instagram, etc
    account_name: varchar({ length: 255 }),
    account_id: varchar({ length: 255 }).notNull(), // Platform-specific user ID
    access_token: text(), // Encrypted OAuth token
    refresh_token: text(), // Encrypted OAuth refresh token
    token_expires_at: timestamp({ withTimezone: true }),
    status: varchar({ length: 50 }).notNull().default('active'), // active, expired, revoked
    created_at: timestamp({ withTimezone: true }).defaultNow(),
    updated_at: timestamp({ withTimezone: true }),
  },
  (table) => [index('publishing_accounts_user_idx').on(table.user_uuid)]
)

// Publishing tasks table - Track video publishing status
export const publishing_tasks = pgTable(
  'publishing_tasks',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    user_uuid: varchar({ length: 255 }).notNull(),
    run_uuid: varchar({ length: 255 }).notNull(),
    artifact_uuid: varchar({ length: 255 }).notNull(), // Video to publish
    account_uuid: varchar({ length: 255 }).notNull(), // Publishing account
    platform: varchar({ length: 50 }).notNull(),
    title: varchar({ length: 500 }),
    description: text(),
    tags: text(), // JSON array
    scheduled_at: timestamp({ withTimezone: true }), // For scheduled posts
    published_at: timestamp({ withTimezone: true }),
    platform_post_id: varchar({ length: 255 }), // ID returned by platform
    platform_post_url: varchar({ length: 500 }), // Public URL
    status: varchar({ length: 50 }).notNull().default('pending'), // pending, publishing, published, failed
    error_message: text(),
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('publishing_tasks_user_idx').on(table.user_uuid),
    index('publishing_tasks_run_idx').on(table.run_uuid),
    index('publishing_tasks_status_idx').on(table.status),
  ]
)

// Consents table - User authorization for digital human/voice cloning
export const consents = pgTable(
  'consents',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    user_uuid: varchar({ length: 255 }).notNull(),
    consent_type: varchar({ length: 50 }).notNull(), // voice_clone, digital_human, likeness
    subject_name: varchar({ length: 255 }), // Name of person giving consent
    relationship: varchar({ length: 100 }), // self, employee, contractor, talent
    proof_file_url: varchar({ length: 500 }), // Signed document/video proof
    approved_use_cases: text(), // JSON array: ["marketing", "training"]
    restrictions: text(), // JSON: {"no_political": true, "no_adult": true}
    granted_at: timestamp({ withTimezone: true }).defaultNow(),
    expires_at: timestamp({ withTimezone: true }),
    revoked_at: timestamp({ withTimezone: true }),
    status: varchar({ length: 50 }).notNull().default('active'), // active, expired, revoked
    created_at: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('consents_user_idx').on(table.user_uuid),
    index('consents_type_idx').on(table.consent_type),
  ]
)
