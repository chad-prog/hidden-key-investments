/**
 * Dedicated Integration Dashboard page
 * Shows status of all platform integrations and configuration
 */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IntegrationDashboard from '../components/IntegrationDashboard';

/**
 * Integration Dashboard page with full-width layout
 * @returns {JSX.Element} Dedicated integration dashboard page
 */
export default function IntegrationDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Page Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Elite Integration Dashboard
              </h1>
              <p className="text-xl text-gray-600">
                Monitor and manage your investment platform connections in real-time
              </p>
            </div>
          </div>
        </section>

        {/* Integration Dashboard Component */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <IntegrationDashboard />
          </div>
        </section>

        {/* Additional Integration Info */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Platform Integrations Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Airtable</h3>
                  <p className="text-gray-600 text-sm">
                    Investor leads, interactions, and property tracking
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mailchimp</h3>
                  <p className="text-gray-600 text-sm">
                    Email marketing and investor segmentation
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-yellow-600 font-bold">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Zapier</h3>
                  <p className="text-gray-600 text-sm">
                    Automated workflows and data synchronization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
