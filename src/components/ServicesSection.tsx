/**
 * Services section showcasing key services offered by TheCurateProp
 */
import React from 'react';
import { Home, Search, Calculator, Users, FileText, TrendingUp } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Property Search',
      description: 'Find your perfect property with our expert guidance and comprehensive database of premium listings.',
      features: ['Personalized matching', 'Market analysis', 'Exclusive listings']
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Property Selling',
      description: 'Maximize your property value with our proven marketing strategies and experienced sales team.',
      features: ['Professional staging', 'Market pricing', 'Fast closing']
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Property Valuation',
      description: 'Get accurate property valuations using advanced analytics and local market expertise.',
      features: ['Instant estimates', 'Detailed reports', 'Market trends']
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Investment Advisory',
      description: 'Make informed investment decisions with our market insights and financial analysis.',
      features: ['ROI analysis', 'Risk assessment', 'Portfolio optimization']
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Legal Support',
      description: 'Navigate complex property transactions with confidence through our legal expertise.',
      features: ['Contract review', 'Due diligence', 'Closing support']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Consultation',
      description: 'Receive personalized advice from our experienced real estate professionals.',
      features: ['Free consultation', 'Custom strategies', '24/7 support']
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Our Premium Services
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From property search to closing, we provide comprehensive real estate services 
            designed to exceed your expectations at every step
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white mb-6">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-slate-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Learn More Link */}
              <div className="mt-6 pt-6 border-t">
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-slate-600 mb-6">
              Contact us today for a free consultation and discover how we can help you achieve your real estate goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                Schedule Consultation
              </button>
              <button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-3 rounded-xl font-semibold transition-all duration-300">
                Call Now: (555) 123-4567
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
