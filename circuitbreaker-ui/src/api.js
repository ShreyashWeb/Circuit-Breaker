import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

/**
 * Fetch health status of services from Spring Boot Actuator
 */
export const getServiceHealth = () => {
  return api.get('/actuator/health');
};

/**
 * Fetch Circuit Breaker states from Spring Boot Actuator / Resilience4j
 */
export const getCircuitBreakerStates = () => {
  return api.get('/actuator/circuitbreakers');
};

/**
 * Trigger latency injection for a specific microservice (Chaos engineering)
 * Calls /chaos/latency/{serviceName} on Gateway and direct delayed route to trip Resilience4j CB.
 * @param {string} serviceName - e.g. 'recommendation-service', 'product-service', 'inventory-service'
 */
export const triggerLatency = async (serviceName) => {
  const norm = (serviceName || '').toLowerCase();
  
  // Call chaos endpoint on Gateway
  try {
    return await api.post(`/chaos/latency/${encodeURIComponent(serviceName)}`);
  } catch {
    // Direct fallback if chaos controller isn't ready: fire delayed calls through Gateway
    if (norm.includes('recommendation')) {
      const requests = Array.from({ length: 6 }, () =>
        api.get('/api/recommendations/delay', { timeout: 6000 }).catch(err => err.response || err)
      );
      return Promise.all(requests);
    } else if (norm.includes('inventory')) {
      const requests = Array.from({ length: 6 }, () =>
        api.get('/inventory/simulate/delay?durationMs=4000', { timeout: 6000 }).catch(err => err.response || err)
      );
      return Promise.all(requests);
    }
    throw new Error(`Latency simulation for ${serviceName} not supported.`);
  }
};

export default api;
