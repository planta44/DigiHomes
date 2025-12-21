import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home, Building, BedDouble, Bath, ArrowRight } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const RentPage = () => {
  const [pageData, setPageData] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: '', type: '' });
  const [locations, setLocations] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const { colors } = useTheme();
  const [heroRef, heroVisible] = useScrollAnimation(0.1, true);
  const [housesRef, housesVisible] = useScrollAnimation(0.1, true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [pageRes, housesRes, locationsRes, typesRes] = await Promise.all([
          api.get('/pages/rent').catch(() => ({ data: null })),
          api.get('/houses').catch(() => ({ data: [] })),
          api.get('/settings/locations').catch(() => ({ data: [] })),
          api.get('/settings/house-types').catch(() => ({ data: [] }))
        ]);
        setPageData(pageRes.data);
        // Filter to only show available rental/lease properties (not buy)
        const allHouses = housesRes.data || [];
        setHouses(allHouses.filter(h => 
          h.vacancy_status === 'available' && 
          (h.listing_type === 'rent' || h.listing_type === 'lease' || !h.listing_type)
        ));
        setLocations(locationsRes.data);
        setHouseTypes(typesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const content = pageData?.content || {
    hero: { title: 'Find Your Perfect Rental', subtitle: 'Quality rental properties in Nakuru & Nyahururu', backgroundImage: '' },
    sections: []
  };

  const filteredHouses = houses.filter(house => {
    const matchLocation = !filters.location || house.location === filters.location;
    const matchType = !filters.type || house.house_type === filters.type;
    return matchLocation && matchType;
  });

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 md:py-32 text-white overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${colors[600]}, ${colors[700]}, ${colors[800]})` }}
      >
        {content.hero.backgroundImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${content.hero.backgroundImage}')` }}></div>
            <div className="absolute inset-0 bg-black/50"></div>
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {content.hero.title}
          </h1>
          <p 
            className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ color: colors[100] }}
          >
            {content.hero.subtitle}
          </p>

          {/* Filters */}
          <div 
            className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-3 rounded-lg text-gray-800 bg-white min-w-[150px]"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-3 rounded-lg text-gray-800 bg-white min-w-[150px]"
            >
              <option value="">All Types</option>
              {houseTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Houses Grid */}
      <section ref={housesRef} className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`mb-8 transition-all duration-700 ${housesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredHouses.length} {filteredHouses.length === 1 ? 'Property' : 'Properties'} Available
            </h2>
          </div>

          {filteredHouses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHouses.map((house, index) => (
                <div 
                  key={house.id}
                  className={`transition-all duration-500 ${housesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <HouseCard house={house} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}

          {/* View All Link */}
          <div 
            className={`mt-12 text-center transition-all duration-700 delay-500 ${housesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <Link
              to="/houses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: colors[600] }}
            >
              View All Houses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default RentPage;
