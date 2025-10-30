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
import LeadForm from './components/LeadForm';
import LeadManagement from './pages/LeadManagement';
import LeadList from './pages/LeadList';
import LeadDetail from './pages/LeadDetail';
import LeadCreate from './pages/LeadCreate';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accredited-investors" element={<AccreditedInvestors />} />
          <Route path="/investor-dashboard" element={<InvestorDashboard />} />
          <Route path="/integration-dashboard" element={<IntegrationDashboard />} />
          <Route path="/lead-form" element={<LeadForm />} />
          
          {/* CRM Routes */}
          <Route path="/crm" element={<LeadManagement />} />
          <Route path="/crm/leads" element={<LeadList />} />
          <Route path="/crm/leads/new" element={<LeadCreate />} />
          <Route path="/crm/leads/:leadId" element={<LeadDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;