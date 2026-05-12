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
2. Navigate to each service in `/services` and run `npm install`.
3. Use Docker Compose (in `/infrastructure`) to spin up the entire environment.

## 🛠️ Tech Stack
- **Language**: JavaScript / Node.js
- **Framework**: Express.js
- **Database**: MongoDB / PostgreSQL
- **Communication**: REST, RabbitMQ
- **Styling**: Vanilla CSS / Tailwind
