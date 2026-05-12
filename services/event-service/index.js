const express = require('express');
const app = express();
app.use(express.json());

const EVENTS = [
    { id: 1, title: 'Tech Conference 2026', price: 150, location: 'San Francisco', available: 100 },
    { id: 2, title: 'Music Festival', price: 75, location: 'Austin', available: 500 },
    { id: 3, title: 'AI Workshop', price: 0, location: 'Online', available: 1000 }
];

// Get all events
app.get('/events', (req, res) => {
    res.json(EVENTS);
});

// Get single event details
app.get('/events/:id', (req, res) => {
    const event = EVENTS.find(e => e.id === parseInt(req.params.id));
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
});

// Update availability (Called by Booking Service)
app.patch('/events/:id/book', (req, res) => {
    const event = EVENTS.find(e => e.id === parseInt(req.params.id));
    if (event && event.available > 0) {
        event.available -= 1;
        return res.json({ success: true, remaining: event.available });
    }
    res.status(400).json({ error: 'Tickets sold out' });
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Event Service running on port ${PORT}`));
