/**
 * Header component with navigation for Hidden Key Investments
 * Includes links to all major sections and integration dashboard
 */
import React from 'react';
import { Button } from './ui/button';

/**
 * Header component with main navigation
 * @returns {JSX.Element} Header with navigation links
 */
export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">Hidden Key Investments</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
            <a href="/properties" className="text-gray-700 hover:text-blue-600 font-medium">Properties</a>
            <a href="/accredited-investors" className="text-gray-700 hover:text-blue-600 font-medium">Investors</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
            <a href="/integration-dashboard" className="text-blue-600 hover:text-blue-700 font-medium">Integrations</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50">
              Investor Login
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
