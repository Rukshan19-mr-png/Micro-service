const express = require('express');
const app = express();
app.use(express.json());

const INTERNSHIPS = [
    { 
        id: 1, 
<<<<<<< HEAD
        title: 'Frontend Software Engineer Intern', 
        company: 'Google', 
        category: 'Frontend', 
        price: 15, 
        location: 'San Francisco, CA (Hybrid)', 
        available: 5, 
        capacity: 5, 
        date: '2026-09-18', 
        skills: ['React', 'JavaScript', 'CSS'], 
        description: 'Collaborate with UI designers and senior engineers to build accessible, high-performance features using React.' 
    },
    { 
        id: 2, 
        title: 'Backend Systems Intern', 
        company: 'Stripe', 
        category: 'Backend', 
        price: 15, 
        location: 'Austin, TX (On-site)', 
        available: 3, 
        capacity: 3, 
        date: '2026-10-04', 
        skills: ['Node.js', 'Express', 'PostgreSQL'], 
        description: 'Work on foundational payment systems, APIs, and microservices logic with high throughput requirements.' 
    },
    { 
        id: 3, 
        title: 'AI Research Assistant', 
        company: 'DeepMind', 
        category: 'AI/ML', 
        price: 15, 
        location: 'London, UK (Remote)', 
        available: 10, 
        capacity: 10, 
        date: '2026-08-12', 
        skills: ['Python', 'PyTorch', 'TensorFlow'], 
        description: 'Implement neural architectures, run training workflows, and analyze agentic behavioral output datasets.' 
    },
    { 
        id: 4, 
        title: 'DevOps & Infrastructure Intern', 
        company: 'HashiCorp', 
        category: 'DevOps', 
        price: 15, 
        location: 'Seattle, WA (Remote)', 
        available: 4, 
        capacity: 4, 
        date: '2026-11-01', 
        skills: ['Docker', 'Kubernetes', 'Go'], 
        description: 'Improve developer tooling pipelines and automate resource provisioning systems using modern IAC principles.' 
    }
];

const PORT = process.env.PORT || 5002;

const findInternship = (id) => INTERNSHIPS.find((item) => item.id === Number(id));

app.get('/health', (req, res) => {
    res.json({ service: 'internship-service', status: 'ok', internships: INTERNSHIPS.length });
});

