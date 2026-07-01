const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const BOOKINGS = [];
const PORT = process.env.PORT || 5003;
const SERVICES = {
    events: process.env.EVENT_SERVICE_URL || 'http://localhost:5002',
    payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
    notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005'
};

app.get('/health', (req, res) => {
    res.json({ service: 'booking-service', status: 'ok', bookings: BOOKINGS.length });
});

app.get('/bookings', (req, res) => {
    const userId = req.query.userId;
    if (userId) {
        return res.json(BOOKINGS.filter((booking) => String(booking.userId) === String(userId)));
    }
    res.json(BOOKINGS);
});

app.post('/bookings', async (req, res) => {
    const eventId = Number(req.body.eventId);
    const userId = req.body.userId;
    const quantity = Number(req.body.quantity || 1);
    const { paymentDetails } = req.body;

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({ error: 'A valid eventId is required' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'A valid userId is required' });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    let reservationCreated = false;

    try {
        const eventResponse = await axios.get(`${SERVICES.events}/events/${eventId}`);
        const event = eventResponse.data;

        await axios.patch(`${SERVICES.events}/events/${eventId}/book`, { quantity });
        reservationCreated = true;
        
        const paymentResponse = await axios.post(`${SERVICES.payments}/payments/process`, {
            amount: event.price * quantity,
            paymentDetails
        });

        const booking = {
            id: BOOKINGS.length + 1,
            eventId,
            eventTitle: event.title,
            userId,
            quantity,
            totalAmount: event.price * quantity,
            status: 'CONFIRMED',
            transactionId: paymentResponse.data.transactionId,
            createdAt: new Date().toISOString()
        };
        BOOKINGS.push(booking);

        try {
            await axios.post(`${SERVICES.notifications}/notifications/send`, {
                userId,
                message: `Booking confirmed for ${event.title}. Quantity: ${quantity}.`
            });
        } catch (notificationError) {
            console.warn('Booking confirmed, but notification failed:', notificationError.message);
        }

        res.status(201).json(booking);
    } catch (err) {
        if (reservationCreated) {
            try {
                await axios.patch(`${SERVICES.events}/events/${eventId}/release`, { quantity });
            } catch (rollbackError) {
                console.error('Failed to release reserved tickets:', rollbackError.message);
            }
        }

        const status = err.response?.status || 500;
        res.status(status).json({
            error: 'Booking failed',
            details: err.response?.data?.error || err.message
        });
    }
});

app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
