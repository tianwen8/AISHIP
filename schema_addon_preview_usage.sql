-- Minimal addon tables for Cineprompt (preview credits + usage counters)
-- Safe to run in Supabase SQL Editor; does not touch existing tables.

create table if not exists preview_credits (
  id integer generated always as identity primary key,
  user_uuid varchar(255) not null unique,
  balance integer not null default 0,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  updated_at timestamp with time zone
);

create table if not exists usage_counters (
  id integer generated always as identity primary key,
  user_uuid varchar(255) not null unique,
  day_key varchar(20) not null,
  prompt_count integer not null default 0,
  minute_key varchar(20) not null,
  minute_count integer not null default 0,
  updated_at timestamp with time zone
);
