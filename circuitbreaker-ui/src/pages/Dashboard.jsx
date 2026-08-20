import React from 'react';
import ServiceCard from '../components/ServiceCard';
import { Server, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

const mockServices = [
  {
    serviceName: 'product-service',
    status: 'UP',
    circuitBreakerState: 'CLOSED',
    lastChecked: '2026-08-20 22:15:00',
  },
  {
    serviceName: 'inventory-service',
    status: 'DOWN',
    circuitBreakerState: 'OPEN',
    lastChecked: '2026-08-20 22:14:45',
  },
  {
    serviceName: 'recommendation-service',
    status: 'UNKNOWN',
    circuitBreakerState: 'HALF_OPEN',
    lastChecked: '2026-08-20 22:13:10',
  },
];

export const Dashboard = () => {
  // Compute basic mock stats
  const totalServices = mockServices.length;
  const healthyServices = mockServices.filter(s => s.status === 'UP').length;
  const openBreakers = mockServices.filter(s => s.circuitBreakerState === 'OPEN').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            System Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time status monitor for active microservices and circuit breaker states.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Updates Active</span>
        </div>
      </div>

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
          {mockServices.map((service) => (
            <ServiceCard
              key={service.serviceName}
              serviceName={service.serviceName}
              status={service.status}
              lastChecked={service.lastChecked}
              circuitBreakerState={service.circuitBreakerState}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
