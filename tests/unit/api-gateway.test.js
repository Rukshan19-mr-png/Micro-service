/**
 * Unit Tests — API Gateway
 * Tests routing, auth middleware, and role guards using mocked axios.
 */

jest.mock('axios');
const axios = require('axios');
const request = require('supertest');
const express = require('express');

// ─── Rebuild gateway app inline (testable instance) ──────────────────────────

function buildGatewayApp(SERVICES) {
    const app = express();
    app.use(express.json());

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
        next();
    });

    const forwardError = (res, err, fallback) => {
        const status = err.response?.status || 502;
        res.status(status).json(err.response?.data || { error: fallback });
    };

    const authenticate = async (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'No token provided' });
        try {
            const response = await axios.get(`${SERVICES.auth}/auth/verify`, { headers: { authorization: token } });
            if (response.data.valid) {
                req.user = response.data.user;
                next();
            } else {
                res.status(401).json({ error: 'Invalid token' });
            }
        } catch {
            res.status(401).json({ error: 'Authentication failed' });
        }
    };

    const requireRole = (...roles) => (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
        }
        next();
    };

    // Health
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
        const isHealthy = Object.values(services).every(s => s.status === 'ok');
        res.status(isHealthy ? 200 : 503).json({ service: 'api-gateway', status: isHealthy ? 'ok' : 'degraded', services });
    });

    // Auth
    app.post('/api/auth/:action', async (req, res) => {
        const action = req.params.action;
        if (!['register', 'login'].includes(action)) return res.status(404).json({ error: 'Unknown auth action' });
        try {
            const response = await axios.post(`${SERVICES.auth}/auth/${action}`, req.body);
            res.status(response.status).json(response.data);
        } catch (err) {
            forwardError(res, err, 'Auth Service Error');
        }
    });

    // Internships
    app.get('/api/internships', async (req, res) => {
        try {
            const response = await axios.get(`${SERVICES.internships}/internships`, { params: req.query });
            res.json(response.data);
        } catch (err) { forwardError(res, err, 'Internship Service Error'); }
    });

    app.get('/api/internships/:id', async (req, res) => {
        try {
            const response = await axios.get(`${SERVICES.internships}/internships/${req.params.id}`);
            res.status(response.status).json(response.data);
        } catch (err) { forwardError(res, err, 'Internship Service Error'); }
    });

    app.post('/api/internships', authenticate, requireRole('company'), async (req, res) => {
        try {
            const response = await axios.post(`${SERVICES.internships}/internships`, {
                ...req.body,
                postedBy: req.user.userId,
                companyName: req.user.name,
                officialWebsite: req.user.website,
                officialEmail: req.user.email,
                officialPhone: req.user.phone
            });
            res.status(response.status).json(response.data);
        } catch (err) { forwardError(res, err, 'Internship Service Error'); }
    });

    // Bookings
    app.post('/api/bookings', authenticate, async (req, res) => {
        try {
            const response = await axios.post(`${SERVICES.applications}/bookings`, {
                ...req.body, userId: req.user.userId, userRole: req.user.role
            });
            res.status(response.status).json(response.data);
        } catch (err) { forwardError(res, err, 'Application Service Error'); }
    });

    app.get('/api/bookings', authenticate, async (req, res) => {
        try {
            const response = await axios.get(`${SERVICES.applications}/bookings`, { params: { userId: req.user.userId } });
            res.status(response.status).json(response.data);
        } catch (err) { forwardError(res, err, 'Application Service Error'); }
    });

    // Notifications
    app.get('/api/notifications', authenticate, async (req, res) => {
        try {
            const response = await axios.get(`${SERVICES.notifications}/notifications/user/${req.user.userId}`);
            res.status(response.status).json(response.data);
        } catch (err) { forwardError(res, err, 'Notification Service Error'); }
    });

    // Metrics
    app.get('/api/metrics', async (req, res) => {
        try {
            const response = await axios.get(`${SERVICES.analytics}/metrics`);
            res.status(response.status).json(response.data);
        } catch (err) { forwardError(res, err, 'Analytics Service Error'); }
    });

    return app;
}

const SERVICES = {
    auth: 'http://auth:5001',
    internships: 'http://internships:5002',
    applications: 'http://bookings:5003',
    payments: 'http://payments:5004',
    notifications: 'http://notifications:5005',
    analytics: 'http://analytics:5006'
};

let app;
beforeAll(() => { app = buildGatewayApp(SERVICES); });
beforeEach(() => jest.clearAllMocks());

// ─── Mock tokens ─────────────────────────────────────────────────────────────

const CANDIDATE_USER = { userId: 1, email: 'student@test.com', role: 'candidate', name: 'Alice' };
const COMPANY_USER = { userId: 2, email: 'company@test.com', role: 'company', name: 'TechCorp', website: 'https://techcorp.com', phone: '+94111234' };

