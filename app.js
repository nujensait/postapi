const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use(express.json()); // для парсинга JSON-параметров запроса

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});