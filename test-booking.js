const axios = require('axios');

async function testBookingFlow() {
    try {
        console.log('1. Registering test user...');
        const email = `test${Date.now()}@test.com`;
        const password = 'password123';
        
        await axios.post('http://localhost:8000/api/auth/register', {
            email, password
        });
        console.log('User registered.');

        console.log('2. Logging in...');
        const loginRes = await axios.post('http://localhost:8000/api/auth/login', {
            email, password
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token received:', token.substring(0, 10) + '...');

        console.log('3. Attempting to book event ID 1...');
        const bookRes = await axios.post('http://localhost:8000/api/bookings', 
            { 
                eventId: 1, 
                paymentDetails: { cardNumber: '1234-5678-9012-3456', expiry: '12/26', cvv: '123' },
                applicant: {
                    fullName: 'Test User',
                    email,
                    phone: '+123456789',
                    location: 'San Francisco, CA',
                    skills: ['JavaScript', 'React'],
                    experience: '1 year experience',
                    coverLetter: 'I am excited to apply.',
                    cvName: 'resume.pdf',
                    cvData: 'data:application/pdf;base64,sample'
                }
            }, 
            { headers: { authorization: `Bearer ${token}` } }
        );
        
        console.log('Booking successful! Response:', bookRes.data);
    } catch (err) {
        console.error('Error during flow:', err.response?.data || err.message);
    }
}

testBookingFlow();
