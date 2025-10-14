@echo off
echo =================================
echo    Starting LMS Development Environment
echo =================================

echo.
echo Step 1: Setting up environment file...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo Environment file created successfully!
) else (
    echo Environment file already exists.
)

echo.
echo Step 2: Starting database and Redis...
docker-compose -f docker-compose.dev.yml up db redis -d

echo.
echo Step 3: Waiting for database to be ready...
timeout /t 10

echo.
echo Step 4: Starting backend...
docker-compose -f docker-compose.dev.yml up backend -d --build

echo.
echo Step 5: Starting frontend...
docker-compose -f docker-compose.dev.yml up frontend -d --build

echo.
echo =================================
echo    LMS Development Environment Started!
echo =================================
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:8000/api/
echo Django Admin: http://localhost:8000/admin/
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo To view logs: docker-compose -f docker-compose.dev.yml logs -f
echo To stop: docker-compose -f docker-compose.dev.yml down
echo.
pause
