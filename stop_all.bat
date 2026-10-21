@echo off
title QLKTX - Stop All Services
echo ========================================================
echo Dang dong toan bo tien trinh Backend (Node.js) va Frontend (Vite)...
echo ========================================================
taskkill /F /IM node.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul
echo Da giai phong toan bo port 5000 va 3000 thanh cong!
pause
