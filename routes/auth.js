const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

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
        user.save((err, savedUser) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(201).send('User registered');
        });
    });
});

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
