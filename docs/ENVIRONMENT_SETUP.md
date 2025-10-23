# Environment Setup Guide

This guide explains how to switch between development and production environments in the uribarri.online project.

## Overview

The project now uses **centralized environment configuration** to eliminate hardcoded URLs throughout the codebase. All environment-dependent settings are controlled by a single variable.

## Configuration Files

### Backend Configuration

**Location:** `/back-end/config/environment.js`

This file centralizes all backend environment settings including:
- API URLs
- Frontend URLs
- CORS origins
- Database configuration
- Email settings
- Rate limiting

### Frontend Configuration

**Location:** `/front-end/src/config/environment.js`

This file centralizes all frontend environment settings including:
- API URL
- App URL
- Domain URL

## Switching Environments

### Backend

**File to edit:** `/back-end/.env`

Change the `NODE_ENV` variable:

```bash
# For Development
NODE_ENV=development

# For Production
NODE_ENV=production
```

**What happens automatically:**
- Development:
  - CORS allows: `localhost:5173`, `localhost:3007`, `127.0.0.1:5173`
  - Frontend URL: `http://localhost:5173`
  - API URL: `http://localhost:3007`
  - Database Host: Value from `MYSQL_HOST` env var (usually `localhost`)

- Production:
  - CORS allows: `https://uribarri.online`, `https://app.uribarri.online`, `https://api.uribarri.online`
  - Frontend URL: `https://app.uribarri.online`
  - API URL: `https://api.uribarri.online`
  - Database Host: Value from `MYSQL_HOST` env var (usually Docker service name or VPS IP)

**After changing NODE_ENV:**
```bash
# If using Docker
docker compose down
docker compose up -d

# Or if running directly
npm run start
```

### Frontend

The frontend environment is automatically determined by Vite's build mode:

**Development Mode:**
```bash
npm run dev
```
- MODE: `development`
- API URL: `http://localhost:3007` (or value from `VITE_API_URL` in `.env`)
- App URL: `http://localhost:5173`

**Production Build:**
```bash
npm run build
```
- MODE: `production`
- API URL: `https://api.uribarri.online`
- App URL: `https://app.uribarri.online`

**Optional Override:**
If you need to test against a different API URL in development, you can uncomment and set `VITE_API_URL` in `/front-end/.env`:

```bash
VITE_API_URL=http://localhost:3007
```

## Files Modified

### Backend
- `/back-end/config/environment.js` - NEW: Centralized config
- `/back-end/index.js` - Updated to use centralized config
- `/back-end/.env` - NEW: Backend environment variables

### Frontend
- `/front-end/src/config/environment.js` - NEW: Centralized config
- `/front-end/src/utils/app/axiosConfig.js` - Updated to use centralized config
- `/front-end/.env` - Updated with documentation

### Documentation
- `/.env.example` - Updated with new structure
- `/front-end/.env.example` - NEW: Frontend example

## Complete Environment Switch Workflow

### Switching to Development

1. **Backend** - Edit `/back-end/.env`:
   ```bash
   NODE_ENV=development
   MYSQL_HOST=localhost
   ```

2. **Restart Backend:**
   ```bash
   docker compose down
   docker compose up -d
   ```

3. **Frontend** - Run dev server:
   ```bash
   cd front-end
   npm run dev
   ```

4. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3007

### Switching to Production

1. **Backend** - Edit `/back-end/.env`:
   ```bash
   NODE_ENV=production
   MYSQL_HOST=mysql  # or your VPS IP
   MYSQL_DATABASE=your_production_db
   MYSQL_USER=your_production_user
   MYSQL_PASSWORD=your_production_password
   ```

2. **Restart Backend:**
   ```bash
   docker compose down
   docker compose up -d
   ```

3. **Frontend** - Build for production:
   ```bash
   cd front-end
   npm run build
   ```

4. **Deploy** the `/front-end/dist` folder to your production server

5. **Access:**
   - Frontend: https://app.uribarri.online
   - Backend: https://api.uribarri.online

## Verification

### Backend
When the backend starts, it will display the environment configuration:
```
╔════════════════════════════════════════════════════════╗
║           ENVIRONMENT CONFIGURATION                    ║
╠════════════════════════════════════════════════════════╣
║ Environment:    development                            ║
║ App Port:       3007                                   ║
║ Frontend URL:   http://localhost:5173                  ║
║ API URL:        http://localhost:3007                  ║
║ Database Host:  localhost                              ║
╚════════════════════════════════════════════════════════╝
```

### Frontend
Open browser console and look for:
```
🔧 Frontend Environment Config: {
  mode: 'development',
  apiUrl: 'http://localhost:3007',
  appUrl: 'http://localhost:5173'
}
```

## Benefits

1. **Single Source of Truth**: Change `NODE_ENV` in one place
2. **No Hardcoded URLs**: All URLs are centralized
3. **Type Safety**: Configuration is imported as a module
4. **Easy Switching**: Just change one variable and restart
5. **Clear Logging**: Environment info displayed on startup
6. **Maintainable**: Add new environments easily

## Troubleshooting

### Backend not using correct environment
- Check `/back-end/.env` file exists
- Verify `NODE_ENV` is set correctly
- Restart Docker containers or Node process
- Check console output for environment configuration

### Frontend not using correct API URL
- Check Vite build mode: `npm run dev` vs `npm run build`
- Clear browser cache (Ctrl+Shift+R)
- Check `/front-end/.env` for VITE_API_URL overrides
- Look for console log: `🔧 Axios Config - API URL:`

### CORS errors
- Verify backend `NODE_ENV` matches frontend mode
- Check that backend CORS origins include frontend URL
- Ensure credentials are set to true on both sides
