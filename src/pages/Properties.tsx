/**
 * Properties listing page with advanced filtering and search
 * Showcases all available investment properties with detailed filters
 */
import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Share2, Grid, List } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// Mock property data - replace with API data later
const propertiesData = [
  {
    id: 1,
    title: 'Luxury Oceanfront Villa',
    location: 'Malibu, CA',
    price: 2450000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/3abec976-24b3-4944-ae65-4ceae293cde1.jpg',
    status: 'For Sale',
    type: 'villa',
    yearBuilt: 2018,
    lotSize: '0.5 acres',
    roi: '8.5%',
    cashFlow: 4500,
    featured: true
  },
  {
    id: 2,
    title: 'Modern Downtown Penthouse',
    location: 'Manhattan, NY',
    price: 1850000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2400,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/d9b66459-f6bf-446b-9d63-aa4e87acc646.jpg',
    status: 'For Sale',
    type: 'condo',
    yearBuilt: 2020,
    lotSize: 'N/A',
    roi: '7.2%',
    cashFlow: 3200,
    featured: true
  },
  {
    id: 3,
    title: 'Charming Suburban Family Home',
    location: 'Austin, TX',
    price: 675000,
    bedrooms: 5,
    bathrooms: 3,
    sqft: 2800,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/56c6997f-5caf-4d1f-a522-6d2f086b0216.jpg',
    status: 'For Sale',
    type: 'house',
    yearBuilt: 2015,
    lotSize: '0.25 acres',
    roi: '6.8%',
    cashFlow: 1800,
    featured: false
  },
  {
    id: 4,
    title: 'Contemporary Loft Apartment',
    location: 'Seattle, WA',
    price: 950000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/797299ee-be5f-4d8c-8c06-7e7ff80350c7.jpg',
    status: 'For Sale',
    type: 'condo',
    yearBuilt: 2019,
    lotSize: 'N/A',
    roi: '5.9%',
    cashFlow: 2200,
    featured: false
  },
  {
    id: 5,
    title: 'Historic Brownstone Townhouse',
    location: 'Boston, MA',
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2600,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/a6b735eb-7e0a-47c7-a441-9315349e8e84.jpg',
    status: 'For Sale',
    type: 'townhouse',
    yearBuilt: 1920,
    lotSize: '0.1 acres',
    roi: '7.8%',
    cashFlow: 2800,
    featured: true
  },
  {
    id: 6,
    title: 'Mountain Retreat Cabin',
    location: 'Aspen, CO',
    price: 1750000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2200,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/4520887c-0879-4fa4-97aa-59c581970be9.jpg',
    status: 'For Sale',
    type: 'cabin',
    yearBuilt: 2010,
    lotSize: '2.0 acres',
    roi: '9.2%',
    cashFlow: 3800,
    featured: false
  },
  {
    id: 7,
    title: 'Beachfront Condo',
    location: 'Miami, FL',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/f77eb251-d733-49d3-af13-df53cda004c7.jpg',
    status: 'For Sale',
    type: 'condo',
    yearBuilt: 2017,
    lotSize: 'N/A',
    roi: '6.5%',
    cashFlow: 1900,
    featured: false
  },
  {
    id: 8,
    title: 'Luxury High-Rise Apartment',
    location: 'Chicago, IL',
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2100,
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/499139a4-1778-49cd-8149-f0878b87f1b5.jpg',
    status: 'For Sale',
    type: 'condo',
    yearBuilt: 2021,
    lotSize: 'N/A',
    roi: '7.1%',
    cashFlow: 2600,
    featured: true
  }
];

export default function Properties() {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'all',
    priceRange: [0, 5000000],
    bedrooms: 'all',
    bathrooms: 'all',
    location: 'all',
    minROI: 0,
    sortBy: 'featured'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter properties based on current filters
  const filteredProperties = useMemo(() => {
    return propertiesData.filter(property => {
      // Search filter
      if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !property.location.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Property type filter
      if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
        return false;
      }

      // Price range filter
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms !== 'all' && property.bedrooms !== parseInt(filters.bedrooms)) {
        return false;
      }

      // Bathrooms filter
      if (filters.bathrooms !== 'all' && property.bathrooms !== parseInt(filters.bathrooms)) {
        return false;
      }

      // ROI filter
      if (parseFloat(property.roi) < filters.minROI) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const properties = [...filteredProperties];
    
    switch (filters.sortBy) {
      case 'price-low':
        return properties.sort((a, b) => a.price - b.price);
      case 'price-high':
        return properties.sort((a, b) => b.price - a.price);
      case 'roi':
        return properties.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
      case 'cashflow':
        return properties.sort((a, b) => b.cashFlow - a.cashFlow);
      case 'featured':
      default:
        return properties.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [filteredProperties, filters.sortBy]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Investment Properties
              </h1>
              <p className="text-xl opacity-90">
                Discover curated real estate investment opportunities with verified returns
              </p>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search properties by name or location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="bg-transparent"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="bg-transparent"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <Button variant="outline" className="bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 mt-6">
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabin</option>
              </select>

              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Any Bedrooms</option>
                <option value="1">1+ Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="roi">Highest ROI</option>
                <option value="cashflow">Highest Cash Flow</option>
              </select>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sortedProperties.length} Properties Found
                </h2>
                <p className="text-gray-600">
                  Showing investment opportunities matching your criteria
                </p>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedProperties.map((property) => (
                  <PropertyListCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {sortedProperties.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Property Card Component for Grid View
function PropertyCard({ property }: { property: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {property.status}
          </span>
        </div>
        {property.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              ${(property.price / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.bathrooms} baths</span>
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            <span>{property.sqft} sqft</span>
          </div>
        </div>

        {/* Investment Metrics */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">ROI:</span>
              <span className="font-semibold text-green-600 ml-1">{property.roi}</span>
            </div>
            <div>
              <span className="text-gray-600">Cash Flow:</span>
              <span className="font-semibold text-green-600 ml-1">${property.cashFlow}/mo</span>
            </div>
          </div>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          View Investment Details
        </Button>
      </CardContent>
    </Card>
  );
}

// Property Card Component for List View
function PropertyListCard({ property }: { property: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        
        <CardContent className="p-6 flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {property.featured && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </span>
                )}
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {property.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {property.title}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            
            <div className="text-right mt-4 md:mt-0">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${(property.price / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">
                Built: {property.yearBuilt}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <Bed className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{property.bedrooms} Beds</div>
            </div>
            <div className="text-center">
              <Bath className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{property.bathrooms} Baths</div>
            </div>
            <div className="text-center">
              <Square className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{property.sqft} sqft</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{property.roi}</div>
              <div className="text-xs text-gray-600">Projected ROI</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              View Full Details
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Heart className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
