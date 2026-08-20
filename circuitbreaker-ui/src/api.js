import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export const getServiceHealth = () => {
  return api.get('/actuator/health');
};

export const getCircuitBreakerStates = () => {
  return api.get('/actuator/circuitbreakers');
};

export default api;
