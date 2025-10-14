# 📁 Project Structure - Smart Learning Academy LMS

## 🏗️ Overall Architecture

```
LMS-Platform/
├── 📁 backend/                    # Django Backend
│   └── 📁 backend/               # Django Project Root
│       ├── 📁 backend/           # Project Settings
│       ├── 📁 users/             # User Management App
│       ├── 📁 courses/           # Course Management App
│       ├── 📁 enrollments/       # Enrollment System App
│       ├── 📁 payments/          # Payment Processing App
│       ├── 📁 certificates/      # Certificate Generation App
│       ├── 📁 media/             # Uploaded Files
│       ├── 📄 requirements.txt   # Python Dependencies
│       ├── 📄 manage.py          # Django Management
│       └── 📄 db.sqlite3         # Development Database
│
├── 📁 LMS frontend/              # React Frontend
│   ├── 📁 src/                   # Source Code
│   │   ├── 📁 components/        # UI Components
│   │   ├── 📁 pages/             # Page Components
│   │   ├── 📁 hooks/             # Custom Hooks
│   │   ├── 📁 api/               # API Client
│   │   ├── 📁 lib/               # Utilities
│   │   └── 📄 App.tsx            # Main App
│   ├── 📄 package.json           # Node Dependencies
│   ├── 📄 vite.config.ts         # Vite Configuration
│   └── 📄 tailwind.config.js     # Tailwind CSS Config
│
├── 📄 README.md                  # Main Documentation
├── 📄 QUICK_START.md             # Setup Guide
└── 📄 PROJECT_STRUCTURE.md       # This File
```

## 🔧 Backend Structure

### Django Project (`backend/backend/`)

```
backend/backend/
├── 📁 backend/                   # Project Configuration
│   ├── 📄 __init__.py
│   ├── 📄 settings.py            # Django Settings
│   ├── 📄 urls.py                # URL Routing
│   ├── 📄 wsgi.py                # WSGI Application
│   ├── 📄 asgi.py                # ASGI Application
│   └── 📄 admin_api.py           # Admin API Endpoints
│
├── 📁 users/                     # User Management
│   ├── 📄 models.py              # User Model
│   ├── 📄 views.py               # User API Views
│   ├── 📄 serializers.py         # User Serializers
│   ├── 📄 urls.py                # User URL Patterns
│   ├── 📄 admin.py               # Admin Interface
│   ├── 📄 apps.py                # App Configuration
│   └── 📁 migrations/            # Database Migrations
│
├── 📁 courses/                   # Course Management
│   ├── 📄 models.py              # Course & CourseMedia Models
│   ├── 📄 views.py               # Course API Views
│   ├── 📄 serializers.py         # Course Serializers
│   ├── 📄 urls.py                # Course URL Patterns
│   ├── 📄 admin.py               # Admin Interface
│   └── 📁 migrations/            # Database Migrations
│
├── 📁 enrollments/               # Enrollment System
│   ├── 📄 models.py              # Enrollment Model
│   ├── 📄 views.py               # Enrollment API Views
│   ├── 📄 serializers.py         # Enrollment Serializers
│   ├── 📄 urls.py                # Enrollment URL Patterns
│   ├── 📄 admin.py               # Admin Interface
│   └── 📁 migrations/            # Database Migrations
│
├── 📁 payments/                  # Payment Processing
│   ├── 📄 models.py              # Payment Model
│   ├── 📄 views.py               # Payment API Views
│   ├── 📄 serializers.py         # Payment Serializers
│   ├── 📄 urls.py                # Payment URL Patterns
│   ├── 📄 admin.py               # Admin Interface
│   └── 📁 migrations/            # Database Migrations
│
├── 📁 certificates/              # Certificate Generation
│   ├── 📄 models.py              # Certificate Model
│   ├── 📄 views.py               # Certificate API Views
│   ├── 📄 serializers.py         # Certificate Serializers
│   ├── 📄 urls.py                # Certificate URL Patterns
│   └── 📁 migrations/            # Database Migrations
│
├── 📁 media/                     # User Uploaded Files
│   ├── 📁 course_thumbnails/     # Course Images
│   ├── 📁 course_media/          # Course Content Files
│   ├── 📁 avatars/               # User Profile Pictures
│   └── 📁 certificates/          # Generated Certificates
│
├── 📄 manage.py                  # Django Management Script
├── 📄 requirements.txt           # Python Dependencies
├── 📄 requirements-minimal.txt   # Essential Dependencies
├── 📄 requirements-freeze.txt    # Exact Version Lock
├── 📄 README-Backend.md          # Backend Documentation
└── 📄 db.sqlite3                 # SQLite Database (Dev)
```

