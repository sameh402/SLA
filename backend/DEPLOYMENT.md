# 🚀 Deployment Guide - Smart Learning Academy LMS

Complete guide for deploying your LMS platform to production.

## 🎯 Deployment Options

### 🔥 Recommended: Modern Cloud Deployment

| Component | Service | Pros | Cost |
|-----------|---------|------|------|
| **Frontend** | Vercel/Netlify | Fast CDN, Easy setup | Free tier available |
| **Backend** | Railway/Render | Auto-deploy, PostgreSQL included | $5-20/month |
| **Database** | Railway PostgreSQL | Managed, backups | Included with backend |
| **Media Files** | Cloudinary/AWS S3 | CDN, image optimization | Free tier available |

### 💰 Budget Option: Single VPS

| Component | Service | Pros | Cost |
|-----------|---------|------|------|
| **Full Stack** | DigitalOcean Droplet | Full control, cost-effective | $5-10/month |
| **Domain** | Namecheap/Cloudflare | Professional URL | $10-15/year |

## 🌟 Option 1: Vercel + Railway (Recommended)

### Step 1: Backend Deployment (Railway)

1. **Create Railway Account**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   railway login
   ```

2. **Prepare Backend for Production**
   ```bash
   cd backend/backend
   
   # Update requirements.txt with production packages
   echo "gunicorn==21.2.0" >> requirements.txt
   echo "whitenoise==6.5.0" >> requirements.txt
   ```

3. **Update Django Settings**
   Create `backend/backend/production_settings.py`:
   ```python
   from .settings import *
   import os
   
   DEBUG = False
   ALLOWED_HOSTS = ['*']  # Railway will set this
   
   # Database
   import dj_database_url
   DATABASES = {
       'default': dj_database_url.config(
           default='sqlite:///db.sqlite3',
           conn_max_age=600
       )
   }
   
   # Static files
   STATIC_URL = '/static/'
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   
   # Media files (use Cloudinary for production)
   DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
   ```

4. **Create Railway Project**
   ```bash
   railway init
   railway add postgresql
   railway deploy
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set DEBUG=False
   railway variables set DJANGO_SETTINGS_MODULE=backend.production_settings
   railway variables set SECRET_KEY=your-super-secret-key-here
   ```

### Step 2: Frontend Deployment (Vercel)

1. **Prepare Frontend**
   ```bash
   cd "LMS frontend"
   
   # Update environment for production
   echo "VITE_API_BASE_URL=https://your-railway-app.railway.app" > .env.production
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Configure Build Settings**
   In Vercel dashboard:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 3: Configure Domain & SSL

1. **Custom Domain** (Optional)
   - Add your domain in Vercel dashboard
   - Update DNS records as instructed
   - SSL certificates are automatic

## 🐳 Option 2: Docker Deployment

### Docker Setup

1. **Create Dockerfile for Backend**
   ```dockerfile
   # backend/backend/Dockerfile
   FROM python:3.10-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   
   COPY . .
   
   RUN python manage.py collectstatic --noinput
   
   EXPOSE 8000
   
   CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
   ```

2. **Create Dockerfile for Frontend**
   ```dockerfile
   # LMS frontend/Dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
   ```

3. **Docker Compose**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   
   services:
     backend:
       build: ./backend/backend
       ports:
         - "8000:8000"
       environment:
         - DEBUG=False
         - DATABASE_URL=postgresql://user:pass@db:5432/lms
       depends_on:
         - db
   
     frontend:
       build: ./LMS frontend
       ports:
         - "3000:3000"
       environment:
         - VITE_API_BASE_URL=http://localhost:8000
   
     db:
       image: postgres:15
       environment:
         POSTGRES_DB: lms
         POSTGRES_USER: user
         POSTGRES_PASSWORD: pass
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

4. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

## 💻 Option 3: VPS Deployment (DigitalOcean)

### Step 1: Server Setup

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - Add SSH key

2. **Initial Server Setup**
   ```bash
   # Connect to server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install dependencies
   apt install python3 python3-pip nodejs npm nginx postgresql postgresql-contrib -y
   
   # Create app user
   adduser lms
   usermod -aG sudo lms
   su - lms
   ```

### Step 2: Database Setup

```bash
# Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q
```

### Step 3: Backend Deployment

