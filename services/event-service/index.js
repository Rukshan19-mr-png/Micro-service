const express = require('express');
const app = express();
app.use(express.json());

const INTERNSHIPS = [
    { 
        id: 1, 
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
        description: 'Contribute to open-source API management and Identity Server products. Work remotely from anywhere globally or at WSO2 Colombo HQ.' 
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
        description: 'Build enterprise fintech platforms for Global 2000 clients with modern microservices architecture and automated testing pipelines.' 
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
        description: 'Design generative AI agent tools and predictive supply chain optimization engines for North America’s largest foodservice provider.' 
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
        description: 'Engage with IFS R&D team building cloud-native Asset Management and ERP suites serving aerospace and defense industries worldwide.' 
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
        description: 'Analyze real-time network telemetry, customer churn modeling, and automated network slice optimization on Dialog’s 5G infrastructure.' 
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
        description: 'Optimize high-throughput driver dispatch algorithms, spatial indexing, and surge pricing engines handling millions of daily ride requests.' 
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
        description: 'Build responsive web apps for Scandinavian software vendors. Foreign candidates can work online asynchronously.' 
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
        description: 'Develop data-driven marketing technologies, analytics dashboards, and web automation tools for top US & Australian venture-backed brands.' 
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
        description: 'Craft cross-platform mobile apps for Silicon Valley client startups with slick animations and offline storage support.' 
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
        description: 'Work on cutting-edge autonomous vehicle navigation systems, smart agriculture robotics, and AI travel engines.' 
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
        description: 'Integrate real-time QR payments, card processing pipelines, and banking API integrations compliant with Central Bank regulations.' 
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
        description: 'Conduct security audits, vulnerability assessments, and SOC incident responses for Sri Lanka’s leading financial institutions.' 
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
        description: 'Implement neural architectures, evaluate LLM reasoning bounds, and train agentic workflow loops with international UK/US teams.' 
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
        description: 'Build foundational payment routing engines, fraud prevention pipelines, and API integrations for global Stripe merchants.' 
    }
];

const PORT = process.env.PORT || 5002;

const findInternship = (id) => INTERNSHIPS.find((item) => item.id === Number(id));

app.get('/health', (req, res) => {
    res.json({ service: 'internship-service', status: 'ok', internships: INTERNSHIPS.length });
});

// Get all internships with multi-criteria filters
app.get('/internships', (req, res) => {
    const { category, search, workMode, applicantOrigin } = req.query;
    let results = [...INTERNSHIPS];

    if (category && category !== 'All') {
        results = results.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    if (workMode && workMode !== 'All') {
        results = results.filter((i) => i.workMode.toLowerCase().includes(workMode.toLowerCase()));
    }

    if (applicantOrigin === 'foreign') {
        // Foreign applicants can only apply for Online / Global remote roles
        results = results.filter((i) => i.eligibleApplicants.includes('Global') || i.workMode.includes('Online'));
    }

    if (search) {
        const q = search.toLowerCase();
        results = results.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                i.company.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q) ||
                i.workMode.toLowerCase().includes(q) ||
                (i.skills || []).some((s) => s.toLowerCase().includes(q))
        );
    }

    res.json(results);
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
        price: Number(price) || 0, // default free application
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
