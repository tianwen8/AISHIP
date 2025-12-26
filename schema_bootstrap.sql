-- =========================================================
-- ShipAny 2.6 Base Schema + PromptShip MVP additions
-- Run in Supabase SQL Editor (test DB only)
-- =========================================================

-- 0) Reset public schema (optional but recommended for clean install)
-- WARNING: This will DROP all existing tables/data in public schema.
-- Uncomment if you need a clean slate.
-- drop schema if exists public cascade;
-- create schema public;

-- 1) ShipAny 2.6 Base Schema (0000_wealthy_squirrel_girl.sql)
CREATE TABLE "affiliates" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "affiliates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "user_uuid" varchar(255) NOT NULL,
  "created_at" timestamp with time zone,
  "status" varchar(50) DEFAULT '' NOT NULL,
  "invited_by" varchar(255) NOT NULL,
  "paid_order_no" varchar(255) DEFAULT '' NOT NULL,
  "paid_amount" integer DEFAULT 0 NOT NULL,
  "reward_percent" integer DEFAULT 0 NOT NULL,
  "reward_amount" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "apikeys" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "apikeys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "api_key" varchar(255) NOT NULL,
  "title" varchar(100),
  "user_uuid" varchar(255) NOT NULL,
  "created_at" timestamp with time zone,
  "status" varchar(50),
  CONSTRAINT "apikeys_api_key_unique" UNIQUE("api_key")
);

CREATE TABLE "credits" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "credits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "trans_no" varchar(255) NOT NULL,
  "created_at" timestamp with time zone,
  "user_uuid" varchar(255) NOT NULL,
  "trans_type" varchar(50) NOT NULL,
  "credits" integer NOT NULL,
  "order_no" varchar(255),
  "expired_at" timestamp with time zone,
  CONSTRAINT "credits_trans_no_unique" UNIQUE("trans_no")
);

CREATE TABLE "preview_credits" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "preview_credits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "user_uuid" varchar(255) NOT NULL,
  "balance" integer NOT NULL DEFAULT 0,
  "period_start" timestamp with time zone,
  "period_end" timestamp with time zone,
  "updated_at" timestamp with time zone,
  CONSTRAINT "preview_credits_user_uuid_unique" UNIQUE("user_uuid")
);

CREATE TABLE "usage_counters" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usage_counters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "user_uuid" varchar(255) NOT NULL,
  "day_key" varchar(20) NOT NULL,
  "prompt_count" integer NOT NULL DEFAULT 0,
  "minute_key" varchar(20) NOT NULL,
  "minute_count" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone,
  CONSTRAINT "usage_counters_user_uuid_unique" UNIQUE("user_uuid")
);

CREATE TABLE "feedbacks" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feedbacks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "created_at" timestamp with time zone,
  "status" varchar(50),
  "user_uuid" varchar(255),
  "content" text,
  "rating" integer
);

CREATE TABLE "orders" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "order_no" varchar(255) NOT NULL,
  "created_at" timestamp with time zone,
  "user_uuid" varchar(255) DEFAULT '' NOT NULL,
  "user_email" varchar(255) DEFAULT '' NOT NULL,
  "amount" integer NOT NULL,
  "interval" varchar(50),
  "expired_at" timestamp with time zone,
  "status" varchar(50) NOT NULL,
  "stripe_session_id" varchar(255),
  "credits" integer NOT NULL,
  "currency" varchar(50),
  "sub_id" varchar(255),
  "sub_interval_count" integer,
  "sub_cycle_anchor" integer,
  "sub_period_end" integer,
  "sub_period_start" integer,
  "sub_times" integer,
  "product_id" varchar(255),
  "product_name" varchar(255),
  "valid_months" integer,
  "order_detail" text,
  "paid_at" timestamp with time zone,
  "paid_email" varchar(255),
  "paid_detail" text,
  CONSTRAINT "orders_order_no_unique" UNIQUE("order_no")
);

CREATE TABLE "posts" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "uuid" varchar(255) NOT NULL,
  "slug" varchar(255),
  "title" varchar(255),
  "description" text,
  "content" text,
  "created_at" timestamp with time zone,
  "updated_at" timestamp with time zone,
  "status" varchar(50),
  "cover_url" varchar(255),
  "author_name" varchar(255),
  "author_avatar_url" varchar(255),
  "locale" varchar(50),
  CONSTRAINT "posts_uuid_unique" UNIQUE("uuid")
);

CREATE TABLE "users" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "uuid" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "created_at" timestamp with time zone,
  "nickname" varchar(255),
  "avatar_url" varchar(255),
  "locale" varchar(50),
  "signin_type" varchar(50),
  "signin_ip" varchar(255),
  "signin_provider" varchar(50),
  "signin_openid" varchar(255),
  "invite_code" varchar(255) DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone,
  "invited_by" varchar(255) DEFAULT '' NOT NULL,
  "is_affiliate" boolean DEFAULT false NOT NULL,
  CONSTRAINT "users_uuid_unique" UNIQUE("uuid")
);

CREATE UNIQUE INDEX "email_provider_unique_idx" ON "users" USING btree ("email","signin_provider");

-- 2) PromptShip MVP additions
CREATE TABLE IF NOT EXISTS "tool_runs" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "uuid" varchar(255) NOT NULL UNIQUE,
  "user_uuid" varchar(255) NOT NULL,
  "tool_id" varchar(100) NOT NULL,
  "status" varchar(50) NOT NULL DEFAULT 'pending',
  "cost_credits" integer NOT NULL DEFAULT 0,
  "input_json" text,
  "output_json" text,
  "usage_json" text,
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "completed_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public_prompts" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "uuid" varchar(255) NOT NULL UNIQUE,
  "slug" varchar(255) NOT NULL UNIQUE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "model" varchar(100),
  "content_json" text NOT NULL,
  "thumbnail_url" varchar(500),
  "tags" text,
  "views" integer NOT NULL DEFAULT 0,
  "copies" integer NOT NULL DEFAULT 0,
  "is_featured" boolean NOT NULL DEFAULT false,
  "is_public" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone
);
