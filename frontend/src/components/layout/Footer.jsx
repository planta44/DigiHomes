import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import Newsletter from '../Newsletter';
import api from '../../config/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [companyInfo, setCompanyInfo] = useState({
    name: 'DIGIHOMES AGENCIES',
    tagline: 'WE CARE ALWAYS',
    phone: '+254 700 000 000',
    phone2: '+254 711 111 111',
    email: 'info@digihomes.co.ke',
    whatsapp: '254700000000',
    facebook: 'https://web.facebook.com/digihomesagency/',
    instagram: '',
    twitter: ''
  });
  const [footerContent, setFooterContent] = useState({
    tagline: 'WE CARE ALWAYS',
    description: 'Your trusted housing agency in Nakuru and Nyahururu, Kenya. Finding you the perfect home.',
    backgroundColor: '#111827',
    textColor: '#d1d5db'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data?.company_info) {
          setCompanyInfo(prev => ({ ...prev, ...response.data.company_info }));
        }
        if (response.data?.footer_content) {
          setFooterContent(prev => ({ ...prev, ...response.data.footer_content }));
        }
      } catch (error) {
        // Use defaults
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer style={{ backgroundColor: footerContent.backgroundColor || '#111827', color: footerContent.textColor || '#d1d5db' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.png" 
                alt="DIGIHOMES" 
                className="h-12 w-auto bg-white rounded p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center gap-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl text-white">DIGI</span>
                  <span className="font-bold text-xl text-red-500">HOMES</span>
                </div>
              </div>
            </div>
            <p className="text-primary-400 font-medium mb-2">{footerContent.tagline}</p>
            <p className="text-gray-400 mb-4">
              {footerContent.description}
            </p>
            <div className="flex gap-4">
              {companyInfo.facebook && (
                <a href={companyInfo.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {companyInfo.instagram && (
                <a href={companyInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {companyInfo.twitter && (
                <a href={companyInfo.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {(footerContent.quickLinks && footerContent.quickLinks.length > 0) ? (
                footerContent.quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.url} className="hover:text-primary-400 transition-colors">{link.label}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                  <li><Link to="/houses" className="hover:text-primary-400 transition-colors">Available Houses</Link></li>
                  <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary-400" />
                <div>
                  {(footerContent.contactLocations && footerContent.contactLocations.length > 0) ? (
                    footerContent.contactLocations.map((loc, i) => <p key={i}>{loc}</p>)
                  ) : (
                    <>
                      <p>Nakuru Town, Kenya</p>
                      <p>Nyahururu Town, Kenya</p>
                    </>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <div>
                  {(footerContent.contactPhones && footerContent.contactPhones.length > 0) ? (
                    footerContent.contactPhones.map((phone, i) => (
                      <a key={i} href={`tel:${phone?.replace(/\s/g, '')}`} className="hover:text-primary-400 block">{phone}</a>
                    ))
                  ) : (
                    <>
                      <a href={`tel:${companyInfo.phone?.replace(/\s/g, '')}`} className="hover:text-primary-400 block">{companyInfo.phone}</a>
                      {companyInfo.phone2 && <a href={`tel:${companyInfo.phone2?.replace(/\s/g, '')}`} className="hover:text-primary-400 block">{companyInfo.phone2}</a>}
                    </>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <a href={`mailto:${footerContent.contactEmail || companyInfo.email}`} className="hover:text-primary-400">
                  {footerContent.contactEmail || companyInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new listings and special offers.
            </p>
            <Newsletter />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} {companyInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
