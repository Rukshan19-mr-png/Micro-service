/**
 * Unit Tests — Event / Internship Service
 * Tests in-memory CRUD: filtering, slot reservation, release, and slot capacity cap.
 */

// ─── Inline the internship data and logic ────────────────────────────────────

function createInternshipStore(seedData) {
    // Deep-clone so each test starts fresh
    const INTERNSHIPS = seedData.map(i => ({ ...i }));

    function getAll({ category, workMode, applicantOrigin, search } = {}) {
        let results = [...INTERNSHIPS];

        if (category && category !== 'All') {
            results = results.filter(i => i.category && i.category.toLowerCase() === category.toLowerCase());
        }
        if (workMode && workMode !== 'All') {
            results = results.filter(i => i.workMode && i.workMode.toLowerCase().includes(workMode.toLowerCase()));
        }
        if (applicantOrigin === 'foreign') {
            results = results.filter(i =>
                (i.eligibleApplicants && i.eligibleApplicants.includes('Global')) ||
                (i.workMode && i.workMode.includes('Online'))
            );
        }
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(i =>
                (i.title && i.title.toLowerCase().includes(q)) ||
                (i.company && i.company.toLowerCase().includes(q)) ||
                (i.skills || []).some(s => s.toLowerCase().includes(q))
            );
        }
        return results;
    }

    function findById(id) {
        return INTERNSHIPS.find(i => i.id === Number(id)) || null;
    }

    function reserveSlot(id, quantity = 1) {
        const internship = INTERNSHIPS.find(i => i.id === Number(id));
        if (!internship) return { status: 404, body: { error: 'Internship not found' } };
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
            return { status: 400, body: { error: 'Quantity must be an integer between 1 and 10' } };
        }
        if (internship.available < quantity) {
            return { status: 409, body: { error: 'Not enough slots available', available: internship.available } };
        }
        internship.available -= quantity;
        return { status: 200, body: { success: true, internship, reserved: quantity, remaining: internship.available } };
    }

    function releaseSlot(id, quantity = 1) {
        const internship = INTERNSHIPS.find(i => i.id === Number(id));
        if (!internship) return { status: 404, body: { error: 'Internship not found' } };
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
            return { status: 400, body: { error: 'Quantity must be an integer between 1 and 10' } };
        }
        internship.available = Math.min(internship.capacity, internship.available + quantity);
        return { status: 200, body: { success: true, internship, released: quantity, remaining: internship.available } };
    }

    return { getAll, findById, reserveSlot, releaseSlot, _store: INTERNSHIPS };
}

// Seed data for tests
const SEED = [
    { id: 1, title: 'Backend Dev Intern', company: 'TechCorp', category: 'Backend', available: 5, capacity: 5, workMode: 'Online (Remote)', eligibleApplicants: 'Global (Foreign & Local)', skills: ['Node.js', 'PostgreSQL'], location: 'Colombo' },
    { id: 2, title: 'Frontend UX Intern', company: 'DesignCo', category: 'Frontend', available: 3, capacity: 3, workMode: 'Hybrid', eligibleApplicants: 'Local (Sri Lanka Only)', skills: ['React', 'Tailwind'], location: 'Colombo' },
    { id: 3, title: 'AI & ML Research Intern', company: 'DeepTech', category: 'AI/ML', available: 2, capacity: 4, workMode: 'Online (Remote)', eligibleApplicants: 'Global (Foreign & Local)', skills: ['Python', 'PyTorch'], location: 'Remote' },
    { id: 4, title: 'DevOps Engineer Intern', company: 'CloudBase', category: 'DevOps', available: 0, capacity: 2, workMode: 'Onsite', eligibleApplicants: 'Local (Sri Lanka Only)', skills: ['Kubernetes', 'Terraform'], location: 'Colombo' },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Event Service — List & Filter', () => {
    let store;
    beforeEach(() => { store = createInternshipStore(SEED); });

    test('getAll returns all internships with no filters', () => {
        expect(store.getAll()).toHaveLength(4);
    });

    test('filters by category (case-insensitive)', () => {
        const results = store.getAll({ category: 'backend' });
        expect(results).toHaveLength(1);
        expect(results[0].category).toBe('Backend');
    });

    test('filters by workMode (partial match, case-insensitive)', () => {
        const remote = store.getAll({ workMode: 'remote' });
        // Matches 'Online (Remote)'
        expect(remote.length).toBeGreaterThanOrEqual(2);
    });

    test('filters foreign-eligible internships', () => {
        const foreign = store.getAll({ applicantOrigin: 'foreign' });
        foreign.forEach(i => {
            const eligGlobal = i.eligibleApplicants && i.eligibleApplicants.includes('Global');
            const isOnline = i.workMode && i.workMode.includes('Online');
            expect(eligGlobal || isOnline).toBe(true);
        });
    });

    test('search by skill (case-insensitive)', () => {
        const results = store.getAll({ search: 'python' });
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results[0].skills).toContain('Python');
    });

    test('search by company name', () => {
        const results = store.getAll({ search: 'deeptech' });
        expect(results).toHaveLength(1);
        expect(results[0].company).toBe('DeepTech');
    });

    test('search with no matches returns empty array', () => {
        const results = store.getAll({ search: 'zzzunknownxxx' });
        expect(results).toHaveLength(0);
    });

    test('unknown category returns empty array', () => {
        const results = store.getAll({ category: 'Quantum Computing' });
        expect(results).toHaveLength(0);
    });

    test('category=All returns all internships', () => {
        expect(store.getAll({ category: 'All' })).toHaveLength(4);
    });
});

