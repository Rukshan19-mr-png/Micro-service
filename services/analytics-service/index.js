const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5006;
const SERVICES = {
  internships: process.env.EVENT_SERVICE_URL || 'http://localhost:5002',
  applications: process.env.BOOKING_SERVICE_URL || 'http://localhost:5003',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005'
};

app.get('/health', (req, res) => {
  res.json({ service: 'analytics-service', status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  try {
    const [internshipsRes, applicationsRes, notificationsRes] = await Promise.all([
      axios.get(`${SERVICES.internships}/internships`),
      axios.get(`${SERVICES.applications}/bookings`),
      axios.get(`${SERVICES.notifications}/notifications`),
    ]);

    const internships = internshipsRes.data || [];
    const applications = applicationsRes.data || [];
    const notifications = notificationsRes.data || [];

    const totalInternships = internships.length;
    const openSlots = internships.reduce((sum, internship) => sum + (internship.available || 0), 0);
    const activeCompanies = new Set(internships.map((item) => item.company)).size;
    const totalStudents = new Set(applications.map((app) => app.userId)).size;

    res.json({
      totalInternships,
      openSlots,
      activeCompanies,
      totalApplications: applications.length,
      totalStudents,
      recentNotifications: notifications.slice(-5).reverse(),
    });
  } catch (err) {
    console.error('Error fetching analytics metrics:', err.message || err);
    res.status(502).json({ error: 'Unable to retrieve analytics metrics' });
  }
});

app.listen(PORT, () => console.log(`Analytics Service running on port ${PORT}`));
