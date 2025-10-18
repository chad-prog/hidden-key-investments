/**
 * Test component to verify React is working
 * Simple component to test the application setup
 */
import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Hidden Key Investments
        </h1>
        <p className="text-xl text-gray-600">
          Your investment platform is loading...
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <p className="text-green-600 font-semibold">
            ✅ React is working! Next step: Full homepage
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;