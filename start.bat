@echo off
title CYBER HUNT DEPLOYMENT TERMINAL
color 0A
cd /d "%~dp0"

echo =========================================================================
echo   _____   __  __  ____   ______  _____    _    _  _    _  _   _  _______ 
echo  / ____^|  \ \/ / ^|  _ \ ^|  ____^|^|  __ \  ^| ^|  ^| ^|^| ^|  ^| ^|^| \ ^| ^|^|__   __^|
echo ^| ^|        \  /  ^| ^|_) ^|^| ^|__   ^| ^|__) ^| ^| ^|__^| ^|^| ^|  ^| ^|^|  \^| ^|   ^| ^|   
echo ^| ^|         / \  ^|  _ ^< ^|  __^|  ^|  _  /  ^|  __  ^|^| ^|  ^| ^|^| . ` ^|   ^| ^|   
echo ^| ^|____   /   \ ^| ^|_) ^|^| ^|____ ^| ^| \ \  ^| ^|  ^| ^|^| ^|__^| ^|^| ^|\  ^|   ^| ^|   
echo  \_____^| /_/\_\ ^|____/ ^|______^|^|_^|  \_\ ^|_^|  ^|_^| \____/ ^|_^| \_^|   ^|_^|   
echo =========================================================================
echo                --- SECURE DEPLOYMENT SYSTEM ---
echo =========================================================================
echo.

:: Check for .env.local
if not exist ".env.local" goto no_env
goto check_node

:no_env
echo [WARNING] .env.local file is missing!
echo Firebase configuration is required for Cyber Hunt to function.
echo Please create .env.local based on .env.example before launching.
echo.
pause

:check_node
:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 goto no_node
goto check_modules

:no_node
echo [ERROR] Node.js is not detected in your PATH.
echo Please install Node.js (https://nodejs.org) and try again.
echo.
pause
exit /b 1

:check_modules
:: Check for node_modules and install if missing
if not exist "node_modules" goto install_modules
goto start_server

:install_modules
echo [SYSTEM] node_modules not found. Initializing module download...
call npm install
if %errorlevel% neq 0 goto install_failed
goto start_server

:install_failed
echo [ERROR] npm install failed.
pause
exit /b 1

:start_server
echo [SYSTEM] Spawning local server...
echo [SYSTEM] Target URL: http://localhost:3000
echo.

:: Open browser automatically
start http://localhost:3000

:: Start Next.js dev server
call npm run dev
