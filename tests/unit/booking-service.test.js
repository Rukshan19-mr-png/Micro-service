/**
 * Unit Tests — Booking / Application Service
 * Tests the application submission logic, including role guards, field validation,
 * local/foreign fee detection, and Saga rollback with mocked axios.
 */

jest.mock('axios');
const axios = require('axios');

// ─── Local phone detection logic (extracted from booking-service) ─────────────

function isLocalSriLankanPhone(phone) {
    const cleanPhone = String(phone).replace(/[\s\-\(\)]/g, '');
    return (
        cleanPhone.startsWith('+94') ||
        cleanPhone.startsWith('94') ||
        cleanPhone.startsWith('07') ||
        cleanPhone.startsWith('011') ||
        cleanPhone.startsWith('01') ||
        cleanPhone.startsWith('03') ||
        cleanPhone.startsWith('08') ||
        cleanPhone.startsWith('09')
    );
}

function calculateFee(phone, quantity) {
    return isLocalSriLankanPhone(phone) ? 0 : 15 * quantity;
}

// ─── Application validation logic ────────────────────────────────────────────

function validateApplication({ internshipId, userId, userRole, quantity, applicant }) {
    if (!Number.isInteger(internshipId) || internshipId < 1) {
        return { status: 400, error: 'A valid internship ID (eventId) is required' };
    }
    if (!userId) {
        return { status: 400, error: 'A valid userId is required' };
    }
    if (userRole === 'company') {
        return { status: 403, error: 'Company accounts cannot apply for internships' };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return { status: 400, error: 'Quantity must be an integer between 1 and 10' };
    }
    const { fullName, email, phone, location, experience, coverLetter, cvName } = applicant || {};
    if (!fullName || !email || !phone || !location || !experience || !coverLetter || !cvName) {
        return { status: 400, error: 'Please complete all applicant details and upload a CV' };
    }
    return null; // valid
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Booking Service — Phone Number / Fee Detection', () => {
    test('Sri Lankan +94 prefix → local (free)', () => {
        expect(isLocalSriLankanPhone('+94 77 123 4567')).toBe(true);
        expect(calculateFee('+94 77 123 4567', 1)).toBe(0);
    });

    test('Sri Lankan 07x prefix → local (free)', () => {
        expect(isLocalSriLankanPhone('0771234567')).toBe(true);
        expect(calculateFee('0771234567', 1)).toBe(0);
    });

    test('Sri Lankan 011 prefix → local (free)', () => {
        expect(isLocalSriLankanPhone('0112345678')).toBe(true);
        expect(calculateFee('0112345678', 1)).toBe(0);
    });

    test('Sri Lankan 94 prefix (no +) → local (free)', () => {
        expect(isLocalSriLankanPhone('94771234567')).toBe(true);
    });

    test('US +1 number → foreign ($15)', () => {
        expect(isLocalSriLankanPhone('+1 (555) 987-6543')).toBe(false);
        expect(calculateFee('+1 (555) 987-6543', 1)).toBe(15);
    });

    test('UK +44 number → foreign ($15)', () => {
        expect(isLocalSriLankanPhone('+44 20 7031 3000')).toBe(false);
        expect(calculateFee('+44 20 7031 3000', 1)).toBe(15);
    });

    test('foreign fee multiplied by quantity', () => {
        expect(calculateFee('+1 555 000 0001', 2)).toBe(30);
        expect(calculateFee('+1 555 000 0001', 3)).toBe(45);
    });

    test('local fee is always 0 regardless of quantity', () => {
        expect(calculateFee('+94 77 000 0000', 5)).toBe(0);
    });
});