## 🎨 Frontend Structure

### React Application (`LMS frontend/`)

```
LMS frontend/
├── 📁 public/                    # Static Assets
│   ├── 📄 index.html             # HTML Template
│   ├── 📄 favicon.ico            # Favicon
│   └── 📁 images/                # Public Images
│
├── 📁 src/                       # Source Code
│   ├── 📁 components/            # Reusable Components
│   │   ├── 📁 ui/                # Base UI Components (shadcn/ui)
│   │   │   ├── 📄 button.tsx     # Button Component
│   │   │   ├── 📄 card.tsx       # Card Component
│   │   │   ├── 📄 input.tsx      # Input Component
│   │   │   ├── 📄 dialog.tsx     # Modal Component
│   │   │   └── 📄 ...            # Other UI Components
│   │   ├── 📄 AdminLayout.tsx    # Admin Dashboard Layout
│   │   ├── 📄 StudentLayout.tsx  # Student Dashboard Layout
│   │   ├── 📄 PaymentModal.tsx   # Payment Processing Modal
│   │   └── 📄 Navbar.tsx         # Navigation Component
│   │
│   ├── 📁 pages/                 # Page Components
│   │   ├── 📄 Home.tsx           # Landing Page
│   │   ├── 📄 Courses.tsx        # Course Listing
│   │   ├── 📄 CourseDetails.tsx  # Course Details Page
│   │   ├── 📄 studetDashboard.tsx # Student Dashboard
│   │   ├── 📄 Learning.tsx       # Course Learning Interface
│   │   ├── 📄 Login.tsx          # Login Page
│   │   ├── 📄 Register.tsx       # Registration Page
│   │   ├── 📁 admin/             # Admin Pages
│   │   │   ├── 📄 AdminDashboard.tsx # Admin Overview
│   │   │   ├── 📄 AdminUsers.tsx     # User Management
│   │   │   ├── 📄 AdminCourses.tsx   # Course Management
│   │   │   ├── 📄 AdminEnrollments.tsx # Enrollment Management
│   │   │   ├── 📄 AdminPayments.tsx  # Payment Management
│   │   │   ├── 📄 AdminOverview.tsx  # System Overview
│   │   │   ├── 📄 AdminActivity.tsx  # Activity Monitoring
│   │   │   └── 📄 AdminSettings.tsx  # Admin Settings
│   │
│   ├── 📁 hooks/                 # Custom React Hooks
│   │   ├── 📄 useEnrollments.tsx # Enrollment Management
│   │   ├── 📄 useDjangoCourses.ts # Course Data Fetching
│   │   ├── 📄 useUserProfile.tsx # User Profile Management
│   │   ├── 📄 useAuth.tsx        # Authentication Logic
│   │   └── 📄 use-toast.tsx      # Toast Notifications
│   │
│   ├── 📁 api/                   # API Client Layer
│   │   ├── 📄 client.ts          # Axios HTTP Client
│   │   └── 📄 admin.ts           # Admin API Functions
│   │
│   ├── 📁 lib/                   # Utility Libraries
│   │   ├── 📄 useAuth.tsx        # Authentication Context
│   │   ├── 📄 i18n.tsx           # Internationalization
│   │   └── 📄 utils.ts           # Utility Functions
│   │
│   ├── 📁 styles/                # Styling
│   │   └── 📄 globals.css        # Global Styles
│   │
│   ├── 📄 App.tsx                # Main Application Component
│   ├── 📄 main.tsx               # Application Entry Point
│   └── 📄 index.css              # Tailwind CSS Imports
│
├── 📄 package.json               # Node.js Dependencies
├── 📄 package-lock.json          # Dependency Lock File
├── 📄 vite.config.ts             # Vite Build Configuration
├── 📄 tailwind.config.js         # Tailwind CSS Configuration
├── 📄 tsconfig.json              # TypeScript Configuration
├── 📄 eslint.config.js           # ESLint Configuration
├── 📄 postcss.config.js          # PostCSS Configuration
└── 📄 .env.local                 # Environment Variables
```

