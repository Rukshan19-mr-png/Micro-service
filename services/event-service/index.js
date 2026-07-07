const express = require('express');
const app = express();
app.use(express.json());

const INTERNSHIPS = [
    { 
        id: 1, 
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

    if (search) {
        const q = search.toLowerCase();
        results = results.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                i.company.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q) ||
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
