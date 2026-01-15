const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CRUD API для управления постами',
            version: '1.0.0',
            description: 'API для создания, чтения, обновления и удаления постов с аутентификацией пользователей',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:3005',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Введите JWT токен, полученный при авторизации'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'Имя пользователя',
                            example: 'john_doe'
                        },
                        password: {
                            type: 'string',
                            description: 'Пароль пользователя',
                            example: 'password123'
                        }
                    }
                },
                Post: {
                    type: 'object',
                    required: ['title', 'description'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID поста',
                            example: 1
                        },
                        title: {
                            type: 'string',
                            description: 'Заголовок поста',
                            example: 'Мой первый пост'
                        },
                        description: {
                            type: 'string',
                            description: 'Описание поста',
                            example: 'Это описание моего первого поста'
                        },
                        author: {
                            type: 'string',
                            description: 'Автор поста (username)',
                            example: 'john_doe'
                        }
                    }
                },
                Token: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            description: 'JWT токен для авторизации',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Сообщение об ошибке',
                            example: 'Ошибка при выполнении операции'
                        }
                    }
                },
                Message: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Сообщение о результате операции',
                            example: 'Операция выполнена успешно'
                        }
                    }
                }
            }
        },
        security: []
    },
    apis: ['./routes/*.js', './app.js'], // Путь к файлам с аннотациями
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
