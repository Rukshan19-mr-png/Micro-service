const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

const db = require('./db');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const PORT = process.env.PORT || 5001;
const memoryUsers = [];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeUser = (user) => ({
    id: user.id,
    email: user.email,
    role: user.role || 'student',
    createdAt: user.created_at || user.createdAt
});

async function createUser(email, password, role = 'student') {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (db.isReady()) {
        const result = await db.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
            [email, hashedPassword, role]
        );
        return result.rows[0];
    }

    if (memoryUsers.some((user) => user.email === email)) {
        const duplicate = new Error('Email already exists');
        duplicate.code = '23505';
        throw duplicate;
    }

    const user = {
        id: memoryUsers.length + 1,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString()
    };
    memoryUsers.push(user);
    return user;
}

async function findUserByEmail(email) {
    if (db.isReady()) {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    return memoryUsers.find((user) => user.email === email);
}

app.get('/health', (req, res) => {
    res.json({
        service: 'auth-service',
        status: 'ok',
        storage: db.isReady() ? 'postgres' : 'memory'
    });
});

// Register
app.post('/auth/register', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'A valid email is required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const role = String(req.body.role || 'student').trim().toLowerCase();
    if (!['student', 'company'].includes(role)) {
        return res.status(400).json({ error: 'Role must be student or company' });
    }

    try {
        const user = await createUser(email, password, role);
        res.status(201).json({ message: 'User registered successfully', user: sanitizeUser(user) });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!isValidEmail(email) || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await findUserByEmail(email);
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role || 'student' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            return res.json({ token, user: sanitizeUser(user) });
        }
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Token (Used by API Gateway)
app.get('/auth/verify', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
        return res.status(401).json({ valid: false, error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
});

db.initDb().finally(() => {
    app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
});
