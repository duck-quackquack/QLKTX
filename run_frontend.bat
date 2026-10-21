@echo off
title QLKTX - Frontend (React / Vite)
echo ========================================================
echo [1/2] Chuan bi moi truong Frontend (React + Vite)...
echo ========================================================
cd /d "%~dp0frontend"

echo [2/2] Dang khoi dong Frontend Vite Dev Server...
echo App URL: http://localhost:3000
echo ========================================================
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Frontend gap su co khi khoi dong!
)
pause
