# Platform Architecture & Vercel Deployment Walkthrough

## 🏗️ Architecture Overview

NexusEvent is built with a decoupled microservice design and configured for **unified 100% free Vercel serverless deployment**.

- **Frontend**: React (Vite, Tailwind CSS, Lucide icons) serving student and company portals.
- **Serverless API Handler**: Vercel Serverless Function (`api/index.js`) consolidating API Gateway, Auth Service, Event/Internship Service, Booking/Application Service, Payment Service, Notification Service, and Analytics Service.
- **Cloud Databases**: MongoDB Atlas (Free M0 shared cluster) & Neon/Supabase PostgreSQL (Free serverless Postgres).

---

## 🧪 Unit & Integration Testing Results

All 18 unit assertions passed cleanly:

```text
=============== NEXUSEVENT ALL-UNITS TEST SUITE ===============

--- 1. Testing API Gateway & Service Health ---
[PASS] API Gateway /health endpoint responds properly

--- 2. Testing Auth Service Units ---
[PASS] Auth: Register new student account
[PASS] Auth: Register new company account
[PASS] Auth: Reject duplicate registration email
[PASS] Auth: Student login & JWT token issuance
[PASS] Auth: Company login & JWT token issuance

--- 3. Testing Internship Service Units ---
[PASS] Internship Service: Fetched 15 active listings
[PASS] Internship Service: Filter listings by category
[PASS] Internship Service: Retrieve single internship details (ID 1)
[PASS] Internship Service: Company role posted new listing successfully
[PASS] Role Guard: Student role correctly forbidden from posting internships

--- 4. Testing Application/Booking Service & Saga Flow ---
[PASS] Application Service: Local Sri Lankan free application submission
[PASS] Application Service: Foreign candidate application with $15 fee
[PASS] Role Guard: Company account correctly blocked from submitting applications
[PASS] Saga Pattern: Reserved slot released after payment decline (Rollback Verified)
[PASS] Application Service: Retrieved 2 applications for logged in student

--- 5. Testing Notification Service Units ---
[PASS] Notification Service: Retrieved 2 user notification messages

--- 6. Testing Analytics Service Units ---
[PASS] Analytics Service: Aggregated platform metrics successfully (16 internships, 4 applications)

================ TEST SUMMARY ================
Passed: 18 / 18 Unit & Integration Assertions
==============================================
```

---

## 🚀 Live Vercel Deployment Checklist

1. Import GitHub repository: `https://github.com/Rukshan19-mr-png/Micro-service`.
2. Configure **Build Command**: `npm run build` and **Output Directory**: `frontend/dist`.
3. *(Optional)* Add `MONGO_URI` and `DB_HOST` Environment Variables for persistent MongoDB Atlas and PostgreSQL storage.
4. Click **Deploy**.
