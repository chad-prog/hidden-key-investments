/**
 * Home page component for Hidden Key Investments
 * Temporary landing page while we build the full application
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <h1 className="text-5xl font-bold mb-4">Hidden Key Investments</h1>
        <p className="text-xl mb-8">Premium Real Estate Investment Opportunities</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="mb-4">
            We're building an elite investment platform for accredited investors.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Learn More
            </button>
            <button className="border border-white hover:bg-white/10 text-white px-6 py-2 rounded-lg transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