## 📊 Data Flow Architecture

### API Data Flow
```
Frontend (React) 
    ↕️ HTTP/REST API
Backend (Django) 
    ↕️ ORM
Database (SQLite/PostgreSQL)
```

### Authentication Flow
```
User Login → JWT Token → API Requests → Token Validation → Response
```

### File Upload Flow
```
Frontend Upload → FormData → Django Media Handler → File Storage → Database URL
```

## 🔗 Key Integrations

### Frontend Dependencies
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI component library
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend Dependencies
- **Django REST Framework** - API development
- **JWT Authentication** - Token-based auth
- **Django CORS Headers** - Cross-origin requests
- **Pillow** - Image processing
- **psutil** - System monitoring
- **DRF Spectacular** - API documentation

## 🗃️ Database Schema Overview

### Core Models
```
User (Custom User Model)
├── Profile Information
├── Role (Student/Instructor/Admin)
└── Authentication Data

Course
├── Content Information
├── Media Files (CourseMedia)
├── Pricing & Status
└── Creator (User)

Enrollment
├── User ←→ Course Relationship
├── Progress Tracking
└── Status Management

Payment
├── Transaction Information
├── Course Purchase Link
└── Status Tracking

Certificate
├── Course Completion Record
├── PDF Generation
└── Verification System
```

## 🛠️ Development Workflow

### Backend Development
1. **Models** → Define data structure
2. **Migrations** → Update database schema
3. **Serializers** → API data transformation
4. **Views** → Business logic & API endpoints
5. **URLs** → Route configuration
6. **Admin** → Administrative interface

### Frontend Development
1. **Components** → Reusable UI elements
2. **Pages** → Route-specific views
3. **Hooks** → State management & side effects
4. **API** → Backend integration
5. **Styling** → Tailwind CSS classes
6. **Routing** → React Router configuration

## 📁 File Naming Conventions

### Backend (Python)
- **Models**: `snake_case` (e.g., `course_media.py`)
- **Views**: `PascalCase` classes (e.g., `CourseViewSet`)
- **URLs**: `kebab-case` (e.g., `course-detail`)

### Frontend (TypeScript)
- **Components**: `PascalCase` (e.g., `AdminLayout.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useEnrollments.tsx`)
- **Pages**: `PascalCase` (e.g., `CourseDetails.tsx`)
- **Utilities**: `camelCase` (e.g., `apiClient.ts`)

## 🎯 Key Features by Directory

### 👨‍🎓 Student Features
- **`/pages/Home.tsx`** - Course browsing
- **`/pages/studetDashboard.tsx`** - Progress tracking
- **`/pages/Learning.tsx`** - Course content
- **`/components/PaymentModal.tsx`** - Payment processing

### 👨‍🏫 Instructor Features
- **`/pages/admin/AdminCourses.tsx`** - Course management
- **`/backend/courses/`** - Course API backend

### 🔧 Admin Features
- **`/pages/admin/AdminDashboard.tsx`** - System overview
- **`/pages/admin/AdminUsers.tsx`** - User management
- **`/pages/admin/AdminEnrollments.tsx`** - Enrollment tracking
- **`/pages/admin/AdminPayments.tsx`** - Payment monitoring

This structure provides a scalable, maintainable architecture for the LMS platform with clear separation of concerns and organized code structure.

