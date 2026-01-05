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
import { 
  useHeroAnimation, 
  useScrollAnimation, 
  useCardStagger, 
  useStatsCounter, 
  useStatsInView 
} from '../hooks/useSimpleAnimations';

// Stat item with count-up animation - MUST visibly count from 0
const StatItem = ({ stat, isInView, numberColor, textColor }) => {
  const animatedValue = useStatsCounter(stat.value, isInView);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: numberColor || '#ffffff' }}>
        {animatedValue}
      </div>
      <div className="text-sm md:text-base font-medium uppercase tracking-wider" style={{ color: textColor || '#9ca3af' }}>
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
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState(null);
  const { colors } = useTheme();
  
  // Hero text animations using hooks - wait for image load
  const [heroRef, setHeroImageLoaded] = useHeroAnimation(0, true);
  const [heroRef2] = useHeroAnimation(1, true);
  const [heroRef3] = useHeroAnimation(2, true);
  
  // Detect hero image load
  useEffect(() => {
    console.log('🖼️ Image load check:', { settingsLoaded, hasImage: !!settings?.hero_content?.backgroundImage });
    if (!settingsLoaded) return;
    
    const heroImage = settings?.hero_content?.backgroundImage || '';
    if (!heroImage) {
      console.log('🖼️ No hero image, triggering animations immediately');
      setHeroImageLoaded(true);
      return;
    }
    
    console.log('🖼️ Loading hero image:', heroImage);
    const img = new Image();
    img.onload = () => {
      console.log('✅ Hero image loaded successfully');
      setHeroImageLoaded(true);
    };
    img.onerror = () => {
      console.log('⚠️ Hero image failed to load, triggering animations anyway');
      setHeroImageLoaded(true);
    };
    img.src = heroImage;
  }, [settingsLoaded, settings?.hero_content?.backgroundImage, setHeroImageLoaded]);
  
  // Stats section - MUST count from 0 when visible
  const [statsRef, statsInView] = useStatsInView();
  
  // Section animations - trigger on scroll
  const featuresTitleRef = useScrollAnimation(0);
  const featuresSubtitleRef = useScrollAnimation(1);
  const featuresGridRef = useCardStagger();
  
  const statsHeadingRef = useScrollAnimation(0);
  const statsSubtitleRef = useScrollAnimation(1);
  
  const housesTitleRef = useScrollAnimation(0);
  const housesSubtitleRef = useScrollAnimation(1);
  const housesGridRef = useCardStagger();
  
  const locationsTitleRef = useScrollAnimation(0);
  const locationsSubtitleRef = useScrollAnimation(1);
  const locationsGridRef = useCardStagger();
  
  const aboutHeadingRef = useScrollAnimation(0);
  const aboutContentRef = useScrollAnimation(1);
  
  // CTA animations
  const ctaTitleRef = useScrollAnimation(0);
  const ctaTextRef = useScrollAnimation(1);
  const ctaButtonsRef = useScrollAnimation(2);

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
      
      // Use admin-selected featured IDs if available, otherwise fallback to featured flag
      // Include ALL property types (rent, buy, lease) in featured section
      const savedFeaturedIds = siteSettings.featured_properties || [];
      let houses;
      
      if (savedFeaturedIds.length > 0) {
        // Get houses in the order specified by admin (up to 9)
        houses = savedFeaturedIds
          .map(id => allHouses.find(h => h.id === id))
          .filter(Boolean)
          .slice(0, 9);
      } else {
        // Fallback: sort by featured flag (up to 9)
        houses = allHouses
          .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
          .slice(0, 9);
      }
      
      setFeaturedHouses(houses);
      setSettings(siteSettings);
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSettingsLoaded(true); // Still mark as loaded even on error
    } finally {
      setLoading(false);
    }
  };

  // Default stats
  const defaultStats = [
    { value: '5000+', label: 'Happy Clients' },
    { value: '200+', label: 'Properties' },
    { value: '50+', label: 'Locations' },
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

  // Hero positioning settings - now using percentage from bottom
  const heroPositioning = {
    desktopHeight: settings?.hero_content?.desktopHeight || '100vh',
    mobileHeight: settings?.hero_content?.mobileHeight || '100vh',
    desktopAlign: settings?.hero_content?.desktopAlign || '10', // percentage from bottom
    mobileAlign: settings?.hero_content?.mobileAlign || '10' // percentage from bottom
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

  return (
    <PublicLayout>
      {/* Global styles for hero positioning and animations */}
      <style>{`
        .hero-container {
          min-height: ${heroPositioning.mobileHeight};
        }
        @media (min-width: 768px) {
          .hero-container {
            min-height: ${heroPositioning.desktopHeight} !important;
          }
        }
        .hero-content-wrapper {
          bottom: ${heroPositioning.mobileAlign}%;
        }
        @media (min-width: 768px) {
          .hero-content-wrapper {
            bottom: ${heroPositioning.desktopAlign}% !important;
          }
        }
        @keyframes popUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .hero-pop-up {
          opacity: 0;
          transform: translateY(30px);
        }
        .hero-pop-up.visible {
          animation: popUp 0.6s ease-out forwards;
        }
        .hero-pop-up.visible.delay-1 { animation-delay: 0.1s; }
        .hero-pop-up.visible.delay-2 { animation-delay: 0.2s; }
        .hero-pop-up.visible.delay-3 { animation-delay: 0.3s; }
        .btn-animate {
          animation: pulse-scale 2s ease-in-out infinite;
        }
        .btn-animate:hover {
          animation: none;
        }
      `}</style>

      {/* Hero Section */}
      <section ref={heroRef} className="hero-container relative text-white overflow-hidden">
        {/* Desktop Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ 
            backgroundImage: heroContent.backgroundImage ? `url('${heroContent.backgroundImage}')` : 'none',
            backgroundColor: '#1a1a1a'
          }}
        ></div>
        {/* Mobile Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ 
            backgroundImage: heroContent.backgroundImageMobile ? `url('${heroContent.backgroundImageMobile}')` : 'none',
            backgroundColor: '#1a1a1a'
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
        
        {/* Content wrapper with percentage-based positioning from bottom */}
        <div className="hero-content-wrapper absolute left-0 right-0 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <h1 ref={heroRef} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-left">
                {heroContent.title}{' '}
                <span style={{ color: heroContent.highlightColor }}>{heroContent.highlight}</span>
              </h1>
              <p ref={heroRef2} className="text-lg md:text-xl mb-6 max-w-2xl text-left" style={{ color: heroContent.descriptionHighlightColor }}>
                {heroContent.description}
              </p>
              <div ref={heroRef3} className="flex flex-wrap gap-4 justify-start">
                <Link 
                  to="/houses" 
                  className="btn-animate font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100"
                  style={{ color: colors[600] }}
                >
                  Browse Houses
                  <ArrowRight className="w-5 h-5" />
                </Link>
                {companyInfo.whatsapp && (
                  <a 
                    href={`https://wa.me/${companyInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-animate border-2 border-green-500 bg-green-500 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 hover:bg-green-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp Us
                  </a>
                )}
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
            <h2 ref={featuresTitleRef} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {featuresSection.title}
            </h2>
            <p ref={featuresSubtitleRef} className="text-gray-600 max-w-2xl mx-auto text-left md:text-center">
              {featuresSection.subtitle}
            </p>
          </div>

          <div ref={featuresGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                data-card-item
              >
                <FeatureCard feature={feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Count up animation - only render when settings loaded to prevent flash */}
      {settingsLoaded && (
        <section 
          ref={statsRef}
          className="py-16 md:py-20 transition-opacity duration-300"
          style={{ backgroundColor: statsSection.backgroundColor || '#1f2937' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {statsSection.title && (
              <div className="text-center mb-12">
                <h2 ref={statsHeadingRef} className="text-3xl md:text-4xl font-bold mb-4" style={{ color: statsSection.numberColor || '#ffffff' }}>{statsSection.title}</h2>
                {statsSection.subtitle && <p ref={statsSubtitleRef} className="max-w-2xl mx-auto" style={{ color: statsSection.textColor || '#9ca3af' }}>{statsSection.subtitle}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <StatItem key={index} stat={stat} isInView={statsInView} numberColor={statsSection.numberColor} textColor={statsSection.textColor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Houses */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 ref={housesTitleRef} className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {housesSection.title}
              </h2>
              <p ref={housesSubtitleRef} className="text-gray-600">
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
            <div ref={housesGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHouses.map((house, index) => (
                <div 
                  key={house.id}
                  data-card-item
                >
                  <HouseCard house={house} />
                </div>
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
            <h2 ref={locationsTitleRef} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locationsSection.title}
            </h2>
            <p ref={locationsSubtitleRef} className="text-gray-600 max-w-2xl mx-auto">
              {locationsSection.subtitle}
            </p>
          </div>

          <div ref={locationsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(locationsSection.locations || []).map((loc, index) => {
              const imageUrl = loc.image?.startsWith('http') 
                ? loc.image 
                : loc.image?.startsWith('/uploads') 
                  ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${loc.image}`
                  : loc.image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800';
              return (
              <div 
                key={loc.name || index}
                data-card-item
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
              <div 
                className={aboutSection.image ? '' : 'lg:col-span-2 mx-auto'}
                style={{
                  width: `${aboutSection.desktopWidth || 60}%`,
                  textAlign: aboutSection.desktopAlign || 'left'
                }}
              >
                <style>{`
                  @media (max-width: 768px) {
                    .about-content-wrapper {
                      width: ${aboutSection.mobileWidth || 100}% !important;
                      text-align: ${aboutSection.mobileAlign || 'center'} !important;
                    }
                  }
                `}</style>
                <div className="about-content-wrapper" style={{ width: '100%', textAlign: 'inherit' }}>
                  {aboutSection.subtitle && (
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 bg-gray-600 text-white">
                      {aboutSection.subtitle}
                    </span>
                  )}
                  {aboutSection.title && (
                    <h2 ref={aboutHeadingRef} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      {aboutSection.title}
                    </h2>
                  )}
                  {/* Desktop Content */}
                  {aboutSection.content && (
                    <div ref={aboutContentRef} className="space-y-4 hidden md:block">
                      {aboutSection.content.split('\n').filter(line => line.trim()).map((line, index) => (
                        <p key={index} className="text-gray-600 text-lg leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                  {/* Mobile Content - fallback to desktop if not set */}
                  {(aboutSection.contentMobile || aboutSection.content) && (
                    <div className="space-y-4 md:hidden">
                      {(aboutSection.contentMobile || aboutSection.content).split('\n').filter(line => line.trim()).map((line, index) => (
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: colors[600] }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 ref={ctaTitleRef} className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your New Home?
          </h2>
          <p ref={ctaTextRef} className="mb-8 max-w-2xl mx-auto" style={{ color: colors[100] }}>
            Contact us today and let us help you find the perfect rental property 
            that fits your needs and budget.
          </p>
          <div ref={ctaButtonsRef} className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/houses" 
              className="btn-animate font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 shadow-lg"
              style={{ color: colors[600] }}
            >
              Browse Houses
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href={`https://wa.me/${companyInfo.whatsapp || '254700000000'}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-animate border-2 border-green-500 bg-green-500 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 hover:bg-green-600 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
