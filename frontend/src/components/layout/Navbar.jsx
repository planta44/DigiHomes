import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Building, Phone, Briefcase, ShoppingBag, Key } from 'lucide-react';
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

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/houses', label: 'Houses', icon: Building },
    { path: '/services', label: 'Services', icon: Briefcase },
    { path: '/buy', label: 'Buy', icon: ShoppingBag },
    { path: '/rent', label: 'Rent', icon: Key },
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 z-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Full Screen Mobile Navigation */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop - Transparent with blur */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Menu Panel - More transparent background */}
        <div 
          className={`absolute inset-x-0 top-0 bg-white/70 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
          style={{ maxHeight: '100vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              {logo && (
                <img src={logo} alt={brandName} className="h-10 w-auto object-contain max-w-[120px]" />
              )}
              <div className="flex items-center">
                <span style={{ color: brandSettings.primaryColor }} className="font-bold text-xl">
                  {firstPart}
                </span>
                <span style={{ color: brandSettings.secondaryColor }} className="font-bold text-xl">
                  {secondPart}
                </span>
              </div>
            </Link>
            <button
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl mb-2 transition-all duration-500 ${
                  isActive(link.path)
                    ? 'bg-primary-500/20 text-primary-600 font-semibold'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
                style={{ 
                  transitionDelay: isOpen ? `${150 + index * 75}ms` : '0ms',
                  transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                  opacity: isOpen ? 1 : 0
                }}
              >
                <div className={`p-2 rounded-lg transition-colors ${isActive(link.path) ? 'bg-primary-100' : 'bg-white/70'}`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <span className="text-lg">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div 
            className="p-4 border-t border-white/20 bg-white/50"
            style={{ 
              transitionDelay: isOpen ? '600ms' : '0ms',
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 500ms ease-out'
            }}
          >
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} {brandName}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
