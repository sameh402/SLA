# Django LMS Backend

A comprehensive Learning Management System backend built with Django and Django REST Framework.

## Features

- **User Management**: Registration, authentication, profile management
- **Course Management**: Create, update, delete courses with media content
- **Enrollment System**: Student enrollment and progress tracking
- **Payment Processing**: Handle course payments and transactions
- **Certificate Generation**: Generate certificates for completed courses
- **Admin Dashboard**: Comprehensive admin interface with analytics
- **API Documentation**: Auto-generated API docs with DRF Spectacular
- **JWT Authentication**: Secure token-based authentication
- **File Upload**: Support for course thumbnails and media files

## Tech Stack

- **Django 5.2.6**: Web framework
- **Django REST Framework 3.15.2**: API framework
- **PostgreSQL**: Database (via psycopg2-binary)
- **JWT**: Authentication (djangorestframework-simplejwt)
- **Pillow**: Image processing
- **CORS Headers**: Cross-origin resource sharing
- **DRF Spectacular**: API documentation

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL (optional - SQLite works for development)
- pip (Python package manager)

### Quick Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   # Full installation
   pip install -r requirements.txt
   
   # Or minimal installation
   pip install -r requirements-minimal.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Database Setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Login (get JWT tokens)
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Users
- `POST /api/users/register/` - User registration
- `GET/PUT /api/users/profile/` - User profile
- `POST /api/users/change-password/` - Change password

### Courses
- `GET /api/courses/` - List courses
- `POST /api/courses/` - Create course
- `GET /api/courses/{id}/` - Course details
- `PUT/PATCH /api/courses/{id}/` - Update course
- `DELETE /api/courses/{id}/` - Delete course

### Enrollments
- `GET /api/enrollments/` - User's enrollments
- `POST /api/enrollments/` - Enroll in course
- `POST /api/enrollments/{id}/progress/` - Update progress

### Payments
- `GET /api/payments/` - User's payments
- `POST /api/payments/` - Create payment
- `POST /api/payments/{id}/verify/` - Verify payment

### Admin APIs
- `GET /api/admin/overview` - Dashboard metrics
- `GET /api/admin/activities` - Activity feed
- `GET /api/admin/users/` - User management
- `GET /api/admin/courses/` - Course management
- `GET /api/admin/enrollments/` - Enrollment management
- `GET /api/admin/payments/` - Payment management

## API Documentation

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

## Database Models

### User
- Custom user model with roles (student, instructor, admin)
- Profile information (first_name, last_name, email, etc.)

### Course
- Title, description, price, status
- Thumbnail image, created_by instructor
- Related media files

### Enrollment
- User-Course relationship
- Progress tracking, status (active/completed)
- Unique constraint on (user, course)

### Payment
- Payment tracking for course purchases
- Status (pending, success, failed)
- Amount, currency, transaction_id

### Certificate
- Generated certificates for completed courses
- PDF file storage

## Development

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Create Test Data
```bash
python manage.py shell
# Use the create_sample_data.py script
```

### Run Tests
```bash
python manage.py test
```

## Deployment

### Production Settings
1. Set `DEBUG=False` in environment
2. Configure production database (PostgreSQL recommended)
3. Set proper `ALLOWED_HOSTS`
4. Use `gunicorn` or similar WSGI server
5. Configure static file serving
6. Set up proper logging

### Environment Variables
```env
DEBUG=False
SECRET_KEY=production-secret-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

