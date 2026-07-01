const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5005;
const notifications = [];

app.get('/health', (req, res) => {
    res.json({ service: 'notification-service', status: 'ok', notifications: notifications.length });
});

app.post('/notifications/send', (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message || String(message).trim().length < 3) {
        return res.status(400).json({ error: 'userId and message are required' });
    }
    
    console.log(`[NOTIFICATION] Sending to User ${userId}: ${message}`);

    const notification = {
        id: notifications.length + 1,
        userId,
        message,
        status: 'SENT',
        timestamp: new Date().toISOString()
    };
    notifications.push(notification);
    
    res.status(202).json(notification);
});

app.get('/notifications/user/:userId', (req, res) => {
    res.json(notifications.filter((notification) => String(notification.userId) === String(req.params.userId)));
});

app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
