import { Search, MapPin, Home, CheckCircle } from 'lucide-react';

const HouseFilters = ({ filters, setFilters, houseTypes, locations = [] }) => {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {/* House Type */}
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

        {/* Availability */}
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
    </div>
  );
};

export default HouseFilters;
