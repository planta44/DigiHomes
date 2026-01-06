import { createContext, useState, useEffect } from 'react';
import api from '../config/api';

export const AnimationContext = createContext();

export const AnimationProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    heroStyle: 'slideUp',
    heroDuration: 800,
    statsCountDuration: 2000,
    // Section-specific animation settings
    sections: {
      features: {
        enabled: true,
        style: 'slideUp',
        duration: 600,
        stagger: 150,
        styleMobile: 'slideUp',
        durationMobile: 400,
        staggerMobile: 100
      },
      houses: {
        enabled: true,
        style: 'slideUp',
        duration: 600,
        stagger: 150,
        styleMobile: 'slideUp',
        durationMobile: 400,
        staggerMobile: 100
      },
      locations: {
        enabled: true,
        style: 'slideUp',
        duration: 600,
        stagger: 150,
        styleMobile: 'slideUp',
        durationMobile: 400,
        staggerMobile: 100
      },
      about: {
        enabled: true,
        style: 'slideUp',
        duration: 600,
        stagger: 150,
        styleMobile: 'slideUp',
        durationMobile: 400,
        staggerMobile: 100
      },
      properties: {
        enabled: true,
        style: 'slideUp',
        duration: 600,
        stagger: 150,
        styleMobile: 'slideUp',
        durationMobile: 400,
        staggerMobile: 100
      },
      contact: {
        enabled: true,
        style: 'slideUp',
        duration: 600,
        stagger: 150,
        styleMobile: 'slideUp',
        durationMobile: 400,
        staggerMobile: 100
      }
    }
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/animations');
        setSettings(prev => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Failed to load animation settings:', error);
      } finally {
        setLoaded(true);
      }
    };
    fetchSettings();
  }, []);

  return (
    <AnimationContext.Provider value={{ settings, loaded }}>
      {children}
    </AnimationContext.Provider>
  );
};
