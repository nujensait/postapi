const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: Создает нового пользователя в системе
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User registered
 *       400:
 *         description: Ошибка при регистрации (пользователь уже существует)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User already exists
 */
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    // Проверяем, существует ли пользователь
    User.findByUsername(username, (err, existingUser) => {
        if (err) {
            return res.status(400).send(err);
        }
        
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        
        // Создаем нового пользователя
        const user = new User(username, password);
        user.save((err) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(201).send('User registered');
        });
    });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Аутентификация пользователя
 *     description: Авторизует пользователя и возвращает JWT токен
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Успешная аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Authentication failed
 *       400:
 *         description: Ошибка запроса
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    User.findByUsername(username, (err, user) => {
        if (err) {
            return res.status(400).send(err);
        }
        
        if (!user) {
            return res.status(401).send('Authentication failed');
        }
        
        // Простая проверка пароля (без хеширования, как в модели)
        if (user.password !== password) {
            return res.status(401).send('Authentication failed');
        }
        
        const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1d' });
        res.status(200).send({ token });
    });
});

module.exports = router;
