const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5004;
const payments = [];

app.get('/health', (req, res) => {
    res.json({ service: 'payment-service', status: 'ok', payments: payments.length });
});

app.post('/payments/process', (req, res) => {
    const { amount, paymentDetails } = req.body;
<<<<<<< HEAD
    const cardNumber = String(paymentDetails?.cardNumber || '').replace(/\D/g, '');
=======
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
    
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
        return res.status(400).json({ status: 'FAILED', error: 'A valid amount is required' });
    }

<<<<<<< HEAD
=======
    // If amount is 0, application is completely free
    if (Number(amount) === 0) {
        const freePayment = {
            status: 'SUCCESS',
            transactionId: 'FREE_' + Date.now().toString(36).toUpperCase(),
            amount: 0,
            cardLast4: 'FREE',
            processedAt: new Date().toISOString()
        };
        payments.push(freePayment);
        return res.json(freePayment);
    }

    const cardNumber = String(paymentDetails?.cardNumber || '').replace(/\D/g, '');

>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
    if (!cardNumber || cardNumber.length < 12) {
        return res.status(400).json({ status: 'FAILED', error: 'Missing payment details' });
    }

<<<<<<< HEAD
    if (!paymentDetails.expiry || !paymentDetails.cvv) {
=======
    if (!paymentDetails?.expiry || !paymentDetails?.cvv) {
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
        return res.status(400).json({ status: 'FAILED', error: 'Incomplete payment details' });
    }
    
    const last4 = cardNumber.slice(-4);
    console.log(`Processing payment of $${Number(amount).toFixed(2)} for card ending ${last4}`);
    
    if (last4 === '0000') {
        return res.status(402).json({ status: 'FAILED', error: 'Payment declined by bank' });
    }

    const payment = {
        status: 'SUCCESS',
        transactionId: 'TX' + Date.now().toString(36).toUpperCase(),
        amount: Number(amount),
        cardLast4: last4,
        processedAt: new Date().toISOString()
    };
    payments.push(payment);

    res.json(payment);
});

app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
