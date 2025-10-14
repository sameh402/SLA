# Django + React LMS Docker Setup

This project contains a complete Learning Management System (LMS) built with Django (backend) and React/Vite (frontend), fully containerized with Docker.

## 🏗️ Architecture

- **Backend**: Django REST Framework with PostgreSQL
- **Frontend**: React with Vite and TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Web Server**: Nginx (production)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## 🚀 Quick Start

### Production Environment

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd <your-project-directory>
   ```

2. **Create environment file**
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Edit `backend/.env` with your production values:
   ```env
   DEBUG=False
   SECRET_KEY=your-super-secret-key-here
   DB_NAME=lms_db
   DB_USER=lms_user
   DB_PASSWORD=your-secure-password
   ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
   CORS_ALLOWED_ORIGINS=https://your-domain.com
   ```

3. **Build and start all services**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/
   - Nginx (Production): http://localhost:8080

### Development Environment

1. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d --build
   ```

2. **Access development services**
   - Frontend: http://localhost:8080
   - Backend: http://localhost:8000
   - Database: localhost:5432
   - Redis: localhost:6379

## 🐳 Docker Services

### Production Services (`docker-compose.yml`)

| Service | Container Name | Port | Description |
|---------|----------------|------|-------------|
| db | lms_db | 5432 | PostgreSQL database |
| redis | lms_redis | 6379 | Redis cache |
| backend | lms_backend | 8000 | Django API server |
| frontend | lms_frontend | 80, 3000 | React app with Nginx |
| nginx | lms_nginx | 8080 | Reverse proxy |

### Development Services (`docker-compose.dev.yml`)

| Service | Container Name | Port | Description |
|---------|----------------|------|-------------|
| db | lms_db_dev | 5432 | PostgreSQL database |
| redis | lms_redis_dev | 6379 | Redis cache |
| backend | lms_backend_dev | 8000 | Django dev server |
| frontend | lms_frontend_dev | 8080, 3000 | Vite dev server |

## 🛠️ Development Workflow

### Backend Development

1. **Run Django commands**
   ```bash
   # Create migrations
   docker-compose exec backend python manage.py makemigrations
   
   # Apply migrations
   docker-compose exec backend python manage.py migrate
   
   # Create superuser
   docker-compose exec backend python manage.py createsuperuser
   
   # Collect static files
   docker-compose exec backend python manage.py collectstatic
   ```

2. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

3. **Access Django shell**
   ```bash
   docker-compose exec backend python manage.py shell
   ```

### Frontend Development

1. **Install new packages**
   ```bash
   docker-compose exec frontend npm install <package-name>
   ```

2. **View logs**
   ```bash
   docker-compose logs -f frontend
   ```

3. **Run tests**
   ```bash
   docker-compose exec frontend npm test
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=backend.settings_production

# Database Configuration
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=lms_password
DB_HOST=db
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379/1

# Security Settings
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Email Configuration (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Database Setup

The database will be automatically initialized when you first run the containers. A superuser will be created with:
- Email: admin@example.com
- Password: admin123

**⚠️ Change these credentials in production!**

## 📊 Monitoring & Logs

### View all logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Monitor resource usage
```bash
docker stats
```

## 🔄 Backup & Restore

### Database Backup
```bash
docker-compose exec db pg_dump -U lms_user lms_db > backup.sql
```

### Database Restore
```bash
docker-compose exec -T db psql -U lms_user lms_db < backup.sql
```

### Media Files Backup
```bash
docker cp lms_backend:/app/media ./media_backup
```

## 🚀 Production Deployment

### 1. Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Update ALLOWED_HOSTS
- [ ] Configure proper CORS origins
- [ ] Set strong database passwords
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules

### 2. Performance Optimization

- [ ] Enable Redis caching
- [ ] Configure static file serving
- [ ] Set up CDN for media files
- [ ] Enable Nginx gzip compression
- [ ] Configure database connection pooling

### 3. Monitoring Setup

- [ ] Set up log aggregation
- [ ] Configure health checks
- [ ] Monitor database performance
- [ ] Set up alerts for errors

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error**
   ```bash
   # Wait for database to be ready
   docker-compose logs db
   ```

2. **Frontend build fails**
   ```bash
   # Clear node_modules and rebuild
   docker-compose down
   docker volume prune
   docker-compose up --build
   ```

3. **Static files not loading**
   ```bash
   # Collect static files
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

4. **Permission errors**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Reset Everything

```bash
# Stop all containers
docker-compose down

# Remove all volumes (⚠️ This will delete all data!)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
