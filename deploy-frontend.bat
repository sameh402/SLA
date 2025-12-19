@echo off
echo ========================================
echo   DEPLOYING FRONTEND TO VERCEL
echo ========================================
echo.

cd /d "%~dp0LMSfrontend"

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
