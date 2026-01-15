const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use(express.json()); // для парсинга JSON-параметров запроса

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Запуск сервера только если файл запущен напрямую (не при импорте для тестов)
if (require.main === module) {
    app.listen(3005, () => {
        console.log('Server is running on port 3005');
    });
}

module.exports = app;