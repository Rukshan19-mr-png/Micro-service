const express = require('express');
const app = express();
app.use(express.json());

app.post('/notifications/send', (req, res) => {
    const { userId, message } = req.body;
    
    console.log(`[NOTIFICATION] Sending to User ${userId}: ${message}`);
    
    // In a real app, integrate with Nodemailer or Twilio here
    res.json({ status: 'SENT', timestamp: new Date() });
});

const PORT = 5005;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
