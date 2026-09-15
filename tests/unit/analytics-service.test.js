/**
 * Unit Tests — Analytics Service
 * Tests aggregation logic with mocked downstream service calls.
 */

jest.mock('axios');
const axios = require('axios');

// ─── Analytics aggregation logic (extracted from analytics-service) ───────────

async function fetchMetrics(SERVICES) {
    const [internshipsRes, applicationsRes, notificationsRes] = await Promise.all([
        axios.get(`${SERVICES.internships}/internships`),
        axios.get(`${SERVICES.applications}/bookings`),
        axios.get(`${SERVICES.notifications}/notifications`),
    ]);

    const internships = internshipsRes.data || [];
    const applications = applicationsRes.data || [];
    const notifications = notificationsRes.data || [];

    const totalInternships = internships.length;
    const openSlots = internships.reduce((sum, i) => sum + (i.available || 0), 0);
    const activeCompanies = new Set(internships.map(i => i.company)).size;
    const totalStudents = new Set(applications.map(a => a.userId)).size;

    return {
        totalInternships,
        openSlots,
        activeCompanies,
        totalApplications: applications.length,
        totalStudents,
        recentNotifications: notifications.slice(-5).reverse()
    };
}

const SERVICES = {
    internships: 'http://localhost:5002',
    applications: 'http://localhost:5003',
    notifications: 'http://localhost:5005'
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Analytics Service — fetchMetrics', () => {
    beforeEach(() => jest.clearAllMocks());

    const mockInternships = [
        { id: 1, company: 'WSO2', available: 5, capacity: 8 },
        { id: 2, company: 'Virtusa', available: 3, capacity: 5 },
        { id: 3, company: 'WSO2', available: 0, capacity: 3 },  // Same company, 0 slots
        { id: 4, company: 'Dialog', available: 10, capacity: 10 },
    ];

    const mockApplications = [
        { id: 1, userId: 'u1', eventId: 1 },
        { id: 2, userId: 'u2', eventId: 2 },
        { id: 3, userId: 'u1', eventId: 3 },  // u1 applied to two internships
    ];

    const mockNotifications = [
        { id: 1, userId: 'u1', message: 'N1' },
        { id: 2, userId: 'u2', message: 'N2' },
        { id: 3, userId: 'u1', message: 'N3' },
        { id: 4, userId: 'u3', message: 'N4' },
        { id: 5, userId: 'u2', message: 'N5' },
        { id: 6, userId: 'u4', message: 'N6' },
    ];

    test('correctly counts total internships', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockInternships })
            .mockResolvedValueOnce({ data: mockApplications })
            .mockResolvedValueOnce({ data: mockNotifications });

        const metrics = await fetchMetrics(SERVICES);
        expect(metrics.totalInternships).toBe(4);
    });

    test('sums open slots across all internships', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockInternships })
            .mockResolvedValueOnce({ data: mockApplications })
            .mockResolvedValueOnce({ data: mockNotifications });

        const metrics = await fetchMetrics(SERVICES);
        // 5 + 3 + 0 + 10 = 18
        expect(metrics.openSlots).toBe(18);
    });

    test('deduplicates companies for activeCompanies count', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockInternships })
            .mockResolvedValueOnce({ data: mockApplications })
            .mockResolvedValueOnce({ data: mockNotifications });

        const metrics = await fetchMetrics(SERVICES);
        // WSO2, Virtusa, Dialog = 3 unique companies
        expect(metrics.activeCompanies).toBe(3);
    });

    test('counts total applications', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockInternships })
            .mockResolvedValueOnce({ data: mockApplications })
            .mockResolvedValueOnce({ data: mockNotifications });

        const metrics = await fetchMetrics(SERVICES);
        expect(metrics.totalApplications).toBe(3);
    });

    test('deduplicates user IDs for totalStudents count', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockInternships })
            .mockResolvedValueOnce({ data: mockApplications })
            .mockResolvedValueOnce({ data: mockNotifications });

        const metrics = await fetchMetrics(SERVICES);
        // u1, u2 = 2 unique students
        expect(metrics.totalStudents).toBe(2);
    });

    test('returns the last 5 notifications in reverse order (most recent first)', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockInternships })
            .mockResolvedValueOnce({ data: mockApplications })
            .mockResolvedValueOnce({ data: mockNotifications });

        const metrics = await fetchMetrics(SERVICES);
        expect(metrics.recentNotifications).toHaveLength(5);
        // slice(-5) then reverse = [N6, N5, N4, N3, N2] by message
        expect(metrics.recentNotifications[0].message).toBe('N6');
        expect(metrics.recentNotifications[4].message).toBe('N2');
    });

    test('handles empty datasets (no internships or applications)', async () => {
        axios.get
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const metrics = await fetchMetrics(SERVICES);
        expect(metrics.totalInternships).toBe(0);
        expect(metrics.openSlots).toBe(0);
        expect(metrics.activeCompanies).toBe(0);
        expect(metrics.totalApplications).toBe(0);
        expect(metrics.totalStudents).toBe(0);
        expect(metrics.recentNotifications).toHaveLength(0);
    });

    test('handles missing available field gracefully (defaults to 0)', async () => {
        axios.get
            .mockResolvedValueOnce({ data: [{ id: 1, company: 'Co', capacity: 5 }] }) // no 'available' field
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const metrics = await fetchMetrics(SERVICES);
        expect(metrics.openSlots).toBe(0);
    });

    test('propagates error when downstream service fails', async () => {
        axios.get.mockRejectedValue(new Error('Connection refused'));
        await expect(fetchMetrics(SERVICES)).rejects.toThrow('Connection refused');
    });
});
