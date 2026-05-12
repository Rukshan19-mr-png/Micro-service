const express = require('express');
const axios = require('axios'); // Note: You would need to npm install axios
const app = express();
app.use(express.json());

const BOOKINGS = [];

app.post('/bookings', async (req, res) => {
    const { eventId, userId, paymentDetails } = req.body;

    try {
        // 1. Check Event Availability (Calling Event Service)
        const eventCheck = await axios.patch(`http://localhost:5002/events/${eventId}/book`);
        
        // 2. Process Payment (Calling Payment Service)
        const paymentResponse = await axios.post('http://localhost:5004/payments/process', {
            amount: 100, // In real life, get this from Event Service
            paymentDetails
        });

        // 3. Save Booking
        const booking = { id: BOOKINGS.length + 1, eventId, userId, status: 'CONFIRMED' };
        BOOKINGS.push(booking);

        // 4. Send Notification (Calling Notification Service)
        await axios.post('http://localhost:5005/notifications/send', {
            userId,
            message: `Booking confirmed for event ${eventId}!`
        });

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Booking failed', details: err.message });
    }
});

const PORT = 5003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
