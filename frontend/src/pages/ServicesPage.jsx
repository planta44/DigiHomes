import { useState, useEffect } from 'react';
import { Building, Home, Users, Shield, MapPin, Clock, Star, CheckCircle, Briefcase } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const iconMap = { Building, Home, Users, Shield, MapPin, Clock, Star, CheckCircle, Briefcase };

const ServicesPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const [heroRef, heroVisible] = useScrollAnimation(0.1, true);
  const [sectionsRef, sectionsVisible] = useScrollAnimation(0.1, true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await api.get('/pages/services');
        setPageData(response.data);
      } catch (error) {
        console.error('Error fetching services page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const content = pageData?.content || {
    hero: { title: 'Our Services', subtitle: 'Professional property services tailored to your needs', backgroundImage: '' },
    sections: [
      { title: 'Property Management', description: 'Complete property management services for landlords', icon: 'Building', items: ['Tenant screening', 'Rent collection', 'Maintenance coordination'] },
      { title: 'Rental Services', description: 'Find your perfect rental home with our expert guidance', icon: 'Home', items: ['Property viewing', 'Lease negotiation', 'Move-in assistance'] },
      { title: 'Consultation', description: 'Expert advice on property investment and management', icon: 'Users', items: ['Market analysis', 'Investment advice', 'Legal guidance'] }
    ]
  };

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
            className={`text-xl md:text-2xl max-w-3xl mx-auto transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
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
                  className={`bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-500 ${
                    sectionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
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
                          className={`flex items-center gap-2 text-gray-700 transition-all duration-500 ${
                            sectionsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                          }`}
                          style={{ transitionDelay: `${(index * 100) + (i * 50)}ms` }}
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
