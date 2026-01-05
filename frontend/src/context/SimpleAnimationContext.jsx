import { createContext, useContext, useEffect, useState } from 'react';
import api from '../config/api';
import { setAnimationSettings } from '../hooks/useSimpleAnimations';

const SimpleAnimationContext = createContext({});

export const SimpleAnimationProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    style: 'pop',
    delay: 100
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('🎬 Fetching animation settings...');
        const response = await api.get('/settings/animations');
        console.log('🎬 API Response:', response.data);
        if (response.data) {
          const newSettings = {
            enabled: response.data.enabled !== false,
            style: response.data.style || 'pop',
            delay: response.data.delay || 100
          };
          console.log('🎬 Animation settings loaded:', newSettings);
          setSettings(newSettings);
          setAnimationSettings(newSettings);
        }
      } catch (error) {
        console.log('⚠️ Animation settings error:', error.message);
        console.log('Using default animation settings');
        const defaultSettings = {
          enabled: true,
          style: 'pop',
          delay: 100
        };
        setSettings(defaultSettings);
        setAnimationSettings(defaultSettings);
      } finally {
        setLoaded(true);
        console.log('✅ Animation system ready');
      }
    };

    fetchSettings();
  }, []);

  return (
    <SimpleAnimationContext.Provider value={{ settings, loaded }}>
      {children}
    </SimpleAnimationContext.Provider>
  );
};

export const useSimpleAnimation = () => useContext(SimpleAnimationContext);

export default SimpleAnimationContext;
