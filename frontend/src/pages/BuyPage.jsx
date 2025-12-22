import { useState, useEffect } from 'react';
import { Search, MapPin, Home, Building, ArrowRight, DollarSign, Ruler, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const BuyPage = () => {
  const [pageData, setPageData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    search: '',
    location: '', 
    property_type: '',
    house_type: '',
    listing_type: '', // 'buy' or 'lease'
    min_price: '',
    max_price: '',
    bedrooms: ''
  });
  const { colors } = useTheme();
  const [heroRef, heroVisible] = useScrollAnimation(0.1, true);
  const [contentRef, contentVisible] = useScrollAnimation(0.1, true);
  const [propertiesRef, propertiesVisible] = useScrollAnimation(0.01, true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [pageRes, propertiesRes, locationsRes, typesRes] = await Promise.all([
          api.get('/pages/buy').catch(() => ({ data: null })),
          api.get('/houses').catch(() => ({ data: [] })),
          api.get('/settings/locations').catch(() => ({ data: [] })),
          api.get('/settings/house-types').catch(() => ({ data: [] }))
        ]);
        setPageData(pageRes.data);
        // Filter to show properties for sale AND lease
        const allProperties = propertiesRes.data || [];
        setProperties(allProperties.filter(p => 
          (p.listing_type === 'buy' || p.listing_type === 'lease') && p.vacancy_status === 'available'
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

  // Filter properties based on selected filters
  const filteredProperties = properties.filter(p => {
    const matchesSearch = !filters.search || 
      p.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || p.location === filters.location;
    const matchesPropertyType = !filters.property_type || p.property_type === filters.property_type;
    const matchesHouseType = !filters.house_type || p.house_type === filters.house_type;
    const matchesListingType = !filters.listing_type || p.listing_type === filters.listing_type;
    const matchesMinPrice = !filters.min_price || p.rent_price >= parseFloat(filters.min_price);
    const matchesMaxPrice = !filters.max_price || p.rent_price <= parseFloat(filters.max_price);
    const matchesBedrooms = !filters.bedrooms || p.bedrooms >= parseInt(filters.bedrooms);
    return matchesSearch && matchesLocation && matchesPropertyType && matchesHouseType && matchesListingType && matchesMinPrice && matchesMaxPrice && matchesBedrooms;
  });

  const content = pageData?.content || {
    hero: { title: 'Properties For Sale', subtitle: 'Find your dream home or investment property', backgroundImage: '' },
    sections: [],
    callToAction: {}
  };

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
            className={`text-xl md:text-2xl max-w-3xl mx-auto transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ color: colors[100] }}
          >
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Properties For Sale Section */}
      <section ref={propertiesRef} className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-8 transition-all duration-700 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Properties For Sale</h2>
            <p className="text-gray-600">Browse available properties for purchase</p>
          </div>

          {/* Filters - Similar to Rent page with More Filters toggle */}
          <div className={`bg-white rounded-xl shadow-md p-4 md:p-6 mb-8 transition-all duration-700 delay-100 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main Filters - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
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

                {/* Buy or Lease */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buy or Lease</label>
                  <select
                    value={filters.listing_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, listing_type: e.target.value }))}
                    className="input-field appearance-none cursor-pointer"
                  >
                    <option value="">All</option>
                    <option value="buy">Buy</option>
                    <option value="lease">Lease</option>
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (KES)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (KES)</label>
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
            )}

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> properties for sale
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <HouseCard key={property.id} house={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties available for sale</h3>
              <p className="text-gray-500">Check back soon for new listings</p>
            </div>
          )}
        </div>
      </section>

      {/* Content Sections */}
      {content.sections?.length > 0 && (
        <section ref={contentRef} className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {content.sections.map((section, index) => (
              <div 
                key={index}
                className={`mb-16 last:mb-0 transition-all duration-700 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-gray-600 text-lg mb-8">{section.description}</p>
                {section.items?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.items.map((item, i) => (
                      <div 
                        key={i}
                        className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg transition-all duration-500 ${contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                        style={{ transitionDelay: `${(index * 150) + (i * 75)}ms` }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors[100] }}>
                          <Home className="w-5 h-5" style={{ color: colors[600] }} />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      {content.callToAction?.title && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="text-center p-8 md:p-12 rounded-2xl bg-gray-100"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{content.callToAction.title}</h3>
              <p className="text-gray-600 mb-6">{content.callToAction.description}</p>
              <a 
                href={content.callToAction.buttonLink || '/contact'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: colors[600] }}
              >
                {content.callToAction.buttonText || 'Contact Us'}
              </a>
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
};

export default BuyPage;
