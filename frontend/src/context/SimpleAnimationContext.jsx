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
        const response = await api.get('/settings/animations');
        if (response.data) {
          const newSettings = {
            enabled: response.data.enabled !== false,
            style: response.data.style || 'pop',
            delay: response.data.delay || 100
          };
          setSettings(newSettings);
          setAnimationSettings(newSettings);
        }
      } catch (error) {
        const defaultSettings = {
          enabled: true,
          style: 'pop',
          delay: 100
        };
        setSettings(defaultSettings);
        setAnimationSettings(defaultSettings);
      } finally {
        setLoaded(true);
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
