#!/bin/bash

# Скрипт установки зависимостей для проекта nodejs-crud-api

echo "Чтение зависимостей из dependencies.txt..."

# Переход в корневую директорию проекта
cd "$(dirname "$0")/.."

# Проверка наличия файла dependencies.txt
if [ ! -f "dependencies.txt" ]; then
    echo "Ошибка: файл dependencies.txt не найден!"
    exit 1
fi

echo ""
echo "Установка production зависимостей..."

# Читаем production зависимости (все, кроме development)
prod_deps=""
dev_section=false

while IFS= read -r line; do
    # Пропускаем пустые строки
    if [ -z "$line" ]; then
        continue
    fi
    
    # Проверяем начало секции development
    if [[ "$line" == *"Development dependencies"* ]] || [[ "$line" == *"development dependencies"* ]]; then
        dev_section=true
        continue
    fi
    
    # Пропускаем комментарии
    if [[ "$line" == \#* ]]; then
        continue
    fi
    
    # Если мы еще не в секции development, добавляем в production
    if [ "$dev_section" = false ]; then
        if [ -n "$prod_deps" ]; then
            prod_deps="$prod_deps $line"
        else
            prod_deps="$line"
        fi
    fi
done < "dependencies.txt"

if [ -n "$prod_deps" ]; then
    npm install $prod_deps
else
    echo "Не найдены production зависимости"
fi

echo ""
echo "Установка development зависимостей..."

# Читаем development зависимости
dev_deps=""
dev_section=false

while IFS= read -r line; do
    # Пропускаем пустые строки
    if [ -z "$line" ]; then
        continue
    fi
    
    # Проверяем начало секции development
    if [[ "$line" == *"Development dependencies"* ]] || [[ "$line" == *"development dependencies"* ]]; then
        dev_section=true
        continue
    fi
    
    # Пропускаем комментарии
    if [[ "$line" == \#* ]]; then
        continue
    fi
    
    # Если мы в секции development, добавляем в dev_deps
    if [ "$dev_section" = true ]; then
        if [ -n "$dev_deps" ]; then
            dev_deps="$dev_deps $line"
        else
            dev_deps="$line"
        fi
    fi
done < "dependencies.txt"

if [ -n "$dev_deps" ]; then
    npm install --save-dev $dev_deps
else
    echo "Не найдены development зависимости"
fi

echo ""
echo "Все зависимости успешно установлены!"
