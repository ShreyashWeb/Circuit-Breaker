import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Activity, LayoutDashboard, History } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
              <Activity className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-transform" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent group-hover:from-indigo-200 group-hover:to-white transition-all duration-300">
              CircuitBreaker Monitor
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <History className="h-4 w-4" />
              <span>State History</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
