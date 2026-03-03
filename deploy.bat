@echo off
REM Code Net - Quick Deploy Script for Windows

echo ================================
echo Code Net - Deploy Script
echo ================================
echo.

REM Check if .env files exist
if not exist "client\.env" (
    echo [ERROR] client\.env not found!
    echo Please copy client\.env.example to client\.env and fill in your Firebase credentials
    pause
    exit /b 1
)

if not exist ".env" (
    echo [WARNING] .env not found in root directory
    echo If you're using OTP feature, please create .env with GMAIL_USER and GMAIL_APP_PASSWORD
    echo.
)

REM Ask which platform to deploy
echo Select deployment platform:
echo 1) Vercel (Frontend only)
echo 2) Netlify (Frontend only)
echo 3) Build only (test build)
echo 4) Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto build
if "%choice%"=="4" goto end
goto invalid

:vercel
echo.
echo Building frontend...
cd client
call npm install
call npm run build

echo.
echo Deploying to Vercel...
call npx vercel --prod

echo.
echo [SUCCESS] Deployment complete!
echo Don't forget to:
echo 1. Set environment variables in Vercel dashboard
echo 2. Deploy backend separately (Railway/Render)
echo 3. Update backend URL in frontend code
goto end

:netlify
echo.
echo Building frontend...
cd client
call npm install
call npm run build

echo.
echo Deploying to Netlify...
call npx netlify deploy --prod

echo.
echo [SUCCESS] Deployment complete!
echo Don't forget to:
echo 1. Set environment variables in Netlify dashboard
echo 2. Deploy backend separately (Railway/Render)
echo 3. Update backend URL in frontend code
goto end

:build
echo.
echo Building frontend...
cd client
call npm install
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Build successful!
    echo Preview build: npm run preview
) else (
    echo.
    echo [ERROR] Build failed! Check errors above.
    pause
    exit /b 1
)
goto end

:invalid
echo Invalid choice!
pause
exit /b 1

:end
echo.
pause
