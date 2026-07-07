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

// Get all internships
app.get('/internships', (req, res) => {
    res.json(INTERNSHIPS);
});

// Get single internship details
app.get('/internships/:id', (req, res) => {
    const internship = findInternship(req.params.id);
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    res.json(internship);
});

// Update availability (Called by Booking Service)
app.patch('/events/:id/book', (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const event = findEvent(req.params.id);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    if (event.available < quantity) {
        return res.status(409).json({ error: 'Not enough tickets available', available: event.available });
    }

    event.available -= quantity;
    res.json({ success: true, event, reserved: quantity, remaining: event.available });
});

// Roll back availability if another service fails after reservation.
app.patch('/events/:id/release', (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const event = findEvent(req.params.id);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    event.available = Math.min(event.capacity, event.available + quantity);
    res.json({ success: true, event, released: quantity, remaining: event.available });
});

app.listen(PORT, () => console.log(`Event Service running on port ${PORT}`));
