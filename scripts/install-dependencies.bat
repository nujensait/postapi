@echo off
REM Скрипт установки зависимостей для проекта nodejs-crud-api

echo Чтение зависимостей из dependencies.txt...

REM Переход в корневую директорию проекта
cd /d "%~dp0.."

REM Проверка наличия файла dependencies.txt
if not exist "dependencies.txt" (
    echo Ошибка: файл dependencies.txt не найден!
    pause
    exit /b 1
)

echo.
echo Установка production зависимостей...
set "prod_deps="
for /f "usebackq tokens=*" %%a in ("dependencies.txt") do (
    set "line=%%a"
    setlocal enabledelayedexpansion
    REM Пропускаем комментарии и пустые строки
    if not "!line:~0,1!"=="#" if not "!line!"=="" (
        REM Проверяем, что это не development зависимость
        echo !line! | findstr /i "nodemon jest supertest" >nul
        if errorlevel 1 (
            if defined prod_deps (
                set "prod_deps=!prod_deps! %%a"
            ) else (
                set "prod_deps=%%a"
            )
        )
    )
    endlocal & set "prod_deps=%prod_deps%"
)

if defined prod_deps (
    call npm install %prod_deps%
) else (
    echo Не найдены production зависимости
)

echo.
echo Установка development зависимостей...
set "dev_deps="
for /f "usebackq tokens=*" %%a in ("dependencies.txt") do (
    set "line=%%a"
    setlocal enabledelayedexpansion
    REM Ищем только development зависимости
    echo !line! | findstr /i "nodemon jest supertest" >nul
    if not errorlevel 1 (
        if defined dev_deps (
            set "dev_deps=!dev_deps! %%a"
        ) else (
            set "dev_deps=%%a"
        )
    )
    endlocal & set "dev_deps=%dev_deps%"
)

if defined dev_deps (
    call npm install --save-dev %dev_deps%
) else (
    echo Не найдены development зависимости
)

echo.
echo Все зависимости успешно установлены!
pause
