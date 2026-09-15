package com.axlero.api_Gateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import java.util.Map;

public class FallbackController {

    @GetMapping("/fallback/recommendations")
    public Mono<Map<String, Object>> recommendationsFallback() {
        return Mono.just(Map.of(
                "status", "fallback",
                "message", "Recommendation service is currently unavailable. Showing default results.",
                "recommendations", java.util.List.of()));
    }
}
