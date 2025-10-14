@echo off
echo =================================
echo    Starting LMS Production Environment
echo =================================

echo.
echo Step 1: Setting up environment file...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo Environment file created successfully!
    echo.
    echo IMPORTANT: Please edit backend\.env with your production values before continuing!
    echo Press any key when ready...
    pause
) else (
    echo Environment file already exists.
)

echo.
echo Step 2: Starting all services...
docker-compose up -d --build

echo.
echo Step 3: Waiting for services to be ready...
timeout /t 30

echo.
echo =================================
echo    LMS Production Environment Started!
echo =================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/api/
echo Django Admin: http://localhost:8000/admin/
echo Nginx Proxy: http://localhost:8080
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
