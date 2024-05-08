// posts.js

const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Создание нового поста
//router.post('/', authMiddleware, (req, res) => {
router.post('/', (req, res) => {        // @fixme skipped auth
    try {
        const { title, description, author } = req.body;
        const post = new Post(title, description, author); // Использование 'new' для создания экземпляра
        post.save((err, savedPost) => {
            if (err) return res.status(400).send(err);
            res.status(201).send(savedPost);
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Получение всех постов
router.get('/', (req, res) => {
    Post.findAll((err, posts) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(posts);
    });
});

// Маршрут для удаления поста
//router.delete('/:id', authMiddleware, (req, res) => {
router.delete('/:id',  (req, res) => {      // @fixme skipped auth
    const { id } = req.params; // Получаем ID поста из параметров маршрута
    Post.deleteById(id, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при удалении поста' });
        }
        if (result.deletedRows === 0) {
            return res.status(404).send({ error: 'Пост не найден' });
        }
        res.status(200).send({ message: 'Пост успешно удален', deletedRows: result.deletedRows });
    });
});

// Маршрут для обновления поста
//router.put('/:id', authMiddleware, (req, res) => {      // @fixme skipped auth
router.put('/:id',  (req, res) => {
    const { id } = req.params; // Получаем ID поста из параметров маршрута
    const { title, description } = req.body; // Получаем новые значения для заголовка и описания из тела запроса

    Post.updateById(id, title, description, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Ошибка при обновлении поста' });
        }
        if (result.updatedRows === 0) {
            return res.status(404).send({ error: 'Пост не найден или данные не изменены' });
        }
        res.status(200).send({ message: 'Пост успешно обновлен', updatedRows: result.updatedRows });
    });
});

module.exports = router;
