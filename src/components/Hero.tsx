/**
 * Hero section component with compelling headline and call-to-action
 */
import React from 'react';
import { Search, Star, TrendingUp, Shield } from 'lucide-react';
import { Button } from './ui/button';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black/40">
        <img
          src="https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/ee4d22b6-e624-4bb0-a2ec-8d45b618a3d9.jpg"
          alt="Luxury Property"
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-8">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Trusted by 10,000+ Clients</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Find Your
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent block">
              Dream Property
            </span>
            Today
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover premium properties curated for your lifestyle. From luxury homes to investment opportunities, 
            we make property dreams come true with expert guidance and personalized service.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Properties
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-white/30 text-white hover:bg-white hover:text-slate-800 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              List Your Property
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                <span className="text-3xl font-bold text-white">500+</span>
              </div>
              <p className="text-slate-300">Properties Sold</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-blue-400 mr-2" />
                <span className="text-3xl font-bold text-white">99%</span>
              </div>
              <p className="text-slate-300">Client Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-3xl font-bold text-white">4.9</span>
              </div>
              <p className="text-slate-300">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
