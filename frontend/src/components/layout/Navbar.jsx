import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Building, Phone } from 'lucide-react';
import api from '../../config/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    name: 'DIGIHOMES',
    primaryColor: '#2563eb',
    secondaryColor: '#dc2626'
  });
  const [logo, setLogo] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data?.brand_settings) {
          setBrandSettings(prev => ({ ...prev, ...response.data.brand_settings }));
          // Use logo from brand_settings first, fallback to company_info
          if (response.data.brand_settings.logo) {
            setLogo(response.data.brand_settings.logo);
          } else if (response.data?.company_info?.logo) {
            setLogo(response.data.company_info.logo);
          }
        }
      } catch (error) {
        // Use defaults
      }
    };
    fetchSettings();
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/houses', label: 'Houses', icon: Building },
    { path: '/contact', label: 'Contact', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  const brandName = brandSettings.name || 'DIGIHOMES';
  const splitAt = brandSettings.splitPosition || Math.ceil(brandName.length / 2);
  const firstPart = brandName.slice(0, splitAt);
  const secondPart = brandName.slice(splitAt);

  return (
    <nav className="bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Brand Name */}
          <Link to="/" className="flex items-center gap-2">
            {logo && (
              <img 
                src={logo} 
                alt={brandName} 
                className="h-10 w-auto object-contain max-w-[120px]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex items-center">
              <span style={{ color: brandSettings.primaryColor }} className="font-bold text-xl sm:text-2xl">
                {firstPart}
              </span>
              <span style={{ color: brandSettings.secondaryColor }} className="font-bold text-xl sm:text-2xl">
                {secondPart}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
