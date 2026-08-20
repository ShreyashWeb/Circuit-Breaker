import React from 'react';
import CircuitBreakerBadge from '../components/CircuitBreakerBadge';
import { History as HistoryIcon, Clock, ArrowRight } from 'lucide-react';

const mockTransitions = [
  {
    id: 1,
    serviceName: 'product-service',
    fromState: 'HALF_OPEN',
    toState: 'CLOSED',
    timestamp: '2026-08-20 22:10:00',
    reason: 'Success rate exceeded 95% during test period',
  },
  {
    id: 2,
    serviceName: 'inventory-service',
    fromState: 'CLOSED',
    toState: 'OPEN',
    timestamp: '2026-08-20 22:05:00',
    reason: 'HTTP 5xx error rate exceeded threshold (50.5% errors)',
  },
  {
    id: 3,
    serviceName: 'recommendation-service',
    fromState: 'OPEN',
    toState: 'HALF_OPEN',
    timestamp: '2026-08-20 21:55:00',
    reason: 'Wait duration of 60 seconds elapsed, initiating trial requests',
  },
  {
    id: 4,
    serviceName: 'product-service',
    fromState: 'CLOSED',
    toState: 'OPEN',
    timestamp: '2026-08-20 20:30:15',
    reason: 'Failure rate threshold reached: 10 consecutive connection timeouts',
  },
];

export const History = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          State Transition History
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Chronological log of service circuit breaker state adjustments and incident thresholds.
        </p>
      </div>

      {/* History Timeline */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold text-lg mb-6 border-b border-slate-805 pb-4">
          <HistoryIcon className="h-5 w-5 text-indigo-400" />
          <span>Transition Events</span>
        </div>

        <div className="flow-root">
          <ul className="-mb-8">
            {mockTransitions.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {/* Vertical line connecting events */}
                  {eventIdx !== mockTransitions.length - 1 ? (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-800"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-4">
                    {/* Timestamp icon bullet */}
                    <div className="relative flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:border-indigo-500/30 transition-colors">
                        <Clock className="h-5 w-5 text-slate-500" />
                      </span>
                    </div>

                    {/* Transition Content */}
                    <div className="min-w-0 flex-1 py-1.5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-200 text-base">{event.serviceName}</span>
                          <div className="mt-1 flex items-center space-x-2 text-sm">
                            <span className="text-slate-500">State Transitioned:</span>
                            <span className="opacity-70 scale-90 inline-block transform"><CircuitBreakerBadge state={event.fromState} /></span>
                            <ArrowRight className="h-3 w-3 text-slate-500" />
                            <span className="scale-90 inline-block transform"><CircuitBreakerBadge state={event.toState} /></span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 self-start md:self-center">
                          <span>{event.timestamp}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-900/50">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider block mb-1">Reason:</span>
                        {event.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default History;
