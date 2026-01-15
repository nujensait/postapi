@echo off
REM Скрипт установки зависимостей для проекта nodejs-crud-api

echo Установка production зависимостей...
call npm install bcryptjs@^2.4.3 express@^4.17.1 jsonwebtoken@^8.5.1 sqlite3@^5.0.0

echo Установка development зависимостей...
call npm install --save-dev jest@^29.7.0 nodemon@^2.0.4 supertest@^6.3.4

echo Все зависимости успешно установлены!
pause
