import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home, Building, BedDouble, Bath, ArrowRight, DollarSign } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useHeroAnimation, useStaggerAnimation, useSectionAnimation } from '../hooks/useAnimations';

const RentPage = () => {
  const [pageData, setPageData] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    search: '',
    location: '', 
    house_type: '',
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: ''
  });
  const [locations, setLocations] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const { colors } = useTheme();
  // Hero animations - re-animate when scrolling back to top
  const [heroRef, heroAnim] = useHeroAnimation(0);
  const [heroRef2, heroAnim2] = useHeroAnimation(1);
  // Section animations
  const [housesRef, housesAnim] = useSectionAnimation(0);
  const [housesRef2, housesAnim2] = useSectionAnimation(1);
  // Card animations - re-animate on scroll
  const [cardsRef, getCardClass] = useStaggerAnimation();

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
    hero: { title: 'Properties For Rent', subtitle: 'Quality rental properties in Nakuru & Nyahururu', backgroundImage: '' },
    sections: []
  };

  const filteredHouses = houses.filter(house => {
    const matchesSearch = !filters.search || 
      house.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      house.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchLocation = !filters.location || house.location === filters.location;
    const matchHouseType = !filters.house_type || house.house_type === filters.house_type;
    const matchPropertyType = !filters.property_type || house.property_type === filters.property_type;
    const matchMinPrice = !filters.min_price || house.rent_price >= parseFloat(filters.min_price);
    const matchMaxPrice = !filters.max_price || house.rent_price <= parseFloat(filters.max_price);
    const matchBedrooms = !filters.bedrooms || house.bedrooms >= parseInt(filters.bedrooms);
    return matchesSearch && matchLocation && matchHouseType && matchPropertyType && matchMinPrice && matchMaxPrice && matchBedrooms;
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
            ref={heroRef} className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${heroAnim}`}
          >
            {content.hero.title}
          </h1>
          <p 
            ref={heroRef2} className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 ${heroAnim2}`}
            style={{ color: colors[100] }}
          >
            {content.hero.subtitle}
          </p>

          </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={housesRef} className={`mb-8 ${housesAnim}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Properties For Rent</h2>
            <p className="text-gray-600">Browse available rental properties</p>
          </div>

          {/* Filters - Similar to Available Houses */}
          <div ref={housesRef2} className={`bg-white rounded-xl shadow-md p-4 md:p-6 mb-8 ${housesAnim2}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search properties..."
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filters.property_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, property_type: e.target.value }))}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="house">Houses</option>
                    <option value="land">Land</option>
                  </select>
                </div>
              </div>

              {/* House Type - Only show if property_type is house or empty */}
              {filters.property_type !== 'land' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Type</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filters.house_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, house_type: e.target.value }))}
                      className="input-field pl-10 appearance-none cursor-pointer"
                    >
                      <option value="">All House Types</option>
                      {houseTypes.map(type => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Bedrooms - Only show if property_type is house or empty */}
              {filters.property_type !== 'land' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                    className="input-field appearance-none cursor-pointer"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              )}

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rent (KES)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value }))}
                    placeholder="Min"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Rent (KES)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                    placeholder="Max"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredHouses.length}</span> properties for rent
              </p>
            </div>
          </div>

          {filteredHouses.length > 0 ? (
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHouses.map((house, index) => (
                <div 
                  key={house.id}
                  data-anim-item
                  className={getCardClass(index)}
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
            className="mt-12 text-center"
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
