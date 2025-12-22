import { createContext, useContext, useEffect, useState } from 'react';
import api from '../config/api';
import { setAnimationSettings } from '../hooks/useAnimations';

const AnimationContext = createContext({});

export const AnimationProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    baseDelay: 100,
    cardStaggerMultiplier: 1,
    heroStaggerMultiplier: 1.5,
    sectionStaggerMultiplier: 1.2
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAnimationSettings = async () => {
      try {
        const response = await api.get('/settings/animations');
        if (response.data) {
          setSettings(response.data);
          setAnimationSettings(response.data);
        }
      } catch (error) {
        console.log('Using default animation settings');
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
