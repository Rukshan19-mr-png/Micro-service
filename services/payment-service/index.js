const express = require('express');
const app = express();
app.use(express.json());

app.post('/payments/process', (req, res) => {
    const { amount, paymentDetails } = req.body;
    
    if (!paymentDetails || !paymentDetails.cardNumber) {
        return res.status(400).json({ status: 'FAILED', error: 'Missing payment details' });
    }
    
    console.log(`Processing payment of $${amount} for ${paymentDetails.cardNumber}`);
    
    // Simulate payment logic
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    if (isSuccess) {
        res.json({ status: 'SUCCESS', transactionId: 'TX' + Math.random().toString(36).substr(2, 9) });
    } else {
        res.status(400).json({ status: 'FAILED', error: 'Payment declined by bank' });
    }
});

const PORT = 5004;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
