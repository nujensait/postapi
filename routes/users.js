const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     description: Возвращает информацию о текущем авторизованном пользователе
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: john_doe
 *       401:
 *         description: Не авторизован
 */
router.get('/me', authMiddleware, (req, res) => {
    // req.user уже установлен в authMiddleware
    res.status(200).send({
        id: req.user.id,
        username: req.user.username
    });
});

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Обновить профиль текущего пользователя
 *     description: Обновляет username текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: new_username
 *     responses:
 *       200:
 *         description: Профиль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Профиль успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.put('/me', authMiddleware, (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).send({ error: 'Username обязателен' });
    }
    
    // Проверяем, не занят ли новый username
    User.findByUsername(username, (err, existingUser) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при проверке username' });
        }
        
        if (existingUser && existingUser.id !== req.user.id) {
            return res.status(400).send({ error: 'Username уже занят' });
        }
        
        User.updateById(req.user.id, { username }, (err) => {
            if (err) {
                return res.status(500).send({ error: 'Ошибка при обновлении профиля' });
            }
            res.status(200).send({ message: 'Профиль успешно обновлен' });
        });
    });
});

/**
 * @swagger
 * /users/password:
 *   post:
 *     summary: Сменить пароль текущего пользователя
 *     description: Изменяет пароль текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: old_password123
 *               newPassword:
 *                 type: string
 *                 example: new_password456
 *     responses:
 *       200:
 *         description: Пароль успешно изменен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пароль успешно изменен
 *       400:
 *         description: Ошибка валидации или неверный старый пароль
 *       401:
 *         description: Не авторизован
 */
router.post('/password', authMiddleware, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).send({ error: 'Старый и новый пароль обязательны' });
    }
    
    // Проверяем старый пароль
    if (req.user.password !== oldPassword) {
        return res.status(400).send({ error: 'Неверный старый пароль' });
    }
    
    User.updatePassword(req.user.id, newPassword, (err) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при изменении пароля' });
        }
        res.status(200).send({ message: 'Пароль успешно изменен' });
    });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о пользователе по его ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: john_doe
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при поиске пользователя' });
        }
        if (!user) {
            return res.status(404).send({ error: 'Пользователь не найден' });
        }
        
        // Не возвращаем пароль
        res.status(200).send({
            id: user.id,
            username: user.username
        });
    });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех зарегистрированных пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: john_doe
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', (req, res) => {
    User.findAll((err, users) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при получении пользователей' });
        }
        
        // Не возвращаем пароли
        const usersWithoutPasswords = users.map(user => ({
            id: user.id,
            username: user.username
        }));
        
        res.status(200).send(usersWithoutPasswords);
    });
});

module.exports = router;
