/**
 * Investment Benefits component
 * Highlights key advantages of investing with Hidden Key
 */
import { Shield, TrendingUp, Users, Building } from 'lucide-react'
import { Button } from '../components/ui/button'

const benefits = [
  {
    icon: Shield,
    title: "Accredited Investor Focus",
    description: "Exclusive opportunities designed specifically for sophisticated investors with verified accreditation"
  },
  {
    icon: TrendingUp,
    title: "Proven Track Record",
    description: "Consistent double-digit returns through multiple market cycles and economic conditions"
  },
  {
    icon: Users,
    title: "Professional Management",
    description: "Hands-on asset management by experienced real estate professionals with deep market knowledge"
  },
  {
    icon: Building,
    title: "Diverse Portfolio",
    description: "Access to multifamily, commercial, industrial, and mixed-use properties across prime markets"
  }
]

export default function InvestmentBenefits() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Hidden Key Investments
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide institutional-grade real estate investment opportunities with the personal touch of a boutique firm
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <benefit.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join our exclusive network of accredited investors and gain access to premium real estate opportunities with superior risk-adjusted returns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8">
              Become an Investor
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-8">
              Download Investment Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}