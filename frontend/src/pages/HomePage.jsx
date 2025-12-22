import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Building, 
  MapPin, 
  Shield, 
  Clock, 
  Phone,
  CheckCircle,
  Star,
  Users,
  Home
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';

// Hook for counting up animation
const useCountUp = (end, duration = 2000, trigger = true) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  
  useEffect(() => {
    if (!trigger) return;
    
    // Parse numeric value from string like "100+" or "5+"
    const numericValue = parseInt(String(end).replace(/[^0-9]/g, '')) || 0;
    const suffix = String(end).replace(/[0-9]/g, '');
    
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(progress * numericValue);
      setCount(currentCount + suffix);
      
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };
    
    countRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [end, duration, trigger]);
  
  return count;
};

// Hook for detecting when element is visible
const useInView = (threshold = 0.3) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, isInView];
};

// Stat item with count-up animation
const StatItem = ({ stat, isVisible }) => {
  const animatedValue = useCountUp(stat.value, 2000, isVisible);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
        {animatedValue || stat.value}
      </div>
      <div className="text-sm md:text-base text-white/80 font-medium uppercase tracking-wider">
        {stat.label}
      </div>
    </div>
  );
};

const iconMap = {
  Building, MapPin, Shield, Clock, Star, Users, Home, CheckCircle
};

const FeatureCard = ({ feature }) => {
  const IconComponent = iconMap[feature.icon] || Building;
  return (
    <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 flex-shrink-0">
        <IconComponent className="w-7 h-7 text-primary-600" />
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-gray-600 text-sm flex-grow">{feature.description}</p>
    </div>
  );
};

