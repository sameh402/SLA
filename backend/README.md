# 🎓 Smart Learning Academy - LMS Platform

A comprehensive Learning Management System (LMS) built with modern web technologies. This platform provides a complete solution for online education with student enrollment, course management, payment processing, and administrative tools.

## 🌟 Features

### 👨‍🎓 Student Features
- **User Registration & Authentication** - Secure JWT-based authentication
- **Course Browsing** - Browse courses with filters, search, and categories
- **Course Enrollment** - Enroll in courses with integrated payment processing
- **Learning Dashboard** - Track progress, view enrolled courses
- **Interactive Learning** - Video lessons, PDFs, images, and downloadable content
- **Progress Tracking** - Real-time progress updates and completion tracking
- **Certificate Generation** - Receive certificates upon course completion
- **Profile Management** - Update personal information and preferences
- **Multi-language Support** - English and Arabic language support

### 👨‍🏫 Instructor Features
- **Course Creation** - Create and manage courses with rich media content
- **Content Upload** - Upload videos, PDFs, images, and other learning materials
- **Student Analytics** - Track student progress and engagement
- **Course Analytics** - View enrollment statistics and revenue data

### 🔧 Admin Features
- **Comprehensive Dashboard** - Overview of platform metrics and analytics
- **User Management** - Manage students, instructors, and administrators
- **Course Management** - Approve, edit, and manage all courses
- **Enrollment Management** - View and manage all student enrollments
- **Payment Management** - Process payments and view financial analytics
- **Activity Monitoring** - Real-time activity feed and system monitoring
- **System Analytics** - Detailed reports and performance metrics

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
LMS frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── AdminLayout.tsx # Admin dashboard layout
│   │   ├── StudentLayout.tsx # Student dashboard layout
│   │   └── PaymentModal.tsx # Payment processing modal
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Courses.tsx     # Course listing
│   │   ├── CourseDetails.tsx # Individual course page
│   │   ├── studetDashboard.tsx # Student dashboard
│   │   ├── Learning.tsx    # Course learning interface
│   │   ├── AdminDashboard.tsx # Admin overview
│   │   ├── AdminUsers.tsx  # User management
│   │   ├── AdminCourses.tsx # Course management
│   │   ├── AdminEnrollments.tsx # Enrollment management
│   │   ├── AdminPayments.tsx # Payment management
│   │   ├── AdminOverview.tsx # System overview
│   │   ├── AdminActivity.tsx # Activity monitoring
│   │   └── AdminSettings.tsx # Admin settings
│   ├── hooks/              # Custom React hooks
│   │   ├── useEnrollments.tsx # Enrollment management
│   │   ├── useDjangoCourses.ts # Course data fetching
│   │   ├── useUserProfile.tsx # User profile management
│   │   └── useAuth.tsx     # Authentication logic
│   ├── api/                # API client and endpoints
│   │   ├── client.ts       # Axios HTTP client
│   │   └── admin.ts        # Admin API functions
│   ├── lib/                # Utility libraries
│   │   ├── useAuth.tsx     # Authentication context
│   │   └── i18n.tsx        # Internationalization
│   └── App.tsx             # Main application component
```

### Backend (Django + DRF)
```
backend/
├── backend/                # Django project settings
│   ├── settings.py         # Django configuration
│   ├── urls.py            # URL routing
│   └── admin_api.py       # Admin API endpoints
├── users/                  # User management app
│   ├── models.py          # User model
│   ├── views.py           # User API views
│   ├── serializers.py     # User serializers
│   └── urls.py            # User URLs
├── courses/                # Course management app
│   ├── models.py          # Course and CourseMedia models
│   ├── views.py           # Course API views
│   ├── serializers.py     # Course serializers
│   └── urls.py            # Course URLs
├── enrollments/            # Enrollment management app
│   ├── models.py          # Enrollment model
│   ├── views.py           # Enrollment API views
│   ├── serializers.py     # Enrollment serializers
│   └── urls.py            # Enrollment URLs
├── payments/               # Payment processing app
│   ├── models.py          # Payment model
│   ├── views.py           # Payment API views
│   ├── serializers.py     # Payment serializers
│   └── urls.py            # Payment URLs
└── certificates/           # Certificate generation app
    ├── models.py          # Certificate model
    ├── views.py           # Certificate API views
    └── serializers.py     # Certificate serializers
```

## 🚀 Tech Stack

### Frontend Technologies
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client for API requests
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization and charts
- **React Hook Form** - Form handling and validation

### Backend Technologies
- **Django 5.2.6** - Python web framework
- **Django REST Framework 3.15.2** - API development
- **PostgreSQL** - Primary database (SQLite for development)
- **JWT Authentication** - Secure token-based authentication
- **Pillow** - Image processing and manipulation
- **CORS Headers** - Cross-origin resource sharing
- **DRF Spectacular** - API documentation generation
- **psutil** - System monitoring and analytics

### Development Tools
- **Vite** - Fast frontend build tool
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Django Admin** - Backend administration interface

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+** and npm/yarn
- **Python 3.8+** and pip
- **PostgreSQL** (optional - SQLite works for development)
- **Git** for version control

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend/backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create `.env` file in backend directory:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run backend server**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd "LMS frontend"
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment configuration**
   Create `.env.local` file in frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_APP_NAME=Smart Learning Academy
   ```

4. **Run frontend development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Frontend will be available at `http://localhost:3000`

## 🔗 API Documentation

