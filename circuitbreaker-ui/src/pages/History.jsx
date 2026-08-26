import React from 'react';
import CircuitBreakerBadge from '../components/CircuitBreakerBadge';
import { History as HistoryIcon, Clock, Trash2, ArrowRightLeft, FileCode2 } from 'lucide-react';
import useCircuitBreakerHistory from '../hooks/useCircuitBreakerHistory';

export const History = () => {
  const { history, clearHistory } = useCircuitBreakerHistory();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            State Transition History
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Chronological log of service circuit breaker state adjustments and incident thresholds.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center space-x-1.5 text-xs bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 self-start sm:self-center"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Transition Logs</span>
          </button>
        )}
      </div>

      {/* History Log Container */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold text-lg mb-6 border-b border-slate-805 pb-4">
          <HistoryIcon className="h-5 w-5 text-indigo-400" />
          <span>Transition Events ({history.length})</span>
        </div>

        {history.length === 0 ? (
          /* Friendly Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 mb-4 shadow-xl">
              <HistoryIcon className="h-10 w-10 text-slate-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No transitions logged yet</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm">
              Circuit breakers are currently stable. Try turning on <strong className="text-indigo-400">Simulation Mode</strong> on the Dashboard or trigger failures in your backend services to record transitions.
            </p>
          </div>
        ) : (
          /* Transition Table */
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-mono text-[10px] font-semibold">
                  <th className="py-3 px-4 sm:px-6">Time</th>
                  <th className="py-3 px-4 sm:px-6">Service</th>
                  <th className="py-3 px-4 sm:px-6">Previous State</th>
                  <th className="py-3 px-4 sm:px-6 text-center w-8"></th>
                  <th className="py-3 px-4 sm:px-6">New State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {history.map((event) => (
                  <tr 
                    key={event.id} 
                    className="hover:bg-slate-900/20 transition-colors duration-150 text-slate-300"
                  >
                    <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-400 flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                      <span>{event.timestamp}</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-200">
                      {event.serviceName}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="scale-95 origin-left inline-block">
                        <CircuitBreakerBadge state={event.previousState} />
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center text-slate-600">
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="scale-100 origin-left inline-block">
                        <CircuitBreakerBadge state={event.newState} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
