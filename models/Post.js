const db = require('../db/database');

class Post {
    constructor(title, description, author) {
        this.title = title;
        this.description = description;
        this.author = author;
    }

    save(callback) {
        const sql = `INSERT INTO posts (title, description, author)
                     VALUES (?, ?, ?)`;
        db.run(sql, [this.title, this.description, this.author], function (err) {
            if (err) return callback(err);
            callback(null, {id: this.lastID, ...this});
        });
    }

    static findAll(callback) {
        const sql = `SELECT *
                     FROM posts`;
        db.all(sql, [], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }

    // Дополнительные методы для обновления и удаления постов можно добавить аналогично
}

module.exports = Post;