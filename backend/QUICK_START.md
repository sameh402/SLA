# 🚀 Quick Start Guide - Smart Learning Academy LMS

Get your LMS platform up and running in 10 minutes!

## ⚡ Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/))

## 🔥 One-Command Setup

### Windows
```powershell
# Clone and setup everything
git clone <your-repo-url> lms-platform
cd lms-platform

# Backend setup
cd backend/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
start python manage.py runserver

# Frontend setup (new terminal)
cd "../../LMS frontend"
npm install
npm run dev
```

### macOS/Linux
```bash
# Clone and setup everything
git clone <your-repo-url> lms-platform
cd lms-platform

# Backend setup
cd backend/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver &

# Frontend setup
cd "../../LMS frontend"
npm install
npm run dev
```

## 🌐 Access Your Platform

After setup, open these URLs:

- **🎓 Student Portal**: `http://localhost:3000`
- **🔧 Admin Dashboard**: `http://localhost:3000/admin`
- **📚 API Docs**: `http://localhost:8000/api/docs/`
- **⚙️ Django Admin**: `http://localhost:8000/admin/`

## 👤 Default Login

Use the superuser account you created during setup, or create test accounts:

### Admin Access
- Username: `admin` (or what you created)
- Password: (what you set during `createsuperuser`)

### Test Student Account
Create via: `http://localhost:3000/register`

## 🎯 First Steps

1. **👨‍💼 Login as Admin** → `http://localhost:3000/admin`
2. **📚 Create a Course** → Add course details and upload content
3. **👨‍🎓 Register as Student** → `http://localhost:3000/register`
4. **💳 Test Enrollment** → Browse courses and enroll
5. **📊 Check Analytics** → View admin dashboard metrics

## 🔧 Environment Files (Optional)

### Backend `.env`
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend `.env.local`
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Smart Learning Academy
```

## 🐛 Common Issues

### Backend Issues
```bash
# Port 8000 in use
python manage.py runserver 8001

# Database issues
python manage.py flush
python manage.py migrate

# Permission issues (Windows)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Frontend Issues
```bash
# Port 3000 in use
npm run dev -- --port 3001

# Module issues
rm -rf node_modules package-lock.json
npm install

# Build issues
npm run build
```

## 📱 Test Features

### Student Features
- ✅ Register/Login
- ✅ Browse courses
- ✅ Enroll in courses
- ✅ Make payments
- ✅ Track progress
- ✅ View dashboard

### Admin Features
- ✅ User management
- ✅ Course management
- ✅ Enrollment tracking
- ✅ Payment monitoring
- ✅ Analytics dashboard
- ✅ Activity feed

## 🚀 Production Deployment

### Quick Deploy Options

#### Vercel (Frontend) + Railway (Backend)
1. **Frontend**: Connect GitHub to Vercel
2. **Backend**: Connect GitHub to Railway
3. **Database**: Use Railway PostgreSQL
4. **Media**: Use Cloudinary or AWS S3

#### Netlify + Heroku
1. **Frontend**: Deploy to Netlify
2. **Backend**: Deploy to Heroku
3. **Database**: Use Heroku PostgreSQL
4. **Media**: Use Cloudinary

## 📞 Need Help?

- **📖 Full Documentation**: See `README.md`
- **🐛 Issues**: Create GitHub issue
- **💬 Questions**: Check GitHub Discussions
- **📧 Support**: Contact maintainers

## 🎉 You're Ready!

Your LMS platform is now running! Start creating courses, enrolling students, and building your educational community.

**Happy Teaching & Learning! 🎓**

