/**
 * Featured Properties component
 * Showcases premium investment opportunities
 */
import { Button } from '../components/ui/button'

const featuredProperties = [
  {
    id: 1,
    name: "Luxury Austin High-Rise",
    location: "Austin, TX",
    type: "Multifamily",
    returns: "12-15%",
    investment: "$500K - $2M",
    image: "https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/15365c76-1819-4906-afa2-b53c2c4cd5dd.jpg"
  },
  {
    id: 2,
    name: "Dallas Industrial Park",
    location: "Dallas, TX",
    type: "Industrial",
    returns: "10-12%",
    investment: "$250K - $1M",
    image: "https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/6e6e05df-c9a3-4a29-bb9a-55b06cfab75d.jpg"
  },
  {
    id: 3,
    name: "Houston Medical Office",
    location: "Houston, TX",
    type: "Commercial",
    returns: "8-10%",
    investment: "$100K - $500K",
    image: "https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/a5d56937-e67e-4b14-a601-9004b0402b66.jpg"
  }
]

export default function FeaturedProperties() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Investment Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Curated portfolio of premium real estate investments with strong fundamentals and growth potential
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                <p className="text-gray-600 mb-4">{property.location}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Property Type</span>
                    <span className="font-semibold">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Returns</span>
                    <span className="font-semibold text-green-600">{property.returns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Investment Range</span>
                    <span className="font-semibold">{property.investment}</span>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" className="bg-transparent border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
            View All Opportunities
          </Button>
        </div>
      </div>
    </section>
  )
}