import { useState, useEffect } from 'react';
import { Search, MapPin, Home, Building } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const defaultContent = {
  hero: { 
    title: 'Buy Your Dream Home', 
    subtitle: 'Explore properties available for purchase in Nakuru & Nyahururu', 
    backgroundImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&auto=format&fit=crop&q=60' 
  },
  sections: [
    { 
      title: 'Why Buy With Us?', 
      description: 'We offer comprehensive support throughout your home buying journey. Our experienced team ensures a smooth and secure property purchase process.', 
      items: ['Verified property listings with clear titles', 'Complete legal documentation support', 'Flexible payment options available', 'Professional property inspection assistance', 'Negotiation support for best prices', 'After-sale support and guidance'] 
    },
    { 
      title: 'Our Buying Process', 
      description: 'We make buying property simple and straightforward with our step-by-step approach.', 
      items: ['Initial consultation to understand your needs', 'Property search and shortlisting', 'Site visits and inspections', 'Price negotiation and agreement', 'Legal verification and documentation', 'Handover and after-sale support'] 
    }
  ],
  callToAction: { title: 'Ready to find your dream home?', description: 'Contact us today to explore available properties and start your home ownership journey.', buttonText: 'Contact Us', buttonLink: '/contact' }
};

const BuyPage = () => {
  const [pageData, setPageData] = useState(null);
  const { colors } = useTheme();
  const [heroRef, heroVisible] = useScrollAnimation(0.1, true);
  const [contentRef, contentVisible] = useScrollAnimation(0.1, true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPage = async () => {
      try {
        const response = await api.get('/pages/buy');
        if (response.data?.content) {
          setPageData(response.data);
        }
      } catch (error) {
        // Use default content
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

      {/* Content Sections */}
      <section ref={contentRef} className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {content.sections?.map((section, index) => (
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

          {/* Call to Action */}
          {content.callToAction && (
            <div 
              className={`mt-16 text-center p-8 md:p-12 rounded-2xl transition-all duration-700 ${contentVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ backgroundColor: colors[50], transitionDelay: '400ms' }}
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
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default BuyPage;
