import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-900/60 py-6 text-center text-xs text-slate-600 font-mono">
          &copy; 2026 CircuitBreaker Monitor. Built for Microservice Reliability.
        </footer>
      </div>
    </Router>
  );
}

export default App;
