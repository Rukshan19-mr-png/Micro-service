/**
 * Unit Tests — Auth Service
 * Tests core logic in isolation (no real DB, no real HTTP calls).
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Helpers extracted from auth-service/index.js ────────────────────────────

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidWebsite = (website) => {
    try {
        const url = new URL(website);
        return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
    } catch {
        return false;
    }
};

const sanitizeUser = (user) => ({
    id: user.id,
    email: user.email,
    role: user.role === 'student' ? 'candidate' : (user.role || 'candidate'),
    name: user.name || '',
    phone: user.phone || '',
    website: user.website || '',
    university: user.university || '',
    fieldOfStudy: user.field_of_study || user.fieldOfStudy || '',
    location: user.location || '',
    createdAt: user.created_at || user.createdAt
});

const JWT_SECRET = 'test_secret';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Auth Service — Email Validation', () => {
    test('accepts valid email addresses', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('student.name+tag@university.ac.lk')).toBe(true);
        expect(isValidEmail('company@corp.io')).toBe(true);
    });

    test('rejects invalid email formats', () => {
        expect(isValidEmail('not-an-email')).toBe(false);
        expect(isValidEmail('@missinglocal.com')).toBe(false);
        expect(isValidEmail('missingdomain@')).toBe(false);
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('spaces in@email.com')).toBe(false);
    });
});

describe('Auth Service — Website Validation', () => {
    test('accepts valid https URLs', () => {
        expect(isValidWebsite('https://example.com')).toBe(true);
        expect(isValidWebsite('https://www.company.co.uk')).toBe(true);
        expect(isValidWebsite('http://legacy-site.org')).toBe(true);
    });

    test('rejects invalid or non-http URLs', () => {
        expect(isValidWebsite('ftp://files.example.com')).toBe(false);
        expect(isValidWebsite('just-a-domain.com')).toBe(false);
        expect(isValidWebsite('')).toBe(false);
        expect(isValidWebsite('not a url')).toBe(false);
    });
});

describe('Auth Service — sanitizeUser()', () => {
    test('normalizes role: student → candidate', () => {
        const user = { id: 1, email: 'a@b.com', role: 'student', name: 'Test', createdAt: new Date().toISOString() };
        const result = sanitizeUser(user);
        expect(result.role).toBe('candidate');
    });

    test('preserves company role as-is', () => {
        const user = { id: 2, email: 'c@d.com', role: 'company', name: 'Corp' };
        expect(sanitizeUser(user).role).toBe('company');
    });

    test('preserves candidate role as-is', () => {
        const user = { id: 3, email: 'e@f.com', role: 'candidate', name: 'Alice' };
        expect(sanitizeUser(user).role).toBe('candidate');
    });

    test('falls back to candidate if role is missing', () => {
        const user = { id: 4, email: 'g@h.com' };
        expect(sanitizeUser(user).role).toBe('candidate');
    });

    test('maps snake_case field_of_study to camelCase fieldOfStudy', () => {
        const user = { id: 5, email: 'i@j.com', role: 'candidate', field_of_study: 'CS' };
        expect(sanitizeUser(user).fieldOfStudy).toBe('CS');
    });

    test('excludes password from sanitized output', () => {
        const user = { id: 6, email: 'k@l.com', role: 'candidate', password: 'secret_hash' };
        const result = sanitizeUser(user);
        expect(result.password).toBeUndefined();
    });

    test('fills empty strings for missing optional fields', () => {
        const user = { id: 7, email: 'm@n.com', role: 'candidate' };
        const result = sanitizeUser(user);
        expect(result.name).toBe('');
        expect(result.phone).toBe('');
        expect(result.website).toBe('');
        expect(result.university).toBe('');
        expect(result.location).toBe('');
    });
});

describe('Auth Service — Password Hashing & Comparison', () => {
    test('bcrypt hash is not the same as plain password', async () => {
        const plain = 'Password123!';
        const hash = await bcrypt.hash(plain, 10);
        expect(hash).not.toBe(plain);
    });

    test('bcrypt.compare returns true for matching password', async () => {
        const plain = 'MySecurePass!';
        const hash = await bcrypt.hash(plain, 10);
        expect(await bcrypt.compare(plain, hash)).toBe(true);
    });

    test('bcrypt.compare returns false for wrong password', async () => {
        const hash = await bcrypt.hash('correct', 10);
        expect(await bcrypt.compare('wrong', hash)).toBe(false);
    });
});

describe('Auth Service — JWT Token', () => {
    test('signs and verifies a valid token', () => {
        const payload = { userId: 42, email: 'user@test.com', role: 'candidate' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, JWT_SECRET);
        expect(decoded.userId).toBe(42);
        expect(decoded.email).toBe('user@test.com');
        expect(decoded.role).toBe('candidate');
    });

    test('throws on expired token', () => {
        const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1ms' });
        // Wait a tick so it expires
        return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
            expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
        });
    });

    test('throws on tampered token', () => {
        const token = jwt.sign({ userId: 1 }, JWT_SECRET);
        const tampered = token.slice(0, -5) + 'XXXXX';
        expect(() => jwt.verify(tampered, JWT_SECRET)).toThrow();
    });

    test('throws on token signed with wrong secret', () => {
        const token = jwt.sign({ userId: 1 }, 'wrong_secret');
        expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
    });
});

describe('Auth Service — In-Memory Duplicate Detection', () => {
    test('detects duplicate email and throws error with code 23505', () => {
        const memoryUsers = [];

        function createUserInMemory(email, passwordHash, role) {
            if (memoryUsers.some(u => u.email === email)) {
                const err = new Error('Email already exists');
                err.code = '23505';
                throw err;
            }
            const user = { id: memoryUsers.length + 1, email, password: passwordHash, role };
            memoryUsers.push(user);
            return user;
        }

        createUserInMemory('dup@test.com', 'hash', 'candidate');
        expect(() => createUserInMemory('dup@test.com', 'hash2', 'candidate')).toThrow(
            expect.objectContaining({ code: '23505' })
        );
    });

    test('allows different emails to be registered', () => {
        const memoryUsers = [];

        function createUserInMemory(email, passwordHash, role) {
            if (memoryUsers.some(u => u.email === email)) {
                const err = new Error('Email already exists');
                err.code = '23505';
                throw err;
            }
            const user = { id: memoryUsers.length + 1, email, password: passwordHash, role };
            memoryUsers.push(user);
            return user;
        }

        const u1 = createUserInMemory('user1@test.com', 'h1', 'candidate');
        const u2 = createUserInMemory('user2@test.com', 'h2', 'company');
        expect(u1.id).toBe(1);
        expect(u2.id).toBe(2);
    });
});
