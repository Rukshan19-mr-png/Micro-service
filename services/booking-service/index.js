const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// In-memory application store
const APPLICATIONS = [];
const PORT = process.env.PORT || 5003;
const SERVICES = {
    internships: process.env.EVENT_SERVICE_URL || 'http://localhost:5002',
    payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
    notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005'
};

app.get('/health', (req, res) => {
    res.json({ service: 'application-service', status: 'ok', applications: APPLICATIONS.length });
});

// Get applications (optionally filtered by userId)
app.get('/bookings', (req, res) => {
    const userId = req.query.userId;
    if (userId) {
        return res.json(APPLICATIONS.filter((app) => String(app.userId) === String(userId)));
    }
    res.json(APPLICATIONS);
});

// Submit an internship application
app.post('/bookings', async (req, res) => {
    const internshipId = Number(req.body.eventId);
    const userId = req.body.userId;
    const userRole = req.body.userRole;
    const quantity = Number(req.body.quantity || 1);
    const { paymentDetails } = req.body;

    if (!Number.isInteger(internshipId) || internshipId < 1) {
        return res.status(400).json({ error: 'A valid internship ID (eventId) is required' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'A valid userId is required' });
    }

    // Only students can apply
    if (userRole === 'company') {
        return res.status(403).json({ error: 'Company accounts cannot apply for internships' });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be an integer between 1 and 10' });
    }

    let reservationCreated = false;

    try {
        // Step 1: Fetch internship details
        const internshipResponse = await axios.get(`${SERVICES.internships}/internships/${internshipId}`);
        const internship = internshipResponse.data;

        // Step 2: Reserve a slot (saga - compensate on failure)
        await axios.patch(`${SERVICES.internships}/internships/${internshipId}/book`, { quantity });
        reservationCreated = true;
        
        // Step 3: Process verification fee payment
        const paymentResponse = await axios.post(`${SERVICES.payments}/payments/process`, {
            amount: internship.price * quantity,
            paymentDetails
        });

        // Step 4: Save the application record
        const application = {
            id: APPLICATIONS.length + 1,
            eventId: internshipId,
            eventTitle: internship.title,
            company: internship.company,
            userId,
            quantity,
            totalAmount: internship.price * quantity,
            status: 'APPLIED',
            transactionId: paymentResponse.data.transactionId,
            appliedAt: new Date().toISOString()
        };
        APPLICATIONS.push(application);

        // Step 5: Send notification (non-critical, fire-and-forget)
        try {
            await axios.post(`${SERVICES.notifications}/notifications/send`, {
                userId,
                message: `Application submitted for "${internship.title}" at ${internship.company}. Status: APPLIED.`
            });
        } catch (notificationError) {
            console.warn('Application confirmed, but notification failed:', notificationError.message);
        }

        res.status(201).json(application);
    } catch (err) {
        // Compensating transaction: release the reserved slot
        if (reservationCreated) {
            try {
                await axios.patch(`${SERVICES.internships}/internships/${internshipId}/release`, { quantity });
            } catch (rollbackError) {
                console.error('Failed to release reserved slot during saga rollback:', rollbackError.message);
            }
        }

        const status = err.response?.status || 500;
        res.status(status).json({
            error: 'Application failed',
            details: err.response?.data?.error || err.message
        });
    }
});

app.listen(PORT, () => console.log(`Application Service running on port ${PORT}`));
