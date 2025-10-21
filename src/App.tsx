/**
 * Main App component with routing setup
 * Defines the application structure and routes
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Home from './pages/Home';
import AccreditedInvestors from './pages/AccreditedInvestors';
import InvestorDashboard from './pages/InvestorDashboard';
import IntegrationDashboard from './pages/IntegrationDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accredited-investors" element={<AccreditedInvestors />} />
          <Route path="/investor-dashboard" element={<InvestorDashboard />} />
          <Route path="/integration-dashboard" element={<IntegrationDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
