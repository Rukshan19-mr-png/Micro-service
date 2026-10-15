const axios = require('axios');
const assert = require('assert');

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function waitForGateway() {
    console.log('⏳ Waiting for API Gateway to be ready...');
    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            const res = await axios.get(`${GATEWAY_URL}/health`, { timeout: 2000 });
            if (res.status === 200 || res.status === 503) {
                console.log(`✅ Gateway responded (attempt ${i})\n`);
                return true;
            }
        } catch {
            console.log(`   Attempt ${i}/${MAX_RETRIES} — gateway not ready, retrying in ${RETRY_DELAY_MS}ms...`);
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
    }
    throw new Error('API Gateway did not become ready in time. Please start all services first.');
}

async function runTestSuite() {
    console.log('=============== NEXUSEVENT ALL-UNITS TEST SUITE ===============');
    let testsPassed = 0;
    let testsFailed = 0;

    const logPass = (name) => {
        testsPassed++;
        console.log(`  ✅ [PASS] ${name}`);
    };

    const logFail = (name, err) => {
        testsFailed++;
        console.error(`  ❌ [FAIL] ${name}:`, err.response?.data || err.message);
    };

    // Wait for gateway before proceeding
    await waitForGateway();

    // ─── 1. Gateway Health Check ─────────────────────────────────────────────
    try {
        console.log('--- 1. Testing API Gateway & Service Health ---');
        const healthRes = await axios.get(`${GATEWAY_URL}/health`);
        assert.strictEqual(healthRes.data.service, 'api-gateway');
        assert.ok(['ok', 'degraded'].includes(healthRes.data.status));
        logPass('API Gateway /health endpoint responds properly');

        // Print individual service statuses
        if (healthRes.data.services) {
            Object.entries(healthRes.data.services).forEach(([name, info]) => {
                const icon = info.status === 'ok' ? '✅' : '⚠️ ';
                console.log(`     ${icon}  ${name}: ${info.status}`);
            });
        }
    } catch (err) {
        logFail('API Gateway /health check', err);
    }

    // ─── 2. Auth Service ─────────────────────────────────────────────────────
    let studentToken = null;
    let companyToken = null;
    const ts = Date.now();
    const testStudentEmail = `student_${ts}@test.com`;
    const testCompanyEmail = `company_${ts}@test.com`;

    try {
        console.log('\n--- 2. Testing Auth Service Units ---');

        // Register Student — role 'student' is accepted but normalized to 'candidate' by the service
        const regStudent = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
            email: testStudentEmail,
            password: 'Password123!',
            role: 'student'
        });
        assert.strictEqual(regStudent.status, 201);
        // Service normalizes 'student' → 'candidate'
        assert.strictEqual(regStudent.data.user.role, 'candidate');
        logPass('Auth: Register new student (candidate) account');

        // Register Company — company accounts require name, phone, and website
        const regCompany = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
            email: testCompanyEmail,
            password: 'Password123!',
            role: 'company',
            name: 'TestCorp Ltd',
            phone: '+94 11 234 5678',
            website: 'https://testcorp.example.com'
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

        // Invalid email format test
        try {
            await axios.post(`${GATEWAY_URL}/api/auth/register`, {
                email: 'not-an-email',
                password: 'Password123!',
                role: 'student'
            });
            assert.fail('Should have rejected invalid email');
        } catch (err) {
            assert.strictEqual(err.response?.status, 400);
            logPass('Auth: Reject invalid email format');
        }

        // Short password test
        try {
            await axios.post(`${GATEWAY_URL}/api/auth/register`, {
                email: `shortpwd_${ts}@test.com`,
                password: '123',
                role: 'student'
            });
            assert.fail('Should have rejected short password');
        } catch (err) {
            assert.strictEqual(err.response?.status, 400);
            logPass('Auth: Reject password shorter than 8 characters');
        }

        // Company missing required fields
        try {
            await axios.post(`${GATEWAY_URL}/api/auth/register`, {
                email: `incomplete_company_${ts}@test.com`,
                password: 'Password123!',
                role: 'company'
                // Missing name, phone, website
            });
            assert.fail('Should have rejected incomplete company registration');
        } catch (err) {
            assert.strictEqual(err.response?.status, 400);
            logPass('Auth: Reject company registration missing required fields');
        }

        // Student Login
        const loginStudent = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
            email: testStudentEmail,
            password: 'Password123!'
        });
        assert.ok(loginStudent.data.token);
        assert.ok(loginStudent.data.user);
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

        // Wrong password test
        try {
            await axios.post(`${GATEWAY_URL}/api/auth/login`, {
                email: testStudentEmail,
                password: 'WrongPassword!'
            });
            assert.fail('Should have rejected wrong password');
        } catch (err) {
            assert.strictEqual(err.response?.status, 401);
            logPass('Auth: Reject login with wrong password');
        }

    } catch (err) {
        logFail('Auth service testing', err);
    }

    // ─── 3. Internship (Event) Service ───────────────────────────────────────
    let newInternshipId = null;

    try {
        console.log('\n--- 3. Testing Internship Service Units ---');

        // List all internships
        const listRes = await axios.get(`${GATEWAY_URL}/api/internships`);
        assert.ok(Array.isArray(listRes.data));
        assert.ok(listRes.data.length > 0);
        logPass(`Internship Service: Fetched ${listRes.data.length} active listings`);

        // Filter by category
        const filterRes = await axios.get(`${GATEWAY_URL}/api/internships?category=Backend`);
        assert.ok(Array.isArray(filterRes.data));
        assert.ok(filterRes.data.length > 0);
        assert.ok(filterRes.data.every(i => i.category.toLowerCase() === 'backend'));
        logPass(`Internship Service: Filter by category=Backend (${filterRes.data.length} results)`);

        // Filter by category with no results
        const emptyFilterRes = await axios.get(`${GATEWAY_URL}/api/internships?category=Nonexistent`);
        assert.ok(Array.isArray(emptyFilterRes.data));
        assert.strictEqual(emptyFilterRes.data.length, 0);
        logPass('Internship Service: Filter by unknown category returns empty array');

        // Search filter
        const searchRes = await axios.get(`${GATEWAY_URL}/api/internships?search=python`);
        assert.ok(Array.isArray(searchRes.data));
        logPass(`Internship Service: Search for "python" (${searchRes.data.length} results)`);

        // Single internship view
        const itemRes = await axios.get(`${GATEWAY_URL}/api/internships/1`);
        assert.strictEqual(itemRes.data.id, 1);
        assert.ok(itemRes.data.title);
        assert.ok(itemRes.data.company);
        logPass('Internship Service: Retrieve single internship details (ID 1)');

        // Non-existent internship returns 404
        try {
            await axios.get(`${GATEWAY_URL}/api/internships/99999`);
            assert.fail('Should have returned 404 for non-existent internship');
        } catch (err) {
            assert.strictEqual(err.response?.status, 404);
            logPass('Internship Service: Returns 404 for non-existent internship');
        }

        // Post new opportunity — requires company role + full company profile in JWT
        if (companyToken) {
            const newPost = await axios.post(`${GATEWAY_URL}/api/internships`, {
                title: 'QA & Automation Engineer Intern',
                category: 'Testing',
                location: 'Colombo, Sri Lanka',
                capacity: 10,
                skills: ['Jest', 'Cypress', 'Playwright'],
                description: 'Automate microservice testing and end-to-end user workflows.'
            }, { headers: { authorization: `Bearer ${companyToken}` } });
            assert.strictEqual(newPost.status, 201);
            assert.ok(newPost.data.id);
            newInternshipId = newPost.data.id;
            logPass(`Internship Service: Company posted new listing (ID: ${newInternshipId})`);
        } else {
            console.log('     ⚠️  Skipping company post test (no company token — auth failed earlier)');
        }

        // Post attempt with Student Token (Role Guard Check)
        if (studentToken) {
            try {
                await axios.post(`${GATEWAY_URL}/api/internships`, {
                    title: 'Unauth Post', category: 'Backend', location: 'None', description: 'Desc'
                }, { headers: { authorization: `Bearer ${studentToken}` } });
                assert.fail('Student should not be allowed to post internship');
            } catch (err) {
                assert.strictEqual(err.response?.status, 403);
                logPass('Role Guard: Student role correctly forbidden from posting internships');
            }
        }

    } catch (err) {
        logFail('Internship service testing', err);
    }

    // ─── 4. Booking / Application Service (Saga Flow) ────────────────────────
    try {
        console.log('\n--- 4. Testing Application/Booking Service & Saga Flow ---');

        if (!studentToken) {
            console.log('     ⚠️  Skipping booking tests (no student token — auth failed earlier)');
        } else {
            // Successful Student Application (Local Sri Lankan Candidate — Free)
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
            assert.strictEqual(applyLocalRes.data.totalAmount, 0); // Local = FREE
            logPass('Application Service: Local Sri Lankan free application (amount=0)');

            // Successful Student Application (Foreign Candidate — $15 USD Fee)
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
            assert.strictEqual(applyForeignRes.data.totalAmount, 15); // Foreign = $15
            logPass('Application Service: Foreign candidate application with $15 fee applied');

            // Missing applicant fields test
            try {
                await axios.post(`${GATEWAY_URL}/api/bookings`, {
                    eventId: 3,
                    quantity: 1,
                    applicant: { fullName: 'Incomplete' }
                }, { headers: { authorization: `Bearer ${studentToken}` } });
                assert.fail('Should have rejected incomplete applicant details');
            } catch (err) {
                assert.strictEqual(err.response?.status, 400);
                logPass('Application Service: Reject submission with missing applicant fields');
            }

            // Company Attempting to Apply (Role Block Check)
            if (companyToken) {
                try {
                    await axios.post(`${GATEWAY_URL}/api/bookings`, {
                        eventId: 1,
                        quantity: 1,
                        applicant: {
                            fullName: 'Company Account',
                            email: testCompanyEmail,
                            phone: '0771234567',
                            location: 'SL',
                            experience: 'exp',
                            coverLetter: 'cl',
                            cvName: 'cv.pdf'
                        }
                    }, { headers: { authorization: `Bearer ${companyToken}` } });
                    assert.fail('Company should be blocked from applying');
                } catch (err) {
                    assert.strictEqual(err.response?.status, 403);
                    logPass('Role Guard: Company account correctly blocked from submitting applications');
                }
            }

            // Saga Rollback Test (Payment Declined — card ending 0000)
            const preBookItem = await axios.get(`${GATEWAY_URL}/api/internships/3`);
            const initialSlots = preBookItem.data.available;

            try {
                await axios.post(`${GATEWAY_URL}/api/bookings`, {
                    eventId: 3,
                    quantity: 1,
                    paymentDetails: { cardNumber: '4000000000000000', expiry: '12/28', cvv: '123' },
                    applicant: {
                        fullName: 'Declined Payment Candidate',
                        email: testStudentEmail,
                        phone: '+15550000000',
                        location: 'New York, USA',
                        skills: ['Java'],
                        experience: '3rd year student',
                        coverLetter: 'Hoping to get selected for AI workshop.',
                        cvName: 'cv.pdf'
                    }
                }, { headers: { authorization: `Bearer ${studentToken}` } });
                assert.fail('Should fail due to declined payment');
            } catch (err) {
                // Give rollback time to complete
                await new Promise(r => setTimeout(r, 300));
                const postBookItem = await axios.get(`${GATEWAY_URL}/api/internships/3`);
                assert.strictEqual(postBookItem.data.available, initialSlots,
                    `Slot was not rolled back! Before: ${initialSlots}, After: ${postBookItem.data.available}`);
                logPass('Saga Pattern: Reserved slot released after payment decline (Rollback Verified)');
            }

            // Unauthenticated application attempt
            try {
                await axios.post(`${GATEWAY_URL}/api/bookings`, {
                    eventId: 1,
                    quantity: 1,
                    applicant: { fullName: 'No Auth', email: 'x@x.com', phone: '0771234567', location: 'SL', experience: 'exp', coverLetter: 'cl', cvName: 'cv.pdf' }
                });
                assert.fail('Should have rejected unauthenticated request');
            } catch (err) {
                assert.strictEqual(err.response?.status, 401);
                logPass('Application Service: Reject unauthenticated application attempt');
            }

            // Fetch User Applications
            const myApps = await axios.get(`${GATEWAY_URL}/api/bookings`, {
                headers: { authorization: `Bearer ${studentToken}` }
            });
            assert.ok(Array.isArray(myApps.data));
            assert.ok(myApps.data.length >= 2);
            logPass(`Application Service: Retrieved ${myApps.data.length} applications for logged-in student`);
        }

    } catch (err) {
        logFail('Booking / Application service testing', err);
    }

    // ─── 5. Notification Service ──────────────────────────────────────────────
    try {
        console.log('\n--- 5. Testing Notification Service Units ---');
        if (!studentToken) {
            console.log('     ⚠️  Skipping — no student token');
        } else {
            const notifRes = await axios.get(`${GATEWAY_URL}/api/notifications`, {
                headers: { authorization: `Bearer ${studentToken}` }
            });
            assert.ok(Array.isArray(notifRes.data));
            // Notifications may be empty if booking tests were skipped
            logPass(`Notification Service: Retrieved ${notifRes.data.length} notification(s) for user`);
        }
    } catch (err) {
        logFail('Notification service testing', err);
    }

    // ─── 6. Analytics Service ────────────────────────────────────────────────
    try {
        console.log('\n--- 6. Testing Analytics Service Units ---');
        const metricsRes = await axios.get(`${GATEWAY_URL}/api/metrics`);
        assert.ok(typeof metricsRes.data.totalInternships === 'number');
        assert.ok(typeof metricsRes.data.activeCompanies === 'number');
        assert.ok(typeof metricsRes.data.totalApplications === 'number');
        assert.ok(typeof metricsRes.data.openSlots === 'number');
        assert.ok(metricsRes.data.totalInternships > 0, 'Expected at least 1 internship in analytics');
        assert.ok(metricsRes.data.activeCompanies > 0, 'Expected at least 1 active company in analytics');
        // totalApplications may be 0 if booking tests are run fresh, so just check it's a number
        logPass(`Analytics Service: Metrics — ${metricsRes.data.totalInternships} internships, ${metricsRes.data.activeCompanies} companies, ${metricsRes.data.totalApplications} applications`);
    } catch (err) {
        logFail('Analytics service testing', err);
    }

    // ─── Summary ─────────────────────────────────────────────────────────────
    console.log('\n================ TEST SUMMARY ================');
    console.log(`  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);
    console.log('==============================================');

    if (testsFailed > 0) {
        process.exit(1);
    }
}

runTestSuite().catch(err => {
    console.error('\n🚨 Test suite crashed:', err.message);
    process.exit(1);
});
