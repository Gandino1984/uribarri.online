# Complete .env Setup Guide

## Overview

You have **TWO** `.env` files:
1. **Backend:** `/back-end/.env` - Controls backend environment
2. **Frontend:** `/front-end/.env` - Optional overrides for frontend

## Backend `.env` File

**Location:** `/back-end/.env`

This is the **MAIN** configuration file. The `NODE_ENV` variable controls everything.

### For Local Development

```bash
# ===============================================
# ENVIRONMENT CONFIGURATION
# ===============================================
NODE_ENV=development

# ===============================================
# APPLICATION CONFIGURATION
# ===============================================
APP_USERNAME=your_app_username
APP_PORT=3007

# ===============================================
# DATABASE CONFIGURATION
# ===============================================
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=uribarri_db
MYSQL_USER=root
MYSQL_PASSWORD=your_local_password
MYSQL_ROOT_PASSWORD=your_root_password

# ===============================================
# RATE LIMITING CONFIGURATION
# ===============================================
MAX_REGISTRATIONS=10
RESET_HOURS=24

# ===============================================
# EMAIL SERVICE CONFIGURATION
# ===============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**What happens with `NODE_ENV=development`:**
- API URL: `http://localhost:3007`
- Frontend URL: `http://localhost:5173`
- CORS: Allows localhost origins
- Database: Connects to `localhost`

### For Production

```bash
# ===============================================
# ENVIRONMENT CONFIGURATION
# ===============================================
NODE_ENV=production

# ===============================================
# APPLICATION CONFIGURATION
# ===============================================
APP_USERNAME=production_username
APP_PORT=3007

# ===============================================
# DATABASE CONFIGURATION
# ===============================================
MYSQL_HOST=mysql  # Docker service name, or your VPS IP
MYSQL_PORT=3306
MYSQL_DATABASE=uribarri_production_db
MYSQL_USER=production_user
MYSQL_PASSWORD=your_secure_production_password
MYSQL_ROOT_PASSWORD=your_secure_root_password

# ===============================================
# RATE LIMITING CONFIGURATION
# ===============================================
MAX_REGISTRATIONS=10
RESET_HOURS=24

# ===============================================
# EMAIL SERVICE CONFIGURATION
# ===============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
```

**What happens with `NODE_ENV=production`:**
- API URL: `https://api.uribarri.online`
- Frontend URL: `https://app.uribarri.online`
- CORS: Only allows uribarri.online domains
- Database: Connects to production database (Docker service or VPS IP)

## Frontend `.env` File

**Location:** `/front-end/.env`

This file is **MOSTLY EMPTY** because the frontend auto-configures based on build mode!

### For Development (Recommended)

```bash
# ===============================================
# FRONTEND ENVIRONMENT CONFIGURATION
# ===============================================
# The frontend automatically uses the correct URLs based on:
# - npm run dev → development mode → localhost:3007
# - npm run build → production mode → api.uribarri.online
#
# You usually don't need to set anything here!
```

**That's it!** The frontend [environment.js](front-end/src/config/environment.js) automatically uses:
- `npm run dev` → `http://localhost:3007`
- `npm run build` → `https://api.uribarri.online`

### Override (Optional)

If you need to test against a different API URL in development:

```bash
# Override development API URL (optional)
VITE_API_URL=http://192.168.1.100:3007
```

### For Production

```bash
# No configuration needed!
# Production builds automatically use: https://api.uribarri.online
```

## Quick Setup Workflows

### Scenario 1: Local Development

1. **Backend** `/back-end/.env`:
   ```bash
   NODE_ENV=development
   MYSQL_HOST=localhost
   MYSQL_DATABASE=uribarri_db
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   ```

2. **Frontend** `/front-end/.env`:
   ```bash
   # Leave empty or comment everything out
   ```

3. **Start:**
   ```bash
   # Backend
   docker compose up -d

   # Frontend
   cd front-end && npm run dev
   ```

4. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3007

### Scenario 2: Testing with Different API

1. **Backend** `/back-end/.env`:
   ```bash
   NODE_ENV=development
   # ... other settings
   ```

2. **Frontend** `/front-end/.env`:
   ```bash
   VITE_API_URL=http://192.168.1.50:3007
   ```

