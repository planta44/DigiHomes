import { useState, useEffect } from 'react';
import { Building, Home, Users, Shield, MapPin, Clock, Star, CheckCircle, Briefcase } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useHeroAnimation, useStaggerAnimation } from '../hooks/useAnimations';

const iconMap = { Building, Home, Users, Shield, MapPin, Clock, Star, CheckCircle, Briefcase };

const defaultContent = {
  hero: { 
    title: 'Our Services', 
    subtitle: 'Professional property services tailored to your needs', 
    backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&auto=format&fit=crop&q=60' 
  },
  sections: [
    { title: 'Property Management', description: 'Complete property management services for landlords. We handle everything from tenant screening to maintenance.', icon: 'Building', items: ['Tenant screening & background checks', 'Rent collection & accounting', 'Property maintenance coordination', 'Regular property inspections'] },
    { title: 'Rental Services', description: 'Find your perfect rental home with our expert guidance and personalized service.', icon: 'Home', items: ['Property viewing arrangements', 'Lease negotiation assistance', 'Move-in coordination', 'Tenant support services'] },
    { title: 'Property Consultation', description: 'Expert advice on property investment, market trends, and management strategies.', icon: 'Users', items: ['Market analysis & valuation', 'Investment strategy advice', 'Legal compliance guidance', 'Portfolio management'] }
  ]
};

const ServicesPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  // Hero animations - re-animate when scrolling back to top
  const [heroRef, heroAnim] = useHeroAnimation(0);
  const [heroRef2, heroAnim2] = useHeroAnimation(1);
  // Card animations - re-animate on scroll
  const [sectionsRef, getSectionClass] = useStaggerAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPage = async () => {
      try {
        const response = await api.get('/pages/services');
        if (response.data?.content) {
          setPageData(response.data);
        }
      } catch (error) {
        // Use default content
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const content = pageData?.content || defaultContent;

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
            ref={heroRef2} className={`text-xl md:text-2xl max-w-3xl mx-auto ${heroAnim2}`}
            style={{ color: colors[100] }}
          >
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Services Sections */}
      <section ref={sectionsRef} className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.sections?.map((section, index) => {
              const IconComponent = iconMap[section.icon] || Building;
              return (
                <div 
                  key={index}
                  data-anim-item className={`bg-gray-50 rounded-2xl p-8 hover:shadow-lg ${getSectionClass(index)}`}
                >
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: colors[100] }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: colors[600] }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                  <p className="text-gray-600 mb-6">{section.description}</p>
                  {section.items?.length > 0 && (
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li 
                          key={i} 
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ServicesPage;
