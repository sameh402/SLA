@echo off
echo ========================================
echo   DEPLOYING BACKEND TO VERCEL
echo ========================================
echo.

cd /d "%~dp0backend"

echo Installing Vercel CLI...
call npm install -g vercel

echo.
echo Deploying to production...
call vercel --prod

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
pause
