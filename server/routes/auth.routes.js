const express = require('express');
const AuthService = require('../services/auth.service');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await AuthService.register(email, password, name);
        res.status(201).json({
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await AuthService.login(email, password);
        res.json({
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.get('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const user = AuthService.verifyToken(token);
        res.json({ valid: true, user });
    } catch (error) {
        res.status(403).json({ valid: false, error: error.message });
    }
});

module.exports = router;
