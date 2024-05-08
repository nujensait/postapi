const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !(await user.comparePassword(req.body.password))) {
            return res.status(401).send('Authentication failed');
        }
        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1d' });
        res.status(200).send({ token });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
