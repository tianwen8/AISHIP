# Manual Supabase Database Setup

Due to connection timeout issues with `drizzle-kit push`, please apply the database schema manually.

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/mrmjaicsxosjckkbghcz/sql/new
2. Copy the SQL from `supabase/migrations/0000_naive_alex_power.sql`
3. Paste and click "Run"

## Step 2: Verify Tables Created

Run this query to verify:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see these tables:
- users
- runs
- graphs
- jobs
- artifacts
- templates
- publishing_accounts
- publishing_tasks
- consents
- node_cache
- orders
- credits
- apikeys
- feedbacks
- generations
- posts
- affiliates

## Step 3: Confirm Connection

After tables are created, come back and I'll update the application code to use real database operations instead of mocks.

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Login
supabase login

# Link project
supabase link --project-ref mrmjaicsxosjckkbghcz

# Push migrations
supabase db push
```
