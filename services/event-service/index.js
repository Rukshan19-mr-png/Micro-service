const express = require('express');
const app = express();
app.use(express.json());

const EVENTS = [
    { id: 1, title: 'Tech Conference 2026', category: 'Tech', price: 150, location: 'San Francisco', available: 100, capacity: 100, date: '2026-09-18' },
    { id: 2, title: 'Music Festival', category: 'Music', price: 75, location: 'Austin', available: 500, capacity: 500, date: '2026-10-04' },
    { id: 3, title: 'AI Workshop', category: 'Tech', price: 0, location: 'Online', available: 1000, capacity: 1000, date: '2026-08-12' }
];

const PORT = process.env.PORT || 5002;

const findEvent = (id) => EVENTS.find((event) => event.id === Number(id));

app.get('/health', (req, res) => {
    res.json({ service: 'event-service', status: 'ok', events: EVENTS.length });
});

// Get all events
app.get('/events', (req, res) => {
    res.json(EVENTS);
});

// Get single event details
app.get('/events/:id', (req, res) => {
    const event = findEvent(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
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