describe('Event Service — findById', () => {
    let store;
    beforeEach(() => { store = createInternshipStore(SEED); });

    test('returns internship for valid ID', () => {
        const result = store.findById(1);
        expect(result).not.toBeNull();
        expect(result.title).toBe('Backend Dev Intern');
    });

    test('returns null for non-existent ID', () => {
        expect(store.findById(9999)).toBeNull();
    });

    test('accepts numeric string ID', () => {
        expect(store.findById('2')).not.toBeNull();
    });
});

describe('Event Service — reserveSlot (Book)', () => {
    let store;
    beforeEach(() => { store = createInternshipStore(SEED); });

    test('decrements available count on successful reservation', () => {
        const before = store.findById(1).available; // 5
        const result = store.reserveSlot(1, 1);
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(store.findById(1).available).toBe(before - 1);
    });

    test('reserves multiple slots at once', () => {
        store.reserveSlot(1, 3);
        expect(store.findById(1).available).toBe(2);
    });

    test('returns 409 when not enough slots', () => {
        const result = store.reserveSlot(4, 1); // ID 4 has 0 available
        expect(result.status).toBe(409);
        expect(result.body.error).toMatch(/Not enough/);
        expect(result.body.available).toBe(0);
    });

    test('returns 404 for non-existent internship', () => {
        const result = store.reserveSlot(9999, 1);
        expect(result.status).toBe(404);
    });

    test('returns 400 for quantity = 0', () => {
        const result = store.reserveSlot(1, 0);
        expect(result.status).toBe(400);
    });

    test('returns 400 for quantity > 10', () => {
        const result = store.reserveSlot(1, 11);
        expect(result.status).toBe(400);
    });

    test('returns 400 for non-integer quantity', () => {
        const result = store.reserveSlot(1, 1.5);
        expect(result.status).toBe(400);
    });
});

describe('Event Service — releaseSlot (Saga Rollback)', () => {
    let store;
    beforeEach(() => { store = createInternshipStore(SEED); });

    test('increments available count after release', () => {
        store.reserveSlot(3, 1); // available: 2 → 1
        const result = store.releaseSlot(3, 1); // should go back to 2
        expect(result.status).toBe(200);
        expect(store.findById(3).available).toBe(2);
    });

    test('release does not exceed capacity', () => {
        // ID 1 is already at capacity (5/5)
        store.releaseSlot(1, 5);
        expect(store.findById(1).available).toBe(5); // capped at capacity
    });

    test('returns 404 for non-existent internship', () => {
        const result = store.releaseSlot(9999, 1);
        expect(result.status).toBe(404);
    });

    test('returns 400 for invalid quantity', () => {
        expect(store.releaseSlot(1, 0).status).toBe(400);
        expect(store.releaseSlot(1, 11).status).toBe(400);
    });

    test('reserve then release restores original availability', () => {
        const initial = store.findById(2).available; // 3
        store.reserveSlot(2, 2);
        expect(store.findById(2).available).toBe(1);
        store.releaseSlot(2, 2);
        expect(store.findById(2).available).toBe(initial);
    });
});