// Get all internships, with optional category filter
app.get('/internships', (req, res) => {
    const { category, search } = req.query;
    let results = [...INTERNSHIPS];

    if (category && category !== 'All') {
        results = results.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
=======
        title: 'Cloud Security & Middleware Intern', 
        company: 'WSO2 Sri Lanka', 
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
        description: 'Contribute to open-source API management and Identity Server products. Work remotely from anywhere globally or at WSO2 Colombo HQ.',
        website: 'https://wso2.com',
        companyEmail: 'careers@wso2.com',
        companyPhone: '+94 11 214 5340',
        isVerifiedCompany: true
    },
    { 
        id: 2, 
        title: 'Full Stack Java & React Intern', 
        company: 'Virtusa Sri Lanka', 
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
        website: 'https://www.virtusa.com',
        companyEmail: 'careers.sl@virtusa.com',
        companyPhone: '+94 11 472 8000',
        isVerifiedCompany: true
    },
    { 
        id: 3, 
        title: 'AI & Generative LLM Engineering Intern', 
        company: 'Sysco LABS Sri Lanka', 
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
        description: 'Design generative AI agent tools and predictive supply chain optimization engines for North America’s largest foodservice provider.',
        website: 'https://syscolabs.lk',
        companyEmail: 'careers@syscolabs.com',
        companyPhone: '+94 11 202 4500',
        isVerifiedCompany: true
    },
    { 
        id: 4, 
        title: 'Enterprise Cloud ERP Systems Intern', 
        company: 'IFS Sri Lanka', 
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
        description: 'Engage with IFS R&D team building cloud-native Asset Management and ERP suites serving aerospace and defense industries worldwide.',
        website: 'https://www.ifs.com',
        companyEmail: 'careers.sl@ifs.com',
        companyPhone: '+94 11 236 4400',
        isVerifiedCompany: true
    },
    { 
        id: 5, 
        title: '5G Telecom Data Science & ML Intern', 
        company: 'Dialog Axiata PLC', 
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
        website: 'https://www.dialog.lk',
        companyEmail: 'careers@dialog.lk',
        companyPhone: '+94 77 767 8678',
        isVerifiedCompany: true
    },
    { 
        id: 6, 
        title: 'Dispatch Algorithm & Mobility Tech Intern', 
        company: 'PickMe (Digital Mobility)', 
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
        website: 'https://pickme.lk',
        companyEmail: 'careers@pickme.lk',
        companyPhone: '+94 11 450 7500',
        isVerifiedCompany: true
    },
    { 
        id: 7, 
        title: 'Frontend UX & Micro-Frontends Intern', 
        company: '99x Sri Lanka', 
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
        description: 'Build responsive web apps for Scandinavian software vendors. Foreign candidates can work online asynchronously.',
        website: 'https://99x.io',
        companyEmail: 'careers@99x.io',
        companyPhone: '+94 11 472 1199',
        isVerifiedCompany: true
    },
    { 
        id: 8, 
        title: 'Growth Tech & Full Stack Engineering Intern', 
        company: 'Surge Global', 
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
        website: 'https://surgeglobal.io',
        companyEmail: 'careers@surgeglobal.io',
        companyPhone: '+94 11 750 0900',
        isVerifiedCompany: true
    },
    { 
        id: 9, 
        title: 'React Native Cross-Platform Mobile Intern', 
        company: 'Calcey Technologies', 
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
        description: 'Craft cross-platform mobile apps for Silicon Valley client startups with slick animations and offline storage support.',
        website: 'https://calcey.com',
        companyEmail: 'careers@calcey.com',
        companyPhone: '+94 11 250 8200',
        isVerifiedCompany: true
    },
    { 
        id: 10, 
        title: 'Autonomous AI & Robotics Software Intern', 
        company: 'CodeGen International', 
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
        description: 'Work on cutting-edge autonomous vehicle navigation systems, smart agriculture robotics, and AI travel engines.',
        website: 'https://codegen.co.uk',
        companyEmail: 'careers@codegen.co.uk',
        companyPhone: '+94 11 266 7900',
        isVerifiedCompany: true
    },
    { 
        id: 11, 
        title: 'Fintech Payment Gateway Developer Intern', 
        company: 'DirectPay Sri Lanka', 
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
        website: 'https://directpay.lk',
        companyEmail: 'info@directpay.lk',
        companyPhone: '+94 11 755 5888',
        isVerifiedCompany: true
    },
    { 
        id: 12, 
        title: 'Cybersecurity Threat Analysis Intern', 
        company: 'MillenniumIT ESP', 
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
        website: 'https://mitesp.com',
        companyEmail: 'careers@mitesp.com',
        companyPhone: '+94 11 241 6000',
        isVerifiedCompany: true
    },
    { 
        id: 13, 
        title: 'AI Research & Frontier Agent Systems Intern', 
        company: 'Google / DeepMind Global', 
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
        description: 'Implement neural architectures, evaluate LLM reasoning bounds, and train agentic workflow loops with international UK/US teams.',
        website: 'https://deepmind.google',
        companyEmail: 'deepmind-careers@google.com',
        companyPhone: '+44 20 7031 3000',
        isVerifiedCompany: true
    },
    { 
        id: 14, 
        title: 'Cloud Systems & Microservices Intern', 
        company: 'Stripe Inc. Global', 
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
        description: 'Build foundational payment routing engines, fraud prevention pipelines, and API integrations for global Stripe merchants.',
        website: 'https://stripe.com',
        companyEmail: 'jobs@stripe.com',
        companyPhone: '+1 888 963 8969',
        isVerifiedCompany: true
    },
    { 
        id: 15, 
        title: 'Fintech Software Engineering Intern', 
        company: 'London Stock Exchange Group (LSEG)', 
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
        description: 'Engineer high-throughput real-time financial market data feeds and trading infrastructure at LSEG Technology Colombo.',
        website: 'https://www.lseg.com',
        companyEmail: 'earlycareers@lseg.com',
        companyPhone: '+44 20 7797 1000',
        isVerifiedCompany: true
    },
    { 
        id: 16, 
        title: 'Digital Telco Cloud & Kubernetes Intern', 
        company: 'Axiata Digital Labs (ADL)', 
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
        website: 'https://axiatadigitallabs.com',
        companyEmail: 'careers@axiatadigitallabs.com',
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
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b

    if (search) {
        const q = search.toLowerCase();
        results = results.filter(
            (i) =>
<<<<<<< HEAD
                i.title.toLowerCase().includes(q) ||
                i.company.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q) ||
=======
                (i.title && i.title.toLowerCase().includes(q)) ||
                (i.company && i.company.toLowerCase().includes(q)) ||
                (i.location && i.location.toLowerCase().includes(q)) ||
                (i.workMode && i.workMode.toLowerCase().includes(q)) ||
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
                (i.skills || []).some((s) => s.toLowerCase().includes(q))
        );
    }

    res.json(results);
<<<<<<< HEAD
});

// Get single internship details
app.get('/internships/:id', (req, res) => {
    const internship = findInternship(req.params.id);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    res.json(internship);
});

// Post a new internship (Company role only)
app.post('/internships', (req, res) => {
    const { title, company, category, price, location, capacity, skills, description } = req.body;
    
    if (!title || !company || !category || !location || !description) {
        return res.status(400).json({ error: 'Missing required fields: title, company, category, location, description' });
    }

    const newInternship = {
        id: INTERNSHIPS.length + 1,
        title,
        company,
        category,
        price: Number(price) || 15, // default verification fee
        location,
        available: Number(capacity) || 5,
        capacity: Number(capacity) || 5,
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : []),
        description
    };

    INTERNSHIPS.push(newInternship);
    res.status(201).json(newInternship);
});

// Reserve a slot (Called by Booking/Application Service)
app.patch('/internships/:id/book', (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const internship = findInternship(req.params.id);

    if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    if (internship.available < quantity) {
        return res.status(409).json({ error: 'Not enough slots available', available: internship.available });
    }

    internship.available -= quantity;
    res.json({ success: true, internship, reserved: quantity, remaining: internship.available });
});

// Roll back availability if another service fails after reservation.
app.patch('/internships/:id/release', (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const internship = findInternship(req.params.id);

    if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    internship.available = Math.min(internship.capacity, internship.available + quantity);
    res.json({ success: true, internship, released: quantity, remaining: internship.available });
});

app.listen(PORT, () => console.log(`Internship Service running on port ${PORT}`));
=======
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

>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
