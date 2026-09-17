# Circuit Breaker Monitoring Dashboard

> A real-time, dark-mode React dashboard for visualizing microservice resilience patterns powered by **Spring Cloud Gateway**, **Resilience4j**, and **Netflix Eureka**.

---

## Table of Contents

- [Overview](#overview)
- [Live Deployment](#live-deployment)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Component Reference](#component-reference)
- [API Endpoints](#api-endpoints)
- [Circuit Breaker States](#circuit-breaker-states)
- [Simulation Mode](#simulation-mode)

---

## Overview

The Circuit Breaker Dashboard provides live observability into a fleet of Spring Boot microservices. It polls the API Gateway every **3 seconds** to surface:

- Per-service health status and circuit breaker state (`CLOSED` / `OPEN` / `HALF_OPEN`)
- Live latency trend charts (last 20 readings per service)
- Fallback UI activation when a circuit trips open
- A chronological state-transition history log with localStorage persistence
- On-demand **latency injection** for chaos engineering demos

---

## Live Deployment

| Service | URL |
| :--- | :--- |
| **Eureka Dashboard** | [https://circuit-breaker-s6d7.onrender.com](https://circuit-breaker-s6d7.onrender.com) |
| **Eureka Service URL** | `https://circuit-breaker-s6d7.onrender.com/eureka/` |

To register a Spring Boot microservice with the hosted registry, add the following to its `application.properties`:

```properties
eureka.client.service-url.defaultZone=https://circuit-breaker-s6d7.onrender.com/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Tailwind CSS v4 |
| Linting | OXLint |

---

## Getting Started

### 1. Install dependencies

```bash
cd circuitbreaker-ui
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` to point to your running API Gateway:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
npm run build
```

The compiled output is placed in `dist/`.

---

## Project Structure

```
circuitbreaker-ui/
├── public/
├── src/
│   ├── api.js                          # Axios client + all API calls
│   ├── components/
│   │   ├── CircuitBreakerBadge.jsx     # State badge (CLOSED / OPEN / HALF_OPEN)
│   │   ├── FallbackPanel.jsx           # Fallback notice shown when circuit is OPEN
│   │   ├── LatencyChart.jsx            # Recharts area chart (last 20 readings)
│   │   ├── Navbar.jsx                  # Top navigation bar
│   │   ├── ServiceCard.jsx             # Per-service monitoring card
│   │   └── Toast.jsx                   # Transition toast notifications
│   ├── hooks/
│   │   └── useCircuitBreakerHistory.js # State-transition history hook
│   └── pages/
│       ├── Dashboard.jsx               # Main monitoring page
│       └── History.jsx                 # Transition log page
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## Component Reference

| Component | Description |
| :--- | :--- |
| `Navbar` | Sticky top bar with branding, tab-based routing, and a direct link to the live Eureka dashboard. |
| `Dashboard` | Main view — summary stat cards, simulation toggle, live polling every 3 s, and the responsive service fleet grid. |
| `ServiceCard` | Per-service card showing health status, circuit breaker badge, fallback panel, latency chart, and the **Trigger Latency** chaos button. |
| `CircuitBreakerBadge` | Animated badge with a pulsing dot. Renders emerald for `CLOSED`, rose for `OPEN`, and amber for `HALF_OPEN`. |
| `FallbackPanel` | Notice that appears on a `ServiceCard` only when the circuit breaker is `OPEN` — displays *"Serving cached fallback: Top Sellers"*. |
| `LatencyChart` | Responsive Recharts area chart showing the last 20 latency readings with an average overlay and tooltip. |
| `Toast` | Corner toast notification that broadcasts `<service> is now <state>` on every state transition and auto-dismisses after 4 s. |
| `History` | Chronological log table of all state transitions, with timestamps and a clear action. Backed by `localStorage`. |
| `useCircuitBreakerHistory` | Custom React hook that records transition events, persists them to `localStorage`, and broadcasts them to subscribers. |

---

## API Endpoints

All requests are made to `VITE_API_BASE_URL` (default: `http://localhost:8080`).

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/actuator/health` | `GET` | Aggregated health status and Eureka discovery info |
| `/actuator/circuitbreakers` | `GET` | Resilience4j circuit breaker states for all registered services |
| `/chaos/latency/{serviceName}` | `POST` | Injects deliberate latency for chaos engineering demos |

---

## Circuit Breaker States

| State | Indicator | Behaviour |
| :--- | :--- | :--- |
| 🟢 **CLOSED** | Emerald badge | Normal operation — requests flow through to downstream services. |
| 🔴 **OPEN** | Rose badge | Failure / slow-call threshold exceeded — requests are short-circuited and the fallback response is served immediately. |
| 🟡 **HALF-OPEN** | Amber badge | Trial state after the wait duration expires — a limited number of probe requests determine if the service has recovered. |

---

## Simulation Mode

If the API Gateway is not running (e.g., during local UI review), toggle **Simulation Mode** from the dashboard header. This generates mock state transitions, latency spikes, and fallback activations locally so the full UI flow can be demonstrated without a live backend.
