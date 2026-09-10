const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Pool } = require('pg');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_vercel_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_db';
const isValidWebsite = (website) => {
    try {
        const url = new URL(website);
        return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
    } catch {
        return false;
    }
};

// ─── POSTGRESQL AUTH STORAGE ──────────────────────────────────────────────────
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'auth_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

let pgReady = false;
const initPg = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'candidate',
                name VARCHAR(255),
                phone VARCHAR(100),
                website VARCHAR(255),
                university VARCHAR(255),
                field_of_study VARCHAR(255),
                location VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        pgReady = true;
    } catch (e) {
        pgReady = false;
    }
};
initPg();

const memoryUsers = [];

async function createUser(email, password, role = 'candidate', profile = {}) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role === 'student' ? 'candidate' : role;
    const { name = '', phone = '', website = '', university = '', fieldOfStudy = '', location = '' } = profile;

    if (pgReady) {
        const result = await pool.query(
            'INSERT INTO users (email, password, role, name, phone, website, university, field_of_study, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, role, name, phone, website, university, field_of_study, location, created_at',
            [email, hashedPassword, normalizedRole, name, phone, website, university, fieldOfStudy, location]
        );
        return result.rows[0];
    }
    if (memoryUsers.some((u) => u.email === email)) {
        const err = new Error('Email already exists');
        err.code = '23505';
        throw err;
    }
    const user = { 
        id: memoryUsers.length + 1, 
        email, 
        password: hashedPassword, 
        role: normalizedRole, 
        name,
        phone,
        website,
        university,
        fieldOfStudy,
        location,
        createdAt: new Date().toISOString() 
    };
    memoryUsers.push(user);
    return user;
}

async function findUserByEmail(email) {
    if (pgReady) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }
    return memoryUsers.find((u) => u.email === email);
}

// ─── MONGODB INTERNSHIP STORAGE ──────────────────────────────────────────────
const internshipSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    isForeignCompany: { type: Boolean, default: false },
    location: { type: String, required: true },
    workMode: { type: String, default: 'Onsite' },
    eligibleApplicants: { type: String, default: 'Open to all candidates' },
    stipend: { type: String, default: 'Competitive' },
    stipendCurrency: { type: String, default: 'LKR' },
    duration: { type: String, default: '6 Months' },
    country: { type: String, default: 'Sri Lanka' },
    city: { type: String, default: 'Colombo' },
    verified: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    available: { type: Number, required: true },
    capacity: { type: Number, required: true },
    date: { type: String },
    skills: [String],
    description: { type: String, required: true },
    website: { type: String, default: '' },
    companyEmail: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    isVerifiedCompany: { type: Boolean, default: true }
}, { timestamps: true });

let Internship;
try {
    Internship = mongoose.model('Internship');
} catch (e) {
    Internship = mongoose.model('Internship', internshipSchema);
}

let mongoReady = false;

