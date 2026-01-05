import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home, Building, BedDouble, Bath, Grid, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';

const RentalsPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  const { colors } = useTheme();
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    house_type: '',
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, locationsRes, typesRes] = await Promise.all([
        api.get('/houses'),
        api.get('/settings/locations'),
        api.get('/settings/house-types')
      ]);
      
      // Filter for rental properties only
      const rentalProperties = (propertiesRes.data || []).filter(p => 
        p.vacancy_status === 'available' && 
        (p.listing_type === 'rent' || p.listing_type === 'lease' || !p.listing_type)
      );
      
      setProperties(rentalProperties);
      setFilteredProperties(rentalProperties);
      setLocations(locationsRes.data || []);
      setHouseTypes(typesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...properties];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.location?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.location) {
      result = result.filter(p => p.location === filters.location);
    }
    
    if (filters.house_type) {
      result = result.filter(p => p.house_type === filters.house_type);
    }
    
    if (filters.property_type) {
      result = result.filter(p => p.property_type === filters.property_type);
    }
    
    if (filters.min_price) {
      result = result.filter(p => p.rent_price >= parseFloat(filters.min_price));
    }
    
    if (filters.max_price) {
      result = result.filter(p => p.rent_price <= parseFloat(filters.max_price));
    }
    
    if (filters.bedrooms) {
      result = result.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }
    
    if (filters.bathrooms) {
      result = result.filter(p => p.bathrooms >= parseInt(filters.bathrooms));
    }
    
    setFilteredProperties(result);
  }, [filters, properties]);

  // Staggered card visibility animation
  useEffect(() => {
    setVisibleCards([]);
    filteredProperties.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, index]);
      }, index * 100);
    });
  }, [filteredProperties]);

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      house_type: '',
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors[200], borderTopColor: 'transparent' }}></div>
            <p className="text-gray-500">Loading rentals...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div 
        className="relative py-16 md:py-24"
        style={{ background: `linear-gradient(135deg, ${colors[700]} 0%, ${colors[900]} 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className={`text-4xl md:text-5xl font-bold text-white mb-4`}>
              Find Your Perfect Rental
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto">
            Discover quality rental properties in Nakuru and Nyahururu
          </p>
          
          {/* Quick Search */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, location..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 bg-gray-50"
                />
              </div>
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-primary-500 min-w-[150px]"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: colors[600] }}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ color: colors[600] }}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                <X className="w-4 h-4" /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Property Type</label>
                <select
                  value={filters.property_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, property_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All</option>
                  <option value="house">House</option>
                  <option value="land">Land</option>
                </select>
              </div>
              {/* Hide House Type when Land is selected */}
              {filters.property_type !== 'land' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">House Type</label>
                  <select
                    value={filters.house_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, house_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All</option>
                    {houseTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Min Rent (KES)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Rent (KES)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bathrooms</label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available
            </h2>
            <p className="text-gray-500 text-sm">Properties for rent and lease</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {filteredProperties.length > 0 ? (
          <div 
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'flex flex-col gap-4'
            }
          >
            {filteredProperties.map((property, index) => (
              <div key={property.id} data-card-item>
                <HouseCard house={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors[600] }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default RentalsPage;
