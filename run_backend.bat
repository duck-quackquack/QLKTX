@echo off
title QLKTX - Backend API (Node.js / Express)
echo ========================================================
echo [1/2] Chuan bi moi truong Backend (Node.js + MongoDB)...
echo ========================================================
cd /d "%~dp0backend"

echo [2/2] Dang chay Backend API (Node.js / Express)...
echo API Server: http://localhost:5000/api/health
echo ========================================================
node --watch server.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Backend gap su co khi khoi dong!
)
pause
