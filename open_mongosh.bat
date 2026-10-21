@echo off
title QLKTX - MongoDB Shell (mongosh)
echo ========================================================
echo Dang ket noi toi MongoDB Database: DormitoryDb...
echo Connection: mongodb://localhost:27017/DormitoryDb
echo ========================================================
set MONGOSH_PATH=C:\Users\%USERNAME%\AppData\Local\Programs\mongosh\mongosh.exe
if exist "%MONGOSH_PATH%" (
    "%MONGOSH_PATH%" "mongodb://localhost:27017/DormitoryDb"
) else (
    mongosh "mongodb://localhost:27017/DormitoryDb"
)
pause

