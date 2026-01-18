# Quick Production Setup

## 1. Get Production Credentials

**Convex:**
```bash
npx convex deploy --prod
# Copy deployment ID from output
```

**WorkOS:**
1. Create production org in [WorkOS dashboard](https://dashboard.workos.com)
2. Get Client ID and API Key
3. Set OAuth redirect: `https://yourdomain.com/callback`

## 2. Set Environment Variables

Add to your deployment platform (Vercel/Railway/Render):

```
CONVEX_DEPLOYMENT=prod:your-id
VITE_CONVEX_URL=https://your-id.convex.cloud
VITE_SITE_URL=https://yourdomain.com
WORKOS_CLIENT_ID=client_...
WORKOS_API_KEY=sk_live_...              (mark as secret)
WORKOS_COOKIE_PASSWORD=<openssl rand -base64 24>  (mark as secret)
WORKOS_REDIRECT_URI=https://yourdomain.com/callback
NODE_ENV=production
```

## 3. Test Locally

```bash
npm run build
npm start
# Visit http://localhost:3000 to test
```

## 4. Deploy

- **Vercel**: Push to GitHub
- **Railway/Render**: Connect GitHub → deploy
- **Docker**: `docker build -t app . && docker run -p 3000:3000 <env vars> app`

## 5. Verify Production

- [ ] App loads
- [ ] Login works
- [ ] Create task works
- [ ] No console errors

## Quick Help

| Problem | Solution |
|---------|----------|
| Build fails | `rm -rf .output node_modules && npm install && npm run build` |
| Backend unreachable | Verify `VITE_CONVEX_URL` in production settings |
| Auth fails | Check `WORKOS_REDIRECT_URI` matches your domain |
| Rollback needed | Go to deployment platform → previous version → promote |

See [DEPLOYMENT.md](DEPLOYMENT.md) for more details.
