
( [README ](README.MD) )
( [ТЕСТЫ](tests/README.md) )

---

# Запуск приложения на продакшене

## Содержание
- [Быстрый старт](#быстрый-старт)
- [Способы запуска](#способы-запуска)
- [Настройка Nginx](#настройка-nginx)
- [Автозапуск при перезагрузке](#автозапуск-при-перезагрузке)
- [Полезные команды](#полезные-команды)
- [Настройка переменных окружения](#настройка-переменных-окружения)

---

## Быстрый старт

```bash
# Установить зависимости
make install

# Настроить переменные окружения
cp .env.example .env
nano .env
# Укажите API_URL=http://90.156.202.37:3005

# Инициализировать БД
make db-init

# Запустить на продакшене (screen)
make prod-start
```

**Все доступные команды:**
```bash
make help
```

---

## Способы запуска

### 1. Простой запуск (тестирование)
```bash
make start          # node app.js
```
❌ Останавливается при закрытии терминала

### 2. Запуск в фоне (nohup)
```bash
make nohup-start    # Запуск
make nohup-stop     # Остановка
make logs           # Просмотр логов
```
✅ Работает в фоне  
❌ Нужно вручную управлять

### 3. Запуск в screen (рекомендуется) ⭐
```bash
make screen-start   # Запуск в screen
make screen-attach  # Подключиться к сессии
make prod-stop      # Остановить
```
✅ Удобное управление  
✅ Можно вернуться к сессии  
✅ **Рекомендуется для продакшена**

**Управление screen вручную:**
- Отключиться от сессии: `Ctrl+A`, затем `D`
- Список сессий: `screen -ls`

### 4. Запуск в tmux (альтернатива)
```bash
tmux new -s crud-api    # Создать сессию
npm start               # Запустить
# Ctrl+B, затем D       # Отключиться
tmux attach -t crud-api # Вернуться
```

### Сравнение методов

| Метод | Простота | Фоновый режим | Рекомендация |
|-------|----------|---------------|--------------|
| `make start` | ⭐⭐⭐⭐⭐ | ❌ | Тестирование |
| `make nohup-start` | ⭐⭐⭐⭐ | ✅ | Временный запуск |
| **`make screen-start`** | ⭐⭐⭐⭐ | ✅ | **Продакшен** ⭐ |
| `tmux` | ⭐⭐⭐ | ✅ | Продакшен |

---

## Настройка Nginx

### Доступ через поддомен (`api.example.com`)

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Доступ через подпапку (`example.com/api/`)

```nginx
location /api/ {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://localhost:3005/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Применение конфигурации

```bash
sudo nano /etc/nginx/sites-available/crud-api
sudo ln -s /etc/nginx/sites-available/crud-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
```

---

## Автозапуск при перезагрузке

### Systemd (рекомендуется)

Создайте `/etc/systemd/system/crud-api.service`:

```ini
[Unit]
Description=CRUD API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/jsfs_postapi
ExecStart=/usr/bin/node /path/to/jsfs_postapi/app.js
Restart=on-failure
Environment=NODE_ENV=production PORT=3005

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable crud-api
sudo systemctl start crud-api
```

### Cron (для screen)

```bash
crontab -e
# Добавьте:
@reboot cd /path/to/jsfs_postapi && screen -dmS crud-api npm start
```

---

## Полезные команды

```bash
# Статус приложения
make status

# Просмотр логов
make logs

# Очистка логов
make logs-clear

# Тесты
make test

# Инициализация БД
make db-init

# Полная очистка
make clean-all

# Информация о проекте
make info
```

**Все команды:**
```bash
make help
```

---

## Рекомендации

1. ✅ Используйте `make screen-start` для продакшена
2. ✅ Настройте Nginx как reverse proxy
3. ✅ Включите HTTPS с Let's Encrypt
4. ✅ Настройте автозапуск через systemd
5. ✅ Регулярно делайте бэкап `data.db`
6. ✅ Настройте firewall (разрешите только 80, 443)
7. ✅ Используйте переменные окружения для секретов

---

## Troubleshooting

**Приложение не запускается:**
```bash
make status          # Проверить статус
make logs            # Посмотреть логи
node app.js          # Запустить напрямую
```

**Порт занят:**
```bash
netstat -tulpn | grep 3005    # Linux
netstat -ano | findstr 3005   # Windows
```

**Проверка работы:**
```bash
curl http://localhost:3005/
# Или откройте: http://localhost:3005/api-docs
```

---

## Настройка переменных окружения

### Быстрая настройка

1. Скопируйте файл `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Отредактируйте `.env` файл, указав ваши значения:
   ```bash
   nano .env
   # или
   vim .env
   ```

### Переменные окружения

**API_URL**  
URL, по которому доступен API (используется в Swagger документации)

Для разработки:
```
API_URL=http://localhost:3005
```

Для продакшена:
```
API_URL=http://90.156.202.37:3005
# или
API_URL=http://your-domain.com:3005
# или с подпапкой
API_URL=http://test.develgu.ru/jsfs_postapi
```

**PORT**  
Порт, на котором запускается приложение
```
PORT=3005
```

**NODE_ENV**  
Режим окружения
```
NODE_ENV=production
# или
NODE_ENV=development
```

**JWT_SECRET**  
Секретный ключ для JWT токенов (обязательно измените на продакшене!)
```
JWT_SECRET=your-very-secret-key-here-change-this
```

### Пример .env файла для продакшена

```env
# API URL для Swagger документации
API_URL=http://90.156.202.37:3005

# Порт приложения
PORT=3005

# Режим окружения
NODE_ENV=production

# JWT секретный ключ (ИЗМЕНИТЕ!)
JWT_SECRET=super-secret-production-key-change-this-12345
```

### Важно!

- ⚠️ Файл `.env` добавлен в `.gitignore` и не попадет в git
- ⚠️ Никогда не коммитьте `.env` файл с реальными секретами
- ⚠️ Обязательно измените `JWT_SECRET` на продакшене
- ⚠️ Используйте `.env.example` как шаблон для других разработчиков
