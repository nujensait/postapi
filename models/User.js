const db = require('../db/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    save(callback) {
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
    }

    static findByUsername(username, callback) {
        const sql = `SELECT *
                     FROM users
                     WHERE username = ?`;
        db.get(sql, [username], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
        });
    }

    comparePassword(candidatePassword, hash, callback) {
        bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
            if (err) return callback(err);
            callback(null, isMatch);
        });
    }
}

module.exports = User;