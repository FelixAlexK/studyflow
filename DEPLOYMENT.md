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

### Railway / Render / Docker
```bash
# 1. Create account and connect GitHub
# 2. Add environment variables
# 3. Configure build: npm run build
# 4. Configure start: npm start
# 5. Deploy
```

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
