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
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';
import { useScrollAnimation, useCountUp } from '../hooks/useScrollAnimation';
import { useTheme } from '../context/ThemeContext';

const iconMap = {
  Building, MapPin, Shield, Clock, Star, Users, Home, CheckCircle
};

const StatItem = ({ value, label, isVisible, index, duration, labelColor }) => {
  const animatedValue = useCountUp(value, duration || 2000, isVisible);
  return (
    <div 
      className={`transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDuration: `${duration || 700}ms`, transitionDelay: `${index * 150}ms` }}
    >
      <div className="text-3xl md:text-4xl font-bold">{animatedValue}</div>
      <div className="text-sm" style={{ color: labelColor || '#bfdbfe' }}>{label}</div>
    </div>
  );
};

const FeatureCard = ({ feature, index, isVisible, animSettings }) => {
  const IconComponent = iconMap[feature.icon] || Building;
  const duration = animSettings?.duration || 700;
  const stagger = animSettings?.staggerDelay || 100;
  return (
    <div 
      className={`text-center p-6 rounded-xl hover:bg-gray-50 transition-all ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${index * stagger}ms` }}
    >
      <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <IconComponent className="w-7 h-7 text-primary-600" />
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-gray-600 text-sm">{feature.description}</p>
    </div>
  );
};

const HomePage = () => {
  const [featuredHouses, setFeaturedHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [statsRef, statsVisible] = useScrollAnimation(0.8, true);
  const [featuresRef, featuresVisible] = useScrollAnimation(0.2, true);
  const [housesRef, housesVisible] = useScrollAnimation(0.1, true);
  const [locationsRef, locationsVisible] = useScrollAnimation(0.2, true);
  const [postsRef, postsVisible] = useScrollAnimation(0.2, true);
  const [ctaRef, ctaVisible] = useScrollAnimation(0.3, true);
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [housesRes, settingsRes] = await Promise.all([
        api.get('/houses?status=available'),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);
      
      const houses = housesRes.data
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, 6);
      setFeaturedHouses(houses);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show stats and features if configured by admin
  const stats = settings?.hero_stats || [];
  const features = settings?.features || [];
  const companyInfo = settings?.company_info || {};
  const animSettings = settings?.animation_settings || { duration: 700, staggerDelay: 100 };
  // Helper to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
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
    overlayOpacityMobile: settings?.hero_content?.overlayOpacityMobile ?? settings?.hero_content?.overlayOpacity ?? 0.6,
    statsLabelColor: settings?.hero_content?.statsLabelColor || '#bfdbfe',
    statsRibbonColor: settings?.hero_content?.statsRibbonColor || '#000000',
    statsRibbonOpacity: settings?.hero_content?.statsRibbonOpacity ?? 0.3
  };

  // Compute stats ribbon background with proper opacity
  const statsRibbonBg = hexToRgba(heroContent.statsRibbonColor, heroContent.statsRibbonOpacity);
  const featuresSection = settings?.features_section || { title: '', subtitle: '' };
  const housesSection = settings?.houses_section || { title: '', subtitle: '' };
  const locationsSection = settings?.locations_section || {
    title: '',
    subtitle: '',
    locations: []
  };
  const aboutSection = {
    title: settings?.about_section?.title || '',
    subtitle: settings?.about_section?.subtitle || '',
    content: settings?.about_section?.content || ''
  };
  const digiPosts = {
    title: settings?.digi_posts?.title || '',
    subtitle: settings?.digi_posts?.subtitle || '',
    posts: settings?.digi_posts?.posts || []
  };

  // Auto-slide for Digi Posts - slide one at a time
  useEffect(() => {
    if (digiPosts.posts.length > 1 && slideRef.current) {
      const interval = setInterval(() => {
        const container = slideRef.current;
        if (container) {
          const cardWidth = container.querySelector('div')?.offsetWidth || 300;
          const maxScroll = container.scrollWidth - container.clientWidth;
          const currentScroll = container.scrollLeft;
          
          if (currentScroll >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
          }
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [digiPosts.posts.length]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section 
        className="relative text-white overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${colors[600]}, ${colors[700]}, ${colors[800]})` }}
      >
        {/* Desktop Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: `url('${heroContent.backgroundImage}')` }}
        ></div>
        {/* Mobile Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url('${heroContent.backgroundImageMobile}')` }}
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {heroContent.title}{' '}
              <span style={{ color: heroContent.highlightColor }}>{heroContent.highlight}</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl" style={{ color: heroContent.descriptionHighlightColor }}>
              {heroContent.description}
            </p>
            <div className="flex flex-wrap gap-4">
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
                style={{ '--hover-color': colors[600] }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors[600]}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                <Phone className="w-5 h-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Only show if stats are configured */}
      {stats.length > 0 && (
        <section 
          ref={statsRef} 
          className="py-8 md:py-12 backdrop-blur-md"
          style={{ backgroundColor: statsRibbonBg }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {stats.map((stat, index) => (
                <StatItem 
                  key={index} 
                  value={stat.value} 
                  label={stat.label} 
                  isVisible={statsVisible}
                  index={index}
                  duration={animSettings.duration}
                  labelColor={heroContent.statsLabelColor}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Only show if features are configured */}
      {features.length > 0 && (
        <section ref={featuresRef} className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(featuresSection.title || featuresSection.subtitle) && (
              <div className={`text-center mb-12 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {featuresSection.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {featuresSection.title}
                  </h2>
                )}
                {featuresSection.subtitle && (
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {featuresSection.subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  feature={feature} 
                  index={index}
                  isVisible={featuresVisible}
                  animSettings={animSettings}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Houses */}
      <section ref={housesRef} className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col md:flex-row md:items-end justify-between mb-10 transition-all ${housesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDuration: `${animSettings.duration}ms` }}>
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
              {featuredHouses.map((house, index) => {
                // Calculate row (0, 1, 2...) based on 3 columns for lg, 2 for md, 1 for sm
                const rowIndex = Math.floor(index / 3);
                return (
                  <div 
                    key={house.id}
                    className={`transition-all ${housesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDuration: `${animSettings.duration}ms`, transitionDelay: `${rowIndex * (animSettings.staggerDelay * 3)}ms` }}
                  >
                    <HouseCard house={house} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No houses available at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* Locations Section */}
      <section ref={locationsRef} className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all ${locationsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDuration: `${animSettings.duration}ms` }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locationsSection.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locationsSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(locationsSection.locations || []).map((loc, index) => {
              // Handle both relative and absolute image URLs
              const imageUrl = loc.image?.startsWith('http') 
                ? loc.image 
                : loc.image?.startsWith('/uploads') 
                  ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${loc.image}`
                  : loc.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800';
              return (
              <div 
                key={loc.name || index}
                className={`relative rounded-2xl overflow-hidden group transition-all ${locationsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDuration: `${animSettings.duration}ms`, transitionDelay: `${index * animSettings.staggerDelay}ms` }}
              >
                <img 
                  src={imageUrl} 
                  alt={loc.name} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
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

      {/* About Section */}
      {(aboutSection.title || aboutSection.content) && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {aboutSection.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {aboutSection.title}
              </h2>
            )}
            {aboutSection.subtitle && (
              <p className="text-lg text-primary-600 font-medium mb-6">
                {aboutSection.subtitle}
              </p>
            )}
            {aboutSection.content && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {aboutSection.content}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Digi Posts Section */}
      {digiPosts?.posts?.length > 0 && (
        <section ref={postsRef} className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(digiPosts.title || digiPosts.subtitle) && (
              <div className={`text-center mb-12 transition-all ${postsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDuration: `${animSettings.duration}ms` }}>
                {digiPosts.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {digiPosts.title}
                  </h2>
                )}
                {digiPosts.subtitle && (
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {digiPosts.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Slideshow Container */}
            <div className={`relative transition-all ${postsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDuration: `${animSettings.duration}ms`, transitionDelay: '200ms' }}>
              {/* Slider - 2 per row on mobile, 3 per row on desktop */}
              <div 
                ref={slideRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {digiPosts.posts.map((post, index) => {
                  // Handle both Cloudinary URLs and local URLs
                  const imageUrl = post.image?.startsWith('http') 
                    ? post.image 
                    : post.image?.startsWith('/uploads') 
                      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${post.image}`
                      : post.image;
                  if (!imageUrl) return null;
                  return (
                  <div 
                    key={index}
                    className="flex-shrink-0 snap-start w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)]"
                  >
                    <div className="rounded-xl overflow-hidden shadow-lg group bg-white h-full flex flex-col">
                      <div className="overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={post.caption || `Post ${index + 1}`}
                          className="w-full h-52 sm:h-60 md:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {post.caption && (
                        <div className="p-4 bg-white">
                          <p className="text-gray-700 text-sm font-medium">{post.caption}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              {digiPosts.posts.length > 2 && (
                <>
                  <button 
                    onClick={() => {
                      const container = slideRef.current;
                      if (container) {
                        const cardWidth = container.querySelector('div')?.offsetWidth || 300;
                        container.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' });
                      }
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    style={{ color: colors[600] }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => {
                      const container = slideRef.current;
                      if (container) {
                        const cardWidth = container.querySelector('div')?.offsetWidth || 300;
                        container.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
                      }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    style={{ color: colors[600] }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 md:py-24" style={{ backgroundColor: colors[600] }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold text-white mb-4 transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Ready to Find Your New Home?
          </h2>
          <p className={`mb-8 max-w-2xl mx-auto transition-all duration-700 delay-100 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ color: colors[100] }}>
            Contact us today and let us help you find the perfect rental property 
            that fits your needs and budget.
          </p>
          <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-200 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link 
              to="/houses" 
              className="font-medium py-2.5 px-5 rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 hover:scale-105 animate-pulse-subtle shadow-lg"
              style={{ color: colors[600] }}
            >
              Browse Houses
              <ArrowRight className="w-5 h-5 animate-bounce-x" />
            </Link>
            <a 
              href={`https://wa.me/${companyInfo.whatsapp || '254700000000'}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-2 border-white text-white font-medium py-2 px-5 rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 hover:bg-white hover:scale-105 animate-pulse-subtle shadow-lg"
              style={{ animationDelay: '0.5s' }}
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
