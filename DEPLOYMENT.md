# Deployment Guide - PromptShip (Video Prompt SaaS)

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Database** - Neon/Supabase PostgreSQL database
3. **Google OAuth App** - For authentication
4. **Creem Account** - For payment processing
5. **AI API Keys** - OpenAI, Fal.ai, etc.

## Environment Variables Setup

### Required Environment Variables

Copy these to your Vercel project settings (Settings → Environment Variables):

#### Database (Neon/Supabase)
```bash
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"
```

#### Authentication (NextAuth.js)
```bash
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"

# Google OAuth
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Optional: GitHub OAuth
NEXT_PUBLIC_AUTH_GITHUB_ENABLED="false"
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

#### Payment (Creem)
```bash
PAY_PROVIDER="creem"
CREEM_ENV="production"
CREEM_API_KEY="your-creem-api-key"
CREEM_WEBHOOK_SECRET="your-creem-webhook-secret"
CREEM_PRODUCTS='[{"product_id":"starter_monthly","price_id":"creem_price_xxx"},{"product_id":"pro_monthly","price_id":"creem_price_yyy"},{"product_id":"business_monthly","price_id":"creem_price_zzz"}]'

# Payment URLs
NEXT_PUBLIC_PAY_SUCCESS_URL="/dashboard"
NEXT_PUBLIC_PAY_FAIL_URL="/pricing"
NEXT_PUBLIC_PAY_CANCEL_URL="/pricing"
NEXT_PUBLIC_WEB_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_PROJECT_NAME="PromptShip"
```

#### AI Services
```bash
# LLM (Director Logic)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
DEEPSEEK_API_KEY="..."
OPENROUTER_API_KEY="sk-or-..."

# Image Generation (Previews)
FAL_API_KEY="..."
```

## Step-by-Step Deployment

### 1. Database Setup

#### Option A: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Run migrations:
```bash
npm run db:push
```

#### Option B: Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string
4. Run migrations:
```bash
npm run db:push
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `https://your-domain.vercel.app`
   - **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`
5. Copy Client ID and Client Secret

> **Note**: This project uses NextAuth.js. You do **NOT** need to enable Google Login in the Supabase Authentication dashboard. The database is only used to store user records.

### 3. Creem Payment Setup

1. Sign up at [creem.io](https://creem.io)
2. Create products in Creem dashboard:
   - Starter Plan: $18/month, 200 credits
   - Pro Plan: $30/month, 400 credits
   - Business Plan: $88/month, 1200 credits
3. Copy API Key and Webhook Secret
4. Set webhook URL to: `https://your-domain.vercel.app/api/pay/notify/creem`
5. Copy price IDs for CREEM_PRODUCTS JSON

### 4. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (from section above)
6. Click "Deploy"

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5. Post-Deployment Configuration

1. **Update Google OAuth**:
   - Add Vercel domain to authorized origins
   - Add callback URL: `https://your-domain.vercel.app/api/auth/callback/google`

2. **Update Creem Webhook**:
   - Set webhook URL to: `https://your-domain.vercel.app/api/pay/notify/creem`

3. **Test Payment Flow**:
   - Visit pricing page
   - Test checkout with Creem test cards
   - Verify webhook is called
   - Check credits are added to user account

4. **Test Prompt Generation**:
   - Sign in with Google
   - Check you received free credits (if configured)
   - Go to /tools/video-storyboard
   - Generate a storyboard/prompt
   - Verify credits are deducted

## Environment Variable Checklist

- [ ] DATABASE_URL
- [ ] DIRECT_URL
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET
- [ ] AUTH_GOOGLE_ID
- [ ] AUTH_GOOGLE_SECRET
- [ ] CREEM_API_KEY
- [ ] CREEM_WEBHOOK_SECRET
- [ ] CREEM_PRODUCTS
- [ ] OPENROUTER_API_KEY
- [ ] FAL_API_KEY
- [ ] NEXT_PUBLIC_WEB_URL
- [ ] NEXT_PUBLIC_PROJECT_NAME

## Troubleshooting

### Database Connection Issues
- Ensure connection string includes `?sslmode=require`
- Check IP allowlist in Neon/Supabase (allow Vercel IPs)
- Verify database exists and migrations ran

### Google OAuth Not Working
- Check authorized origins and redirect URIs
- Ensure NEXTAUTH_URL matches deployed domain
- Verify Google+ API is enabled

### Payment Issues
- Check Creem webhook URL is correct
- Verify webhook secret matches
- Test with Creem test cards first
- Check Creem dashboard for webhook logs

### Credits Not Deducting
- Check user is authenticated
- Verify credit balance API works: `/api/user/credits`
- Check database credits table has transactions
- Review `/api/tools/run` logs

## Production Checklist

Before going live:

- [ ] Set CREEM_ENV to "production"
- [ ] Use production Creem API keys
- [ ] Test payment flow end-to-end
- [ ] Test prompt generation workflow
- [ ] Verify webhook signature validation
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure custom domain
- [ ] Set up error tracking (Sentry optional)
- [ ] Review and test all user flows

## Support

For deployment issues:
- Check Vercel deployment logs
- Review Next.js build errors
- Contact support if needed

For payment issues:
- Check Creem dashboard logs
- Review webhook event history
- Test with Creem sandbox mode first
