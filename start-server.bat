@echo off
setlocal EnableDelayedExpansion

:: Initialize log file
echo Starting Cosmic Canvas Backend...
echo [%DATE% %TIME%] === Starting backend script === > server-start-log.txt 2>&1
echo [%DATE% %TIME%] Script location: %~f0 >> server-start-log.txt 2>&1

:: Log initial environment
echo [%DATE% %TIME%] Current directory: %CD% >> server-start-log.txt 2>&1
echo [%DATE% %TIME%] PATH: %PATH% >> server-start-log.txt 2>&1

:: Attempt to change to script directory
echo [%DATE% %TIME%] Attempting to change to script directory: %~dp0 >> server-start-log.txt 2>&1
cd /d "%~dp0" 2>> server-start-log.txt
if !ERRORLEVEL! neq 0 (
    echo [%DATE% %TIME%] ERROR: Failed to change directory to %~dp0 >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERRORLEVEL: !ERRORLEVEL! >> server-start-log.txt 2>&1
    echo ERROR: Directory change failed - check server-start-log.txt
    echo Press any key to exit...
    pause
    goto :error_exit
)
echo [%DATE% %TIME%] Successfully changed to directory: %CD% >> server-start-log.txt 2>&1

:: Check server environment
echo Checking server environment...
echo [%DATE% %TIME%] Checking for server.js in %CD%... >> server-start-log.txt 2>&1
if not exist server.js (
    echo [%DATE% %TIME%] ERROR: server.js not found in %CD% >> server-start-log.txt 2>&1
    dir >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERROR: Directory contents logged above >> server-start-log.txt 2>&1
    echo ERROR: server.js not found - check server-start-log.txt
    echo Press any key to exit...
    pause
    goto :error_exit
)
echo [%DATE% %TIME%] server.js found at %CD%\server.js >> server-start-log.txt 2>&1

:: Check for Node.js
echo [%DATE% %TIME%] Checking for Node.js... >> server-start-log.txt 2>&1
where node >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [%DATE% %TIME%] ERROR: Node.js not found in PATH >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERROR: PATH check failed - install from https://nodejs.org >> server-start-log.txt 2>&1
    echo ERROR: Node.js not found - check server-start-log.txt
    echo Press any key to exit...
    pause
    goto :error_exit
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
if not defined NODE_VERSION (
    echo [%DATE% %TIME%] ERROR: Failed to get Node.js version >> server-start-log.txt 2>&1
    echo ERROR: Node.js version check failed - check server-start-log.txt
    echo Press any key to exit...
    pause
    goto :error_exit
)
echo [%DATE% %TIME%] Node.js found - Version: !NODE_VERSION! >> server-start-log.txt 2>&1

:: Check if port 3001 is available
echo [%DATE% %TIME%] Checking port 3001 availability... >> server-start-log.txt 2>&1
netstat -aon | findstr ":3001" >nul 2>> server-start-log.txt
if !ERRORLEVEL! equ 0 (
    echo [%DATE% %TIME%] WARNING: Port 3001 already in use >> server-start-log.txt 2>&1
    echo WARNING: Port 3001 is already in use by another process
) else (
    echo [%DATE% %TIME%] Port 3001 is available >> server-start-log.txt 2>&1
)

:: Start backend
echo [%DATE% %TIME%] Attempting to start backend on port 3001... >> server-start-log.txt 2>&1
echo Starting server...
start /B node server.js >> server-start-log.txt 2>&1
if !ERRORLEVEL! neq 0 (
    echo [%DATE% %TIME%] ERROR: Failed to start node server.js >> server-start-log.txt 2>&1
    echo ERROR: Server failed to start - check server-start-log.txt
    echo Press any key to exit...
    pause
    goto :error_exit
)
timeout /t 2 >nul

:: Verify server started
echo [%DATE% %TIME%] Verifying server started on port 3001... >> server-start-log.txt 2>&1
netstat -aon | findstr ":3001" >nul 2>> server-start-log.txt
if !ERRORLEVEL! neq 0 (
    echo [%DATE% %TIME%] ERROR: Backend failed to start on port 3001 >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERROR: Possible issues: >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERROR: - Invalid Pusher credentials in server.js >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERROR: - Port 3001 access denied >> server-start-log.txt 2>&1
    echo [%DATE% %TIME%] ERROR: - Syntax error in server.js >> server-start-log.txt 2>&1
    echo ERROR: Server verification failed - check server-start-log.txt
    echo Press any key to exit...
    pause
    goto :error_exit
)

echo [%DATE% %TIME%] Backend started successfully on port 3001 >> server-start-log.txt 2>&1
echo Backend running successfully!
echo Log file: server-start-log.txt
echo Server is running - press any key to exit...
pause
exit /b 0

:error_exit
echo [%DATE% %TIME%] === Script terminated due to error === >> server-start-log.txt 2>&1
echo Script failed - check server-start-log.txt for details
echo Press any key to exit...
pause
exit /b 1

endlocal