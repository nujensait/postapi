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
    static deleteById(id, callback) {
        const sql = 'DELETE FROM posts WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { deletedRows: this.changes }); // this.changes возвращает количество удаленных строк
            }
        });
    }

    static updateById(id, title, description, callback) {
        const sql = 'UPDATE posts SET title = ?, description = ? WHERE id = ?';
        db.run(sql, [title, description, id], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { updatedRows: this.changes }); // this.changes возвращает количество обновленных строк
            }
        });
    }
}

module.exports = Post;