# Deployment Guide - Uribarri.Online

This guide provides step-by-step instructions for deploying the Uribarri.Online application to a VPS.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [VPS Initial Setup](#vps-initial-setup)
4. [Domain Configuration](#domain-configuration)
5. [Install Required Software](#install-required-software)
6. [Deploy Backend (API)](#deploy-backend-api)
7. [Deploy Frontend (App)](#deploy-frontend-app)
8. [Configure Nginx](#configure-nginx)
9. [SSL Certificates](#ssl-certificates)
10. [Environment Variables](#environment-variables)
11. [Database Setup](#database-setup)
12. [Start Services](#start-services)
13. [Monitoring & Maintenance](#monitoring--maintenance)
14. [Troubleshooting](#troubleshooting)

---

## Overview

**Domain Structure:**
- Main website: `https://uribarri.online`
- Frontend application: `https://app.uribarri.online`
- Backend API: `https://api.uribarri.online`

**Technology Stack:**
- Frontend: React 18.3.1 + Vite 6.2.1
- Backend: Node.js 22.9.0 + Express 4.21.2
- Database: MySQL 8.0
- Reverse Proxy: Nginx
- Containerization: Docker + Docker Compose

---

## Prerequisites

- VPS with Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain names configured and pointing to your VPS IP
- At least 2GB RAM, 20GB storage

---

## VPS Initial Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Create Deployment User

```bash
sudo adduser deployer
sudo usermod -aG sudo deployer
su - deployer
```

### 3. Setup SSH Key Authentication (Optional but recommended)

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add your public key to ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## Domain Configuration

Configure your domain DNS records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_VPS_IP | 3600 |
| A | app | YOUR_VPS_IP | 3600 |
| A | api | YOUR_VPS_IP | 3600 |
| CNAME | www | uribarri.online | 3600 |

**Wait for DNS propagation** (can take up to 48 hours, usually 15-30 minutes)

Verify DNS propagation:
```bash
dig uribarri.online
dig app.uribarri.online
dig api.uribarri.online
```

---

## Install Required Software

### 1. Install Docker

```bash
# Add Docker's official GPG key
sudo apt update
sudo apt install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 2. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. Install Certbot (for SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 4. Install Git

```bash
sudo apt install git -y
```

---

## Deploy Backend (API)

### 1. Clone Repository

```bash
cd /home/deployer
git clone https://github.com/YOUR_USERNAME/uribarri.online.git
cd uribarri.online
```

### 2. Configure Environment Variables

```bash
# Copy example and edit
cp .env.example .env
nano .env
```

**Production `.env` configuration:**

```bash
# Environment
NODE_ENV=production

# Application
APP_USERNAME=your_app_username
APP_PORT=3007
BACKEND_HOST=mysql

# Database
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=uribarri_db
MYSQL_USER=uribarri_user
MYSQL_PASSWORD=STRONG_PASSWORD_HERE
MYSQL_ROOT_PASSWORD=STRONG_ROOT_PASSWORD_HERE

# Rate Limiting
MAX_REGISTRATIONS=10
RESET_HOURS=24

# Email Service (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
VITE_API_URL=https://api.uribarri.online
FRONTEND_URL=https://app.uribarri.online
```

**Important:** Replace all placeholder values with actual credentials!

### 3. Create Required Directories

```bash
# Create directories for assets
mkdir -p back-end/assets/images/shops
mkdir -p public/images/uploads
sudo chown -R deployer:deployer back-end/assets public
sudo chmod -R 755 back-end/assets public
```

### 4. Build and Start Backend

```bash
# Build and start containers
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f back-end
```

---

## Deploy Frontend (App)

### 1. Install Node.js (for building)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 22
nvm install 22
nvm use 22
node --version
```

### 2. Build Frontend

```bash
cd /home/deployer/uribarri.online/front-end

# Install dependencies
npm install

# Create production .env
cat > .env.production << EOF
VITE_API_URL=https://api.uribarri.online
EOF

# Build for production
npm run build
```

### 3. Deploy Build Files

```bash
# Create web directory
sudo mkdir -p /var/www/app.uribarri.online

# Copy build files
sudo cp -r dist/* /var/www/app.uribarri.online/

# Set permissions
sudo chown -R www-data:www-data /var/www/app.uribarri.online
sudo chmod -R 755 /var/www/app.uribarri.online
```

---

## Configure Nginx

### 1. Copy Nginx Configuration

```bash
sudo cp deployment/nginx/uribarri.conf /etc/nginx/sites-available/uribarri.conf
```

### 2. Create Temporary HTTP-only Config (for SSL setup)

```bash
sudo nano /etc/nginx/sites-available/uribarri-temp.conf
```

Add:
```nginx
server {
    listen 80;
    server_name uribarri.online www.uribarri.online app.uribarri.online api.uribarri.online;

    location / {
        return 200 "Working!\n";
    }
}
```

### 3. Enable Configuration

```bash
# Enable temp config
sudo ln -s /etc/nginx/sites-available/uribarri-temp.conf /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificates

### 1. Obtain SSL Certificates

```bash
# Get certificates for all domains
sudo certbot certonly --nginx -d uribarri.online -d www.uribarri.online
sudo certbot certonly --nginx -d app.uribarri.online
sudo certbot certonly --nginx -d api.uribarri.online
```

### 2. Switch to Production Nginx Config

```bash
# Disable temp config
sudo rm /etc/nginx/sites-enabled/uribarri-temp.conf

# Enable production config
sudo ln -s /etc/nginx/sites-available/uribarri.conf /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Setup Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is setup by default via systemd timer
sudo systemctl status certbot.timer
```

---

## Environment Variables

### Backend Environment Variables

All backend environment variables are configured in the `.env` file at the root of the project.

**Required variables:**
- `NODE_ENV=production`
- `MYSQL_*` - Database credentials
- `EMAIL_*` - Email service configuration
- `FRONTEND_URL` - Frontend URL for CORS and email links
- `VITE_API_URL` - Not used by backend, but included for consistency

### Frontend Environment Variables

Frontend uses environment variables at **build time**.

Create `/home/deployer/uribarri.online/front-end/.env.production`:
```bash
VITE_API_URL=https://api.uribarri.online
```

**Note:** If you change frontend environment variables, you must rebuild:
```bash
cd /home/deployer/uribarri.online/front-end
npm run build
sudo cp -r dist/* /var/www/app.uribarri.online/
```

---

## Database Setup

### 1. Access MySQL Container

```bash
docker compose exec db mysql -u root -p
# Enter MYSQL_ROOT_PASSWORD when prompted
```

### 2. Verify Database

```sql
SHOW DATABASES;
USE uribarri_db;
SHOW TABLES;
```

### 3. Database Backup Strategy

**Create backup script:**
```bash
sudo nano /home/deployer/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/deployer/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec -T db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} uribarri_db > \
  $BACKUP_DIR/uribarri_db_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -name "uribarri_db_*.sql" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /home/deployer/backup-db.sh
```

**Schedule daily backups:**
```bash
crontab -e
# Add:
0 2 * * * /home/deployer/backup-db.sh
```

---

## Start Services

### 1. Start Docker Containers

```bash
cd /home/deployer/uribarri.online
docker compose up -d
```

### 2. Verify Services

```bash
# Check container status
docker compose ps

# Check backend logs
docker compose logs -f back-end

# Check database logs
docker compose logs -f db

# Test API endpoint
curl https://api.uribarri.online/test-endpoint

# Visit frontend
# Open browser: https://app.uribarri.online
```

---

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
docker compose logs -f back-end

# Database logs
docker compose logs -f db

# Nginx access logs
sudo tail -f /var/log/nginx/api_uribarri_access.log
sudo tail -f /var/log/nginx/app_uribarri_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/api_uribarri_error.log
sudo tail -f /var/log/nginx/app_uribarri_error.log
```

### Restart Services

```bash
# Restart backend only
docker compose restart back-end

# Restart all containers
docker compose restart

# Restart Nginx
sudo systemctl restart nginx
```

### Update Application

```bash
cd /home/deployer/uribarri.online

# Pull latest changes
git pull origin main

# Backend update
docker compose down
docker compose up -d --build

# Frontend update
cd front-end
npm install
npm run build
sudo cp -r dist/* /var/www/app.uribarri.online/
```

### Monitor Resources

```bash
# Container resource usage
docker stats

# System resource usage
htop
# or
top

# Disk usage
df -h

# Check Docker disk usage
docker system df
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker compose logs back-end

# Check if port is in use
sudo lsof -i :3007

# Restart containers
docker compose down
docker compose up -d
```

### Database Connection Issues

```bash
# Check MySQL container is running
docker compose ps db

# Check MySQL logs
docker compose logs db

# Verify .env database credentials match
cat .env

# Try connecting manually
docker compose exec db mysql -u root -p
```

### Frontend Not Loading

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/app_uribarri_error.log

# Verify build files exist
ls -la /var/www/app.uribarri.online/

# Check file permissions
sudo chown -R www-data:www-data /var/www/app.uribarri.online
sudo chmod -R 755 /var/www/app.uribarri.online
```

### CORS Errors

1. Verify `NODE_ENV=production` in `.env`
2. Check backend CORS configuration in `back-end/index.js`
3. Restart backend: `docker compose restart back-end`
4. Check browser console for specific error
5. Verify frontend is making requests to correct API URL

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

### Email Not Sending

1. Verify Gmail App Password is correct
2. Check EMAIL_* variables in `.env`
3. Verify Gmail account allows less secure apps (if needed)
4. Check backend logs for email errors:
   ```bash
   docker compose logs back-end | grep -i email
   ```

### File Upload Issues

```bash
# Check directory permissions
sudo ls -la /home/deployer/uribarri.online/back-end/assets/images/
sudo ls -la /home/deployer/uribarri.online/public/images/uploads/

# Fix permissions if needed
sudo chown -R deployer:deployer back-end/assets public
sudo chmod -R 755 back-end/assets public

# Check Nginx client_max_body_size
sudo grep -r "client_max_body_size" /etc/nginx/
```

---

## Security Checklist

- [ ] Strong passwords for MySQL root and user
- [ ] Gmail App Password (not regular password)
- [ ] SSL certificates installed and auto-renewing
- [ ] Firewall configured (UFW)
  ```bash
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Regular backups configured
- [ ] Environment variables secured (not in git)
- [ ] CORS properly configured
- [ ] Security headers enabled in Nginx

---

## Useful Commands Reference

```bash
# Docker
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose restart            # Restart all services
docker compose logs -f back-end   # View backend logs
docker compose ps                 # List containers

# Nginx
sudo systemctl restart nginx      # Restart Nginx
sudo systemctl status nginx       # Check Nginx status
sudo nginx -t                     # Test configuration

# SSL
sudo certbot renew               # Renew certificates
sudo certbot certificates        # List certificates

# System
sudo systemctl reboot            # Reboot server
df -h                            # Check disk space
htop                             # Monitor resources
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/YOUR_USERNAME/uribarri.online/issues
- Email: andinogerman@gmail.com

---

**Last Updated:** 2025-10-22