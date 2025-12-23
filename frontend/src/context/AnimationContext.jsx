import { createContext, useContext, useEffect, useState } from 'react';
import api from '../config/api';
import { setAnimationSettings } from '../hooks/useNewAnimations';

const AnimationContext = createContext({});

export const AnimationProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    animationStyle: 'pop',
    baseDelay: 150,
    cardStaggerMultiplier: 1,
    heroStaggerMultiplier: 2,
    sectionStaggerMultiplier: 1.5,
    heroTextDelay: 400,
    statsCountDuration: 2000
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAnimationSettings = async () => {
      try {
        const response = await api.get('/settings/animations');
        if (response.data) {
          console.log('🎬 Fetched animation settings from API:', response.data);
          setSettings(response.data);
          setAnimationSettings(response.data);
        }
      } catch (error) {
        console.log('⚠️ Using default animation settings');
        setAnimationSettings(settings);
      } finally {
        setLoaded(true);
      }
    };

    fetchAnimationSettings();
  }, []);

  return (
    <AnimationContext.Provider value={{ settings, loaded }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimationContext = () => useContext(AnimationContext);

export default AnimationContext;
