/**
 * Unit Tests — Notification Service
 * Tests notification storage, retrieval, and validation.
 */

// ─── Inline the notification logic for unit-testable isolation ───────────────

function createNotificationStore() {
    const notifications = [];

    function sendNotification(userId, message) {
        if (!userId || !message || String(message).trim().length < 3) {
            return { status: 400, body: { error: 'userId and message are required' } };
        }

        const notification = {
            id: notifications.length + 1,
            userId,
            message,
            status: 'SENT',
            timestamp: new Date().toISOString()
        };
        notifications.push(notification);
        return { status: 202, body: notification };
    }

    function getUserNotifications(userId) {
        return notifications.filter(n => String(n.userId) === String(userId));
    }

    function getAllNotifications() {
        return [...notifications];
    }

    return { sendNotification, getUserNotifications, getAllNotifications, _store: notifications };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Notification Service — Sending Notifications', () => {
    let store;

    beforeEach(() => {
        store = createNotificationStore();
    });

    test('sends a valid notification and returns 202', () => {
        const result = store.sendNotification('user_1', 'Your application was submitted successfully.');
        expect(result.status).toBe(202);
        expect(result.body.status).toBe('SENT');
        expect(result.body.id).toBe(1);
        expect(result.body.userId).toBe('user_1');
        expect(result.body.message).toMatch(/submitted/);
    });

    test('assigns incrementing IDs', () => {
        store.sendNotification('u1', 'First notification');
        store.sendNotification('u2', 'Second notification');
        const r3 = store.sendNotification('u3', 'Third notification');
        expect(r3.body.id).toBe(3);
    });

    test('timestamp is a valid ISO string', () => {
        const result = store.sendNotification('u1', 'Test notification message');
        expect(() => new Date(result.body.timestamp)).not.toThrow();
        expect(new Date(result.body.timestamp).toISOString()).toBe(result.body.timestamp);
    });

    test('rejects when userId is missing', () => {
        const result = store.sendNotification(null, 'Valid message here');
        expect(result.status).toBe(400);
        expect(result.body.error).toMatch(/required/);
    });

    test('rejects when message is missing', () => {
        const result = store.sendNotification('user_5', null);
        expect(result.status).toBe(400);
    });

    test('rejects when message is too short (< 3 chars)', () => {
        const result = store.sendNotification('user_6', 'hi');
        expect(result.status).toBe(400);
    });

    test('rejects empty string message', () => {
        const result = store.sendNotification('user_7', '');
        expect(result.status).toBe(400);
    });
});

describe('Notification Service — Retrieving Notifications', () => {
    let store;

    beforeEach(() => {
        store = createNotificationStore();
        store.sendNotification('user_A', 'Notification for A (1)');
        store.sendNotification('user_B', 'Notification for B (1)');
        store.sendNotification('user_A', 'Notification for A (2)');
        store.sendNotification('user_C', 'Notification for C (1)');
    });

    test('getAll returns all notifications', () => {
        expect(store.getAllNotifications()).toHaveLength(4);
    });

    test('getUserNotifications filters by userId', () => {
        const userANotifs = store.getUserNotifications('user_A');
        expect(userANotifs).toHaveLength(2);
        expect(userANotifs.every(n => n.userId === 'user_A')).toBe(true);
    });

    test('getUserNotifications with numeric userId matches string userId', () => {
        // Notification stored with numeric userId should be retrievable by string
        store._store.push({
            id: 5, userId: 42, message: 'Numeric ID notification', status: 'SENT', timestamp: new Date().toISOString()
        });
        const results = store.getUserNotifications('42');
        expect(results).toHaveLength(1);
    });

    test('getUserNotifications returns empty array for unknown user', () => {
        const results = store.getUserNotifications('unknown_user');
        expect(results).toHaveLength(0);
    });

    test('each notification has required fields', () => {
        const all = store.getAllNotifications();
        all.forEach(n => {
            expect(n).toHaveProperty('id');
            expect(n).toHaveProperty('userId');
            expect(n).toHaveProperty('message');
            expect(n).toHaveProperty('status', 'SENT');
            expect(n).toHaveProperty('timestamp');
        });
    });
});
