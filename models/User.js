const db = require('../db/database');
const bcrypt = require('bcryptjs');

class User {

    /**
     * @param username
     * @param password
     */
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    /**
     * @param callback
     */
    save(callback) {
        // hash password
        /*
        bcrypt.hash(this.password, 8, (err, hashedPassword) => {
            if (err) {
                return null;
                //return callback(err);
            }
            const sql = `INSERT INTO users (username, password)
                         VALUES (?, ?)`;
            db.run(sql, [this.username, hashedPassword], function (err) {
                if (err) return callback(err);
                callback(null, {id: this.lastID, ...this});
            });
        });
        */
        // @fixme without password hashing
        const sql = `INSERT INTO users (username, password)
                     VALUES (?, ?)`;
        db.run(sql, [this.username, this.password], function (err) {
            if (err) return callback(err);
            callback(null, {id: this.lastID, ...this});
        });
    }

    /**
     * @param username
     * @param callback
     */
    static findByUsername(username, callback) {
        const sql = `SELECT *
                     FROM users
                     WHERE username = ?`;
        db.get(sql, [username], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
        });
    }

    /**
     * @param id
     * @param callback
     */
    static findById(id, callback) {
        const sql = `SELECT *
                     FROM users
                     WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
        });
    }

    /**
     * @param candidatePassword
     * @param hash
     * @param callback
     */
    comparePassword(candidatePassword, hash, callback) {
        bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
            if (err) return callback(err);
            callback(null, isMatch);
        });
    }

    /**
     * @param callback
     */
    static findAll(callback) {
        const sql = `SELECT *
                     FROM users`;
        db.all(sql, [], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    }

    /**
     * @param id
     * @param updates - { username }
     * @param callback
     */
    static updateById(id, updates, callback) {
        const { username } = updates;
        const sql = 'UPDATE users SET username = ? WHERE id = ?';
        db.run(sql, [username, id], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { updatedRows: this.changes });
        });
    }

    /**
     * @param id
     * @param newPassword
     * @param callback
     */
    static updatePassword(id, newPassword, callback) {
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        db.run(sql, [newPassword, id], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, { updatedRows: this.changes });
        });
    }
}

module.exports = User;