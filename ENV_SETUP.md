# Environment Variables

All variables from `.env.example`:

| Variable | Dev | Prod | Secret |
|----------|-----|------|--------|
| `CONVEX_DEPLOYMENT` | `dev:xxx` | `prod:xxx` | No |
| `VITE_CONVEX_URL` | Dev URL | Prod URL | No |
| `VITE_SITE_URL` | `http://localhost:3000` | `https://yourdomain.com` | No |
| `WORKOS_CLIENT_ID` | `client_test_xxx` | `client_xxx` | No |
| `WORKOS_API_KEY` | `sk_test_xxx` | `sk_live_xxx` | **YES** |
| `WORKOS_COOKIE_PASSWORD` | Any string | `openssl rand -base64 24` | **YES** |
| `WORKOS_REDIRECT_URI` | `http://localhost:3000/callback` | `https://yourdomain.com/callback` | No |
| `NODE_ENV` | `development` | `production` | No |

## Generate Cookie Password

```bash
openssl rand -base64 24
```

## Security Tips

- ✓ Never commit `.env.local` to Git
- ✓ Mark API keys as "secret" in deployment platform
- ✓ Use `sk_live_` keys in production (not `sk_test_`)
- ✓ Rotate secrets quarterly
- ✓ All URLs must use `https://` in production

## Setup by Platform

**Vercel**: Settings → Environment Variables → add each variable  
**Railway**: Variables tab → click "Add Variable"  
**Render**: Environment tab → add variables  
**Docker**: Pass with `-e VARIABLE=value`
