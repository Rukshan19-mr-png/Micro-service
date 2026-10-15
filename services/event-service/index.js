const express = require('express');
const app = express();
app.use(express.json());

const INTERNSHIPS = [
    { 
        id: 1, 
        title: 'Cloud Security & Middleware Intern', 
        company: 'CodeX Sri Lanka', 
        category: 'Backend', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo, Sri Lanka',
        workMode: 'Online (Remote)',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: 'LKR 120,000 / mo ($400 USD)',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: true,
        available: 8, 
        capacity: 8, 
        date: '2026-09-18', 
        skills: ['Java', 'Go', 'OAuth2', 'Kubernetes', 'Ballerina'], 
        description: 'Contribute to open-source API management and Identity Server products. Work remotely from anywhere globally or at CodeX Colombo HQ.',
        website: 'https://codextech.io',
        companyEmail: 'careers@codextech.io',
        companyPhone: '+94 11 214 5340',
        isVerifiedCompany: true
    },
    { 
        id: 2, 
        title: 'Full Stack Java & React Intern', 
        company: 'NexaStack Sri Lanka', 
        category: 'Full Stack', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo (Orion City), Sri Lanka',
        workMode: 'Hybrid',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 95,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: true,
        available: 12, 
        capacity: 15, 
        date: '2026-10-04', 
        skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'AWS'], 
        description: 'Build enterprise fintech platforms for Global 2000 clients with modern microservices architecture and automated testing pipelines.',
        website: 'https://www.nexastack.io',
        companyEmail: 'careers.sl@nexastack.io',
        companyPhone: '+94 11 472 8000',
        isVerifiedCompany: true
    },
    { 
        id: 3, 
        title: 'AI & Generative LLM Engineering Intern', 
        company: 'DataNova Sri Lanka', 
        category: 'AI/ML', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo, Sri Lanka',
        workMode: 'Online (Remote)',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: '$600 USD / mo (LKR 180,000)',
        stipendCurrency: 'USD',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: true,
        available: 5, 
        capacity: 5, 
        date: '2026-08-12', 
        skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'PostgreSQL'], 
        description: 'Design generative AI agent tools and predictive supply chain optimization engines for next-generation logistics and retail platforms.',
        website: 'https://datanova.lk',
        companyEmail: 'careers@datanova.lk',
        companyPhone: '+94 11 202 4500',
        isVerifiedCompany: true
    },
    { 
        id: 4, 
        title: 'Enterprise Cloud ERP Systems Intern', 
        company: 'OrbitERP Sri Lanka', 
        category: 'Backend', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo, Sri Lanka',
        workMode: 'Onsite',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 100,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 6, 
        capacity: 6, 
        date: '2026-11-01', 
        skills: ['C#', '.NET Core', 'PL/SQL', 'Docker', 'Azure'], 
        description: 'Engage with OrbitERP R&D team building cloud-native Asset Management and ERP suites serving aerospace and defense industries worldwide.',
        website: 'https://www.orbiterp.io',
        companyEmail: 'careers.sl@orbiterp.io',
        companyPhone: '+94 11 236 4400',
        isVerifiedCompany: true
    },
    { 
        id: 5, 
        title: '5G Telecom Data Science & ML Intern', 
        company: 'PrimeWave PLC', 
        category: 'Data Science', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo 02, Sri Lanka',
        workMode: 'Hybrid',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 85,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 4, 
        capacity: 4, 
        date: '2026-09-01', 
        skills: ['Python', 'Pandas', 'Spark', 'BigQuery', 'TensorFlow'], 
        description: 'Analyze real-time network telemetry, customer churn modeling, and automated network slice optimization on Dialog’s 5G infrastructure.',
        website: 'https://www.primewave.lk',
        companyEmail: 'careers@primewave.lk',
        companyPhone: '+94 77 767 8678',
        isVerifiedCompany: true
    },
    { 
        id: 6, 
        title: 'Dispatch Algorithm & Mobility Tech Intern', 
        company: 'SwiftRide (Digital Mobility)', 
        category: 'Backend', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo 05, Sri Lanka',
        workMode: 'Onsite',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 90,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: true,
        available: 5, 
        capacity: 5, 
        date: '2026-09-15', 
        skills: ['Go', 'Redis', 'Kafka', 'PostGIS', 'Node.js'], 
        description: 'Optimize high-throughput driver dispatch algorithms, spatial indexing, and surge pricing engines handling millions of daily ride requests.',
        website: 'https://swiftride.lk',
        companyEmail: 'careers@swiftride.lk',
        companyPhone: '+94 11 450 7500',
        isVerifiedCompany: true
    },
    { 
        id: 7, 
        title: 'Frontend UX & Micro-Frontends Intern', 
        company: 'FluxUI Sri Lanka', 
        category: 'Frontend', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo, Sri Lanka',
        workMode: 'Online (Remote)',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: '$450 USD / mo',
        stipendCurrency: 'USD',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 7, 
        capacity: 7, 
        date: '2026-10-01', 
        skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Jest'], 
        description: 'Build responsive web apps for international software vendors. Foreign candidates can work online asynchronously.',
        website: 'https://fluxui.io',
        companyEmail: 'careers@fluxui.io',
        companyPhone: '+94 11 472 1199',
        isVerifiedCompany: true
    },
    { 
        id: 8, 
        title: 'Growth Tech & Full Stack Engineering Intern', 
        company: 'VelocityGlobal', 
        category: 'Full Stack', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo, Sri Lanka',
        workMode: 'Online (Remote)',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: 'LKR 110,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 5, 
        capacity: 5, 
        date: '2026-08-30', 
        skills: ['Node.js', 'Vue.js', 'GraphQL', 'MongoDB', 'AWS Lambda'], 
        description: 'Develop data-driven marketing technologies, analytics dashboards, and web automation tools for top US & Australian venture-backed brands.',
        website: 'https://velocityglobal.io',
        companyEmail: 'careers@velocityglobal.io',
        companyPhone: '+94 11 750 0900',
        isVerifiedCompany: true
    },
    { 
        id: 9, 
        title: 'React Native Cross-Platform Mobile Intern', 
        company: 'AgileSoft Technologies', 
        category: 'Mobile', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo 03, Sri Lanka',
        workMode: 'Hybrid',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 85,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 4, 
        capacity: 4, 
        date: '2026-09-10', 
        skills: ['React Native', 'TypeScript', 'Redux Toolkit', 'iOS/Android'], 
        description: 'Craft cross-platform mobile apps for leading client startups with slick animations and offline storage support.',
        website: 'https://agilesoft.io',
        companyEmail: 'careers@agilesoft.io',
        companyPhone: '+94 11 250 8200',
        isVerifiedCompany: true
    },
    { 
        id: 10, 
        title: 'Autonomous AI & Robotics Software Intern', 
        company: 'RoboLogic International', 
        category: 'AI/ML', 
        price: 0, 
        isForeignCompany: false,
        location: 'Trace Expert City, Colombo',
        workMode: 'Onsite',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 105,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: true,
        available: 6, 
        capacity: 6, 
        date: '2026-10-15', 
        skills: ['Python', 'C++', 'OpenCV', 'ROS', 'Machine Learning'], 
        description: 'Work on cutting-edge autonomous vehicle navigation systems, smart agriculture robotics, and AI automation engines.',
        website: 'https://robologic.tech',
        companyEmail: 'careers@robologic.tech',
        companyPhone: '+94 11 266 7900',
        isVerifiedCompany: true
    },
    { 
        id: 11, 
        title: 'Fintech Payment Gateway Developer Intern', 
        company: 'TrustPay Sri Lanka', 
        category: 'Backend', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo 04, Sri Lanka',
        workMode: 'Hybrid',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 90,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 5, 
        capacity: 5, 
        date: '2026-10-01', 
        skills: ['Node.js', 'Express', 'PCI-DSS', 'PostgreSQL', 'Redis'], 
        description: 'Integrate real-time QR payments, card processing pipelines, and banking API integrations compliant with Central Bank regulations.',
        website: 'https://trustpay.lk',
        companyEmail: 'info@trustpay.lk',
        companyPhone: '+94 11 755 5888',
        isVerifiedCompany: true
    },
    { 
        id: 12, 
        title: 'Cybersecurity Threat Analysis Intern', 
        company: 'ShieldNet ESP', 
        category: 'CyberSecurity', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo, Sri Lanka',
        workMode: 'Onsite',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 95,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 3, 
        capacity: 3, 
        date: '2026-09-25', 
        skills: ['SIEM', 'Python', 'Ethical Hacking', 'Network Security', 'Wireshark'], 
        description: 'Conduct security audits, vulnerability assessments, and SOC incident responses for Sri Lanka’s leading financial institutions.',
        website: 'https://shieldnet.io',
        companyEmail: 'careers@shieldnet.io',
        companyPhone: '+94 11 241 6000',
        isVerifiedCompany: true
    },
    { 
        id: 13, 
        title: 'AI Research & Frontier Agent Systems Intern', 
        company: 'Apex AI / MindCore Global', 
        category: 'AI/ML', 
        price: 25, 
        isForeignCompany: true,
        location: 'London, UK / Global Remote',
        workMode: 'Online (Remote)',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: '$1,200 USD / mo',
        stipendCurrency: 'USD',
        duration: '3 Months',
        country: 'United Kingdom',
        city: 'London',
        verified: true,
        featured: true,
        available: 10, 
        capacity: 10, 
        date: '2026-08-12', 
        skills: ['Python', 'PyTorch', 'JAX', 'Reinforcement Learning'], 
        description: 'Implement neural architectures, evaluate LLM reasoning bounds, and train agentic workflow loops with international research teams.',
        website: 'https://apexai.tech',
        companyEmail: 'careers@apexai.tech',
        companyPhone: '+44 20 7031 3000',
        isVerifiedCompany: true
    },
    { 
        id: 14, 
        title: 'Cloud Systems & Microservices Intern', 
        company: 'PayNexus Inc. Global', 
        category: 'Backend', 
        price: 25, 
        isForeignCompany: true,
        location: 'Austin, TX, USA (Remote)',
        workMode: 'Online (Remote)',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: '$1,100 USD / mo',
        stipendCurrency: 'USD',
        duration: '6 Months',
        country: 'United States',
        city: 'Austin',
        verified: true,
        featured: false,
        available: 4, 
        capacity: 4, 
        date: '2026-10-01', 
        skills: ['Ruby', 'Go', 'Distributed Systems', 'gRPC'], 
        description: 'Build foundational payment routing engines, fraud prevention pipelines, and API integrations for global merchants.',
        website: 'https://paynexus.io',
        companyEmail: 'jobs@paynexus.io',
        companyPhone: '+1 888 963 8969',
        isVerifiedCompany: true
    },
    { 
        id: 15, 
        title: 'Fintech Software Engineering Intern', 
        company: 'Global Finance Exchange Group (GFEG)', 
        category: 'Backend', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo 10, Sri Lanka',
        workMode: 'Hybrid',
        eligibleApplicants: 'Global (Foreign & Local)',
        stipend: 'LKR 115,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: true,
        available: 6, 
        capacity: 8, 
        date: '2026-10-20', 
        skills: ['C++', 'Java', 'Market Data', 'Kafka', 'Linux'], 
        description: 'Engineer high-throughput real-time financial market data feeds and trading infrastructure at GFEG Technology Colombo.',
        website: 'https://www.gfeg.io',
        companyEmail: 'earlycareers@gfeg.io',
        companyPhone: '+44 20 7797 1000',
        isVerifiedCompany: true
    },
    { 
        id: 16, 
        title: 'Digital Telco Cloud & Kubernetes Intern', 
        company: 'CloudAxis Digital Labs (CDL)', 
        category: 'DevOps', 
        price: 0, 
        isForeignCompany: false,
        location: 'Colombo 03, Sri Lanka',
        workMode: 'Hybrid',
        eligibleApplicants: 'Local (Sri Lanka Only)',
        stipend: 'LKR 95,000 / mo',
        stipendCurrency: 'LKR',
        duration: '6 Months',
        country: 'Sri Lanka',
        city: 'Colombo',
        verified: true,
        featured: false,
        available: 5, 
        capacity: 6, 
        date: '2026-11-05', 
        skills: ['Kubernetes', 'CI/CD', 'Helm', 'Terraform', 'Prometheus'], 
        description: 'Deploy automated cloud-native pipelines, manage production container clusters, and implement GitOps observability.',
        website: 'https://cloudaxis.io',
        companyEmail: 'careers@cloudaxis.io',
        companyPhone: '+94 11 200 4000',
        isVerifiedCompany: true
    }
];