const HomePage = () => {
  const [featuredHouses, setFeaturedHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const { colors } = useTheme();
  const [statsRef, statsVisible] = useInView(0.3);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [housesRes, settingsRes] = await Promise.all([
        api.get('/houses?status=available'),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);
      
      const allHouses = housesRes.data || [];
      const siteSettings = settingsRes.data || {};
      
      // Filter out houses for sale - they should only appear on Buy page
      const rentalHouses = allHouses.filter(h => h.listing_type !== 'buy');
      
      // Use admin-selected featured IDs if available, otherwise fallback to featured flag
      const savedFeaturedIds = siteSettings.featured_properties || [];
      let houses;
      
      if (savedFeaturedIds.length > 0) {
        // Get houses in the order specified by admin (up to 9)
        houses = savedFeaturedIds
          .map(id => rentalHouses.find(h => h.id === id))
          .filter(Boolean)
          .slice(0, 9);
      } else {
        // Fallback: sort by featured flag (up to 9)
        houses = rentalHouses
          .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
          .slice(0, 9);
      }
      
      setFeaturedHouses(houses);
      setSettings(siteSettings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default stats
  const defaultStats = [
    { value: '100+', label: 'Happy Clients' },
    { value: '50+', label: 'Properties' },
    { value: '2', label: 'Locations' },
    { value: '5+', label: 'Years Experience' }
  ];
  
  // Default features if not configured by admin
  const defaultFeatures = [
    { icon: 'Building', title: 'Quality Homes', description: 'Carefully selected properties that meet our high standards for comfort and safety.' },
    { icon: 'MapPin', title: 'Prime Locations', description: 'Properties in Nakuru and Nyahururu with easy access to amenities and transport.' },
    { icon: 'Shield', title: 'Trusted Agency', description: 'Years of experience helping families find their perfect homes in Kenya.' },
    { icon: 'Clock', title: 'Quick Process', description: 'Streamlined rental process to get you into your new home faster.' }
  ];
  
  const stats = settings?.stats_section?.stats?.length > 0 ? settings.stats_section.stats : defaultStats;
  const statsSection = settings?.stats_section || { title: 'Our Impact', subtitle: '' };
  const features = settings?.features?.length > 0 ? settings.features : defaultFeatures;
  const companyInfo = settings?.company_info || {};
  const aboutSection = settings?.about_section || { title: '', subtitle: '', content: '', image: '' };

  // Hero positioning settings
  const heroPositioning = {
    desktopHeight: settings?.hero_content?.desktopHeight || '100vh',
    mobileHeight: settings?.hero_content?.mobileHeight || '100vh',
    desktopAlign: settings?.hero_content?.desktopAlign || 'bottom',
    mobileAlign: settings?.hero_content?.mobileAlign || 'bottom'
  };

  const heroContent = {
    title: settings?.hero_content?.title || '',
    highlight: settings?.hero_content?.highlight || '',
    highlightColor: settings?.hero_content?.highlightColor || colors[200],
    descriptionHighlightColor: settings?.hero_content?.descriptionHighlightColor || colors[200],
    description: settings?.hero_content?.description || '',
    backgroundImage: settings?.hero_content?.backgroundImage || '',
    backgroundImageMobile: settings?.hero_content?.backgroundImageMobile || settings?.hero_content?.backgroundImage || '',
    overlayColor: settings?.hero_content?.overlayColor || '#000000',
    overlayColorMobile: settings?.hero_content?.overlayColorMobile || settings?.hero_content?.overlayColor || '#000000',
    overlayOpacity: settings?.hero_content?.overlayOpacity ?? 0.5,
    overlayOpacityMobile: settings?.hero_content?.overlayOpacityMobile ?? settings?.hero_content?.overlayOpacity ?? 0.6
  };

  const featuresSection = settings?.features_section || { title: 'Why Choose DIGIHOMES?', subtitle: "We're committed to making your house-hunting experience smooth and successful." };
  const housesSection = settings?.houses_section || { title: 'Featured Properties', subtitle: 'Explore our selection of quality rental properties' };
  const locationsSection = settings?.locations_section || {
    title: '',
    subtitle: '',
    locations: []
  };

  // Get alignment classes
  const getAlignmentClass = (align) => {
    switch (align) {
      case 'top': return 'justify-start pt-24';
      case 'center': return 'justify-center';
      case 'bottom': 
      default: return 'justify-end';
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section 
        className="relative text-white overflow-hidden flex flex-col"
        style={{ 
          backgroundColor: '#1a1a1a',
          minHeight: heroPositioning.mobileHeight
        }}
      >
        {/* Desktop height override */}
        <style>{`
          @media (min-width: 768px) {
            .hero-section { min-height: ${heroPositioning.desktopHeight} !important; }
          }
        `}</style>
        <div className="hero-section absolute inset-0"></div>
        
        {/* Desktop Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ 
            backgroundImage: heroContent.backgroundImage ? `url('${heroContent.backgroundImage}')` : 'none'
          }}
        ></div>
        {/* Mobile Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ 
            backgroundImage: heroContent.backgroundImageMobile ? `url('${heroContent.backgroundImageMobile}')` : 'none'
          }}
        ></div>
        {/* Desktop Overlay */}
        <div 
          className="absolute inset-0 hidden md:block"
          style={{ backgroundColor: heroContent.overlayColor, opacity: heroContent.overlayOpacity }}
        ></div>
        {/* Mobile Overlay */}
        <div 
          className="absolute inset-0 md:hidden"
          style={{ backgroundColor: heroContent.overlayColorMobile, opacity: heroContent.overlayOpacityMobile }}
        ></div>
        
        {/* Content wrapper with alignment */}
        <div className={`relative flex-1 flex flex-col ${getAlignmentClass(heroPositioning.mobileAlign)} md:${getAlignmentClass(heroPositioning.desktopAlign)}`}>
          {/* Hero content - aligned left */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-left">
                {heroContent.title}{' '}
                <span style={{ color: heroContent.highlightColor }}>{heroContent.highlight}</span>
              </h1>
              <p className="text-lg md:text-xl mb-6 max-w-2xl text-left" style={{ color: heroContent.descriptionHighlightColor }}>
                {heroContent.description}
              </p>
              <div className="flex flex-wrap gap-4 justify-start">
                <Link 
                  to="/houses" 
                  className="font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100"
                  style={{ color: colors[600] }}
                >
                  Browse Houses
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/contact" 
                  className="border-2 border-white text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 hover:bg-white"
                  onMouseEnter={(e) => e.currentTarget.style.color = colors[600]}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  <Phone className="w-5 h-5" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {featuresSection.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-left md:text-center">
              {featuresSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Count up animation */}
      <section 
        ref={statsRef}
        className="py-16 md:py-20"
        style={{ background: `linear-gradient(135deg, ${colors[600]} 0%, ${colors[800]} 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsSection.title && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{statsSection.title}</h2>
              {statsSection.subtitle && <p className="text-white/80 max-w-2xl mx-auto">{statsSection.subtitle}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatItem key={index} stat={stat} isVisible={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Houses */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {housesSection.title}
              </h2>
              <p className="text-gray-600">
                {housesSection.subtitle}
              </p>
            </div>
            <Link 
              to="/houses" 
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
            >
              View All Houses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredHouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHouses.map((house) => (
                <HouseCard key={house.id} house={house} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No houses available at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locationsSection.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locationsSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(locationsSection.locations || []).map((loc, index) => {
              const imageUrl = loc.image?.startsWith('http') 
                ? loc.image 
                : loc.image?.startsWith('/uploads') 
                  ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${loc.image}`
                  : loc.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800';
              return (
              <div 
                key={loc.name || index}
                className="relative rounded-2xl overflow-hidden group h-64"
              >
                <img 
                  src={imageUrl} 
                  alt={loc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{loc.name}</h3>
                  <p className="text-gray-200 mb-4">{loc.description}</p>
                  <Link 
                    to={`/houses?location=${loc.name}`}
                    className="inline-flex items-center gap-2 text-white font-medium hover:text-primary-200"
                  >
                    View Houses in {loc.name}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      {(aboutSection.title || aboutSection.content) && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image Side */}
              {aboutSection.image && (
                <div className="relative">
                  <img 
                    src={aboutSection.image} 
                    alt={aboutSection.title || 'About Us'} 
                    className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
                  />
                  <div 
                    className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl hidden lg:block"
                    style={{ backgroundColor: colors[200] }}
                  ></div>
                </div>
              )}
              
              {/* Content Side */}
              <div className={aboutSection.image ? '' : 'lg:col-span-2 max-w-3xl mx-auto text-center'}>
                {aboutSection.subtitle && (
                  <span 
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                    style={{ backgroundColor: colors[100], color: colors[700] }}
                  >
                    {aboutSection.subtitle}
                  </span>
                )}
                {aboutSection.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {aboutSection.title}
                  </h2>
                )}
                {aboutSection.content && (
                  <div className="space-y-4">
                    {aboutSection.content.split('\n').filter(line => line.trim()).map((line, index) => (
                      <p key={index} className="text-gray-600 text-lg leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-8">
                  <Link 
                    to="/contact"
                    className="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all"
                    style={{ color: colors[600] }}
                  >
                    Get in Touch
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: colors[600] }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your New Home?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto" style={{ color: colors[100] }}>
            Contact us today and let us help you find the perfect rental property 
            that fits your needs and budget.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/houses" 
              className="font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 shadow-lg"
              style={{ color: colors[600] }}
            >
              Browse Houses
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href={`https://wa.me/${companyInfo.whatsapp || '254700000000'}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-2 border-white text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 hover:bg-white shadow-lg"
              onMouseEnter={(e) => e.currentTarget.style.color = colors[600]}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              <Phone className="w-5 h-5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
