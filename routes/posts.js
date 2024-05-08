// posts.js

const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Создание нового поста
//router.post('/', authMiddleware, (req, res) => {
router.post('/', (req, res) => {
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

module.exports = router;
