import { createContext, useContext, useEffect, useState } from 'react';
import api from '../config/api';

/**
 * ANIMATION CONTEXT - Single source of truth for animation settings
 * - No module-level state
 * - Settings loaded from API
 * - `loaded` flag ensures hooks wait for settings
 */

const AnimationContext = createContext({});

export const AnimationProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    // Hero text animations
    heroAnimationStyle: 'pop',
    heroTextDelay: 400,
    heroTextStagger: 200,
    // Card animations
    cardAnimationStyle: 'pop',
    cardBaseDelay: 150,
    cardStaggerDelay: 100,
    // Section animations
    sectionAnimationStyle: 'pop',
    sectionBaseDelay: 200,
    sectionStaggerDelay: 150,
    // Stats animation
    statsCountDuration: 2000
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAnimationSettings = async () => {
      try {
        const response = await api.get('/settings/animations');
        if (response.data) {
          console.log('🎬 Animation settings loaded from API:', response.data);
          setSettings(response.data);
        } else {
          console.log('⚠️ API returned no settings, using defaults');
        }
      } catch (error) {
        console.log('⚠️ Failed to fetch settings, using defaults:', error.message);
      } finally {
        // CRITICAL: Set loaded to true so hooks can start
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
