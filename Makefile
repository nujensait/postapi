.PHONY: help install install-deps start dev stop restart logs test clean db-init nohup-start nohup-stop screen-start screen-attach screen-list

# Цвета для вывода
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ Справка

help: ## Показать эту справку
	@echo "$(BLUE)Доступные команды:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Установка

install: ## Установить все зависимости (npm install)
	@echo "$(BLUE)Установка зависимостей...$(NC)"
	npm install
	@echo "$(GREEN)✓ Зависимости установлены$(NC)"

install-deps: ## Установить зависимости из dependencies.txt
	@echo "$(BLUE)Установка зависимостей из dependencies.txt...$(NC)"
	@if [ -f "scripts/install-dependencies.sh" ]; then \
		chmod +x scripts/install-dependencies.sh && ./scripts/install-dependencies.sh; \
	else \
		echo "$(RED)Ошибка: scripts/install-dependencies.sh не найден$(NC)"; \
		exit 1; \
	fi


##@ Запуск (простой)

start: ## Запустить приложение (node app.js)
	@echo "$(BLUE)Запуск приложения...$(NC)"
	npm start

dev: ## Запустить в режиме разработки (nodemon)
	@echo "$(BLUE)Запуск в режиме разработки...$(NC)"
	npm run dev

##@ Запуск (фоновый режим)

nohup-start: ## Запустить в фоне с nohup
	@echo "$(BLUE)Запуск в фоне с nohup...$(NC)"
	@mkdir -p logs
	@nohup npm start > logs/app.log 2>&1 & echo $$! > app.pid
	@echo "$(GREEN)✓ Приложение запущено в фоне (PID: $$(cat app.pid))$(NC)"
	@echo "Логи: tail -f logs/app.log"

nohup-stop: ## Остановить приложение запущенное через nohup
	@if [ -f app.pid ]; then \
		echo "$(BLUE)Остановка приложения (PID: $$(cat app.pid))...$(NC)"; \
		kill $$(cat app.pid) && rm app.pid; \
		echo "$(GREEN)✓ Приложение остановлено$(NC)"; \
	else \
		echo "$(RED)Ошибка: app.pid не найден$(NC)"; \
	fi

screen-start: ## Запустить в screen сессии
	@echo "$(BLUE)Запуск в screen сессии...$(NC)"
	@screen -dmS crud-api npm start
	@echo "$(GREEN)✓ Приложение запущено в screen (crud-api)$(NC)"
	@echo "Подключиться: screen -r crud-api"

screen-attach: ## Подключиться к screen сессии
	@screen -r crud-api

screen-list: ## Список screen сессий
	@screen -ls

##@ База данных

db-init: ## Инициализировать базу данных
	@echo "$(BLUE)Инициализация базы данных...$(NC)"
	node db/database.js
	@echo "$(GREEN)✓ База данных инициализирована$(NC)"

db-reset: ## Сбросить базу данных (удалить и создать заново)
	@echo "$(YELLOW)Внимание: база данных будет удалена!$(NC)"
	@rm -f data.db
	@make db-init

##@ Тестирование

test: ## Запустить тесты
	@echo "$(BLUE)Запуск тестов...$(NC)"
	npm test

test-watch: ## Запустить тесты в режиме наблюдения
	@echo "$(BLUE)Запуск тестов в режиме наблюдения...$(NC)"
	npm run test:watch

test-coverage: ## Запустить тесты с покрытием
	@echo "$(BLUE)Запуск тестов с покрытием...$(NC)"
	npm test

##@ Логи

logs: ## Просмотр логов приложения
	@if [ -f logs/app.log ]; then \
		tail -f logs/app.log; \
	else \
		echo "$(RED)Логи не найдены$(NC)"; \
	fi

logs-error: ## Просмотр логов ошибок
	@if [ -f logs/err.log ]; then \
		tail -f logs/err.log; \
	else \
		echo "$(RED)Логи ошибок не найдены$(NC)"; \
	fi

