/**
 * Home page component for Hidden Key Investments
 * Professional real estate investment platform landing page
 */
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-white text-2xl font-bold">Hidden Key Investments</div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-blue-200 transition-colors">Properties</a>
              <a href="#" className="text-white hover:text-blue-200 transition-colors">Investors</a>
              <a href="#" className="text-white hover:text-blue-200 transition-colors">About</a>
              <a href="#" className="text-white hover:text-blue-200 transition-colors">Contact</a>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Investor Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Elite Real Estate
            <span className="block text-blue-300">Investment Opportunities</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Access exclusive, high-yield real estate investments with proven track records. 
            Join our network of accredited investors building wealth through strategic property acquisitions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Explore Investments
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/5 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Properties</h3>
              <p className="text-gray-300">Carefully vetted commercial and residential properties with strong growth potential.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Proven Returns</h3>
              <p className="text-gray-300">Consistent track record of 12-18% annual returns across our investment portfolio.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-gray-300">Comprehensive due diligence and asset protection strategies for every investment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 Hidden Key Investments. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}