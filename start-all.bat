@echo off
echo Starting Cosmic Canvas (Front-End and Back-End)...
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

:: Verify Node.js works
echo [%DATE% %TIME%] Testing Node.js version... >> crash-log.txt
node -v >> crash-log.txt 2>&1
if %ERRORLEVEL% neq 0 (
    echo [%DATE% %TIME%] ERROR: Node.js failed to run >> crash-log.txt
    echo ERROR: Node.js installed but not working. Reinstall it.
    pause
    exit /b 1
)
echo [%DATE% %TIME%] Node.js version check passed >> crash-log.txt

:: Start back-end (safely)
echo [%DATE% %TIME%] Starting back-end on port 3001... >> crash-log.txt
if not exist server (
    echo [%DATE% %TIME%] ERROR: server folder not found. Ensure server/ exists >> crash-log.txt
    echo ERROR: server folder missing
    pause
    exit /b 1
)
start "Cosmic Canvas Backend" cmd /k "cd server && (if not exist node_modules (npm install express pusher --no-audit --no-fund >> ..\crash-log.txt 2>&1 && echo [%DATE% %TIME%] Back-end dependencies installed >> ..\crash-log.txt)) && node server.js >> ..\crash-log.txt 2>&1 || (echo [%DATE% %TIME%] ERROR: Backend failed to start. Check Pusher credentials or port 3001 >> ..\crash-log.txt & pause)"

:: Start front-end
echo [%DATE% %TIME%] Starting front-end on port 3000... >> crash-log.txt
npx serve . -p 3000 >> crash-log.txt 2>&1
if %ERRORLEVEL% neq 0 (
    echo [%DATE% %TIME%] ERROR: Front-end failed to start >> crash-log.txt
    echo ERROR: Failed to start front-end. Check crash-log.txt
    pause
    exit /b 1
)

echo [%DATE% %TIME%] Front-end should be running >> crash-log.txt
start "" "http://localhost:3000"
pause