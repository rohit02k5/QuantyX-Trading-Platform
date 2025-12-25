# QuantyX — Real-Time Event-Driven Trading Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Architecture](https://img.shields.io/badge/architecture-event--driven-success.svg)
![Status](https://img.shields.io/badge/status-live-success.svg)

QuantyX is a real-time trading platform designed to simulate the architecture and performance characteristics of a modern crypto exchange.

Unlike traditional CRUD-based applications, QuantyX is built around an event-driven microservices architecture, decoupling order ingestion, execution, and real-time broadcasting to achieve low latency, horizontal scalability, and fault isolation.

This project was built to demonstrate distributed systems design, real-time data flow, and production deployment practices.

---

## Live Demo & Resources

| Component | URL | Status |
|---------|-----|--------|
| Frontend (Next.js) | https://quantyx-live.vercel.app | Live |
| API Gateway | https://quantyx-backend-production.up.railway.app | Live |
| WebSocket Event Stream | wss://quantyx-events-production.up.railway.app | Live |
| Demo Walkthrough Video | https://drive.google.com/file/d/1tYQqVc_MrsCb6G3iCqUtir8IwDKpFD7E/view | Available |

---

## Product Screenshots

<img width="791" height="887" src="https://github.com/user-attachments/assets/6d7bf4dc-38ec-4291-9bfa-ae389c6aed71" />
<img width="1291" height="710" src="https://github.com/user-attachments/assets/9ceb14a8-a7ec-41db-8bfb-bf12f7b162e6" />
<img width="1405" height="773" src="https://github.com/user-attachments/assets/d293bd51-5d1e-47f1-bbd3-1d7fb15704c6" />
<img width="1799" height="736" src="https://github.com/user-attachments/assets/5528ff50-9b37-4ff3-80c3-755ab26159dc" />
<img width="1919" height="878" src="https://github.com/user-attachments/assets/8020b816-f7af-4756-83c3-9796b87fb75c" />

---

## Why QuantyX Is Different

Most trading applications are simple REST APIs backed by a database.

QuantyX models how real exchanges operate:

- Non-blocking order submission  
- Asynchronous order execution  
- Real-time client updates via WebSockets  
- Clear separation of concerns across services  
- Message-driven processing using Redis  

This design allows the platform to handle request bursts, prevent API overload, scale execution independently, and deliver instant UI updates.

---

## Core Features

### Frontend — Professional Trading Terminal
- Next.js 14 (App Router) with TypeScript  
- TradingView Lightweight Charts with live Binance WebSocket feeds  
- Zero-refresh UI with real-time order and position updates  
- Zustand and React Query for predictable state and cache management  
- Glassmorphism-inspired dark UI with smooth micro-interactions  

### Backend — Event-Driven Microservices
- API Gateway for authentication, validation, and rate limiting  
- Execution Worker for order matching and balance updates  
- Event Service for real-time WebSocket broadcasting  
- Redis Pub/Sub as the messaging backbone  
- PostgreSQL with Prisma ORM for transactional consistency  

### Security and Reliability
- JWT-based authentication using HttpOnly cookies  
- Bcrypt password hashing  
- Proxy-aware rate limiting  
- Shared Zod schemas for strict request and response validation  
- Safe handling of Binance Testnet API keys  

---

## System Architecture

graph TD
Client[User Client]

sql
Copy code
subgraph Frontend
    UI[Trading UI]
    Charts[Live Charts]
end

subgraph Backend_Services
    API[API Gateway]
    Exec[Execution Worker]
    Events[Event Service]
end

subgraph Infrastructure
    Redis[(Redis Pub/Sub)]
    DB[(PostgreSQL)]
end

Client -->|REST| API
Client -->|WebSocket| Events

API -->|Publish Order| Redis
Redis -->|Consume Order| Exec

Exec -->|Write Trades| DB
Exec -->|Publish Result| Redis

Redis -->|Consume Result| Events
Events -->|Push Updates| Client
yaml
Copy code

### Execution Flow
1. User submits an order to the API Gateway.  
2. The API validates authentication and balance, then publishes the order to Redis.  
3. The Execution Worker consumes the order, executes trade logic, updates the database, and publishes the result.  
4. The Event Service consumes execution events and pushes real-time updates to the connected client.  

---

## Tech Stack

### Frontend
- Framework: Next.js 14  
- Language: TypeScript  
- Styling: Tailwind CSS  
- State Management: Zustand, React Query  
- Realtime Communication: Native WebSocket API  

### Backend
- Runtime: Node.js (Alpine Linux)  
- Framework: Express.js  
- Messaging: Redis Pub/Sub  
- Database: PostgreSQL  
- ORM: Prisma  
- Validation: Zod  

### Infrastructure
- Monorepo managed using NPM Workspaces  
- Docker with multi-stage builds  
- Frontend deployed on Vercel  
- Backend services deployed on Railway  

---

## Monorepo Structure

QuantyX
┣ apps
┃ ┣ backend
┃ ┣ execution-service
┃ ┣ event-service
┃ ┗ frontend
┣ packages
┃ ┣ database
┃ ┗ types
┣ Dockerfile
┗ package.json

yaml
Copy code

---

## Local Development

### Prerequisites
- Node.js 18 or higher  
- PostgreSQL  
- Redis  

### Installation
git clone https://github.com/rohit02k5/QuantyX-Trading-Platform.git
cd QuantyX-Trading-Platform
npm install

bash
Copy code

### Environment Configuration
Create a `.env` file in the root directory:
DATABASE_URL=postgresql://postgres:password@localhost:5432/quantyx
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret
PORT=3000

shell
Copy code

### Database Setup
npx prisma generate
npx prisma db push

shell
Copy code

### Running Locally
npm run dev

yaml
Copy code

---

## Deployment Overview

### Backend (Railway)
- Single repository deployed as multiple services  
- Shared Docker image with independent service entrypoints  
- Proxy-aware configuration for correct rate limiting  

### Frontend (Vercel)
- Root directory set to apps/frontend  
- Environment-based API and WebSocket URLs  
- SPA routing handled via platform rewrites  

---

## Engineering Highlights

- Strong type safety across frontend and backend via shared schemas  
- Fully non-blocking API layer using asynchronous execution  
- Redis-based message passing to isolate failures  
- Docker Alpine compatibility through Prisma binary target configuration  

---

## Author

Rohit  
B.Tech Electrical Engineering, IIT Bhilai  
