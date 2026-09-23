# Circuit Breaker — Cloud-Native E-Commerce API Gateway

> **Axlero Solutions — Advanced Full-Stack Java Engineering (Project 3)**  
> A production-grade, fault-tolerant microservices system built with Spring Boot, Spring Cloud Gateway, Resilience4j, Netflix Eureka, Micrometer Tracing with Zipkin, and a real-time React monitoring dashboard.

---

## Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   React Dashboard (5173)    │
                          └──────────────┬──────────────┘
                                         │ HTTP
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          API Gateway (8080)           │
                     │  • Resilience4j Circuit Breakers      │
                     │  • Rate Limiting (100 req/s)          │
                     │  • Bulkhead Concurrency Guards        │
                     │  • Distributed Tracing Header Baggage │
                     └───────┬───────────┬───────────┬───────┘
                             │           │           │
                 ┌───────────┘           │           └───────────┐
                 ▼                       ▼                       ▼
      ┌────────────────────┐  ┌────────────────────┐  ┌─────────────────────┐
      │  Product Service   │  │ Inventory Service  │  │Recommendation Service│
      │       (8081)       │  │       (8082)       │  │       (8083)        │
      │  [Rate Limited]    │  │ [Bulkhead Guarded] │  │  [CB + Fallback]    │
      └─────────┬──────────┘  └─────────┬──────────┘  └──────────┬──────────┘
                │                       │                        │
                └───────────────────────┼────────────────────────┘
                                        │ Register & Discover
                                        ▼
                            ┌───────────────────────┐
                            │ Eureka Server (8761)  │
                            └───────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              ┌─────────────────────┐       ┌─────────────────────┐
              │    MySQL (3306)     │       │    Zipkin (9411)    │
              │  (inventory_db &    │       │ (Distributed Trace  │
              │ recommendation_db)  │       │     Collector)      │
              └─────────────────────┘       └─────────────────────┘
```

---

## Real-World Use Case

During peak traffic events (such as **Black Friday**), downstream non-critical services (like the **Recommendation Engine**) can become overwhelmed and start timing out. Without resilience patterns, slow requests consume connection threads, leading to catastrophic cascading failures across the entire system.

Using **Spring Cloud Gateway** and **Resilience4j**:
- **Circuit Breaker (`recommendationCB`)**: Monitors timeout and error thresholds.
- **Fail-Fast & Fallbacks**: When timeouts breach the 50% failure rate, the breaker **opens**, failing requests instantly and returning a cached fallback response (`/fallback/recommendations`).
- **Core Site Performance**: Critical transactional services (**Product** and **Inventory**) stay fast, protected by **Rate Limiters** and **Bulkheads**.
- **Self-Healing Recovery**: After 10 seconds, the breaker enters **`HALF_OPEN`**, probes incoming traffic, and automatically returns to **`CLOSED`** upon service recovery.

---

## Microservice Modules & Ports

| Module | Location / Branch | Port | Database | Resilience & Observability |
| :--- | :--- | :---: | :--- | :--- |
| **Eureka Server** | `Eureka-server/` | `8761` | — | Service Registry & Discovery |
| **API Gateway** | `api-Gateway/` | `8080` | — | Resilience4j CB, Rate Limiter, Bulkhead, Micrometer Tracing |
| **Product Service** | `product-service/` | `8081` | H2 (in-memory) | Rate Limited Route, Micrometer Tracing, Actuator |
| **Inventory Service** | `inventory-service/` | `8082` | MySQL / H2 | Bulkhead Route, Micrometer Tracing, Zipkin |
| **Recommendation Service** | `.` (Root project) | `8083` | MySQL / H2 | Circuit Breaker Protected, Chaos Latency Endpoint |
| **React Dashboard** | `circuitbreaker-ui/` | `5173` | — | Vite + React, Real-time state badges, Chaos trigger |
| **Zipkin** | Docker container | `9411` | In-memory | Distributed Request Tracing (`/api/v2/spans`) |

---

## Prerequisites

- **Java 21+** (or Java 25)
- **Maven 3.9+** (or use included `mvnw.cmd` / `./mvnw`)
- **Node.js 20+** & **npm**
- **Docker** (for MySQL & Zipkin) OR local MySQL 8 install

---

## Quick Start Guide

### 1. Start Infrastructure (MySQL & Zipkin)

```bash
docker compose up -d
```
> Starts MySQL on port `3306` (with `inventory_db` and `recommendation_db`) and Zipkin on port `9411`.  
> *(If not using Docker, all Spring microservices automatically fall back to embedded H2 database).*

---

### 2. Start Eureka Server (Port 8761)

```bash
cd Eureka-server
.\mvnw.cmd spring-boot:run
```
Open [http://localhost:8761](http://localhost:8761) — wait for the Eureka dashboard to initialize.

---

### 3. Start Product Service (Port 8081)

```bash
cd product-service
.\mvnw.cmd spring-boot:run
```

---

### 4. Start Inventory Service (Port 8082)

```bash
cd inventory-service
.\mvnw.cmd spring-boot:run
```

---

### 5. Start Recommendation Service (Port 8083)

```bash
# In the workspace root folder:
.\mvnw.cmd spring-boot:run
```

---

### 6. Start API Gateway (Port 8080)

```bash
cd api-Gateway
.\mvnw.cmd spring-boot:run
```

---

### 7. Start React Monitoring Dashboard (Port 5173)

```bash
cd circuitbreaker-ui
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Testing & Verifying the Circuit Breaker