const db = require('./db');
const PORT = process.env.PORT || 5002;

const getInternships = async () => {
    if (db.isReady()) {
        const docs = await db.Internship.find().sort({ id: 1 }).lean();
        return docs;
    }
    return INTERNSHIPS;
};

const findInternship = async (id) => {
    const numericId = Number(id);
    if (db.isReady()) {
        return await db.Internship.findOne({ id: numericId }).lean();
    }
    return INTERNSHIPS.find((item) => item.id === numericId);
};

app.get('/health', async (req, res) => {
    const list = await getInternships();
    res.json({
        service: 'internship-service',
        status: 'ok',
        storage: db.isReady() ? 'mongodb' : 'memory',
        internships: list.length
    });
});

// Get all internships with multi-criteria filters
app.get('/internships', async (req, res) => {
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

// Get single internship details
app.get('/internships/:id', async (req, res) => {
    const internship = await findInternship(req.params.id);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    res.json(internship);
});

// Post a new internship (Company role only)
app.post('/internships', async (req, res) => {
    const { title, category, price, location, capacity, skills, description, companyName, officialWebsite, officialEmail, officialPhone } = req.body;
    const company = companyName;
    const website = officialWebsite;
    const companyEmail = officialEmail;
    const companyPhone = officialPhone;
    
    if (!title || !company || !category || !location || !description || !website || !companyEmail || !companyPhone) {
        return res.status(400).json({ error: 'A verified company profile is required to publish an internship' });
    }

    const currentList = await getInternships();
    const newId = currentList.length > 0 ? Math.max(...currentList.map(i => i.id || 0)) + 1 : 1;

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
        skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : []),
        description,
        website: website || '',
        companyEmail: companyEmail || '',
        companyPhone: companyPhone || '',
        isVerifiedCompany: true
    };

    if (db.isReady()) {
        const doc = await db.Internship.create(newInternship);
        return res.status(201).json(doc);
    }

    INTERNSHIPS.push(newInternship);
    res.status(201).json(newInternship);
});

