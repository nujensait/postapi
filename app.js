const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use(express.json()); // для парсинга JSON-параметров запроса

// Корневой маршрут с приветствием и справкой по API
app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в CRUD API для управления постами!',
        version: '1.0.0',
        description: 'API для создания, чтения, обновления и удаления постов с аутентификацией пользователей',
        endpoints: {
            auth: {
                register: {
                    method: 'POST',
                    path: '/auth/register',
                    description: 'Регистрация нового пользователя',
                    body: {
                        username: 'string (required)',
                        password: 'string (required)'
                    },
                    auth: false
                },
                login: {
                    method: 'POST',
                    path: '/auth/login',
                    description: 'Аутентификация пользователя и получение токена',
                    body: {
                        username: 'string (required)',
                        password: 'string (required)'
                    },
                    response: {
                        token: 'string (JWT token)'
                    },
                    auth: false
                }
            },
            posts: {
                getAll: {
                    method: 'GET',
                    path: '/posts',
                    description: 'Получить список всех постов',
                    auth: false
                },
                create: {
                    method: 'POST',
                    path: '/posts',
                    description: 'Создать новый пост (требуется авторизация)',
                    headers: {
                        Authorization: 'Bearer <token>'
                    },
                    body: {
                        title: 'string (required)',
                        description: 'string (required)'
                    },
                    auth: true
                },
                update: {
                    method: 'PUT',
                    path: '/posts/:id',
                    description: 'Обновить свой пост (требуется авторизация, только владелец)',
                    headers: {
                        Authorization: 'Bearer <token>'
                    },
                    body: {
                        title: 'string (optional)',
                        description: 'string (optional)'
                    },
                    auth: true,
                    ownership: 'Только автор поста может его обновить'
                },
                delete: {
                    method: 'DELETE',
                    path: '/posts/:id',
                    description: 'Удалить свой пост (требуется авторизация, только владелец)',
                    headers: {
                        Authorization: 'Bearer <token>'
                    },
                    auth: true,
                    ownership: 'Только автор поста может его удалить'
                }
            }
        },
        documentation: {
            readme: 'https://github.com/your-repo/README.MD',
            postman: 'Импортируйте postman.json для тестирования API'
        },
        server: {
            port: 3005,
            status: 'running'
        }
    });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Запуск сервера только если файл запущен напрямую (не при импорте для тестов)
if (require.main === module) {
    app.listen(3005, () => {
        console.log('Server is running on port 3005');
    });
}

module.exports = app;