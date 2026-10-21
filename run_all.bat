@echo off
title QLKTX - Full System Launcher
echo ========================================================
echo [1/3] Don dep cac tien trinh cu (tranh conflict port)...
echo ========================================================
taskkill /F /IM node.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul
ping 127.0.0.1 -n 2 >nul

echo ========================================================
echo [2/3] Khoi dong Backend API (Node.js / Express)...
echo ========================================================
start "QLKTX Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

ping 127.0.0.1 -n 3 >nul

echo ========================================================
echo [3/3] Khoi dong Frontend React (Vite)...
echo ========================================================
start "QLKTX Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo DA KHOI DONG XONG HE THONG MERN STACK!
echo - Backend API:  http://localhost:5000/api/health
echo - Web Frontend: http://localhost:3000
echo - Database:     mongodb://localhost:27017/DormitoryDb
echo ========================================================
echo Tai khoan mau:
echo - Admin:   admin / Admin@123
echo - Staff:   staff / Staff@123
echo - Student: sv2026001 / Ktx@123456
echo ========================================================
pause
