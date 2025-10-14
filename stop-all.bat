@echo off
echo =================================
echo    Stopping LMS Environment
echo =================================

echo.
echo Stopping development environment...
docker-compose -f docker-compose.dev.yml down

echo.
echo Stopping production environment...
docker-compose down

echo.
echo =================================
echo    All services stopped!
echo =================================
echo.
pause
