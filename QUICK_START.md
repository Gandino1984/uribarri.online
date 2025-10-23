# Quick Start: Environment Switching

## TL;DR - How to Switch Environments

### Backend

Edit `/back-end/.env` and change this line:

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

Then restart:
```bash
docker compose down && docker compose up -d
```

### Frontend

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
# Deploy the /dist folder
```

## What Changed?

All hardcoded URLs have been removed. Now everything is controlled by:

- **Backend:** `NODE_ENV` variable in `/back-end/.env`
- **Frontend:** Vite's build mode (automatically set by `npm run dev` or `npm run build`)

## Configuration Files

- `/back-end/config/environment.js` - Backend centralized config
- `/front-end/src/config/environment.js` - Frontend centralized config
- `/ENVIRONMENT_SETUP.md` - Full documentation

## URLs by Environment

### Development
- Frontend: `http://localhost:5173`
- API: `http://localhost:3007`

### Production
- Frontend: `https://app.uribarri.online`
- API: `https://api.uribarri.online`

## Verification

Check the console logs when your apps start:

**Backend:**
```
╔════════════════════════════════════════════════════════╗
║           ENVIRONMENT CONFIGURATION                    ║
╠════════════════════════════════════════════════════════╣
║ Environment:    development                            ║
║ Frontend URL:   http://localhost:5173                  ║
║ API URL:        http://localhost:3007                  ║
╚════════════════════════════════════════════════════════╝
```

**Frontend Browser Console:**
```
🔧 Axios Config - API URL: http://localhost:3007
```