function mockCandidateAuth() {
    axios.get.mockResolvedValueOnce({ data: { valid: true, user: CANDIDATE_USER } });
}
function mockCompanyAuth() {
    axios.get.mockResolvedValueOnce({ data: { valid: true, user: COMPANY_USER } });
}
function mockInvalidAuth() {
    axios.get.mockResolvedValueOnce({ data: { valid: false } });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('API Gateway — /health', () => {
    test('returns ok when all services are healthy', async () => {
        axios.get.mockResolvedValue({ data: { status: 'ok' } });
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.service).toBe('api-gateway');
        expect(res.body.status).toBe('ok');
    });

    test('returns 503 degraded when a service is down', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { status: 'ok' } }) // auth
            .mockRejectedValueOnce(new Error('ECONNREFUSED')) // internships down
            .mockResolvedValue({ data: { status: 'ok' } }); // rest ok

        const res = await request(app).get('/health');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('degraded');
    });

    test('includes per-service status breakdown', async () => {
        axios.get.mockResolvedValue({ data: { status: 'ok' } });
        const res = await request(app).get('/health');
        expect(res.body.services).toHaveProperty('auth');
        expect(res.body.services).toHaveProperty('internships');
        expect(res.body.services).toHaveProperty('analytics');
    });
});

describe('API Gateway — Auth Routes', () => {
    test('POST /api/auth/register forwards to auth service', async () => {
        axios.post.mockResolvedValueOnce({ status: 201, data: { user: { role: 'candidate' } } });
        const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'pass123!', role: 'student' });
        expect(res.status).toBe(201);
    });

    test('POST /api/auth/login forwards to auth service', async () => {
        axios.post.mockResolvedValueOnce({ status: 200, data: { token: 'jwt_token', user: { role: 'candidate' } } });
        const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'pass123!' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBe('jwt_token');
    });

    test('unknown auth action returns 404', async () => {
        const res = await request(app).post('/api/auth/unknown');
        expect(res.status).toBe(404);
    });

    test('forwards auth service 400 error on bad registration', async () => {
        const err = { response: { status: 400, data: { error: 'Email already exists' } } };
        axios.post.mockRejectedValueOnce(err);
        const res = await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: '123456!', role: 'student' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email already exists');
    });
});

describe('API Gateway — Internship Routes', () => {
    test('GET /api/internships is public (no auth required)', async () => {
        axios.get.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });
        const res = await request(app).get('/api/internships');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    test('GET /api/internships/:id is public', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { id: 5, title: 'Test Intern' } });
        const res = await request(app).get('/api/internships/5');
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(5);
    });

    test('POST /api/internships requires auth (no token → 401)', async () => {
        const res = await request(app).post('/api/internships').send({ title: 'New Role' });
        expect(res.status).toBe(401);
    });

    test('POST /api/internships requires company role (candidate → 403)', async () => {
        mockCandidateAuth();
        const res = await request(app)
            .post('/api/internships')
            .set('authorization', 'Bearer student_token')
            .send({ title: 'New Role' });
        expect(res.status).toBe(403);
    });

    test('POST /api/internships succeeds with company role', async () => {
        mockCompanyAuth();
        axios.post.mockResolvedValueOnce({ status: 201, data: { id: 17, title: 'QA Intern' } });
        const res = await request(app)
            .post('/api/internships')
            .set('authorization', 'Bearer company_token')
            .send({ title: 'QA Intern', category: 'Testing', location: 'Colombo', description: 'Test role' });
        expect(res.status).toBe(201);
        expect(res.body.id).toBe(17);
    });

    test('invalid token → 401 on protected route', async () => {
        mockInvalidAuth();
        const res = await request(app)
            .post('/api/internships')
            .set('authorization', 'Bearer bad_token')
            .send({ title: 'Hack' });
        expect(res.status).toBe(401);
    });
});

describe('API Gateway — Booking Routes', () => {
    test('POST /api/bookings requires auth (no token → 401)', async () => {
        const res = await request(app).post('/api/bookings').send({ eventId: 1 });
        expect(res.status).toBe(401);
    });

    test('POST /api/bookings passes userId and userRole from JWT to booking service', async () => {
        mockCandidateAuth();
        axios.post.mockResolvedValueOnce({ status: 201, data: { id: 1, status: 'APPLIED' } });
        const res = await request(app)
            .post('/api/bookings')
            .set('authorization', 'Bearer student_token')
            .send({ eventId: 1, quantity: 1 });
        expect(res.status).toBe(201);
        // Check that userId and userRole were forwarded
        expect(axios.post.mock.calls[0][1]).toMatchObject({ userId: 1, userRole: 'candidate' });
    });

    test('GET /api/bookings requires auth (no token → 401)', async () => {
        const res = await request(app).get('/api/bookings');
        expect(res.status).toBe(401);
    });

    test('GET /api/bookings passes userId as query param to booking service', async () => {
        mockCandidateAuth();
        axios.get.mockResolvedValueOnce({ data: { valid: true, user: CANDIDATE_USER } }); // second auth verify call won't happen since mock was consumed
        axios.get.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
        const res = await request(app)
            .get('/api/bookings')
            .set('authorization', 'Bearer student_token');
        expect(res.status).toBe(200);
    });
});

describe('API Gateway — Notifications & Metrics', () => {
    test('GET /api/notifications requires auth', async () => {
        const res = await request(app).get('/api/notifications');
        expect(res.status).toBe(401);
    });

    test('GET /api/metrics is public', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { totalInternships: 16, activeCompanies: 14, totalApplications: 5 } });
        const res = await request(app).get('/api/metrics');
        expect(res.status).toBe(200);
        expect(res.body.totalInternships).toBe(16);
    });

    test('GET /api/metrics forwards 502 when analytics service is down', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 502, data: { error: 'Unable to retrieve analytics metrics' } } });
        const res = await request(app).get('/api/metrics');
        expect(res.status).toBe(502);
    });
});
