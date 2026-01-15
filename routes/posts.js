// posts.js

const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Создать новый пост
 *     description: Создает новый пост (требуется авторизация)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Мой первый пост
 *               description:
 *                 type: string
 *                 example: Это описание моего первого поста
 *     responses:
 *       201:
 *         description: Пост успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 */
// Создание нового поста
router.post('/', authMiddleware, (req, res) => {
    const { title, description } = req.body;
    
    // Валидация обязательных полей
    if (!title || !description) {
        return res.status(400).send({ error: 'Title and description are required' });
    }
    
    // Автор поста - текущий авторизованный пользователь
    const author = req.user.username;
    
    const post = new Post(title, description, author);
    post.save((err, savedPost) => {
        if (err) return res.status(400).send(err);
        res.status(201).send(savedPost);
    });
});

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Список постов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Ошибка сервера
 */
// Получение всех постов
router.get('/', (req, res) => {
    Post.findAll((err, posts) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(posts);
    });
});

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Удалить пост
 *     description: Удаляет пост (требуется авторизация, только владелец)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID поста
 *     responses:
 *       200:
 *         description: Пост успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пост успешно удален
 *                 deletedRows:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав для удаления этого поста
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пост не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Маршрут для удаления поста
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    
    // Проверяем, существует ли пост и является ли пользователь его автором
    Post.findById(id, (err, post) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при поиске поста' });
        }
        if (!post) {
            return res.status(404).send({ error: 'Пост не найден' });
        }
        
        // Проверка, что пользователь является автором поста
        if (post.author !== req.user.username) {
            return res.status(403).send({ error: 'Нет прав для удаления этого поста' });
        }
        
        Post.deleteById(id, (err, result) => {
            if (err) {
                return res.status(500).send({ error: 'Ошибка при удалении поста' });
            }
            res.status(200).send({ message: 'Пост успешно удален', deletedRows: result.deletedRows });
        });
    });
});

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Обновить пост
 *     description: Обновляет пост (требуется авторизация, только владелец)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID поста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Обновленный заголовок
 *               description:
 *                 type: string
 *                 example: Обновленное описание
 *     responses:
 *       200:
 *         description: Пост успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пост успешно обновлен
 *                 updatedRows:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав для обновления этого поста
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пост не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Маршрут для обновления поста
router.put('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    // Валидация данных
    if (!title && !description) {
        return res.status(400).send({ error: 'Необходимо указать title или description для обновления' });
    }

    // Проверяем, существует ли пост и является ли пользователь его автором
    Post.findById(id, (err, post) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при поиске поста' });
        }
        if (!post) {
            return res.status(404).send({ error: 'Пост не найден или данные не изменены' });
        }
        
        // Проверка, что пользователь является автором поста
        if (post.author !== req.user.username) {
            return res.status(403).send({ error: 'Нет прав для обновления этого поста' });
        }

        Post.updateById(id, title, description, (err, result) => {
            if (err) {
                return res.status(500).send({ error: 'Ошибка при обновлении поста' });
            }
            res.status(200).send({ message: 'Пост успешно обновлен', updatedRows: result.updatedRows });
        });
    });
});

module.exports = router;
