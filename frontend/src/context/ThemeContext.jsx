import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const ThemeContext = createContext();

// Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 37, g: 99, b: 235 }; // Default blue
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
};

// Lighten or darken a color
const adjustColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  const adjust = (value) => Math.min(255, Math.max(0, Math.round(value + (255 * percent / 100))));
  if (percent > 0) {
    // Lighten
    return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`;
  } else {
    // Darken
    const factor = (100 + percent) / 100;
    return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
  }
};

// Generate color shades from base color (600 level)
const generateShades = (hex) => {
  const rgb = hexToRgb(hex);
  return {
    50: adjustColor(hex, 47),
    100: adjustColor(hex, 40),
    200: adjustColor(hex, 30),
    300: adjustColor(hex, 20),
    400: adjustColor(hex, 10),
    500: adjustColor(hex, 5),
    600: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    700: adjustColor(hex, -10),
    800: adjustColor(hex, -20),
    900: adjustColor(hex, -30),
  };
};

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [colors, setColors] = useState(generateShades('#2563eb'));
  const [brandSettings, setBrandSettings] = useState(null);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data?.brand_settings) {
          setBrandSettings(response.data.brand_settings);
          if (response.data.brand_settings.themeColor) {
            setThemeColor(response.data.brand_settings.themeColor);
          }
        }
      } catch (error) {
        // Use default
      }
    };
    fetchTheme();
  }, []);

  // Generate and apply color shades when theme changes
  useEffect(() => {
    const shades = generateShades(themeColor);
    setColors(shades);
    
    // Apply to CSS variables for Tailwind
    const root = document.documentElement;
    Object.entries(shades).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });
    root.style.setProperty('--theme-color', themeColor);
    
    // Also set RGB values for opacity support
    const rgb = hexToRgb(themeColor);
    root.style.setProperty('--theme-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }, [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, colors, brandSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
