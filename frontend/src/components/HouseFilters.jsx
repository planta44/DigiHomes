import { useState } from 'react';
import { Search, MapPin, Home, CheckCircle, DollarSign, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const HouseFilters = ({ filters, setFilters, houseTypes, locations = [], houses = [] }) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get unique towns for selected location
  const getAvailableTowns = () => {
    if (!filters.location || !houses.length) return [];
    const townsSet = new Set();
    houses.forEach(h => {
      if (h.location === filters.location && h.town) {
        townsSet.add(h.town);
      }
    });
    return Array.from(townsSet).sort();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
      {/* Main Filters - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search houses..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="input-field pl-10 appearance-none cursor-pointer"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Town - Show when location is selected */}
        {filters.location && getAvailableTowns().length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Town
            </label>
            <select
              value={filters.town || ''}
              onChange={(e) => handleChange('town', e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">All Towns</option>
              {getAvailableTowns().map(town => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              House Type
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.house_type}
                onChange={(e) => handleChange('house_type', e.target.value)}
                className="input-field pl-10 appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {houseTypes.map(type => (
                  <option key={type.id || type} value={type.name || type}>{type.name || type}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* More Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            More Filters
            {showMoreFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* More Filters - Collapsible */}
      {showMoreFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          {/* House Type (if not already showing) */}
          {filters.location && getAvailableTowns().length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                House Type
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filters.house_type}
                  onChange={(e) => handleChange('house_type', e.target.value)}
                  className="input-field pl-10 appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {houseTypes.map(type => (
                    <option key={type.id || type} value={type.name || type}>{type.name || type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price (KES)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price || ''}
                onChange={(e) => handleChange('min_price', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (KES)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="Max"
                value={filters.max_price || ''}
                onChange={(e) => handleChange('max_price', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Listing Type (Rent/Lease) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Type
            </label>
            <select
              value={filters.listing_type || ''}
              onChange={(e) => handleChange('listing_type', e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">All</option>
              <option value="rent">Rent</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="input-field pl-10 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseFilters;