// Reserve a slot (Called by Booking/Application Service)
app.patch('/internships/:id/book', async (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const numericId = Number(req.params.id);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    if (db.isReady()) {
        const doc = await db.Internship.findOne({ id: numericId });
        if (!doc) return res.status(404).json({ error: 'Internship not found' });
        if (doc.available < quantity) {
            return res.status(409).json({ error: 'Not enough slots available', available: doc.available });
        }
        doc.available -= quantity;
        await doc.save();
        return res.json({ success: true, internship: doc, reserved: quantity, remaining: doc.available });
    }

    const internship = INTERNSHIPS.find((item) => item.id === numericId);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    if (internship.available < quantity) {
        return res.status(409).json({ error: 'Not enough slots available', available: internship.available });
    }
    internship.available -= quantity;
    res.json({ success: true, internship, reserved: quantity, remaining: internship.available });
});

// Roll back availability if another service fails after reservation.
app.patch('/internships/:id/release', async (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const numericId = Number(req.params.id);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    if (db.isReady()) {
        const doc = await db.Internship.findOne({ id: numericId });
        if (!doc) return res.status(404).json({ error: 'Internship not found' });
        doc.available = Math.min(doc.capacity, doc.available + quantity);
        await doc.save();
        return res.json({ success: true, internship: doc, released: quantity, remaining: doc.available });
    }

    const internship = INTERNSHIPS.find((item) => item.id === numericId);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    internship.available = Math.min(internship.capacity, internship.available + quantity);
    res.json({ success: true, internship, released: quantity, remaining: internship.available });
});

db.initDb(INTERNSHIPS).finally(() => {
    app.listen(PORT, () => console.log(`Internship Service running on port ${PORT}`));
});

