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
import InvestorProfilePage from './pages/InvestorProfilePage';
import InvestorsPage from './pages/InvestorsPage';
import DocumentationPortal from './pages/DocumentationPortal';
import MonitoringDashboard from './pages/MonitoringDashboard';
import EnhancedLeadCapture from './pages/EnhancedLeadCapture';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';

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
          
          {/* Documentation Portal */}
          <Route path="/docs" element={<DocumentationPortal />} />
          
          {/* Monitoring */}
          <Route path="/monitoring" element={<MonitoringDashboard />} />
          
          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          
          {/* Workflows */}
          <Route path="/workflows" element={<WorkflowBuilder />} />
          
          {/* CRM Routes */}
          <Route path="/crm" element={<LeadManagement />} />
          <Route path="/crm/leads" element={<LeadList />} />
          <Route path="/crm/leads/new" element={<LeadCreate />} />
          <Route path="/crm/leads/enhanced" element={<EnhancedLeadCapture />} />
          <Route path="/crm/leads/:leadId" element={<LeadDetail />} />
          <Route path="/crm/investors" element={<InvestorsPage />} />
          <Route path="/crm/investors/:investorId" element={<InvestorProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;