const INITIAL_INTERNSHIPS = [
    { id: 1, title: 'Cloud Security & Middleware Intern', company: 'WSO2 Sri Lanka', category: 'Backend', price: 0, isForeignCompany: false, location: 'Colombo, Sri Lanka', workMode: 'Online (Remote)', eligibleApplicants: 'Global (Foreign & Local)', stipend: 'LKR 120,000 / mo ($400 USD)', stipendCurrency: 'LKR', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: true, available: 8, capacity: 8, date: '2026-09-18', skills: ['Java', 'Go', 'OAuth2', 'Kubernetes', 'Ballerina'], description: 'Contribute to open-source API management and Identity Server products.', website: 'https://wso2.com', companyEmail: 'careers@wso2.com', companyPhone: '+94 11 214 5340', isVerifiedCompany: true },
    { id: 2, title: 'Full Stack Java & React Intern', company: 'Virtusa Sri Lanka', category: 'Full Stack', price: 0, isForeignCompany: false, location: 'Colombo (Orion City), Sri Lanka', workMode: 'Hybrid', eligibleApplicants: 'Local (Sri Lanka Only)', stipend: 'LKR 95,000 / mo', stipendCurrency: 'LKR', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: true, available: 12, capacity: 15, date: '2026-10-04', skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'AWS'], description: 'Build enterprise fintech platforms for Global 2000 clients.', website: 'https://www.virtusa.com', companyEmail: 'careers.sl@virtusa.com', companyPhone: '+94 11 472 8000', isVerifiedCompany: true },
    { id: 3, title: 'AI & Generative LLM Engineering Intern', company: 'Sysco LABS Sri Lanka', category: 'AI/ML', price: 0, isForeignCompany: false, location: 'Colombo, Sri Lanka', workMode: 'Online (Remote)', eligibleApplicants: 'Global (Foreign & Local)', stipend: '$600 USD / mo (LKR 180,000)', stipendCurrency: 'USD', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: true, available: 5, capacity: 5, date: '2026-08-12', skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'PostgreSQL'], description: 'Design generative AI agent tools and predictive engines.', website: 'https://syscolabs.lk', companyEmail: 'careers@syscolabs.com', companyPhone: '+94 11 202 4500', isVerifiedCompany: true },
    { id: 4, title: 'Enterprise Cloud ERP Systems Intern', company: 'IFS Sri Lanka', category: 'Backend', price: 0, isForeignCompany: false, location: 'Colombo, Sri Lanka', workMode: 'Onsite', eligibleApplicants: 'Local (Sri Lanka Only)', stipend: 'LKR 100,000 / mo', stipendCurrency: 'LKR', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: false, available: 6, capacity: 6, date: '2026-11-01', skills: ['C#', '.NET Core', 'PL/SQL', 'Docker', 'Azure'], description: 'Engage with IFS R&D team building cloud-native ERP suites.', website: 'https://www.ifs.com', companyEmail: 'careers.sl@ifs.com', companyPhone: '+94 11 236 4400', isVerifiedCompany: true },
    { id: 5, title: '5G Telecom Data Science & ML Intern', company: 'Dialog Axiata PLC', category: 'Data Science', price: 0, isForeignCompany: false, location: 'Colombo 02, Sri Lanka', workMode: 'Hybrid', eligibleApplicants: 'Local (Sri Lanka Only)', stipend: 'LKR 85,000 / mo', stipendCurrency: 'LKR', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: false, available: 4, capacity: 4, date: '2026-09-01', skills: ['Python', 'Pandas', 'Spark', 'BigQuery', 'TensorFlow'], description: 'Analyze real-time network telemetry on Dialog’s 5G infrastructure.', website: 'https://dialog.lk', companyEmail: 'careers@dialog.lk', companyPhone: '+94 77 767 8678', isVerifiedCompany: true },
    { id: 6, title: 'Dispatch Algorithm & Mobility Tech Intern', company: 'PickMe (Digital Mobility)', category: 'Backend', price: 0, isForeignCompany: false, location: 'Colombo 05, Sri Lanka', workMode: 'Onsite', eligibleApplicants: 'Local (Sri Lanka Only)', stipend: 'LKR 90,000 / mo', stipendCurrency: 'LKR', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: true, available: 5, capacity: 5, date: '2026-09-15', skills: ['Go', 'Redis', 'Kafka', 'PostGIS', 'Node.js'], description: 'Optimize high-throughput driver dispatch algorithms.', website: 'https://pickme.lk', companyEmail: 'careers@pickme.lk', companyPhone: '+94 11 450 7500', isVerifiedCompany: true },
    { id: 7, title: 'Frontend UX & Micro-Frontends Intern', company: '99x Sri Lanka', category: 'Frontend', price: 0, isForeignCompany: false, location: 'Colombo, Sri Lanka', workMode: 'Online (Remote)', eligibleApplicants: 'Global (Foreign & Local)', stipend: '$450 USD / mo', stipendCurrency: 'USD', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: false, available: 7, capacity: 7, date: '2026-10-01', skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Jest'], description: 'Build responsive web apps for Scandinavian software vendors.', website: 'https://99x.io', companyEmail: 'careers@99x.io', companyPhone: '+94 11 472 1199', isVerifiedCompany: true },
    { id: 8, title: 'Growth Tech & Full Stack Engineering Intern', company: 'Surge Global', category: 'Full Stack', price: 0, isForeignCompany: false, location: 'Colombo, Sri Lanka', workMode: 'Online (Remote)', eligibleApplicants: 'Global (Foreign & Local)', stipend: 'LKR 110,000 / mo', stipendCurrency: 'LKR', duration: '6 Months', country: 'Sri Lanka', city: 'Colombo', verified: true, featured: false, available: 5, capacity: 5, date: '2026-08-30', skills: ['Node.js', 'Vue.js', 'GraphQL', 'MongoDB', 'AWS Lambda'], description: 'Develop data-driven marketing technologies.', website: 'https://surgeglobal.io', companyEmail: 'careers@surgeglobal.io', companyPhone: '+94 11 750 0900', isVerifiedCompany: true }
];

