const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Routes to Internal Services
const SERVICES = {
    auth: 'http://localhost:5001',
    events: 'http://localhost:5002',
    bookings: 'http://localhost:5003'
};

// Authentication Middleware
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const response = await axios.get(`${SERVICES.auth}/auth/verify`, {
            headers: { authorization: token }
        });
        if (response.data.valid) {
            req.user = response.data.user;
            next();
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Route: Auth
app.post('/api/auth/:path(.*)', async (req, res) => {
    const path = req.params.path;
    try {
        const response = await axios.post(`${SERVICES.auth}/auth/${path}`, req.body);
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth Error' });
    }
});

// Route: Events (Public)
app.get('/api/events', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.events}/events`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Event Service Error' });
    }
});

// Route: Bookings (Protected)
app.post('/api/bookings', authenticate, async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.bookings}/bookings`, {
            ...req.body,
            userId: req.user.userId
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Booking Service Error' });
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
