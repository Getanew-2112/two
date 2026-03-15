# 🚀 Deployment Guide

## Overview

This guide covers deploying the Clinic Management System to production environments.

---

## Prerequisites

### Required Software
- Node.js 14+ and npm
- PostgreSQL 12+
- Git
- Web server (Nginx/Apache) for production

### Required Accounts (for cloud deployment)
- Cloud provider account (AWS/Azure/DigitalOcean/Heroku)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd clinic-management-system
```

### 2. Setup Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE clinic_management;

# Create user (optional)
CREATE USER clinic_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE clinic_management TO clinic_admin;

# Exit psql
\q

# Run schema
psql -U postgres -d clinic_management -f server/database/schema.sql

# Run patient auth migration
psql -U postgres -d clinic_management -f server/database/add-patient-auth.sql
```

### 3. Setup Backend
```bash
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_management
DB_USER=postgres
DB_PASSWORD=your_db_password
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
EOF

# Start server
npm start
```

### 4. Setup Frontend
```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

### 5. Verify Installation
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Login with admin/admin123

---

## Production Deployment

### Option 1: Traditional Server (VPS/Dedicated)

#### Step 1: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 2: Setup Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE clinic_management;
CREATE USER clinic_admin WITH PASSWORD 'strong_production_password';
GRANT ALL PRIVILEGES ON DATABASE clinic_management TO clinic_admin;
\q

# Import schema
sudo -u postgres psql -d clinic_management -f /path/to/schema.sql
```

#### Step 3: Deploy Backend
```bash
# Create app directory
sudo mkdir -p /var/www/clinic-backend
sudo chown $USER:$USER /var/www/clinic-backend

# Copy backend files
cd /var/www/clinic-backend
git clone <repository-url> .
cd server
npm install --production

# Create production .env
cat > .env << EOF
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_management
DB_USER=clinic_admin
DB_PASSWORD=strong_production_password
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Start with PM2
pm2 start server.js --name clinic-backend
pm2 save
pm2 startup
```

#### Step 4: Build and Deploy Frontend
```bash
# Create frontend directory
sudo mkdir -p /var/www/clinic-frontend
sudo chown $USER:$USER /var/www/clinic-frontend

# Copy and build frontend
cd /var/www/clinic-frontend
git clone <repository-url> .
cd client

# Update API URL in code (if needed)
# Edit src/services/auth.js and other files to use production API URL

npm install
npm run build

# Copy build to nginx directory
sudo cp -r build/* /var/www/html/clinic/
```

#### Step 5: Configure Nginx
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/clinic

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html/clinic;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/clinic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Setup SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

### Option 2: Heroku Deployment

#### Step 1: Prepare Application
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create clinic-management-app
```

#### Step 2: Setup Database
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Get database URL
heroku config:get DATABASE_URL

# Import schema
heroku pg:psql < server/database/schema.sql
```

#### Step 3: Configure Environment
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set PORT=5000
```

#### Step 4: Deploy
```bash
# Create Procfile in root
echo "web: cd server && node server.js" > Procfile

# Commit and push
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main

# Open app
heroku open
```

---

### Option 3: Docker Deployment

#### Step 1: Create Dockerfile for Backend
```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Step 2: Create Dockerfile for Frontend
```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Step 3: Create docker-compose.yml
```yaml
version: '3.8'

services:
  database:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: clinic_management
      POSTGRES_USER: clinic_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      PORT: 5000
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: clinic_management
      DB_USER: clinic_admin
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - database

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Step 4: Deploy with Docker
```bash
# Create .env file
cat > .env << EOF
DB_PASSWORD=your_secure_password
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Environment Variables

### Backend (.env)
```bash
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_management
DB_USER=clinic_admin
DB_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Optional
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend (Environment-specific)
Update API URLs in:
- `src/services/auth.js`
- All dashboard files with API calls

Replace `http://localhost:5000` with production URL.

---

## Security Checklist

### Pre-Deployment
- [ ] Change default admin password
- [ ] Generate strong JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable helmet security headers
- [ ] Sanitize user inputs
- [ ] Implement SQL injection prevention
- [ ] Set up backup strategy

### Post-Deployment
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Configure automated backups
- [ ] Set up log rotation
- [ ] Enable firewall rules
- [ ] Restrict database access
- [ ] Set up intrusion detection
- [ ] Regular security updates

---

## Database Backup

### Manual Backup
```bash
# Backup
pg_dump -U clinic_admin -d clinic_management > backup_$(date +%Y%m%d).sql

# Restore
psql -U clinic_admin -d clinic_management < backup_20240315.sql
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/clinic"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="clinic_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -U clinic_admin -d clinic_management > $BACKUP_DIR/$FILENAME

# Compress
gzip $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

### Setup Cron Job
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/clinic-backup.log 2>&1
```

---

## Monitoring

### PM2 Monitoring
```bash
# View status
pm2 status

# View logs
pm2 logs clinic-backend

# Monitor resources
pm2 monit

# Restart on crash (automatic)
pm2 startup
pm2 save
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Database Monitoring
```bash
# Active connections
psql -U clinic_admin -d clinic_management -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
psql -U clinic_admin -d clinic_management -c "SELECT pg_size_pretty(pg_database_size('clinic_management'));"
```

---

## Performance Optimization

### Backend
- Enable gzip compression
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling
- Enable CDN for static assets

### Frontend
- Minify and bundle assets
- Enable lazy loading
- Optimize images
- Use service workers
- Implement code splitting

### Database
- Create indexes on frequently queried columns
- Regular VACUUM and ANALYZE
- Optimize query plans
- Monitor slow queries

---

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs clinic-backend

# Check port availability
sudo netstat -tulpn | grep 5000

# Check environment variables
pm2 env 0
```

### Database Connection Issues
```bash
# Test connection
psql -U clinic_admin -d clinic_management -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Frontend Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple backend instances
- Database replication
- Session management (Redis)

### Vertical Scaling
- Increase server resources
- Optimize database
- Enable caching
- CDN for static assets

---

## Maintenance

### Regular Tasks
- [ ] Weekly: Review logs
- [ ] Weekly: Check disk space
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security patches
- [ ] Quarterly: Performance review
- [ ] Quarterly: Backup restoration test

### Update Procedure
```bash
# Backup first
./backup.sh

# Pull latest code
git pull origin main

# Update backend
cd server
npm install
pm2 restart clinic-backend

# Update frontend
cd ../client
npm install
npm run build
sudo cp -r build/* /var/www/html/clinic/

# Clear cache
sudo systemctl reload nginx
```

---

## Support and Documentation

### Useful Commands
```bash
# View all PM2 processes
pm2 list

# Restart backend
pm2 restart clinic-backend

# View real-time logs
pm2 logs --lines 100

# Reload Nginx
sudo systemctl reload nginx

# Check system resources
htop
df -h
free -m
```

### Log Locations
- Backend: `~/.pm2/logs/`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`
- System: `/var/log/syslog`

---

## Rollback Procedure

### If Deployment Fails
```bash
# Stop new version
pm2 stop clinic-backend

# Restore database backup
psql -U clinic_admin -d clinic_management < /var/backups/clinic/latest_backup.sql

# Revert code
git checkout <previous-commit-hash>

# Rebuild and restart
cd server
npm install
pm2 restart clinic-backend

cd ../client
npm run build
sudo cp -r build/* /var/www/html/clinic/
```

---

**Deployment Status:** Ready for production
**Last Updated:** Today
**Version:** 1.0.0

**Good luck with your deployment! 🚀**