const memoryInternships = JSON.parse(JSON.stringify(INITIAL_INTERNSHIPS));

const initMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        mongoReady = true;
        const count = await Internship.countDocuments();
        if (count === 0) {
            await Internship.insertMany(INITIAL_INTERNSHIPS);
        }
    } catch (e) {
        mongoReady = false;
    }
};
initMongo();

const getInternships = async () => {
    if (mongoReady) {
        return await Internship.find().sort({ id: 1 }).lean();
    }
    return memoryInternships;
};

const findInternship = async (id) => {
    const numericId = Number(id);
    if (mongoReady) {
        return await Internship.findOne({ id: numericId }).lean();
    }
    return memoryInternships.find((i) => i.id === numericId);
};

// ─── IN-MEMORY APPLICATIONS & NOTIFICATIONS STORE ──────────────────────────────
const APPLICATIONS = [];
const NOTIFICATIONS = [];

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
};

// ─── HEALTH & METRICS ROUTES ─────────────────────────────────────────────────
app.get(['/api/health', '/health'], async (req, res) => {
    const list = await getInternships();
    res.json({
        service: 'nexusevent-vercel-serverless',
        status: 'ok',
        storage: {
            auth: pgReady ? 'postgres' : 'memory',
            internships: mongoReady ? 'mongodb' : 'memory'
        },
        counts: {
            internships: list.length,
            applications: APPLICATIONS.length,
            notifications: NOTIFICATIONS.length
        }
    });
});

