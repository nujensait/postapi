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
    static findById(id, callback) {
        const sql = `SELECT *
                     FROM posts
                     WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
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

    /**
     * @param options - { page, limit, author, search }
     * @param callback
     */
    static findWithPagination(options, callback) {
        const { page = 1, limit = 10, author, search } = options;
        const offset = (page - 1) * limit;
        
        let sql = 'SELECT * FROM posts WHERE 1=1';
        let countSql = 'SELECT COUNT(*) as total FROM posts WHERE 1=1';
        const params = [];
        const countParams = [];

        // Фильтр по автору
        if (author) {
            sql += ' AND author = ?';
            countSql += ' AND author = ?';
            params.push(author);
            countParams.push(author);
        }

        // Поиск по title или description
        if (search) {
            sql += ' AND (title LIKE ? OR description LIKE ?)';
            countSql += ' AND (title LIKE ? OR description LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
            countParams.push(searchPattern, searchPattern);
        }

        sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        // Получаем общее количество записей
        db.get(countSql, countParams, (err, countRow) => {
            if (err) return callback(err);

            const total = countRow.total;

            // Получаем записи с пагинацией
            db.all(sql, params, (err, rows) => {
                if (err) return callback(err);
                
                callback(null, {
                    items: rows,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total
                });
            });
        });
    }

    /**
     * @param author
     * @param callback
     */
    static findByAuthor(author, callback) {
        const sql = `SELECT *
                     FROM posts
                     WHERE author = ?
                     ORDER BY id DESC`;
        db.all(sql, [author], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }

    /**
     * @param searchText
     * @param callback
     */
    static search(searchText, callback) {
        const sql = `SELECT *
                     FROM posts
                     WHERE title LIKE ? OR description LIKE ?
                     ORDER BY id DESC`;
        const searchPattern = `%${searchText}%`;
        db.all(sql, [searchPattern, searchPattern], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }
}

module.exports = Post;