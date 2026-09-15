# NexusEvent - Microservices Ticketing Platform

NexusEvent is a modern, distributed event management and ticketing platform built with a microservices architecture. This project is designed to demonstrate scalability, service isolation, and asynchronous communication.

## 🏗️ Architecture Overview

The system is divided into independent services that communicate over REST and Message Queues:

### 1. Backend Services
- **API Gateway**: Single entry point using Node.js/Express. Handles rate limiting and routing.
- **Auth Service**: Manages user authentication and authorization (JWT).
- **Event Service**: CRUD operations for events, venues, and categories.
- **Booking Service**: Manages the ticket reservation lifecycle and seat inventory.
- **Payment Service**: Processes transactions and manages payment status.
- **Notification Service**: Asynchronous service for sending Email/SMS updates.

### 2. Infrastructure
- **Database**: Each service has its own dedicated database (Database-per-service pattern).
- **Message Broker**: RabbitMQ or Redis for inter-service communication (e.g., notifying the Payment service after a booking).
- **Containerization**: Docker & Docker Compose for local development.

### 3. Frontend
- **Web Portal**: A premium, responsive dashboard built with React/Next.js for browsing and booking events.

## 🚀 Getting Started
1. Clone the repository.
2. From the repo root, install root support dependencies:

```bash
cd d:\Micro-servise
npm install
```

3. Start the full stack with Docker Compose:

```bash
docker compose -f infrastructure/docker-compose.yml up --build
```

4. Open the app in your browser:

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:8000`

5. To stop the stack:

```bash
docker compose -f infrastructure/docker-compose.yml down
```

### Optional: Start services locally without Docker
- API Gateway: `npm run start:gateway`
- Auth Service: `npm run start:auth`
- Event Service: `npm run start:events`
- Booking Service: `npm run start:bookings`
- Payment Service: `npm run start:payments`
- Notification Service: `npm run start:notifications`

## � Service URLs
When running the full stack with Docker Compose, the following services are available locally:

- `http://localhost:5173` — Frontend application
- `http://localhost:8000` — API Gateway
- `http://localhost:5001` — Auth Service
- `http://localhost:5002` — Event Service
- `http://localhost:5003` — Booking Service
- `http://localhost:5004` — Payment Service
- `http://localhost:5005` — Notification Service

Use the API Gateway endpoint for frontend calls and authentication flows.

## 🌐 1-Click Free Vercel Cloud Deployment

This monorepo is fully configured for **unified 100% free Vercel deployment** hosting both the React frontend and Serverless Express API.

### Deploying to Vercel:
1. Push this repository to GitHub (`https://github.com/Rukshan19-mr-png/Micro-service`).
2. Navigate to [vercel.com/new](https://vercel.com/new) and import `Rukshan19-mr-png/Micro-service`.
3. Set **Build Command**: `npm run build` and **Output Directory**: `frontend/dist`.
4. *(Optional Cloud Databases)*:
   - `MONGO_URI`: MongoDB Atlas free M0 cluster connection string.
   - `DB_HOST`: Neon.tech / Supabase PostgreSQL host.
5. Click **Deploy** to host both frontend and serverless API under a single `.vercel.app` domain.

## 🛠️ Tech Stack
- **Language**: JavaScript / Node.js
- **Framework**: Express.js, React, Vite, Tailwind CSS
- **Database**: MongoDB Atlas / Neon PostgreSQL
- **Deployment**: Vercel Serverless Functions & Static CDN
---
*Developed for Software Engineering Internship Portfolio*