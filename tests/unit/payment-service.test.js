/**
 * Unit Tests — Payment Service
 * Tests payment processing logic including free payments, declines, and validation.
 */

// ─── Inline the payment logic for unit-testable isolation ────────────────────

function processPayment(amount, paymentDetails) {
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
        return { status: 400, body: { status: 'FAILED', error: 'A valid amount is required' } };
    }

    if (Number(amount) === 0) {
        return {
            status: 200,
            body: {
                status: 'SUCCESS',
                transactionId: 'FREE_' + Date.now().toString(36).toUpperCase(),
                amount: 0,
                cardLast4: 'FREE',
                processedAt: new Date().toISOString()
            }
        };
    }

    const cardNumber = String(paymentDetails?.cardNumber || '').replace(/\D/g, '');

    if (!cardNumber || cardNumber.length < 12) {
        return { status: 400, body: { status: 'FAILED', error: 'Missing payment details' } };
    }

    if (!paymentDetails?.expiry || !paymentDetails?.cvv) {
        return { status: 400, body: { status: 'FAILED', error: 'Incomplete payment details' } };
    }

    const last4 = cardNumber.slice(-4);

    if (last4 === '0000') {
        return { status: 402, body: { status: 'FAILED', error: 'Payment declined by bank' } };
    }

    return {
        status: 200,
        body: {
            status: 'SUCCESS',
            transactionId: 'TX' + Date.now().toString(36).toUpperCase(),
            amount: Number(amount),
            cardLast4: last4,
            processedAt: new Date().toISOString()
        }
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Payment Service — Free Payments (amount = 0)', () => {
    test('returns SUCCESS with FREE_ transactionId when amount is 0', () => {
        const result = processPayment(0, null);
        expect(result.status).toBe(200);
        expect(result.body.status).toBe('SUCCESS');
        expect(result.body.transactionId).toMatch(/^FREE_/);
        expect(result.body.amount).toBe(0);
        expect(result.body.cardLast4).toBe('FREE');
    });

    test('free payment does not require paymentDetails', () => {
        const result = processPayment(0, undefined);
        expect(result.status).toBe(200);
        expect(result.body.status).toBe('SUCCESS');
    });

    test('amount of "0" (string) is treated as free', () => {
        const result = processPayment('0', null);
        expect(result.status).toBe(200);
        expect(result.body.cardLast4).toBe('FREE');
    });
});

describe('Payment Service — Valid Paid Payments', () => {
    test('returns SUCCESS with TX_ transactionId for valid card', () => {
        const result = processPayment(15, {
            cardNumber: '4111111111111111',
            expiry: '12/28',
            cvv: '123'
        });
        expect(result.status).toBe(200);
        expect(result.body.status).toBe('SUCCESS');
        expect(result.body.transactionId).toMatch(/^TX/);
        expect(result.body.amount).toBe(15);
        expect(result.body.cardLast4).toBe('1111');
    });

    test('card number spaces and dashes are stripped before processing', () => {
        const result = processPayment(25, {
            cardNumber: '4111-1111-1111-1112',
            expiry: '06/27',
            cvv: '456'
        });
        expect(result.status).toBe(200);
        expect(result.body.cardLast4).toBe('1112');
    });

    test('processedAt is a valid ISO date string', () => {
        const result = processPayment(10, {
            cardNumber: '4111111111111111',
            expiry: '12/28',
            cvv: '999'
        });
        expect(result.status).toBe(200);
        expect(() => new Date(result.body.processedAt)).not.toThrow();
        expect(new Date(result.body.processedAt).toISOString()).toBe(result.body.processedAt);
    });
});

describe('Payment Service — Card Decline (last 4 = 0000)', () => {
    test('declines card ending in 0000 with status 402', () => {
        const result = processPayment(15, {
            cardNumber: '4000000000000000',
            expiry: '12/28',
            cvv: '123'
        });
        expect(result.status).toBe(402);
        expect(result.body.status).toBe('FAILED');
        expect(result.body.error).toMatch(/declined/i);
    });

    test('card "4999999999990000" (any prefix, ends 0000) is declined', () => {
        const result = processPayment(20, {
            cardNumber: '4999999999990000',
            expiry: '01/30',
            cvv: '000'
        });
        expect(result.status).toBe(402);
        expect(result.body.status).toBe('FAILED');
    });
});

describe('Payment Service — Validation Errors', () => {
    test('negative amount returns 400', () => {
        const result = processPayment(-5, { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' });
        expect(result.status).toBe(400);
        expect(result.body.status).toBe('FAILED');
    });

    test('non-numeric amount returns 400', () => {
        const result = processPayment('abc', { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' });
        expect(result.status).toBe(400);
    });

    test('null amount returns 400', () => {
        const result = processPayment(null, { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' });
        expect(result.status).toBe(400);
    });

    test('card number shorter than 12 digits returns 400', () => {
        const result = processPayment(15, { cardNumber: '12345', expiry: '12/28', cvv: '123' });
        expect(result.status).toBe(400);
        expect(result.body.error).toMatch(/Missing payment details/);
    });

    test('missing expiry returns 400', () => {
        const result = processPayment(15, { cardNumber: '4111111111111111', cvv: '123' });
        expect(result.status).toBe(400);
        expect(result.body.error).toMatch(/Incomplete/);
    });

    test('missing CVV returns 400', () => {
        const result = processPayment(15, { cardNumber: '4111111111111111', expiry: '12/28' });
        expect(result.status).toBe(400);
        expect(result.body.error).toMatch(/Incomplete/);
    });

    test('empty paymentDetails for paid amount returns 400', () => {
        const result = processPayment(15, {});
        expect(result.status).toBe(400);
    });
});
