import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"

/**
 * Hero section component for Hidden Key Investments
 * Features a compelling value proposition and call-to-action
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
          Hidden Key Investments
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
          Premium Real Estate Investment Opportunities for Accredited Investors
        </p>
        <p className="text-lg mb-12 text-gray-300 max-w-3xl mx-auto">
          Access exclusive property investments with proven track records. 
          Join elite investors in building wealth through carefully curated 
          real estate opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Explore Opportunities
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 text-lg"
          >
            Learn More
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-300">$50M+</div>
            <div className="text-gray-300">Assets Under Management</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-300">15%+</div>
            <div className="text-gray-300">Average Annual Returns</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-300">100+</div>
            <div className="text-gray-300">Satisfied Investors</div>
          </div>
        </div>
      </div>
    </section>
  )
}
