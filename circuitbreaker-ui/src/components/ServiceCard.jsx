import React from 'react';
import CircuitBreakerBadge from './CircuitBreakerBadge';

/**
 * ServiceCard component
 * Displays details of a monitored microservice:
 * - Service name
 * - Health status (UP/DOWN/UNKNOWN) indicated by a colored dot
 * - Circuit breaker state badge
 * - Last checked timestamp
 * 
 * @param {Object} props
 * @param {string} props.serviceName
 * @param {'UP' | 'DOWN' | 'UNKNOWN'} props.status
 * @param {string} props.lastChecked
 * @param {'CLOSED' | 'OPEN' | 'HALF_OPEN'} props.circuitBreakerState
 */
export const ServiceCard = ({ serviceName, status, lastChecked, circuitBreakerState }) => {
  const normalizedStatus = (status || '').toUpperCase();

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

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/5 flex flex-col justify-between h-48 relative overflow-hidden group">
      {/* Background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-300 truncate">
            {serviceName}
          </h3>
          <span className="flex-shrink-0">
            <CircuitBreakerBadge state={circuitBreakerState} />
          </span>
        </div>

        {/* Health status dot and label */}
        <div className="flex items-center mt-4">
          <div className="relative flex items-center justify-center mr-2">
            <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${dotColorClass} opacity-75 animate-ping`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColorClass} shadow-md`}></span>
          </div>
          <span className="text-sm font-medium text-slate-400">
            Status: <span className={`font-semibold ${textStatusColor}`}>{statusText}</span>
          </span>
        </div>
      </div>

      {/* Footer detailing the last checked time */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>Last Checked</span>
        <span className="font-mono text-slate-400">{lastChecked}</span>
      </div>
    </div>
  );
};

export default ServiceCard;
