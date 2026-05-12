const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

const USERS = []; // In-memory DB for demonstration
const JWT_SECRET = 'nexus_secret_key_123';

// Register
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    USERS.push({ id: USERS.length + 1, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = USERS.find(u => u.email === email);
    
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
        return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

// Verify Token (Used by API Gateway)
app.get('/auth/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
