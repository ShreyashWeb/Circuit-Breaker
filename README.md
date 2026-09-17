# Circuit Breaker — Full Stack Integration

> A complete microservices demo system built with Spring Boot, Spring Cloud Gateway, Resilience4j, Netflix Eureka, and a React monitoring dashboard.

---

## Architecture

```
React Dashboard (5173)
        |
   API Gateway (8080)  ←── Resilience4j Circuit Breaker
   /        |        \
Product  Inventory  Recommendation
(8081)   (8082)      (8083)
   \        |        /
      Eureka Server (8761)
           |
         MySQL (3306)
```

---

## Modules

| Module | Branch | Port | Database |
| :--- | :--- | :--- | :--- |
| Eureka Server | `eureka-server` | `8761` | — |
| API Gateway | `gateway-resilience-(-Uday-)` | `8080` | — |
| Product Service | `product-service-(-vaibhav)` | `8081` | H2 (in-memory) |
| Inventory Service | `inventory-service-(-Charu-)` | `8082` | MySQL (`inventory_db`) |
| Recommendation Service | `recommendation-service-(-Arpitha-)` | `8083` | MySQL (`recommendation_db`) |
| React Dashboard | `frontend-monitoring-(-Shreyash-)` | `5173` | — |

---

## Prerequisites

- **Java 21+** and **Maven**
- **Node.js 20+** and **npm**
- **Docker** (for MySQL — easiest option) OR a local MySQL 8 install

---

## Quick Start

### 1. Start MySQL (via Docker)

```bash
docker compose up -d
```

This creates both `inventory_db` and `recommendation_db` automatically.

> **No Docker?** Create the databases manually in your local MySQL:
> ```sql
> CREATE DATABASE inventory_db;
> CREATE DATABASE recommendation_db;
> ```
> Default credentials: `root` / `root`

---

### 2. Start Eureka Server

```bash
cd Eureka-server
./mvnw spring-boot:run
```

Open [http://localhost:8761](http://localhost:8761) — wait until the dashboard is up before starting other services.

---

### 3. Start Product Service

```bash
cd product-service
./mvnw spring-boot:run
```

Uses H2 in-memory DB — no setup needed. Runs on port `8081`.

---

### 4. Start Inventory Service

```bash
cd inventory-service
./mvnw spring-boot:run
```

Connects to MySQL `inventory_db` on port `8082`.

---

### 5. Start Recommendation Service

```bash
cd recommendation-service
./mvnw spring-boot:run
```

Connects to MySQL `recommendation_db` on port `8083`.

---

### 6. Start API Gateway

```bash
cd api-Gateway
./mvnw spring-boot:run
```

Runs on port `8080`. All requests to microservices should go through this gateway.

---

### 7. Start React Dashboard

```bash
cd circuitbreaker-ui
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Testing the Circuit Breaker

1. Open the React dashboard at `http://localhost:5173`
2. All services should show **CLOSED** (green) — normal operation
3. Click **Trigger Latency** on the **Recommendation Service** card
4. Watch the circuit breaker transition: `CLOSED` → `OPEN` (red) → fallback activates
5. After ~10 seconds, it transitions to `HALF_OPEN` (amber) → probes → back to `CLOSED`

---

## Key Endpoints

| Endpoint | Purpose |
| :--- | :--- |
| `GET http://localhost:8761` | Eureka dashboard — see registered services |
| `GET http://localhost:8080/actuator/health` | Aggregated health of all services |
| `GET http://localhost:8080/actuator/circuitbreakers` | Live circuit breaker states |
| `GET http://localhost:8080/products` | Product Service via Gateway |
| `GET http://localhost:8080/inventory` | Inventory Service via Gateway |
| `GET http://localhost:8080/api/recommendations` | Recommendation Service via Gateway |
| `POST http://localhost:8080/chaos/latency/recommendation-service` | Inject latency for chaos testing |

---

## Team

| Member | Module |
| :--- | :--- |
| Vaibhav | Product Service |
| Charu | Inventory Service |
| Arpitha | Recommendation Service |
| Uday | API Gateway + Resilience4j |
| Shreyash | React Dashboard |
