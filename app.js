const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const app = express();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use(express.json()); // для парсинга JSON-параметров запроса

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CRUD API Documentation'
}));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Редирект на документацию API
 *     description: Перенаправляет на Swagger UI документацию
 *     tags: [Info]
 *     responses:
 *       302:
 *         description: Редирект на /api-docs
 */
// Корневой маршрут - редирект на Swagger документацию
app.get('/', (req, res) => {
    res.redirect('/api-docs');
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