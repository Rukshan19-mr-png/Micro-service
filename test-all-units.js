const axios = require('axios');
const assert = require('assert');

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';

async function runTestSuite() {
    console.log('=============== NEXUSEVENT ALL-UNITS TEST SUITE ===============');
    let testsPassed = 0;
    let testsFailed = 0;

    const logPass = (name) => {
        testsPassed++;
        console.log(`[PASS] ${name}`);
    };

    const logFail = (name, err) => {
        testsFailed++;
        console.error(`[FAIL] ${name}:`, err.response?.data || err.message);
    };

    // 1. Gateway Health Check
    try {
        console.log('\n--- 1. Testing API Gateway & Service Health ---');
        const healthRes = await axios.get(`${GATEWAY_URL}/health`);
        assert.strictEqual(healthRes.data.service, 'api-gateway');
        assert.ok(['ok', 'degraded'].includes(healthRes.data.status));
        logPass('API Gateway /health endpoint responds properly');
    } catch (err) {
        logFail('API Gateway /health check', err);
    }

    // 2. Auth Service Unit Tests
    let studentToken = null;
    let companyToken = null;
    const testStudentEmail = `student_${Date.now()}@test.com`;
    const testCompanyEmail = `company_${Date.now()}@test.com`;

    try {
        console.log('\n--- 2. Testing Auth Service Units ---');
        
        // Register Student
        const regStudent = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
            email: testStudentEmail,
            password: 'Password123!',
            role: 'student'
        });
        assert.strictEqual(regStudent.status, 201);
        assert.strictEqual(regStudent.data.user.role, 'student');
        logPass('Auth: Register new student account');

        // Register Company
        const regCompany = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
            email: testCompanyEmail,
            password: 'Password123!',
            role: 'company'
        });
        assert.strictEqual(regCompany.status, 201);
        assert.strictEqual(regCompany.data.user.role, 'company');
        logPass('Auth: Register new company account');

        // Duplicate Registration Test
        try {
            await axios.post(`${GATEWAY_URL}/api/auth/register`, {
                email: testStudentEmail,
                password: 'Password123!',
                role: 'student'
            });
            assert.fail('Should have rejected duplicate email');
        } catch (err) {
            assert.strictEqual(err.response?.status, 400);
            logPass('Auth: Reject duplicate registration email');
        }

        // Student Login
        const loginStudent = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
            email: testStudentEmail,
            password: 'Password123!'
        });
        assert.ok(loginStudent.data.token);
        studentToken = loginStudent.data.token;
        logPass('Auth: Student login & JWT token issuance');

        // Company Login
        const loginCompany = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
            email: testCompanyEmail,
            password: 'Password123!'
        });
        assert.ok(loginCompany.data.token);
        companyToken = loginCompany.data.token;
        logPass('Auth: Company login & JWT token issuance');

    } catch (err) {
        logFail('Auth service testing', err);
    }

    // 3. Internship Service Unit Tests
    try {
        console.log('\n--- 3. Testing Internship Service Units ---');
        
        // List internships
        const listRes = await axios.get(`${GATEWAY_URL}/api/internships`);
        assert.ok(Array.isArray(listRes.data));
        assert.ok(listRes.data.length > 0);
        logPass(`Internship Service: Fetched ${listRes.data.length} active listings`);

        // Filter by category
        const filterRes = await axios.get(`${GATEWAY_URL}/api/internships?category=Backend`);
        assert.ok(Array.isArray(filterRes.data));
        logPass('Internship Service: Filter listings by category');

        // Single internship view
        const itemRes = await axios.get(`${GATEWAY_URL}/api/internships/1`);
        assert.strictEqual(itemRes.data.id, 1);
        logPass('Internship Service: Retrieve single internship details (ID 1)');

        // Post new opportunity with Company Token
        const newPost = await axios.post(`${GATEWAY_URL}/api/internships`, {
            title: 'QA & Automation Engineer Intern',
            company: 'TestCorp SL',
            category: 'Testing',
            location: 'Colombo, Sri Lanka',
            capacity: 10,
            skills: ['Jest', 'Cypress', 'Playwright'],
            description: 'Automate microservice testing and end-to-end user workflows.'
        }, { headers: { authorization: `Bearer ${companyToken}` } });
        assert.strictEqual(newPost.status, 201);
        assert.ok(newPost.data.id);
        logPass('Internship Service: Company role posted new listing successfully');

        // Post attempt with Student Token (Role Guard Check)
        try {
            await axios.post(`${GATEWAY_URL}/api/internships`, {
                title: 'Unauth Post', company: 'Fake', category: 'Backend', location: 'None', description: 'Desc'
            }, { headers: { authorization: `Bearer ${studentToken}` } });
            assert.fail('Student should not be allowed to post internship');
        } catch (err) {
            assert.strictEqual(err.response?.status, 403);
            logPass('Role Guard: Student role correctly forbidden from posting internships');
        }

    } catch (err) {
        logFail('Internship service testing', err);
    }

    // 4. Booking & Application Service Unit Tests (Saga Flow)
    try {
        console.log('\n--- 4. Testing Application/Booking Service & Saga Flow ---');
        
        // Successful Student Application (Local Sri Lankan Candidate - Free)
        const applyLocalRes = await axios.post(`${GATEWAY_URL}/api/bookings`, {
            eventId: 1,
            quantity: 1,
            paymentDetails: { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' },
            applicant: {
                fullName: 'Local Sri Lankan Applicant',
                email: testStudentEmail,
                phone: '+94 77 123 4567',
                location: 'Colombo, Sri Lanka',
                skills: ['JavaScript', 'Node.js'],
                experience: 'Computer Science Undergraduate at University of Moratuwa',
                coverLetter: 'Passionate software engineering intern candidate.',
                cvName: 'Resume_Moratuwa.pdf',
                cvData: 'data:application/pdf;base64,mock'
            }
        }, { headers: { authorization: `Bearer ${studentToken}` } });

        assert.strictEqual(applyLocalRes.status, 201);
        assert.strictEqual(applyLocalRes.data.status, 'APPLIED');
        assert.strictEqual(applyLocalRes.data.totalAmount, 0); // Local FREE
        logPass('Application Service: Local Sri Lankan free application submission');

        // Successful Student Application (Foreign Candidate - $15 USD Fee)
        const applyForeignRes = await axios.post(`${GATEWAY_URL}/api/bookings`, {
            eventId: 2,
            quantity: 1,
            paymentDetails: { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' },
            applicant: {
                fullName: 'Foreign International Candidate',
                email: testStudentEmail,
                phone: '+1 (555) 987-6543',
                location: 'London, UK',
                skills: ['Python', 'Docker'],
                experience: 'Imperial College London CS graduate',
                coverLetter: 'Excited for global remote placement.',
                cvName: 'Resume_Imperial.pdf',
                cvData: 'data:application/pdf;base64,mock'
            }
        }, { headers: { authorization: `Bearer ${studentToken}` } });

        assert.strictEqual(applyForeignRes.status, 201);
        assert.strictEqual(applyForeignRes.data.totalAmount, 15); // Foreign $15
        logPass('Application Service: Foreign candidate application with $15 fee');

        // Company Attempting to Apply (Role Block Check)
        try {
            await axios.post(`${GATEWAY_URL}/api/bookings`, {
                eventId: 1,
                quantity: 1,
                applicant: { fullName: 'Company Account', email: testCompanyEmail, phone: '0771234567', location: 'SL', experience: 'exp', coverLetter: 'cl', cvName: 'cv' }
            }, { headers: { authorization: `Bearer ${companyToken}` } });
            assert.fail('Company should be blocked from applying');
        } catch (err) {
            assert.strictEqual(err.response?.status, 403);
            logPass('Role Guard: Company account correctly blocked from submitting applications');
        }

        // Saga Rollback Test (Payment Declined '0000')
        const preBookItem = await axios.get(`${GATEWAY_URL}/api/internships/3`);
        const initialSlots = preBookItem.data.available;

        try {
            await axios.post(`${GATEWAY_URL}/api/bookings`, {
                eventId: 3,
                quantity: 1,
                paymentDetails: { cardNumber: '4000000000000000', expiry: '12/28', cvv: '123' }, // Bank decline trigger
                applicant: {
                    fullName: 'Declined Payment Candidate',
                    email: testStudentEmail,
                    phone: '+15550000000', // Foreign candidate triggers payment
                    location: 'New York, USA',
                    skills: ['Java'],
                    experience: '3rd year student',
                    coverLetter: 'Hoping to get selected for AI workshop.',
                    cvName: 'cv.pdf'
                }
            }, { headers: { authorization: `Bearer ${studentToken}` } });
            assert.fail('Should fail due to declined payment');
        } catch (err) {
            const postBookItem = await axios.get(`${GATEWAY_URL}/api/internships/3`);
            assert.strictEqual(postBookItem.data.available, initialSlots);
            logPass('Saga Pattern: Reserved slot released after payment decline (Rollback Verified)');
        }

        // Fetch User Applications
        const myApps = await axios.get(`${GATEWAY_URL}/api/bookings`, { headers: { authorization: `Bearer ${studentToken}` } });
        assert.ok(Array.isArray(myApps.data));
        assert.ok(myApps.data.length >= 2);
        logPass(`Application Service: Retrieved ${myApps.data.length} applications for logged in student`);

    } catch (err) {
        logFail('Booking / Application service testing', err);
    }

    // 5. Notification Service Unit Tests
    try {
        console.log('\n--- 5. Testing Notification Service Units ---');
        const notifRes = await axios.get(`${GATEWAY_URL}/api/notifications`, { headers: { authorization: `Bearer ${studentToken}` } });
        assert.ok(Array.isArray(notifRes.data));
        assert.ok(notifRes.data.length > 0);
        logPass(`Notification Service: Retrieved ${notifRes.data.length} user notification messages`);
    } catch (err) {
        logFail('Notification service testing', err);
    }

    // 6. Analytics Service Unit Tests
    try {
        console.log('\n--- 6. Testing Analytics Service Units ---');
        const metricsRes = await axios.get(`${GATEWAY_URL}/api/metrics`);
        assert.ok(metricsRes.data.totalInternships > 0);
        assert.ok(metricsRes.data.activeCompanies > 0);
        assert.ok(metricsRes.data.totalApplications > 0);
        logPass(`Analytics Service: Aggregated platform metrics successfully (${metricsRes.data.totalInternships} internships, ${metricsRes.data.totalApplications} applications)`);
    } catch (err) {
        logFail('Analytics service testing', err);
    }

    console.log('\n================ TEST SUMMARY ================');
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log('==============================================');

    if (testsFailed > 0) {
        process.exit(1);
    }
}

runTestSuite();
