import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ withTimezone: true }),
    nickname: varchar({ length: 255 }),
    avatar_url: varchar({ length: 255 }),
    locale: varchar({ length: 50 }),
    signin_type: varchar({ length: 50 }),
    signin_ip: varchar({ length: 255 }),
    signin_provider: varchar({ length: 50 }),
    signin_openid: varchar({ length: 255 }),
    invite_code: varchar({ length: 255 }).notNull().default(""),
    updated_at: timestamp({ withTimezone: true }),
    invited_by: varchar({ length: 255 }).notNull().default(""),
    is_affiliate: boolean().notNull().default(false),
  },
  (table) => [
    uniqueIndex("email_provider_unique_idx").on(
      table.email,
      table.signin_provider
    ),
  ]
);

// Orders table
export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  order_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull().default(""),
  user_email: varchar({ length: 255 }).notNull().default(""),
  amount: integer().notNull(),
  interval: varchar({ length: 50 }),
  expired_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull(),
  stripe_session_id: varchar({ length: 255 }),
  credits: integer().notNull(),
  currency: varchar({ length: 50 }),
  sub_id: varchar({ length: 255 }),
  sub_interval_count: integer(),
  sub_cycle_anchor: integer(),
  sub_period_end: integer(),
  sub_period_start: integer(),
  sub_times: integer(),
  product_id: varchar({ length: 255 }),
  product_name: varchar({ length: 255 }),
  valid_months: integer(),
  order_detail: text(),
  paid_at: timestamp({ withTimezone: true }),
  paid_email: varchar({ length: 255 }),
  paid_detail: text(),
});

// API Keys table
export const apikeys = pgTable("apikeys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  api_key: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 100 }),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
});

// Credits table
export const credits = pgTable("credits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  trans_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull(),
  trans_type: varchar({ length: 50 }).notNull(),
  credits: integer().notNull(),
  order_no: varchar({ length: 255 }),
  expired_at: timestamp({ withTimezone: true }),
});

// Posts table
export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  slug: varchar({ length: 255 }),
  title: varchar({ length: 255 }),
  description: text(),
  content: text(),
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  cover_url: varchar({ length: 255 }),
  author_name: varchar({ length: 255 }),
  author_avatar_url: varchar({ length: 255 }),
  locale: varchar({ length: 50 }),
});

// Affiliates table
export const affiliates = pgTable("affiliates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull().default(""),
  invited_by: varchar({ length: 255 }).notNull(),
  paid_order_no: varchar({ length: 255 }).notNull().default(""),
  paid_amount: integer().notNull().default(0),
  reward_percent: integer().notNull().default(0),
  reward_amount: integer().notNull().default(0),
});

// Feedbacks table
export const feedbacks = pgTable("feedbacks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  user_uuid: varchar({ length: 255 }),
  content: text(),
  rating: integer(),
});

// Generations table (AI Image/Video generations)
export const generations = pgTable("generations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }),
  type: varchar({ length: 50 }).notNull(), // 'image' or 'video'
  model_used: varchar({ length: 255 }).notNull(),
  prompt: text().notNull(),
  negative_prompt: text(),
  reference_image_url: varchar({ length: 500 }), // Will store S3/R2 URLs in the future
  result_url: varchar({ length: 500 }), // Will store S3/R2 URLs in the future (nullable - not storing base64)
  result_urls: text(), // JSON array for multiple results
  credits_used: integer().notNull().default(0),
  status: varchar({ length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  error_message: text(),
  quality: varchar({ length: 50 }), // standard, hd, ultra
  width: integer(),
  height: integer(),
  duration: integer(), // for videos (in seconds)
  is_public: boolean().notNull().default(false),
  is_queued: boolean().notNull().default(false), // for free users
  queue_position: integer(),
  processed_at: timestamp({ withTimezone: true }),
  metadata: text(), // JSON for additional data
});

// ==============================================================================
// AISHIP / PromptShip Tables
// ==============================================================================

// Tool Runs table (Generic execution record for AI Ship tools)
export const tool_runs = pgTable("tool_runs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  tool_id: varchar({ length: 100 }).notNull(), // e.g., "video-storyboard"
  status: varchar({ length: 50 }).notNull().default("pending"), // pending, running, completed, failed
  cost_credits: integer().notNull().default(0),
  input_json: text(), // JSON string of user inputs
  output_json: text(), // JSON string of tool results (the script/storyboard)
  usage_json: text(), // JSON string of token usage / API metadata
  error_message: text(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  completed_at: timestamp({ withTimezone: true }),
});

// Public Prompts table (SEO Plaza)
export const public_prompts = pgTable("public_prompts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  slug: varchar({ length: 255 }).notNull().unique(), // URL-friendly slug
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  
  // Content
  model: varchar({ length: 100 }), // sora, kling, runway
  content_json: text().notNull(), // The full storyboard/prompt JSON
  thumbnail_url: varchar({ length: 500 }), // Flux generated preview
  tags: text(), // JSON array: ["cyberpunk", "ad"]

  // Stats
  views: integer().notNull().default(0),
  copies: integer().notNull().default(0),
  
  // Status
  is_featured: boolean().notNull().default(false),
  is_public: boolean().notNull().default(true),
  
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }),
});
