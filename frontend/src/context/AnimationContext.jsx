import { createContext, useState, useEffect } from 'react';
import api from '../config/api';

export const AnimationContext = createContext();

export const AnimationProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    heroStyle: 'slideUp',
    heroDuration: 800,
    statsCountDuration: 2000,
    cardStyle: 'slideUp',
    cardDuration: 600,
    cardStagger: 150,
    cardStyleMobile: 'slideUp',
    cardDurationMobile: 400,
    cardStaggerMobile: 100
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