1. Open the React dashboard at [http://localhost:5173](http://localhost:5173).
2. All services will show **Health: UP** and the Recommendation Service Circuit Breaker badge will display **CLOSED** (Green).
3. Click the **"Trigger Latency (Chaos Test)"** button on the **Recommendation Service** card:
   - **Step 1 (`CLOSED` ➔ `OPEN`)**: Gateway injects delay, times out after 2s, and trips the circuit breaker to **`OPEN` (Red)**.
   - **Step 2 (Instant Fallback)**: The **Fallback Panel** immediately appears, rendering cached fallback data without server timeouts or thread blocking.
   - **Step 3 (`OPEN` ➔ `HALF_OPEN`)**: After the 10-second wait window (`wait-duration-in-open-state=10s`), the breaker automatically transitions to **`HALF_OPEN` (Amber)**.
   - **Step 4 (`HALF_OPEN` ➔ `CLOSED`)**: The system sends trial probe requests. Since normal service has resumed, it self-heals back to **`CLOSED` (Green)**.
4. Throughout the test, notice that **Product Service** and **Inventory Service** remain completely fast and unaffected.

---

## Key Actuator & Gateway Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `http://localhost:8761` | `GET` | Eureka Server Discovery Dashboard |
| `http://localhost:8080/actuator/health` | `GET` | Aggregated microservice health via Gateway |
| `http://localhost:8080/actuator/circuitbreakers` | `GET` | Live Resilience4j Circuit Breaker states (`recommendationCB`) |
| `http://localhost:8080/actuator/ratelimiters` | `GET` | Resilience4j Rate Limiter metrics and configurations |
| `http://localhost:8080/actuator/bulkheads` | `GET` | Resilience4j Bulkhead concurrent call metrics |
| `http://localhost:8080/products` | `GET` | Products routed via Gateway to Product Service |
| `http://localhost:8080/inventory/1` | `GET` | Inventory routed via Gateway to Inventory Service |
| `http://localhost:8080/api/recommendations` | `GET` | Recommendations routed via Gateway (CB protected) |
| `http://localhost:8080/chaos/latency/recommendation-service` | `POST` | Injects latency to test Circuit Breaker trip & recovery |
| `http://localhost:9411` | `GET` | Zipkin UI for Distributed Request Tracing |

---

## Project Specification Alignment (Axlero)

- **Week 1**: 3 Spring Boot microservices (`Product`, `Inventory`, `Recommendation`) + Eureka Service Registry + Spring Cloud Gateway routing.
- **Week 2**: Resilience4j Circuit Breaker with timeout and fallback on Recommendation Service + React monitoring UI.
- **Mid-Project Review**: Routing audit and chaos simulation with fallback data.
- **Week 3**: Advanced Resilience (**Rate Limiting** to prevent scraping/DDoS and **Bulkheads** for thread pool isolation) + State Visualization in React.
- **Week 4**: **Distributed Tracing** (Micrometer Tracing + Zipkin) across all services + UI "Trigger Latency" chaos testing.

---

## Team Responsibilities

- **Member 1 (Vaibhav)** — Product Service
- **Member 2 (Charu)** — Inventory Service
- **Member 3 (Arpitha)** — Recommendation Service
- **Member 4 (Uday)** — API Gateway & Resilience4j
- **Member 5 (Shreyash)** — Frontend Monitoring Dashboard & Full Integration
