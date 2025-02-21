@echo off
echo Starting Cosmic Canvas...
echo [%DATE% %TIME%] Script started > crash-log.txt

:: Test if echo is working
echo [%DATE% %TIME%] Echo test >> crash-log.txt

:: Check for Node.js
echo [%DATE% %TIME%] Checking for Node.js... >> crash-log.txt
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [%DATE% %TIME%] ERROR: Node.js not found. Install from https://nodejs.org >> crash-log.txt
    echo ERROR: Node.js not found. Please install it from https://nodejs.org
    pause
    exit /b 1
)
echo [%DATE% %TIME%] Node.js found >> crash-log.txt

:: Try a simple Node command
echo [%DATE% %TIME%] Testing Node.js version... >> crash-log.txt
node -v >> crash-log.txt 2>&1
if %ERRORLEVEL% neq 0 (
    echo [%DATE% %TIME%] ERROR: Node.js failed to run >> crash-log.txt
    echo ERROR: Node.js is installed but not working. Reinstall it.
    pause
    exit /b 1
)
echo [%DATE% %TIME%] Node.js version check passed >> crash-log.txt

:: Start the server
echo [%DATE% %TIME%] Starting server on port 3000... >> crash-log.txt
npx serve . -p 3000 >> crash-log.txt 2>&1
if %ERRORLEVEL% neq 0 (
    echo [%DATE% %TIME%] ERROR: Server failed to start >> crash-log.txt
    echo ERROR: Failed to start server. Check crash-log.txt
    pause
    exit /b 1
)

echo [%DATE% %TIME%] Server should be running >> crash-log.txt
pause