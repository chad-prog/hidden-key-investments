/**
 * Property search section with filters and search functionality
 */
import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function SearchSection() {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: 'all',
    priceRange: 'all',
    bedrooms: 'all'
  });

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Any Price' },
    { value: '0-500k', label: 'Under $500K' },
    { value: '500k-1m', label: '$500K - $1M' },
    { value: '1m-2m', label: '$1M - $2M' },
    { value: '2m+', label: '$2M+' }
  ];

  const bedroomOptions = [
    { value: 'all', label: 'Any Bedrooms' },
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4+ Bedrooms' }
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Find Your Perfect Property
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Use our advanced search to discover properties that match your exact requirements
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            {/* Location */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <Input
                type="text"
                placeholder="Enter city, neighborhood, or address..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                className="h-12 text-base border-slate-300 focus:border-blue-500"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Property Type
              </label>
              <select
                value={searchFilters.propertyType}
                onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none text-base"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price Range
              </label>
              <select
                value={searchFilters.priceRange}
                onChange={(e) => setSearchFilters({...searchFilters, priceRange: e.target.value})}
                className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none text-base"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Bedrooms
              </label>
              <select
                value={searchFilters.bedrooms}
                onChange={(e) => setSearchFilters({...searchFilters, bedrooms: e.target.value})}
                className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none text-base"
              >
                {bedroomOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Properties
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Quick Search Tags */}
        <div className="text-center mt-8">
          <p className="text-slate-600 mb-4">Popular Searches:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Luxury Homes', 'Beachfront Properties', 'City Apartments', 'Investment Properties', 'New Construction'].map((tag) => (
              <button
                key={tag}
                className="bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-blue-600 transition-all duration-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
