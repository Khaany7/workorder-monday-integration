const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

class AuthService {
    static async register(email, password, name) {
        return new Promise(async (resolve, reject) => {
            try {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return reject(new Error('Invalid email format'));
                }

                if (password.length < 8) {
                    return reject(new Error('Password must be at least 8 characters'));
                }
                if (!/[A-Z]/.test(password)) {
                    return reject(new Error('Password must contain at least one uppercase letter'));
                }
                if (!/[0-9]/.test(password)) {
                    return reject(new Error('Password must contain at least one number'));
                }
                if (!/[!@#$%^&*]/.test(password)) {
                    return reject(new Error('Password must contain at least one special character (!@#$%^&*)'));
                }

                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

                const db = getDatabase();
                db.run(
                    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
                    [email, hashedPassword, name],
                    function (err) {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                reject(new Error('Email already registered'));
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve({ id: this.lastID, email, name });
                        }
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    static async login(email, password) {
        return new Promise((resolve, reject) => {
            const db = getDatabase();

            db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                if (err) return reject(err);
                if (!user) return reject(new Error('Invalid email or password'));

                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    return reject(new Error('Invalid email or password'));
                }

                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                resolve({
                    token,
                    user: { id: user.id, email: user.email, name: user.name }
                });
            });
        });
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}

module.exports = AuthService;
