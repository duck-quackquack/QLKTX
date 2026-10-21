@echo off
set "PATH=C:\Users\AD\MinGit\cmd;C:\Users\AD\MinGit\ucrt64\bin;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo DANG PUSH DU AN QLKTX LEN GITHUB...
echo Repo: https://github.com/duck-quackquack/QLKTX.git
echo ========================================================
git push -u origin main
echo.
echo ========================================================
echo HOAN TAT! Nhan phim bat ky de thoat...
echo ========================================================
pause
