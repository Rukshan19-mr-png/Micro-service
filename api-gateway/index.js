const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Routes to Internal Services
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    internships: process.env.EVENT_SERVICE_URL || 'http://localhost:5002',
    applications: process.env.BOOKING_SERVICE_URL || 'http://localhost:5003',
    payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
    notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5006'
};

const forwardError = (res, err, fallback) => {
    const status = err.response?.status || 502;
    res.status(status).json(err.response?.data || { error: fallback });
};

// Authentication Middleware — attaches req.user from JWT
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

// Role Guard Middleware — only allows specified roles
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
};

// Health check (aggregates all downstream services)
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

// ─── Auth Routes ────────────────────────────────────────────────────────────

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

// ─── Internship Routes ───────────────────────────────────────────────────────

// Public: list all internships (with optional ?category= and ?search= filters)
app.get('/api/internships', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.internships}/internships`, { params: req.query });
        res.json(response.data);
    } catch (err) {
        forwardError(res, err, 'Internship Service Error');
    }
});

// Public: get single internship
app.get('/api/internships/:id', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.internships}/internships/${req.params.id}`);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Internship Service Error');
    }
});

// Protected (company only): post a new internship listing
app.post('/api/internships', authenticate, requireRole('company'), async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.internships}/internships`, {
            ...req.body,
<<<<<<< HEAD
            postedBy: req.user.userId
=======
            postedBy: req.user.userId,
            companyName: req.user.name,
            officialWebsite: req.user.website,
            officialEmail: req.user.email,
            officialPhone: req.user.phone
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Internship Service Error');
    }
});

// Backwards-compatible aliases for /api/events (used by older frontend code)
app.get('/api/events', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.internships}/internships`, { params: req.query });
        res.json(response.data);
    } catch (err) {
        forwardError(res, err, 'Internship Service Error');
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.internships}/internships/${req.params.id}`);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Internship Service Error');
    }
});

// ─── Application Routes ──────────────────────────────────────────────────────

// Protected (student only): submit internship application
app.post('/api/bookings', authenticate, async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.applications}/bookings`, {
            ...req.body,
            userId: req.user.userId,
            userRole: req.user.role
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Application Service Error');
    }
});

// Protected: get user's applications
app.get('/api/bookings', authenticate, async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.applications}/bookings`, {
            params: { userId: req.user.userId }
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Application Service Error');
    }
});

// ─── Notification Routes ─────────────────────────────────────────────────────

app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.notifications}/notifications/user/${req.user.userId}`);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Notification Service Error');
    }
});

// ─── Analytics Routes ───────────────────────────────────────────────────────

app.get('/api/metrics', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.analytics}/metrics`);
        res.status(response.status).json(response.data);
    } catch (err) {
        forwardError(res, err, 'Analytics Service Error');
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
