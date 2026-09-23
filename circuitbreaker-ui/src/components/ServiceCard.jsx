import React, { useState } from 'react';
import CircuitBreakerBadge from './CircuitBreakerBadge';
import LatencyChart from './LatencyChart';
import FallbackPanel from './FallbackPanel';
import api, { triggerLatency } from '../api';
import { Zap, Loader2, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';

/**
 * ServiceCard component
 * Displays details of a monitored microservice:
 * - Service name
 * - Health status (UP/DOWN/UNKNOWN) indicated by a colored dot
 * - Circuit breaker state badge (or Resilience tag for transactional services)
 * - FallbackPanel (rendered when circuit breaker is OPEN)
 * - Latency trend line chart (last 20 readings)
 * - Trigger Latency button for the designated Recommendation Service
 * - Last checked timestamp
 */
export const ServiceCard = ({
  serviceName,
  status,
  lastChecked,
  circuitBreakerState,
  latencyHistory,
}) => {
  const normalizedStatus = (status || '').toUpperCase();
  const isRecommendation = (serviceName || '').toLowerCase().includes('recommendation');
  const isInventory = (serviceName || '').toLowerCase().includes('inventory');
  const isProduct = (serviceName || '').toLowerCase().includes('product');
  const isOpen = (circuitBreakerState || '').toUpperCase() === 'OPEN';
  const isHalfOpen = (circuitBreakerState || '').toUpperCase() === 'HALF_OPEN';

  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerFeedback, setTriggerFeedback] = useState(null); // 'success' | 'stubbed' | 'recovered' | null

  const handleRecover = async () => {
    if (isTriggering) return;
    setIsTriggering(true);
    try {
      await api.get('/api/recommendations');
      await api.get('/api/recommendations');
      setTriggerFeedback('recovered');
    } catch (e) {
      console.warn('Probe call error:', e);
    } finally {
      setIsTriggering(false);
      setTimeout(() => setTriggerFeedback(null), 2500);
    }
  };

  // Determine health dot classes
  let dotColorClass = 'bg-slate-500 shadow-slate-500/50';
  let statusText = 'UNKNOWN';
  let textStatusColor = 'text-slate-400';

  if (normalizedStatus === 'UP') {
    dotColorClass = 'bg-emerald-500 shadow-emerald-500/50';
    statusText = 'UP';
    textStatusColor = 'text-emerald-400';
  } else if (normalizedStatus === 'DOWN') {
    dotColorClass = 'bg-rose-500 shadow-rose-500/50';
    statusText = 'DOWN';
    textStatusColor = 'text-rose-400';
  }

  const handleTriggerLatency = async () => {
    if (isTriggering) return;
    setIsTriggering(true);
    setTriggerFeedback(null);

    try {
      await triggerLatency(serviceName);
      setTriggerFeedback('success');
    } catch (err) {
      console.warn(`Backend /chaos/latency/${serviceName} not ready or unreachable.`, err);
      setTriggerFeedback('stubbed');
    } finally {
      setIsTriggering(false);
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setTriggerFeedback(null);
      }, 3000);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/10 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Background subtle glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="space-y-4">
        {/* Top Header: Title & CB Badge / Tag */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors duration-300 truncate" title={serviceName}>
            {serviceName}
          </h3>
          <div className="flex-shrink-0">
            {isRecommendation ? (
              <CircuitBreakerBadge state={circuitBreakerState} />
            ) : (
              <CircuitBreakerBadge state={circuitBreakerState} />
            )}
          </div>
        </div>

        {/* Health status dot and service role tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative flex items-center justify-center mr-2.5">
              <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${dotColorClass} opacity-75 animate-ping`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColorClass} shadow-md`} />
            </div>
            <span className="text-xs font-medium text-slate-400">
              Health: <span className={`font-semibold ${textStatusColor}`}>{statusText}</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            {isRecommendation
              ? 'Non-Critical (CB Protected)'
              : isProduct
              ? 'Core Route • Rate Limited'
              : isInventory
              ? 'Core Route • Bulkhead'
              : 'Microservice'}
          </span>
        </div>

        {/* Fallback Panel - Visible ONLY when Circuit Breaker State is OPEN */}
        {isOpen && <FallbackPanel />}

        {/* Latency History Chart */}
        <div className="pt-2">
          <LatencyChart serviceName={serviceName} data={latencyHistory} />
        </div>
      </div>

      {/* Action Area: Trigger Latency for Recommendation Service, Status Guard for Core Services */}
      <div className="mt-6 space-y-4">
        {isRecommendation ? (
          <div>
            {isHalfOpen ? (
              <button
                onClick={handleRecover}
                disabled={isTriggering}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                <span>Self-Healing (Click to Close Circuit)</span>
              </button>
            ) : (
              <button
                onClick={handleTriggerLatency}
                disabled={isTriggering}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-md disabled:cursor-not-allowed ${
                  isTriggering
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : triggerFeedback === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : triggerFeedback === 'stubbed'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-200 text-slate-200 border border-slate-700/60 hover:border-amber-500/40 hover:shadow-amber-500/10'
                }`}
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                    <span>Injecting Latency...</span>
                  </>
                ) : triggerFeedback === 'success' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Latency Triggered!</span>
                  </>
                ) : triggerFeedback === 'stubbed' ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Trigger Injected (Stub)</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    <span>Trigger Latency (Chaos Test)</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="w-full py-2 px-3 rounded-xl bg-slate-800/40 border border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            {isProduct ? (
              <>
                <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                <span>Protected by Rate Limiter & Tracing</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Protected by Bulkhead & Tracing</span>
              </>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Last Checked</span>
          <span className="font-mono text-slate-400">{lastChecked || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