app.get(['/api/metrics', '/metrics'], async (req, res) => {
    const internships = await getInternships();
    const totalInternships = internships.length;
    const openSlots = internships.reduce((sum, item) => sum + (item.available || 0), 0);
    const activeCompanies = new Set(internships.map((i) => i.company)).size;
    const totalStudents = new Set(APPLICATIONS.map((a) => a.userId)).size;

    res.json({
        totalInternships,
        openSlots,
        activeCompanies,
        totalApplications: APPLICATIONS.length,
        totalStudents,
        recentNotifications: NOTIFICATIONS.slice(-5).reverse()
    });
});

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
app.post(['/api/auth/:action', '/auth/:action'], async (req, res) => {
    const action = req.params.action;
    
    if (action === 'register') {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const rawRole = String(req.body.role || 'candidate').trim().toLowerCase();
        const role = (rawRole === 'student') ? 'candidate' : rawRole;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'A valid email is required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        if (!['candidate', 'company'].includes(role)) {
            return res.status(400).json({ error: 'Role must be candidate or company' });
        }

        const name = String(req.body.name || req.body.fullName || req.body.companyName || '').trim();
        const phone = String(req.body.phone || req.body.phoneNumber || '').trim();
        const website = String(req.body.website || req.body.officialWebsite || '').trim();
        const university = String(req.body.university || '').trim();
        const fieldOfStudy = String(req.body.fieldOfStudy || '').trim();
        const location = String(req.body.location || '').trim();

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
            return res.status(201).json({
                message: 'User registered successfully',
                user: { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role, 
                    name: user.name, 
                    phone: user.phone, 
                    website: user.website,
                    university: user.university,
                    fieldOfStudy: user.fieldOfStudy,
                    location: user.location
                }
            });
        } catch (err) {
            if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (action === 'login') {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        try {
            const user = await findUserByEmail(email);
            if (user && await bcrypt.compare(password, user.password)) {
                const userRole = user.role === 'student' ? 'candidate' : (user.role || 'candidate');
                const token = jwt.sign({ 
                    userId: user.id, 
                    email: user.email, 
                    role: userRole,
                    name: user.name || '',
                    website: user.website || '',
                    phone: user.phone || ''
                }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
                return res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        email: user.email, 
                        role: userRole,
                        name: user.name || '',
                        website: user.website || '',
                        phone: user.phone || '',
                        university: user.university || '',
                        fieldOfStudy: user.field_of_study || user.fieldOfStudy || '',
                        location: user.location || ''
                    } 
                });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    res.status(404).json({ error: 'Unknown auth action' });
});

app.get(['/api/auth/verify', '/auth/verify'], authenticate, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ─── INTERNSHIP ROUTES ───────────────────────────────────────────────────────
app.get(['/api/internships', '/internships', '/api/events'], async (req, res) => {
    const { category, search, workMode, applicantOrigin } = req.query;
    let results = await getInternships();

    if (category && category !== 'All') {
        results = results.filter((i) => i.category && i.category.toLowerCase() === category.toLowerCase());
    }

    if (workMode && workMode !== 'All') {
        results = results.filter((i) => i.workMode && i.workMode.toLowerCase().includes(workMode.toLowerCase()));
    }

    if (applicantOrigin === 'foreign') {
        results = results.filter((i) => (i.eligibleApplicants && i.eligibleApplicants.includes('Global')) || (i.workMode && i.workMode.includes('Online')));
    }

    if (search) {
        const q = search.toLowerCase();
        results = results.filter(
            (i) =>
                (i.title && i.title.toLowerCase().includes(q)) ||
                (i.company && i.company.toLowerCase().includes(q)) ||
                (i.location && i.location.toLowerCase().includes(q)) ||
                (i.workMode && i.workMode.toLowerCase().includes(q)) ||
                (i.skills || []).some((s) => s.toLowerCase().includes(q))
        );
    }

    res.json(results);
});

app.get(['/api/internships/:id', '/internships/:id', '/api/events/:id'], async (req, res) => {
    const internship = await findInternship(req.params.id);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    res.json(internship);
});

app.post(['/api/internships', '/internships'], authenticate, requireRole('company'), async (req, res) => {
    const { title, category, price, location, capacity, skills, description } = req.body;
    const company = req.user.name;
    const website = req.user.website;
    const companyEmail = req.user.email;
    const companyPhone = req.user.phone;
    
    if (!title || !company || !category || !location || !description || !website || !companyEmail || !companyPhone) {
        return res.status(400).json({ error: 'Your company profile must include a name, official website, email, and phone number before posting' });
    }

    const currentList = await getInternships();
    const newId = currentList.length > 0 ? Math.max(...currentList.map((i) => i.id || 0)) + 1 : 1;

    const newInternship = {
        id: newId,
        title,
        company,
        category,
        price: Number(price) || 0,
        location,
        available: Number(capacity) || 5,
        capacity: Number(capacity) || 5,
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map((s) => s.trim()) : []),
        description,
        website,
        companyEmail,
        companyPhone,
        isVerifiedCompany: true
    };

    if (mongoReady) {
        const doc = await Internship.create(newInternship);
        return res.status(201).json(doc);
    }

    memoryInternships.push(newInternship);
    res.status(201).json(newInternship);
});

app.patch(['/api/internships/:id/book', '/internships/:id/book'], async (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const numericId = Number(req.params.id);

    if (mongoReady) {
        const doc = await Internship.findOne({ id: numericId });
        if (!doc) return res.status(404).json({ error: 'Internship not found' });
        if (doc.available < quantity) return res.status(409).json({ error: 'Not enough slots available', available: doc.available });
        doc.available -= quantity;
        await doc.save();
        return res.json({ success: true, internship: doc, remaining: doc.available });
    }

    const item = memoryInternships.find((i) => i.id === numericId);
    if (!item) return res.status(404).json({ error: 'Internship not found' });
    if (item.available < quantity) return res.status(409).json({ error: 'Not enough slots available', available: item.available });
    item.available -= quantity;
    res.json({ success: true, internship: item, remaining: item.available });
});

app.patch(['/api/internships/:id/release', '/internships/:id/release'], async (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const numericId = Number(req.params.id);

    if (mongoReady) {
        const doc = await Internship.findOne({ id: numericId });
        if (!doc) return res.status(404).json({ error: 'Internship not found' });
        doc.available = Math.min(doc.capacity, doc.available + quantity);
        await doc.save();
        return res.json({ success: true, internship: doc, remaining: doc.available });
    }

    const item = memoryInternships.find((i) => i.id === numericId);
    if (!item) return res.status(404).json({ error: 'Internship not found' });
    item.available = Math.min(item.capacity, item.available + quantity);
    res.json({ success: true, internship: item, remaining: item.available });
});

// ─── BOOKING / APPLICATION ROUTES ───────────────────────────────────────────
app.get(['/api/bookings', '/bookings'], authenticate, (req, res) => {
    const userId = req.user.userId;
    res.json(APPLICATIONS.filter((app) => String(app.userId) === String(userId)));
});

app.post(['/api/bookings', '/bookings'], authenticate, async (req, res) => {
    const internshipId = Number(req.body.eventId);
    const userId = req.user.userId;
    const userRole = req.user.role;
    const quantity = Number(req.body.quantity || 1);
    const { paymentDetails } = req.body;
    const applicant = req.body.applicant || {};

    if (userRole === 'company') {
        return res.status(403).json({ error: 'Company accounts cannot apply for internships' });
    }

    const internship = await findInternship(internshipId);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });

    if (internship.available < quantity) {
        return res.status(409).json({ error: 'Not enough slots available' });
    }

    // Reserve slot
    if (mongoReady) {
        await Internship.updateOne({ id: internshipId }, { $inc: { available: -quantity } });
    } else {
        const item = memoryInternships.find((i) => i.id === internshipId);
        if (item) item.available -= quantity;
    }

    // Payment handling
    const cleanPhone = String(applicant.phone || '').replace(/[\s\-\(\)]/g, '');
    const isLocalApplicant = cleanPhone.startsWith('+94') || cleanPhone.startsWith('94') || cleanPhone.startsWith('07') || cleanPhone.startsWith('011') || cleanPhone.startsWith('01') || cleanPhone.startsWith('03') || cleanPhone.startsWith('08') || cleanPhone.startsWith('09');
    const applicableFee = isLocalApplicant ? 0 : 15 * quantity;

    const cardNumber = String(paymentDetails?.cardNumber || '').replace(/\D/g, '');
    if (applicableFee > 0 && cardNumber.endsWith('0000')) {
        // Compensating transaction: rollback reservation
        if (mongoReady) {
            await Internship.updateOne({ id: internshipId }, { $inc: { available: quantity } });
        } else {
            const item = memoryInternships.find((i) => i.id === internshipId);
            if (item) item.available += quantity;
        }
        return res.status(402).json({ error: 'Application failed', details: 'Payment declined by bank' });
    }

    const transactionId = applicableFee === 0 ? 'FREE_' + Date.now().toString(36).toUpperCase() : 'TX' + Date.now().toString(36).toUpperCase();

    const application = {
        id: APPLICATIONS.length + 1,
        eventId: internshipId,
        eventTitle: internship.title,
        company: internship.company,
        userId,
        quantity,
        totalAmount: applicableFee,
        status: 'APPLIED',
        transactionId,
        appliedAt: new Date().toISOString(),
        applicant
    };

    APPLICATIONS.push(application);

    // Save notification
    NOTIFICATIONS.push({
        id: NOTIFICATIONS.length + 1,
        userId,
        message: `Application submitted for "${internship.title}" at ${internship.company}. Status: APPLIED.`,
        status: 'SENT',
        timestamp: new Date().toISOString()
    });

    res.status(201).json(application);
});

// ─── NOTIFICATION ROUTES ─────────────────────────────────────────────────────
app.get(['/api/notifications', '/notifications'], authenticate, (req, res) => {
    const userId = req.user.userId;
    res.json(NOTIFICATIONS.filter((n) => String(n.userId) === String(userId)));
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`Unified Vercel Serverless API running locally on port ${PORT}`));
}
