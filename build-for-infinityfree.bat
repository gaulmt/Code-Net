@echo off
REM Build Code Net for InfinityFree Hosting

echo ================================
echo Build for InfinityFree
echo ================================
echo.

REM Check if client/.env exists
if not exist "client\.env" (
    echo [ERROR] client\.env not found!
    echo Please create client\.env with your Firebase credentials
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
cd client
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ================================
echo [SUCCESS] Build Complete!
echo ================================
echo.
echo Files to upload are in: client\dist
echo.
echo Next steps:
echo 1. Open FileZilla or FTP client
echo 2. Connect to InfinityFree FTP
echo 3. Upload ALL files from client\dist to htdocs folder
echo 4. Upload .htaccess file (see DEPLOY_INFINITYFREE.md)
echo 5. Test your site!
echo.
echo Backend URL to update in code:
echo - Deploy backend to Railway first
echo - Update API URL in frontend code
echo - Rebuild and reupload
echo.
echo Full guide: DEPLOY_INFINITYFREE.md
echo.
pause
