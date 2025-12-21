import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import HouseFilters from '../components/HouseFilters';
import api from '../config/api';

const HousesPage = () => {
  const [searchParams] = useSearchParams();
  const [houses, setHouses] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: searchParams.get('location') || '',
    house_type: '',
    status: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [filters]);

  const fetchOptions = async () => {
    try {
      const [locRes, typesRes] = await Promise.all([
        api.get('/settings/locations').catch(() => ({ data: [] })),
        api.get('/settings/house-types').catch(() => ({ data: [] }))
      ]);
      setLocations(locRes.data);
      setHouseTypes(typesRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.house_type) params.append('house_type', filters.house_type);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/houses?${params.toString()}`);
      setHouses(response.data);
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableCount = houses.filter(h => h.vacancy_status === 'available').length;

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Available Houses</h1>
          </div>
          <p className="text-primary-100">
            Browse our selection of quality rental properties in Nakuru and Nyahururu
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <HouseFilters 
          filters={filters} 
          setFilters={setFilters} 
          houseTypes={houseTypes}
          locations={locations}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{houses.length}</span> properties
            {availableCount > 0 && (
              <span className="text-green-600"> ({availableCount} available)</span>
            )}
          </p>
        </div>

        {/* Houses Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : houses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map(house => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No houses found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new listings
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default HousesPage;
