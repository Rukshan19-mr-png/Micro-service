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
<<<<<<< HEAD
=======
const isValidWebsite = (website) => {
    try {
        const url = new URL(website);
        return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
    } catch {
        return false;
    }
};
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b

const sanitizeUser = (user) => ({
    id: user.id,
    email: user.email,
<<<<<<< HEAD
    role: user.role || 'student',
    createdAt: user.created_at || user.createdAt
});

async function createUser(email, password, role = 'student') {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (db.isReady()) {
        const result = await db.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
            [email, hashedPassword, role]
=======
    role: user.role === 'student' ? 'candidate' : (user.role || 'candidate'),
    name: user.name || '',
    phone: user.phone || '',
    website: user.website || '',
    university: user.university || '',
    fieldOfStudy: user.field_of_study || user.fieldOfStudy || '',
    location: user.location || '',
    createdAt: user.created_at || user.createdAt
});

async function createUser(email, password, role = 'candidate', profile = {}) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role === 'student' ? 'candidate' : role;
    const { name = '', phone = '', website = '', university = '', fieldOfStudy = '', location = '' } = profile;

    if (db.isReady()) {
        const result = await db.query(
            'INSERT INTO users (email, password, role, name, phone, website, university, field_of_study, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, role, name, phone, website, university, field_of_study, location, created_at',
            [email, hashedPassword, normalizedRole, name, phone, website, university, fieldOfStudy, location]
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
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
<<<<<<< HEAD
        role,
=======
        role: normalizedRole,
        name,
        phone,
        website,
        university,
        fieldOfStudy,
        location,
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
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

<<<<<<< HEAD
    const role = String(req.body.role || 'student').trim().toLowerCase();
    if (!['student', 'company'].includes(role)) {
        return res.status(400).json({ error: 'Role must be student or company' });
    }

    try {
        const user = await createUser(email, password, role);
=======
    const rawRole = String(req.body.role || 'candidate').trim().toLowerCase();
    const role = (rawRole === 'student') ? 'candidate' : rawRole;
    if (!['candidate', 'company'].includes(role)) {
        return res.status(400).json({ error: 'Role must be candidate or company' });
    }

    const name = String(req.body.name || req.body.fullName || req.body.companyName || '').trim();
    const phone = String(req.body.phone || req.body.phoneNumber || '').trim();
    const website = String(req.body.website || req.body.officialWebsite || '').trim();
    const university = String(req.body.university || '').trim();
    const fieldOfStudy = String(req.body.fieldOfStudy || '').trim();
    const location = String(req.body.location || '').trim();

    // Specific validation for company
    if (role === 'company') {
        if (!website) {
            return res.status(400).json({ error: 'Official company website link is required to verify authenticity' });
        }
        if (!phone) {
            return res.status(400).json({ error: 'Official company contact/phone number is required' });
        }
        if (!name) {
            return res.status(400).json({ error: 'Company name is required' });
        }
        if (!isValidWebsite(website)) {
            return res.status(400).json({ error: 'Enter a valid official website URL, including https://' });
        }
    }

    try {
        const user = await createUser(email, password, role, { name, phone, website, university, fieldOfStudy, location });
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
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
<<<<<<< HEAD
            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role || 'student' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
=======
            const userRole = user.role === 'student' ? 'candidate' : (user.role || 'candidate');
            const token = jwt.sign({ 
                userId: user.id, 
                email: user.email, 
                role: userRole,
                name: user.name || '',
                website: user.website || '',
                phone: user.phone || ''
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
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
