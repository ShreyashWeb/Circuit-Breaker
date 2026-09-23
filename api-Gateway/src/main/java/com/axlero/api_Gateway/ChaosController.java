package com.axlero.api_Gateway;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/chaos")
public class ChaosController {

    private final WebClient webClient = WebClient.create();
    
    @Autowired(required = false)
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @RequestMapping(value = "/latency/{serviceName}", method = {RequestMethod.GET, RequestMethod.POST})
    public Mono<ResponseEntity<Map<String, Object>>> triggerChaos(@PathVariable String serviceName) {
        String targetPath;
        String lower = serviceName.toLowerCase();
        if (lower.contains("recommendation")) {
            targetPath = "http://localhost:8080/api/recommendations/delay";
        } else if (lower.contains("inventory")) {
            targetPath = "http://localhost:8080/inventory/simulate/delay?durationMs=4000";
        } else if (lower.contains("product")) {
            targetPath = "http://localhost:8080/products/delay";
        } else {
            targetPath = "http://localhost:8080/products/delay";
        }

        // Fire 5 concurrent requests through the gateway route to trip the circuit breaker
        return Flux.range(1, 5)
                .flatMap(i -> webClient.get()
                        .uri(targetPath)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(6))
                        .onErrorResume(e -> Mono.just("fallback/error")))
                .collectList()
                .map(results -> ResponseEntity.ok(Map.of(
                        "status", "chaos_injected",
                        "service", serviceName,
                        "requestsFired", results.size(),
                        "message", "Triggered latency calls through Gateway to activate Circuit Breaker."
                )));
    }

    @PostMapping("/reset/{serviceName}")
    public Mono<ResponseEntity<Map<String, Object>>> resetCircuitBreaker(@PathVariable String serviceName) {
        String lower = serviceName.toLowerCase();
        String cbName = lower.contains("recommendation") ? "recommendationCB" :
                        lower.contains("inventory") ? "inventoryCB" : "productCB";

        if (circuitBreakerRegistry != null) {
            try {
                circuitBreakerRegistry.circuitBreaker(cbName).transitionToClosedState();
            } catch (Exception ignored) {
                try {
                    circuitBreakerRegistry.circuitBreaker(cbName).reset();
                } catch (Exception ignored2) {}
            }
        }

        return Mono.just(ResponseEntity.ok(Map.of(
                "status", "reset_success",
                "circuitBreaker", cbName,
                "targetState", "CLOSED"
        )));
    }
}