3. Frontend will connect to `192.168.1.50:3007` instead of localhost

### Scenario 3: Production Deployment

1. **Backend** `/back-end/.env`:
   ```bash
   NODE_ENV=production
   MYSQL_HOST=mysql  # or your VPS IP
   MYSQL_DATABASE=uribarri_production
   MYSQL_USER=prod_user
   MYSQL_PASSWORD=secure_password
   ```

2. **Frontend** `/front-end/.env`:
   ```bash
   # Leave empty - production URLs are hardcoded
   ```

3. **Deploy:**
   ```bash
   # Backend
   docker compose down
   docker compose up -d

   # Frontend
   cd front-end
   npm run build
   # Upload /dist folder to your server
   ```

4. **Access:**
   - Frontend: https://app.uribarri.online
   - Backend: https://api.uribarri.online

## Common Scenarios

### "I want to test production build locally"

**Problem:** Production builds use `https://api.uribarri.online`

**Solution:**
```bash
# Option 1: Use development mode
npm run dev

# Option 2: Temporarily modify /front-end/src/config/environment.js
# Change production URLs to localhost (not recommended)
```

### "Backend and frontend are on different servers"

**Backend** `.env`:
```bash
NODE_ENV=development  # or production
```

**Frontend** `.env`:
```bash
VITE_API_URL=http://backend-server-ip:3007
```

### "I'm using Docker Compose"

**Backend** `.env`:
```bash
NODE_ENV=development
MYSQL_HOST=mysql  # Docker service name from docker-compose.yml
```

Docker Compose will handle networking automatically.

## Environment Variables Summary

### Backend (`/back-end/.env`)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `NODE_ENV` | **YES** | Controls all environment settings | `development` or `production` |
| `APP_PORT` | **YES** | Backend port | `3007` |
| `MYSQL_HOST` | **YES** | Database host | `localhost` or `mysql` |
| `MYSQL_DATABASE` | **YES** | Database name | `uribarri_db` |
| `MYSQL_USER` | **YES** | Database user | `root` |
| `MYSQL_PASSWORD` | **YES** | Database password | Your password |
| `EMAIL_USER` | No | Email for notifications | `your@email.com` |
| `EMAIL_PASS` | No | Email app password | Your app password |

### Frontend (`/front-end/.env`)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_API_URL` | No | Override API URL in dev | `http://localhost:3007` |

**Note:** Frontend usually needs **NO** variables! It auto-configures.

## Verification Commands

### Check Backend Environment

```bash
docker compose logs back-end | grep "ENVIRONMENT CONFIGURATION" -A 10
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║           ENVIRONMENT CONFIGURATION                    ║
╠════════════════════════════════════════════════════════╣
║ Environment:    development                            ║
║ Frontend URL:   http://localhost:5173                  ║
║ API URL:        http://localhost:3007                  ║
╚════════════════════════════════════════════════════════╝
```

### Check Frontend Environment

Open browser console and look for:
```
🔧 Axios Config - API URL: http://localhost:3007
```

## Troubleshooting

### Backend not loading environment

**Check:**
```bash
# Verify .env file exists
ls -la /home/german-andino/Escritorio/github_repositories/uribarri.online/back-end/.env

# Restart Docker
docker compose down
docker compose up -d

# Check logs
docker compose logs back-end
```

### Frontend using wrong API URL

**Check:**
```bash
# Verify no VITE_API_URL override
cat front-end/.env

# Rebuild
cd front-end
npm run build

# Check build output
npm run build 2>&1 | grep "API URL"
```

### CORS errors

**Cause:** Backend `NODE_ENV` doesn't match frontend mode

**Solution:**
- Development: `NODE_ENV=development` + `npm run dev`
- Production: `NODE_ENV=production` + `npm run build`

## Security Notes

1. **Never commit** `.env` files to git (they're in `.gitignore`)
2. **Use strong passwords** for production
3. **Use Gmail App Passwords** (not your regular password)
4. **Keep production** `.env` secure on your server only

## Need Help?

See:
- [QUICK_START.md](QUICK_START.md) - Fast reference
- [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) - Detailed technical docs