logs-clear: ## Очистить логи
	@echo "$(BLUE)Очистка логов...$(NC)"
	@rm -f logs/*.log
	@echo "$(GREEN)✓ Логи очищены$(NC)"

##@ Очистка

clean: ## Очистить временные файлы
	@echo "$(BLUE)Очистка временных файлов...$(NC)"
	@rm -rf node_modules
	@rm -rf coverage
	@rm -f package-lock.json
	@rm -f app.pid
	@echo "$(GREEN)✓ Временные файлы удалены$(NC)"

clean-logs: ## Очистить логи
	@make logs-clear

clean-all: ## Полная очистка (включая БД)
	@make clean
	@make clean-logs
	@rm -f data.db
	@echo "$(GREEN)✓ Полная очистка выполнена$(NC)"

##@ Информация

status: ## Показать статус приложения
	@echo "$(BLUE)Статус приложения:$(NC)"
	@echo ""
	@if [ -f app.pid ]; then \
		echo "$(YELLOW)Nohup:$(NC)"; \
		echo "  PID: $$(cat app.pid)"; \
		ps -p $$(cat app.pid) > /dev/null 2>&1 && echo "  Статус: $(GREEN)Запущен$(NC)" || echo "  Статус: $(RED)Остановлен$(NC)"; \
		echo ""; \
	fi
	@echo "$(YELLOW)Screen сессии:$(NC)"; \
	screen -ls 2>/dev/null | grep crud-api || echo "  Нет активных сессий"

info: ## Показать информацию о проекте
	@echo "$(BLUE)Информация о проекте:$(NC)"
	@echo ""
	@echo "$(YELLOW)Название:$(NC) CRUD API для управления постами"
	@echo "$(YELLOW)Версия:$(NC) $$(node -p "require('./package.json').version")"
	@echo "$(YELLOW)Node.js:$(NC) $$(node --version)"
	@echo "$(YELLOW)NPM:$(NC) $$(npm --version)"
	@echo ""
	@echo "$(YELLOW)Документация:$(NC)"
	@echo "  README: README.MD"
	@echo "  Production: PRODUCTION.MD"
	@echo "  API Docs: http://localhost:3005/api-docs"
	@echo ""
	@echo "$(YELLOW)Команды:$(NC)"
	@echo "  make help - показать все доступные команды"

##@ Разработка

lint: ## Проверить код (если настроен линтер)
	@echo "$(BLUE)Проверка кода...$(NC)"
	@if [ -f .eslintrc.js ] || [ -f .eslintrc.json ]; then \
		npm run lint 2>/dev/null || echo "$(YELLOW)Линтер не настроен$(NC)"; \
	else \
		echo "$(YELLOW)Линтер не настроен$(NC)"; \
	fi

format: ## Форматировать код (если настроен prettier)
	@echo "$(BLUE)Форматирование кода...$(NC)"
	@if command -v prettier > /dev/null; then \
		prettier --write . 2>/dev/null || echo "$(YELLOW)Prettier не настроен$(NC)"; \
	else \
		echo "$(YELLOW)Prettier не установлен$(NC)"; \
	fi

##@ Продакшен

deploy: ## Подготовка к деплою
	@echo "$(BLUE)Подготовка к деплою...$(NC)"
	@make clean
	@make install
	@make test
	@make db-init
	@echo "$(GREEN)✓ Готово к деплою$(NC)"

prod-start: ## Запуск в продакшен режиме (screen)
	@echo "$(BLUE)Запуск в продакшен режиме...$(NC)"
	@make screen-start

prod-stop: ## Остановка продакшен режима
	@echo "$(BLUE)Остановка screen сессии...$(NC)"
	@screen -X -S crud-api quit 2>/dev/null || echo "$(YELLOW)Сессия не найдена$(NC)"

##@ Docker (если используется)

docker-build: ## Собрать Docker образ
	@echo "$(BLUE)Сборка Docker образа...$(NC)"
	@if [ -f Dockerfile ]; then \
		docker build -t crud-api .; \
		echo "$(GREEN)✓ Docker образ собран$(NC)"; \
	else \
		echo "$(RED)Dockerfile не найден$(NC)"; \
	fi

docker-run: ## Запустить Docker контейнер
	@echo "$(BLUE)Запуск Docker контейнера...$(NC)"
	@docker run -d -p 3005:3005 --name crud-api crud-api
	@echo "$(GREEN)✓ Docker контейнер запущен$(NC)"

docker-stop: ## Остановить Docker контейнер
	@docker stop crud-api
	@docker rm crud-api
	@echo "$(GREEN)✓ Docker контейнер остановлен$(NC)"
