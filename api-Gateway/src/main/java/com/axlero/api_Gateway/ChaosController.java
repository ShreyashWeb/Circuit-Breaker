package com.axlero.api_Gateway;

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

    @PostMapping("/latency/{serviceName}")
    @GetMapping("/latency/{serviceName}")
    public Mono<ResponseEntity<Map<String, Object>>> triggerChaos(@PathVariable String serviceName) {
        String targetPath;
        if (serviceName.toLowerCase().contains("recommendation")) {
            targetPath = "http://localhost:8080/api/recommendations/delay";
        } else if (serviceName.toLowerCase().contains("inventory")) {
            targetPath = "http://localhost:8080/inventory/simulate/delay?durationMs=4000";
        } else {
            targetPath = "http://localhost:8080/products";
        }

        // Fire 6 concurrent requests through the gateway route to trip the circuit breaker
        return Flux.range(1, 6)
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
}