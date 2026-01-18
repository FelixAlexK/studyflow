# Production Deployment Guide

## Setup Convex Production

```bash
# Deploy backend
npx convex deploy --prod

# Verify
npx convex status --prod
```

## Test Locally First

```bash
# Build
npm run build

# Run production server
npm start

# Test in browser at http://localhost:3000
```

## Deploy

**Vercel**: Push to GitHub, auto-deploys  
**Railway/Render/Docker**: Add environment variables, click deploy  
**Docker**: `docker build -t app . && docker run -p 3000:3000 <env vars>`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | `rm -rf .output node_modules && npm install && npm run build` |
| Backend not connecting | Check `VITE_CONVEX_URL` is production URL |
| Auth fails | Verify `WORKOS_REDIRECT_URI` matches your domain |
| App doesn't start | Check all env vars are set |

## Rollback

1. Go to deployment platform
2. Click previous deployment
3. Promote to production

## Resources

- [Convex Docs](https://docs.convex.dev)
- [WorkOS Docs](https://workos.com/docs)
- [.env.example](.env.example) - Environment template

### Vercel (Recommended)
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect GitHub to Vercel dashboard
# 3. Add environment variables (see .env.example)
# 4. Done - auto-deploys on push
```

### Render

**Easiest option** - Render automatically passes environment variables to build:

1. Push code to GitHub
2. Create new Web Service at https://render.com/dashboard
3. Connect your GitHub repository
4. Add all environment variables in the "Environment" tab:
   - `VITE_CONVEX_URL`
   - `VITE_CONVEX_SITE_URL`
   - `VITE_SITE_URL`
   - Plus all WorkOS variables (see table below)
5. Build Command: `pnpm install && pnpm run build`
6. Start Command: `pnpm start`
7. Click Deploy

### Railway / Docker

For self-hosted or Docker deployments:

1. Set environment variables before building
2. Build: `docker build --build-arg VITE_CONVEX_URL=https://... .`
3. Or set in Docker Compose/Railway dashboard
4. Build Command: `pnpm install && pnpm run build`
5. Start Command: `pnpm start`

### ⚠️ Important: Vite Build-Time Variables

Environment variables starting with `VITE_` **must be set before the build step**, not just at runtime.

**On Render:** ✅ Handled automatically
- Add variables to Environment tab
- Render passes them during build

**On Docker/Railway:** Must pass as build args
```bash
docker build \
  --build-arg VITE_CONVEX_URL=https://... \
  --build-arg VITE_CONVEX_SITE_URL=https://... \
  --build-arg VITE_SITE_URL=https://... \
  .
```

**If missing:** You'll see error: `missing VITE_CONVEX_URL env var`

## Environment Variables

Copy `.env.example` to your deployment platform. Required variables:

| Variable | Value | Example |
|----------|-------|---------|
| `CONVEX_DEPLOYMENT` | Production deployment ID | `prod:my-app-123` |
| `VITE_CONVEX_URL` | Convex API URL | `https://my-app-123.convex.cloud` |
| `VITE_SITE_URL` | Your app URL | `https://app.example.com` |
| `WORKOS_CLIENT_ID` | WorkOS client ID | `client_...` |
| `WORKOS_API_KEY` | WorkOS API key (secret) | `sk_live_...` |
| `WORKOS_COOKIE_PASSWORD` | Random 32+ chars (secret) | `openssl rand -base64 24` |
| `WORKOS_REDIRECT_URI` | OAuth redirect | `https://app.example.com/callback` |
| `NODE_ENV` | Environment | `production` |

## Fixing Build-Time Environment Variables

If you see `Error: missing VITE_CONVEX_URL env var`:

**On Render:**
1. Go to Environment variables tab
2. Make sure these are added:
   - `VITE_CONVEX_URL`
   - `VITE_CONVEX_SITE_URL`
   - `VITE_SITE_URL`
3. Reopen or redeploy the service

**On Docker/Railway:**
```bash
# Pass as build arguments
docker build \
  --build-arg VITE_CONVEX_URL="https://xxx.convex.cloud" \
  --build-arg VITE_CONVEX_SITE_URL="https://xxx.convex.site" \
  --build-arg VITE_SITE_URL="https://yourapp.com" \
  .
```

**Why:** Vite needs these at build time to embed them in the frontend bundle.
