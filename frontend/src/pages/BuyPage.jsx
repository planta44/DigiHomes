import { useState, useEffect } from 'react';
import { Search, MapPin, Home, Building, ArrowRight, Filter } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: '', property_type: '' });
  const { colors } = useTheme();
  const [heroRef, heroVisible] = useScrollAnimation(0.1, true);
  const [contentRef, contentVisible] = useScrollAnimation(0.1, true);
  const [propertiesRef, propertiesVisible] = useScrollAnimation(0.1, true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [pageRes, propertiesRes, locationsRes] = await Promise.all([
          api.get('/pages/buy').catch(() => ({ data: null })),
          api.get('/houses').catch(() => ({ data: [] })),
          api.get('/settings/locations').catch(() => ({ data: [] }))
        ]);
        setPageData(pageRes.data);
        // Filter to only show properties for sale (listing_type='buy')
        const allProperties = propertiesRes.data || [];
        setProperties(allProperties.filter(p => p.listing_type === 'buy' && p.vacancy_status === 'available'));
        setLocations(locationsRes.data);
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
    const matchesLocation = !filters.location || p.location === filters.location;
    const matchesType = !filters.property_type || p.property_type === filters.property_type;
    return matchesLocation && matchesType;
  });

  const content = pageData?.content || {
    hero: { title: '', subtitle: '', backgroundImage: '' },
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

          {/* Filters */}
          <div className={`flex flex-wrap gap-4 mb-8 transition-all duration-700 delay-100 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white min-w-[150px]"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
            <select
              value={filters.property_type}
              onChange={(e) => setFilters(prev => ({ ...prev, property_type: e.target.value }))}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white min-w-[150px]"
            >
              <option value="">All Types</option>
              <option value="house">Houses</option>
              <option value="land">Land</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <div 
                  key={property.id}
                  className={`transition-all duration-500 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <HouseCard house={property} />
                </div>
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
              className="text-center p-8 md:p-12 rounded-2xl"
              style={{ backgroundColor: colors[50] }}
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
