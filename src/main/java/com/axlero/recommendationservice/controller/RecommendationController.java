package com.axlero.recommendationservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RecommendationController {

    @GetMapping("/recommendations")
    public String getRecommendations() {
        return "Top Sellers: Laptop, Smartphone, Headphones";
    }
}