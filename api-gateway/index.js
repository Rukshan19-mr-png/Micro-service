const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Routes to Internal Services
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    events: process.env.EVENT_SERVICE_URL || 'http://localhost:5002',
    bookings: process.env.BOOKING_SERVICE_URL || 'http://localhost:5003',
    payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
    notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005'
};

const forwardError = (res, err, fallback) => {
    const status = err.response?.status || 502;
    res.status(status).json(err.response?.data || { error: fallback });
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

app.get('/health', async (req, res) => {
    const checks = await Promise.all(Object.entries(SERVICES).map(async ([name, url]) => {
        try {
            const response = await axios.get(`${url}/health`, { timeout: 1500 });
            return [name, { status: 'ok', data: response.data }];
        } catch (err) {
            return [name, { status: 'down', error: err.message }];
        }
    }));

    const services = Object.fromEntries(checks);
    const isHealthy = Object.values(services).every((service) => service.status === 'ok');
    res.status(isHealthy ? 200 : 503).json({ service: 'api-gateway', status: isHealthy ? 'ok' : 'degraded', services });
});

// Route: Auth
app.post('/api/auth/:action', async (req, res) => {
    const action = req.params.action;
    if (!['register', 'login'].includes(action)) {
        return res.status(404).json({ error: 'Unknown auth action' });
    }

    try {
        const response = await axios.post(`${SERVICES.auth}/auth/${action}`, req.body);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Auth Service Error');
    }
});

// Route: Events (Public)
app.get('/api/events', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.events}/events`);
        res.json(response.data);
    } catch (err) {
        forwardError(res, err, 'Event Service Error');
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.events}/events/${req.params.id}`);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Event Service Error');
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
        forwardError(res, err, 'Booking Service Error');
    }
});

app.get('/api/bookings', authenticate, async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.bookings}/bookings`, {
            params: { userId: req.user.userId }
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Booking Service Error');
    }
});

app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.notifications}/notifications/user/${req.user.userId}`);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Notification Service Error');
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
