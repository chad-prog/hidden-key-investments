/**
 * Hero section component for Hidden Key Investments
 * Features compelling value proposition and call-to-action
 */
import { Button } from '../components/ui/button'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          Hidden Key Investments
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
          Unlocking Premium Real Estate Opportunities for Accredited Investors
        </p>
        <p className="text-lg mb-12 text-blue-200 max-w-3xl mx-auto leading-relaxed">
          Access exclusive off-market properties, sophisticated investment structures, 
          and professional asset management designed for elite investors seeking 
          superior risk-adjusted returns.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6">
            Explore Opportunities
          </Button>
          <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 py-6">
            Schedule Consultation
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-2">$50M+</div>
            <div className="text-blue-200">Assets Under Management</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-2">15%+</div>
            <div className="text-blue-200">Average Annual Returns</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-2">50+</div>
            <div className="text-blue-200">Successful Exits</div>
          </div>
        </div>
      </div>
    </section>
  )
}