```bash
# Clone repository
git clone <your-repo> /home/lms/app
cd /home/lms/app/backend/backend

# Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn

# Environment setup
echo "DEBUG=False" > .env
echo "DATABASE_URL=postgresql://lms_user:secure_password@localhost/lms_db" >> .env
echo "SECRET_KEY=your-secret-key" >> .env

# Django setup
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

### Step 4: Frontend Deployment

```bash
cd /home/lms/app/LMS\ frontend

# Build frontend
npm install
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/html/
```

### Step 5: Nginx Configuration

```nginx
# /etc/nginx/sites-available/lms
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /home/lms/app/backend/backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /home/lms/app/backend/backend/media/;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Process Management (Systemd)

```ini
# /etc/systemd/system/lms-backend.service
[Unit]
Description=LMS Backend
After=network.target

[Service]
User=lms
Group=lms
WorkingDirectory=/home/lms/app/backend/backend
Environment=PATH=/home/lms/app/backend/backend/venv/bin
ExecStart=/home/lms/app/backend/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl daemon-reload
sudo systemctl enable lms-backend
sudo systemctl start lms-backend
```

## 🔒 SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check services
sudo systemctl status lms-backend
sudo systemctl status nginx
sudo systemctl status postgresql

# Check logs
sudo journalctl -u lms-backend -f
sudo tail -f /var/log/nginx/error.log
```

### Database Backup

```bash
# Create backup script
#!/bin/bash
# /home/lms/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U lms_user -h localhost lms_db > /home/lms/backups/lms_backup_$DATE.sql
find /home/lms/backups -name "*.sql" -mtime +7 -delete

# Make executable and add to cron
chmod +x /home/lms/backup.sh
crontab -e
# Add: 0 2 * * * /home/lms/backup.sh
```

### Updates

```bash
# Update application
cd /home/lms/app
git pull origin main

# Backend updates
cd backend/backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart lms-backend

# Frontend updates
cd ../../LMS\ frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

## 🔧 Environment Variables

### Backend Production Environment
```env
DEBUG=False
SECRET_KEY=your-super-secret-production-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Media storage (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend Production Environment
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_NAME=Smart Learning Academy
VITE_APP_VERSION=1.0.0
```

## 🚨 Security Checklist

- [ ] **HTTPS enabled** with valid SSL certificate
- [ ] **DEBUG=False** in production
- [ ] **Strong SECRET_KEY** generated
- [ ] **Database password** is secure
- [ ] **ALLOWED_HOSTS** configured properly
- [ ] **CORS_ALLOWED_ORIGINS** set correctly
- [ ] **Firewall configured** (UFW on Ubuntu)
- [ ] **Regular backups** scheduled
- [ ] **Server updates** automated
- [ ] **Log monitoring** in place
- [ ] **Error tracking** configured (Sentry)

## 📈 Performance Optimization

### Backend Optimization
- Use **Redis** for caching
- Configure **database connection pooling**
- Enable **gzip compression**
- Set up **CDN** for static files
- Implement **API rate limiting**

### Frontend Optimization
- Enable **code splitting**
- Configure **service worker**
- Optimize **image loading**
- Use **lazy loading** for components
- Implement **caching strategies**

## 🆘 Troubleshooting

### Common Issues

**502 Bad Gateway**
```bash
# Check backend service
sudo systemctl status lms-backend
sudo journalctl -u lms-backend -n 50
```

**Database Connection Issues**
```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

**Static Files Not Loading**
```bash
# Recollect static files
cd /home/lms/app/backend/backend
source venv/bin/activate
python manage.py collectstatic --noinput
```

**CORS Errors**
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Verify frontend URL is correct

## 🎯 Production Checklist

Before going live:

- [ ] **Test all features** in production environment
- [ ] **Create admin user** account
- [ ] **Upload sample courses** for testing
- [ ] **Test payment processing** (if applicable)
- [ ] **Verify email notifications** work
- [ ] **Check mobile responsiveness**
- [ ] **Test user registration** flow
- [ ] **Verify file uploads** work
- [ ] **Check API documentation** is accessible
- [ ] **Set up monitoring** and alerts

Your LMS platform is now ready for production! 🚀

## 📞 Support

For deployment issues:
- Check logs first
- Review this guide
- Create GitHub issue
- Contact maintainers

**Happy Deploying! 🎉**

