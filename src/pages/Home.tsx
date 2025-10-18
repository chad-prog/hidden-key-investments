/**
 * Home page component - Simple test version to verify React is working
 */
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Hidden Key Investments
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Premium Real Estate Investment Platform
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
          <p className="text-green-300 font-semibold">
            ✅ React is working! Site is loading successfully.
          </p>
          <p className="text-blue-200 mt-2">
            Next: Adding professional components...
          </p>
        </div>
      </div>
    </div>
  );
}