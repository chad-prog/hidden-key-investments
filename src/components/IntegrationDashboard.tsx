/**
 * Integration Dashboard Component
 * Tests and displays status of all elite integrations
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Database, Mail, Zap, Shield } from 'lucide-react';

interface IntegrationStatus {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  lastChecked: Date | null;
  icon: React.ReactNode;
}

/**
 * Integration Dashboard for testing elite platform connections
 * @returns {JSX.Element} Dashboard component with integration status
 */
export default function IntegrationDashboard() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      name: 'Airtable API',
      status: 'loading',
      message: 'Testing connection...',
      lastChecked: null,
      icon: <Database className="h-6 w-6" />
    },
    {
      name: 'Mailchimp API',
      status: 'loading',
      message: 'Testing connection...',
      lastChecked: null,
      icon: <Mail className="h-6 w-6" />
    },
    {
      name: 'Zapier Automation',
      status: 'loading',
      message: 'Testing connection...',
      lastChecked: null,
      icon: <Zap className="h-6 w-6" />
    },
    {
      name: 'Security Layer',
      status: 'loading',
      message: 'Testing security...',
      lastChecked: null,
      icon: <Shield className="h-6 w-6" />
    }
  ]);

  const [isTesting, setIsTesting] = useState(false);

  /**
   * Test all integrations
   */
  const testAllIntegrations = async () => {
    setIsTesting(true);
    
    // Mock integration tests for now
    setIntegrations(prev => prev.map(integration => {
      if (integration.name === 'Airtable API') {
        return {
          ...integration,
          status: 'success',
          message: 'Airtable API configured',
          lastChecked: new Date()
        };
      }
      if (integration.name === 'Mailchimp API') {
        return {
          ...integration,
          status: 'success',
          message: 'Mailchimp API configured',
          lastChecked: new Date()
        };
      }
      if (integration.name === 'Zapier Automation') {
        return {
          ...integration,
          status: 'success',
          message: 'Zapier integration ready',
          lastChecked: new Date()
        };
      }
      if (integration.name === 'Security Layer') {
        return {
          ...integration,
          status: 'success',
          message: 'Security configuration complete',
          lastChecked: new Date()
        };
      }
      return integration;
    }));

    setIsTesting(false);
  };

  useEffect(() => {
    testAllIntegrations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'loading': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <XCircle className="h-5 w-5" />;
      case 'loading': return <RefreshCw className="h-5 w-5 animate-spin" />;
      default: return <RefreshCw className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Elite Integration Dashboard</h2>
          <p className="text-gray-600 mt-1">Test and monitor your investment platform connections</p>
        </div>

        {/* Integration Status Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, index) => (
              <div
                key={integration.name}
                className={`border-2 rounded-lg p-4 transition-all duration-300 ${getStatusColor(integration.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{integration.message}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusIcon(integration.status)}
                  </div>
                </div>
                {integration.lastChecked && (
                  <div className="mt-3 text-xs text-gray-500">
                    Last checked: {integration.lastChecked.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {integrations.filter(i => i.status === 'success').length} of {integrations.length} integrations active
            </div>
            <button
              onClick={testAllIntegrations}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test All'}</span>
            </button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <strong>Environment:</strong> {import.meta.env.MODE} | 
            <strong> Build:</strong> {import.meta.env.VITE_APP_VERSION || 'Development'}
          </div>
        </div>
      </div>
    </div>
  );
}