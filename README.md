The project is one complete system, not 5 separate projects. Each person will work mainly on their assigned module/area through their own GitHub branch, and we'll integrate everything together into main.
The project covers Spring Cloud, Resilience4j, Eureka, React, and distributed tracing. �
Java-Project.pdf
🔹 1️⃣ Member 1 — Product Service
Primary responsibility: Product Microservice
Tasks:
Create the Product Spring Boot microservice
Develop Product APIs
Configure the service
Register the service with Eureka
Make sure the service can be discovered through the Service Registry
Test the service independently
Integrate it with the API Gateway
Main focus: Spring Boot + Microservices + Eureka
🔹 2️⃣ Member 2 — Inventory Service
Primary responsibility: Inventory Microservice
Tasks:
Create the Inventory Spring Boot microservice
Develop stock/availability APIs
Configure the service
Register the service with Eureka
Test inventory availability
Test what happens when the service becomes unavailable
Integrate it with the Gateway
Main focus: Spring Boot + Microservices + Eureka + Failure Testing
🔹 3️⃣ Member 3 — Recommendation Service
Primary responsibility: Recommendation Microservice
Tasks:
Create the Recommendation Spring Boot microservice
Develop Recommendation APIs
Configure and register it with Eureka
Integrate it with the Gateway
Implement a way to deliberately introduce delay/failure
Help demonstrate the Circuit Breaker when the Recommendation Service becomes slow/down
Work with Member 4 on fallback/Circuit Breaker testing
This service is particularly important because the project specifically uses it to demonstrate the Circuit Breaker and fallback mechanism. �
Java-Project.pdf
🔹 4️⃣ Member 4 — API Gateway + Resilience
Primary responsibility: Gateway & Resilience4j
Tasks:
Set up Spring Cloud Gateway
Configure routing to all microservices
Connect Gateway with Eureka/Service Discovery
Integrate Resilience4j
Implement Circuit Breaker
Configure fallback responses
Implement timeouts
Implement Rate Limiting
Implement Bulkheads
Work with Recommendation Service to test failure scenarios
Integrate Micrometer Tracing + Zipkin in Week 4
This is probably the most backend-heavy role, because it handles the core resilience architecture. �
Java-Project.pdf
🔹 5️⃣ Member 5 — React UI + Monitoring
Primary responsibility: Frontend & Monitoring
Tasks:
Set up React dashboard
Display the available microservices
Show service health/status
Create monitoring/visualization components
Display Circuit Breaker states:
🟢 Closed
🔴 Open
🟡 Half-Open
Add the Trigger Latency button
Show what happens when a backend service becomes slow
Make the Circuit Breaker activation visually understandable
Polish the dashboard for the final demonstration
The project specifically requires the UI to visualize Circuit Breaker states and later demonstrate the latency-triggered failure scenario. 
