// posts.js

const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

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

// Получение всех постов
router.get('/', (req, res) => {
    Post.findAll((err, posts) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(posts);
    });
});

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
