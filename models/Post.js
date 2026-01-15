const db = require('../db/database');

class Post {

    /**
     * @param title
     * @param description
     * @param author
     */
    constructor(title, description, author) {
        this.title = title;
        this.description = description;
        this.author = author;
    }

    /**
     * @param callback
     */
    save(callback) {
        const sql = `INSERT INTO posts (title, description, author)
                     VALUES (?, ?, ?)`;
        const title = this.title;
        const description = this.description;
        const author = this.author;
        
        db.run(sql, [title, description, author], function (err) {
            if (err) return callback(err);
            callback(null, {
                id: this.lastID,
                title: title,
                description: description,
                author: author
            });
        });
    }

    /**
     * @param callback
     */
    static findAll(callback) {
        const sql = `SELECT *
                     FROM posts`;
        db.all(sql, [], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }

    /**
     * @param id
     * @param callback
     */
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

    /**
     * @param id
     * @param title
     * @param description
     * @param callback
     */
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