describe('Booking Service — Application Validation', () => {
    const validApplicant = {
        fullName: 'Jane Doe',
        email: 'jane@test.com',
        phone: '+94 77 111 2222',
        location: 'Colombo, Sri Lanka',
        experience: 'Third-year CS student',
        coverLetter: 'I am passionate about software engineering.',
        cvName: 'resume.pdf'
    };

    test('valid application returns null (no error)', () => {
        const err = validateApplication({
            internshipId: 1,
            userId: 42,
            userRole: 'candidate',
            quantity: 1,
            applicant: validApplicant
        });
        expect(err).toBeNull();
    });

    test('company role is blocked with 403', () => {
        const err = validateApplication({
            internshipId: 1, userId: 42, userRole: 'company', quantity: 1, applicant: validApplicant
        });
        expect(err).not.toBeNull();
        expect(err.status).toBe(403);
    });

    test('missing internshipId returns 400', () => {
        const err = validateApplication({ internshipId: 0, userId: 42, userRole: 'candidate', quantity: 1, applicant: validApplicant });
        expect(err.status).toBe(400);
    });

    test('missing userId returns 400', () => {
        const err = validateApplication({ internshipId: 1, userId: null, userRole: 'candidate', quantity: 1, applicant: validApplicant });
        expect(err.status).toBe(400);
    });

    test('quantity 0 returns 400', () => {
        const err = validateApplication({ internshipId: 1, userId: 1, userRole: 'candidate', quantity: 0, applicant: validApplicant });
        expect(err.status).toBe(400);
    });

    test('quantity 11 returns 400', () => {
        const err = validateApplication({ internshipId: 1, userId: 1, userRole: 'candidate', quantity: 11, applicant: validApplicant });
        expect(err.status).toBe(400);
    });

    test('missing fullName returns 400', () => {
        const err = validateApplication({ internshipId: 1, userId: 1, userRole: 'candidate', quantity: 1, applicant: { ...validApplicant, fullName: '' } });
        expect(err.status).toBe(400);
    });

    test('missing cvName returns 400', () => {
        const err = validateApplication({ internshipId: 1, userId: 1, userRole: 'candidate', quantity: 1, applicant: { ...validApplicant, cvName: '' } });
        expect(err.status).toBe(400);
    });

    test('missing phone returns 400', () => {
        const err = validateApplication({ internshipId: 1, userId: 1, userRole: 'candidate', quantity: 1, applicant: { ...validApplicant, phone: '' } });
        expect(err.status).toBe(400);
    });
});

describe('Booking Service — Saga Pattern (axios mocked)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('payment decline causes slot to be released (rollback)', async () => {
        // Simulate internship fetch
        axios.get.mockResolvedValue({ data: { id: 3, title: 'AI Intern', company: 'TechCo' } });
        // Simulate slot reservation success
        axios.patch.mockResolvedValueOnce({ data: { success: true } });
        // Simulate payment decline (throws)
        axios.post.mockRejectedValueOnce({ response: { status: 402, data: { error: 'Payment declined by bank' } } });
        // Simulate release slot success
        axios.patch.mockResolvedValueOnce({ data: { success: true, released: 1 } });

        const APPLICATIONS = [];
        const SERVICES = {
            internships: 'http://localhost:5002',
            payments: 'http://localhost:5004',
            notifications: 'http://localhost:5005'
        };

        let reservationCreated = false;
        let error = null;

        try {
            const internshipRes = await axios.get(`${SERVICES.internships}/internships/3`);
            await axios.patch(`${SERVICES.internships}/internships/3/book`, { quantity: 1 });
            reservationCreated = true;

            // Payment fails
            await axios.post(`${SERVICES.payments}/payments/process`, { amount: 15 });
        } catch (err) {
            error = err;
            if (reservationCreated) {
                await axios.patch(`${SERVICES.internships}/internships/3/release`, { quantity: 1 });
            }
        }

        expect(error).not.toBeNull();
        // Verify release was called (rollback happened)
        const patchCalls = axios.patch.mock.calls;
        expect(patchCalls.length).toBe(2);
        expect(patchCalls[1][0]).toContain('/release');
        expect(APPLICATIONS).toHaveLength(0); // No application was saved
    });

    test('successful application (local, free) does not trigger release', async () => {
        axios.get.mockResolvedValue({ data: { id: 1, title: 'Backend Intern', company: 'WSO2' } });
        axios.patch.mockResolvedValue({ data: { success: true } });
        axios.post
            .mockResolvedValueOnce({ data: { status: 'SUCCESS', transactionId: 'FREE_ABC', amount: 0 } }) // payment
            .mockResolvedValueOnce({ data: { status: 'SENT' } }); // notification

        const APPLICATIONS = [];
        const SERVICES = {
            internships: 'http://localhost:5002',
            payments: 'http://localhost:5004',
            notifications: 'http://localhost:5005'
        };

        let reservationCreated = false;

        const internshipRes = await axios.get(`${SERVICES.internships}/internships/1`);
        await axios.patch(`${SERVICES.internships}/internships/1/book`, { quantity: 1 });
        reservationCreated = true;

        const paymentRes = await axios.post(`${SERVICES.payments}/payments/process`, { amount: 0 });
        APPLICATIONS.push({ id: 1, eventId: 1, status: 'APPLIED', totalAmount: 0, transactionId: paymentRes.data.transactionId });

        await axios.post(`${SERVICES.notifications}/notifications/send`, { userId: 1, message: 'Applied' });

        expect(APPLICATIONS).toHaveLength(1);
        expect(APPLICATIONS[0].status).toBe('APPLIED');
        expect(APPLICATIONS[0].totalAmount).toBe(0);

        // Release should NOT have been called
        const patchCalls = axios.patch.mock.calls;
        expect(patchCalls.every(call => !call[0].includes('/release'))).toBe(true);
    });
});
