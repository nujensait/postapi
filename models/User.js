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
}

module.exports = User;