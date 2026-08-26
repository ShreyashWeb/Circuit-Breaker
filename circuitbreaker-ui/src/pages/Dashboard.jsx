import React, { useState, useEffect, useRef } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Server, AlertTriangle, ShieldCheck, Heart, RefreshCw, Play, Pause, Activity } from 'lucide-react';
import { getServiceHealth, getCircuitBreakerStates } from '../api';
import useCircuitBreakerHistory from '../hooks/useCircuitBreakerHistory';

// Helper to generate initial mock latency history
const generateMockLatencyHistory = () => {
  const history = [];
  const now = Date.now();
  for (let i = 19; i >= 0; i--) {
    const time = new Date(now - i * 3000).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    history.push({
      time,
      latency: Math.floor(Math.random() * (100 - 45 + 1)) + 45 // 45-100ms
    });
  }
  return history;
};

// Services list to track
const SERVICES_LIST = ['product-service', 'inventory-service', 'recommendation-service'];

export const Dashboard = () => {
  const [services, setServices] = useState([
    { serviceName: 'product-service', status: 'UNKNOWN', circuitBreakerState: 'CLOSED', lastChecked: '-', latencyHistory: generateMockLatencyHistory() },
    { serviceName: 'inventory-service', status: 'UNKNOWN', circuitBreakerState: 'CLOSED', lastChecked: '-', latencyHistory: generateMockLatencyHistory() },
    { serviceName: 'recommendation-service', status: 'UNKNOWN', circuitBreakerState: 'CLOSED', lastChecked: '-', latencyHistory: generateMockLatencyHistory() },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);

  const { recordTransition } = useCircuitBreakerHistory();
  const prevCBStatesRef = useRef({});
  const isFirstFetchRef = useRef(true);

  // Poll function
  const fetchServiceData = async (isFirstLoad = false) => {
    if (isFirstLoad) {
      setLoading(true);
    }
    setError(null);

    // If simulation mode is active, run local simulation instead
    if (simulationMode) {
      setTimeout(() => {
        setServices(prev => {
          return prev.map(s => {
            // 15% chance to transition circuit breaker state in simulation
            let nextCBState = s.circuitBreakerState;
            let nextStatus = s.status === 'UNKNOWN' ? 'UP' : s.status;

            if (Math.random() < 0.15) {
              if (s.circuitBreakerState === 'CLOSED') {
                nextCBState = 'OPEN';
                nextStatus = 'DOWN';
              } else if (s.circuitBreakerState === 'OPEN') {
                nextCBState = 'HALF_OPEN';
                nextStatus = 'UP';
              } else {
                nextCBState = Math.random() > 0.4 ? 'CLOSED' : 'OPEN';
                nextStatus = nextCBState === 'CLOSED' ? 'UP' : 'DOWN';
              }
            }

            // Generate mock latency based on status & state
            let mockLatency = Math.floor(Math.random() * (110 - 45 + 1)) + 45; // default UP/CLOSED
            if (nextStatus === 'DOWN') {
              mockLatency = Math.floor(Math.random() * (1200 - 800 + 1)) + 800; // timeout/error
            } else if (nextCBState === 'HALF_OPEN') {
              mockLatency = Math.floor(Math.random() * (350 - 180 + 1)) + 180; // slightly slow
            }

            const time = new Date().toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });

            const newLatencyHistory = [...s.latencyHistory.slice(1), { time, latency: mockLatency }];

            // Record transition if state changed
            if (!isFirstFetchRef.current && s.circuitBreakerState !== nextCBState) {
              recordTransition(s.serviceName, s.circuitBreakerState, nextCBState);
            }

            return {
              ...s,
              status: nextStatus,
              circuitBreakerState: nextCBState,
              lastChecked: time,
              latencyHistory: newLatencyHistory
            };
          });
        });
        
        isFirstFetchRef.current = false;
        setLoading(false);
      }, 500);
      return;
    }

    // Live backend mode
    try {
      const [healthRes, cbRes] = await Promise.all([
        getServiceHealth(),
        getCircuitBreakerStates()
      ]);

      const healthData = healthRes.data;
      const cbData = cbRes.data;

      setServices(prev => {
        const nextStates = {};
        const updated = prev.map(s => {
          const parsed = parseServiceDataFor(s.serviceName, healthData, cbData);
          
          // Generate metric source (simulate metric since backend endpoint isn't ready)
          let mockLatency = Math.floor(Math.random() * (110 - 45 + 1)) + 45;
          if (parsed.status === 'DOWN') {
            mockLatency = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
          } else if (parsed.circuitBreakerState === 'HALF_OPEN') {
            mockLatency = Math.floor(Math.random() * (350 - 180 + 1)) + 180;
          }

          const time = parsed.lastChecked;
          const newLatencyHistory = [...s.latencyHistory.slice(1), { time, latency: mockLatency }];
          nextStates[s.serviceName] = parsed.circuitBreakerState;

          // Record transition if changed
          const prevCBState = prevCBStatesRef.current[s.serviceName];
          if (!isFirstFetchRef.current && prevCBState && prevCBState !== parsed.circuitBreakerState) {
            recordTransition(s.serviceName, prevCBState, parsed.circuitBreakerState);
          }

          return {
            ...s,
            ...parsed,
            latencyHistory: newLatencyHistory
          };
        });

        prevCBStatesRef.current = nextStates;
        return updated;
      });

      isFirstFetchRef.current = false;
      setError(null);
    } catch (err) {
      console.error('Error polling service details', err);
      setError('Connection to gateway failed. Verify backend services are running on http://localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  // Robust parser for Spring Actuator data
  const parseServiceDataFor = (serviceName, healthData, cbData) => {
    const normalize = (name) => name.toLowerCase().replace(/[-_]/g, '');
    const normTarget = normalize(serviceName);

    let status = 'UNKNOWN';
    let circuitBreakerState = 'CLOSED';

    // 1. Health Status Parsing
    if (healthData) {
      if (healthData.components) {
        const compKey = Object.keys(healthData.components).find(k => normalize(k) === normTarget);
        if (compKey) {
          status = healthData.components[compKey].status || 'UNKNOWN';
        }
      }

      if (status === 'UNKNOWN') {
        const eurekaApps = healthData.components?.discoveryComposite?.components?.eureka?.details?.applications 
          || healthData.components?.eureka?.details?.applications
          || healthData.details?.eureka?.details?.applications;
        if (eurekaApps) {
          const appKey = Object.keys(eurekaApps).find(k => normalize(k) === normTarget);
          if (appKey) {
            status = eurekaApps[appKey] > 0 ? 'UP' : 'DOWN';
          }
        }
      }

      if (status === 'UNKNOWN') {
        const cbDetails = healthData.components?.circuitBreakers?.details;
        if (cbDetails) {
          const cbKey = Object.keys(cbDetails).find(k => normalize(k) === normTarget);
          if (cbKey) {
            status = cbDetails[cbKey].status || 'UNKNOWN';
          }
        }
      }
    }

    // 2. Circuit Breaker State Parsing
    if (cbData && cbData.circuitBreakers) {
      if (Array.isArray(cbData.circuitBreakers)) {
        const cb = cbData.circuitBreakers.find(c => c && typeof c === 'object' && c.name && normalize(c.name) === normTarget);
        if (cb && cb.state) {
          circuitBreakerState = cb.state;
        }
      } else if (typeof cbData.circuitBreakers === 'object') {
        const cbKey = Object.keys(cbData.circuitBreakers).find(k => normalize(k) === normTarget);
        if (cbKey) {
          const cbVal = cbData.circuitBreakers[cbKey];
          circuitBreakerState = (typeof cbVal === 'string' ? cbVal : cbVal.state) || 'CLOSED';
        }
      }
    }

    // Fallback to health details circuitBreaker state
    if (circuitBreakerState === 'CLOSED' && healthData) {
      const cbDetails = healthData.components?.circuitBreakers?.details;
      if (cbDetails) {
        const cbKey = Object.keys(cbDetails).find(k => normalize(k) === normTarget);
        if (cbKey && cbDetails[cbKey].details?.state) {
          circuitBreakerState = cbDetails[cbKey].details.state;
        }
      }
    }

    // Normalize status values
    status = status.toUpperCase() === 'UP' ? 'UP' : (status.toUpperCase() === 'DOWN' ? 'DOWN' : 'UNKNOWN');

    // Normalize CB State
    let cbState = circuitBreakerState.toUpperCase();
    if (cbState.includes('HALF')) cbState = 'HALF_OPEN';
    if (cbState !== 'OPEN' && cbState !== 'HALF_OPEN' && cbState !== 'CLOSED') {
      cbState = 'CLOSED';
    }

    return {
      serviceName,
      status,
      circuitBreakerState: cbState,
      lastChecked: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    };
  };

  // Wire up Polling: on mount and every 3 seconds
  useEffect(() => {
    // Initial fetch
    fetchServiceData(true);

    const interval = setInterval(() => {
      fetchServiceData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationMode]);

  // Compute stats
  const totalServices = services.length;
  const healthyServices = services.filter(s => s.status === 'UP').length;
  const openBreakers = services.filter(s => s.circuitBreakerState === 'OPEN').length;

  // Render spinner on first load
  const isFirstLoad = loading && services.every(s => s.status === 'UNKNOWN');
  if (isFirstLoad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-400 text-sm font-mono">Connecting to Gateway Services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            System Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time status monitor for active microservices and circuit breaker states.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={() => {
              setSimulationMode(!simulationMode);
              isFirstFetchRef.current = true;
            }}
            className={`flex items-center space-x-1.5 text-xs border rounded-lg px-3 py-1.5 font-mono cursor-pointer transition-all duration-300 ${
              simulationMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
            title="Toggle simulation mode to test transitions and line charts without a running backend"
          >
            <Activity className={`h-3.5 w-3.5 ${simulationMode ? 'animate-pulse text-amber-400' : ''}`} />
            <span>{simulationMode ? 'Simulation Active' : 'Simulation Mode'}</span>
          </button>

          <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Updates Active</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 px-4 py-3.5 rounded-xl flex items-center justify-between text-sm animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchServiceData(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-lg shadow-rose-500/20"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Services</p>
            <p className="text-2xl font-bold text-slate-100">{totalServices}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Healthy</p>
            <p className="text-2xl font-bold text-slate-100">{healthyServices} / {totalServices}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Open Breakers</p>
            <p className="text-2xl font-bold text-slate-100">{openBreakers}</p>
          </div>
        </div>
      </div>

      {/* Service Cards Grid (1 col mobile, 2 tablet, 3 desktop) */}
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-indigo-400" />
          Active Microservices
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.serviceName}
              serviceName={service.serviceName}
              status={service.status}
              lastChecked={service.lastChecked}
              circuitBreakerState={service.circuitBreakerState}
              latencyHistory={service.latencyHistory}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
