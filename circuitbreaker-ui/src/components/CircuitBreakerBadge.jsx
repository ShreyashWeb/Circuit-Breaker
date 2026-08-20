import React from 'react';

/**
 * CircuitBreakerBadge component
 * Displays status badge for circuit breakers:
 * - CLOSED (Green)
 * - OPEN (Red)
 * - HALF_OPEN (Yellow)
 * 
 * @param {Object} props
 * @param {'CLOSED' | 'OPEN' | 'HALF_OPEN'} props.state
 */
export const CircuitBreakerBadge = ({ state }) => {
  const normalizedState = (state || '').toUpperCase();

  let styles = {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/20',
    label: state || 'UNKNOWN'
  };

  if (normalizedState === 'CLOSED') {
    styles = {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      label: 'CLOSED'
    };
  } else if (normalizedState === 'OPEN') {
    styles = {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      label: 'OPEN'
    };
  } else if (normalizedState === 'HALF_OPEN') {
    styles = {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      label: 'HALF OPEN'
    };
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border} transition-all duration-300 shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        normalizedState === 'CLOSED' ? 'bg-emerald-400 animate-pulse' :
        normalizedState === 'OPEN' ? 'bg-rose-400 animate-pulse' :
        normalizedState === 'HALF_OPEN' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-400'
      }`}></span>
      {styles.label}
    </span>
  );
};

export default CircuitBreakerBadge;