### Authentication Endpoints
```
POST /api/auth/token/              # Login (get JWT tokens)
POST /api/auth/token/refresh/      # Refresh JWT token
```

### User Management
```
POST /api/users/register/          # User registration
GET  /api/users/profile/           # Get user profile
PUT  /api/users/profile/           # Update user profile
POST /api/users/change-password/   # Change password
```

### Course Management
```
GET    /api/courses/               # List all courses
POST   /api/courses/               # Create new course
GET    /api/courses/{id}/          # Get course details
PUT    /api/courses/{id}/          # Update course
DELETE /api/courses/{id}/          # Delete course
```

### Enrollment System
```
GET  /api/enrollments/             # Get user's enrollments
POST /api/enrollments/             # Enroll in a course
PUT  /api/enrollments/{id}/        # Update enrollment
POST /api/enrollments/{id}/progress/ # Update progress
```

### Payment Processing
```
GET  /api/payments/                # Get user's payments
POST /api/payments/                # Create payment
POST /api/payments/{id}/verify/    # Verify payment
```

### Admin APIs
```
GET /api/admin/overview            # Dashboard metrics
GET /api/admin/activities          # Activity feed
GET /api/admin/users/              # User management
GET /api/admin/courses/            # Course management
GET /api/admin/enrollments/        # Enrollment management
GET /api/admin/payments/           # Payment management
```

### API Documentation
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

## 🗄️ Database Schema

### User Model
```python
class User(AbstractUser):
    role = models.CharField(choices=[
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin')
    ])
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/')
    phone = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
```

### Course Model
```python
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='course_thumbnails/')
    status = models.CharField(choices=[('draft', 'Draft'), ('published', 'Published')])
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Enrollment Model
```python
class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(choices=[('active', 'Active'), ('completed', 'Completed')])
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'course')
```

### Payment Model
```python
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_status = models.CharField(choices=[
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ])
    transaction_id = models.CharField(max_length=100, unique=True)
```

## 🎨 UI/UX Features

### Design System
- **Modern Design** - Clean, professional interface
- **Dark/Light Mode** - Automatic theme switching
- **Responsive Layout** - Mobile-first design approach
- **Accessibility** - WCAG compliant components
- **Animations** - Smooth transitions and micro-interactions

### Component Library
- **Cards & Layouts** - Flexible card-based layouts
- **Forms & Inputs** - Validated form components
- **Data Visualization** - Charts and analytics displays
- **Navigation** - Intuitive navigation patterns
- **Modals & Dialogs** - Contextual interaction patterns

### User Experience
- **Fast Loading** - Optimized performance and caching
- **Offline Support** - Service worker implementation
- **Error Handling** - Graceful error states and recovery
- **Loading States** - Skeleton screens and spinners
- **Toast Notifications** - User feedback system

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure token-based authentication
- **Role-Based Access** - Student, Instructor, Admin roles
- **Permission System** - Granular permission control
- **Session Management** - Automatic token refresh
- **CORS Protection** - Cross-origin request security

### Data Security
- **Input Validation** - Server-side data validation
- **SQL Injection Prevention** - ORM-based queries
- **XSS Protection** - Content sanitization
- **CSRF Protection** - Cross-site request forgery prevention
- **File Upload Security** - Safe file handling

## 📊 Analytics & Monitoring

### Admin Analytics
- **User Metrics** - Registration, activity, engagement
- **Course Analytics** - Enrollment, completion rates
- **Revenue Tracking** - Payment processing, financial reports
- **System Health** - Performance monitoring, error tracking

### Student Analytics
- **Progress Tracking** - Course completion progress
- **Learning Patterns** - Study time and engagement
- **Achievement System** - Certificates and milestones

## 🚀 Deployment

### Production Setup

#### Backend Deployment
```bash
# Install production dependencies
pip install -r requirements.txt gunicorn

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

### Environment Variables

#### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@localhost/lms_db
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=Smart Learning Academy
```

### Recommended Hosting
- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: PostgreSQL on Railway, AWS RDS, DigitalOcean
- **Media Files**: AWS S3, Cloudinary, DigitalOcean Spaces

## 🧪 Testing

### Backend Testing
```bash
python manage.py test
```

### Frontend Testing
```bash
npm run test
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and API docs
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

### Upcoming Features
- [ ] **Mobile App** - React Native mobile application
- [ ] **Video Streaming** - Integrated video streaming service
- [ ] **Live Classes** - Real-time video conferencing
- [ ] **Discussion Forums** - Course-specific discussion boards
- [ ] **Gamification** - Points, badges, and leaderboards
- [ ] **AI Recommendations** - Personalized course suggestions
- [ ] **Multi-tenant Support** - Support for multiple institutions
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **API Rate Limiting** - Enhanced API security
- [ ] **Webhook System** - Event-driven integrations

### Technical Improvements
- [ ] **Microservices** - Split into microservices architecture
- [ ] **GraphQL API** - Alternative to REST API
- [ ] **Real-time Features** - WebSocket integration
- [ ] **Caching Layer** - Redis caching implementation
- [ ] **CDN Integration** - Content delivery network
- [ ] **Monitoring** - Application performance monitoring

---

## 🏆 Built With Love

This LMS platform represents a modern approach to online education, combining powerful backend capabilities with an intuitive user interface. Whether you're a student looking to learn, an instructor ready to teach, or an administrator managing an educational platform, this system provides all the tools you need.

**Happy Learning! 🎓**

