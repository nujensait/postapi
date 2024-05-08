const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {

    // Получаем токен из заголовков запроса
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Если токен отсутствует, отправляем статус 401 (Неавторизован)
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.sendStatus(403); // Отправляем статус 403 (Запрещено), если токен неверен
        }

        // Поиск пользователя по ID, извлеченному из токена
        User.findById(decoded.userId, (err, user) => {
            if (err || !user) {
                return res.sendStatus(404); // Пользователь не найден
            }

            req.user = user; // Добавляем пользователя в объект запроса
            next(); // Передаем управление следующему обработчику маршрута
        });
    });
};

module.exports = authMiddleware;
