/**
 * Featured properties section showcasing premium listings
 */
import React from 'react';
import { MapPin, Bed, Bath, Square, Heart, Share2 } from 'lucide-react';
import { Button } from './ui/button';

export default function FeaturedProperties() {
  const featuredProperties = [
    {
      id: 1,
      title: 'Luxury Oceanfront Villa',
      location: 'Malibu, CA',
      price: '$2,450,000',
      bedrooms: 4,
      bathrooms: 3,
      sqft: '3,200',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/4d8d4da2-d0fe-43c0-94b4-6fb508c65c4c.jpg',
      status: 'For Sale',
      featured: true
    },
    {
      id: 2,
      title: 'Modern Downtown Penthouse',
      location: 'Manhattan, NY',
      price: '$1,850,000',
      bedrooms: 3,
      bathrooms: 2,
      sqft: '2,400',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/074d1283-b7f7-4ce6-b8b7-442a9dde0c80.jpg',
      status: 'For Sale',
      featured: true
    },
    {
      id: 3,
      title: 'Charming Suburban Family Home',
      location: 'Austin, TX',
      price: '$675,000',
      bedrooms: 5,
      bathrooms: 3,
      sqft: '2,800',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/52ede5bd-28b2-41d6-9154-ef56551acd8a.jpg',
      status: 'For Sale',
      featured: false
    },
    {
      id: 4,
      title: 'Contemporary Loft Apartment',
      location: 'Seattle, WA',
      price: '$950,000',
      bedrooms: 2,
      bathrooms: 2,
      sqft: '1,800',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/0d6e4a63-6461-492e-b5d2-3cc0244af34d.jpg',
      status: 'For Sale',
      featured: false
    },
    {
      id: 5,
      title: 'Historic Brownstone Townhouse',
      location: 'Boston, MA',
      price: '$1,200,000',
      bedrooms: 4,
      bathrooms: 3,
      sqft: '2,600',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/bcd04f8b-972d-4670-b953-6b0c6345fbc2.jpg',
      status: 'For Sale',
      featured: false
    },
    {
      id: 6,
      title: 'Mountain Retreat Cabin',
      location: 'Aspen, CO',
      price: '$1,750,000',
      bedrooms: 3,
      bathrooms: 2,
      sqft: '2,200',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/0aaa55b6-6247-4c47-b022-3e5f9b373f51.jpg',
      status: 'For Sale',
      featured: true
    }
  ];

  return (
    <section id="properties" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover our hand-selected premium properties, each offering unique features 
            and exceptional value for discerning buyers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              {/* Property Image */}
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-64 object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {property.status}
                  </span>
                </div>

                {/* Featured Badge */}
                {property.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200">
                    <Heart className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200">
                    <Share2 className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {property.price}
                </div>

                {/* Property Details */}
                <div className="flex justify-between items-center text-sm text-slate-600 mb-6 border-t pt-4">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>

                {/* View Details Button */}
                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg transition-colors duration-200">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Properties Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            variant="outline"
            className="bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
          >
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
}
