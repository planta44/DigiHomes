import { useState, useEffect, useRef } from 'react';
import { 
  Save, Plus, Trash2, Settings, MapPin, Home, BarChart3, Star, Building, 
  Shield, Clock, Users, CheckCircle, Loader2, Image, FileText, Phone, Mail,
  HelpCircle, Globe, Palette, Upload, Link as LinkIcon, Zap, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import ImageUpload from '../../components/ImageUpload';
import api from '../../config/api';

const iconOptions = [
  { value: 'Building', label: 'Building' },
  { value: 'MapPin', label: 'Location' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Star', label: 'Star' },
  { value: 'Users', label: 'Users' },
  { value: 'Home', label: 'Home' },
  { value: 'CheckCircle', label: 'Check' }
];

const ImageUploadField = ({ value, onChange, label }) => {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('url');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Handle both Cloudinary (full URL) and local uploads (relative path)
      const imageUrl = response.data.url.startsWith('http') 
        ? response.data.url 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${response.data.url}`;
      onChange(imageUrl);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg ${mode === 'upload' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}>
          <Upload className="w-3 h-3" /> Upload
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg ${mode === 'url' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}>
          <LinkIcon className="w-3 h-3" /> URL
        </button>
      </div>
      {mode === 'upload' ? (
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 text-sm">
            {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Click to upload</>}
          </button>
        </div>
      ) : (
        <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="input-field text-sm" />
      )}
      {value && <img src={value} alt="Preview" className="mt-2 h-20 object-cover rounded" />}
    </div>
  );
};

const SiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  
  const [settings, setSettings] = useState({
    brand_settings: { name: 'DIGIHOMES', splitPosition: 4, primaryColor: '#2563eb', secondaryColor: '#dc2626', logo: '', themeColor: '#2563eb', hamburgerMenuBg: '#ffffff', hamburgerMenuOpacity: 0.9, hamburgerMenuTextColor: '#374151' },
    animation_settings: { enabled: true, heroAnimationStyle: 'pop', heroTextDelay: 400, heroTextStagger: 200, cardAnimationStyle: 'pop', cardBaseDelay: 150, cardStaggerDelay: 100, sectionAnimationStyle: 'pop', sectionBaseDelay: 200, sectionStaggerDelay: 150, statsCountDuration: 2000 },
    features: [],
    company_info: { name: 'DIGIHOMES AGENCIES', tagline: '', phone: '', phone2: '', email: '', whatsapp: '', facebook: '', instagram: '', twitter: '', logo: '' },
    hero_content: { title: '', highlight: '', description: '', backgroundImage: '', desktopHeight: '100vh', mobileHeight: '100vh', desktopAlign: 'bottom', mobileAlign: 'bottom' },
    features_section: { title: '', subtitle: '' },
    stats_section: { title: '', subtitle: '', stats: [{ value: '100+', label: 'Happy Clients' }], backgroundColor: '#1f2937', textColor: '#9ca3af', numberColor: '#ffffff' },
    houses_section: { title: '', subtitle: '' },
    locations_section: { title: '', subtitle: '', locations: [] },
    about_section: { title: '', subtitle: '', content: '', contentMobile: '', image: '', desktopWidth: '60', mobileWidth: '100', desktopAlign: 'left', mobileAlign: 'center' },
    footer_content: { tagline: '', description: '', quickLinks: [], contactLocations: [], contactPhones: [], contactEmail: '' },
    contact_page: { title: '', subtitle: '', workingHours: [], offices: [], faqs: [] },
    digi_posts: { title: '', subtitle: '', posts: [] }
  });

  const [locations, setLocations] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [newHouseType, setNewHouseType] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, locationsRes, typesRes] = await Promise.all([
        api.get('/settings'),
        api.get('/settings/locations'),
        api.get('/settings/house-types')
      ]);
      const data = settingsRes.data;
      setSettings(prev => ({
        ...prev,
        brand_settings: { ...prev.brand_settings, ...data.brand_settings },
        animation_settings: { ...prev.animation_settings, ...data.animation_settings },
        features: data.features || prev.features,
        company_info: { ...prev.company_info, ...data.company_info },
        hero_content: { ...prev.hero_content, ...data.hero_content },
        features_section: { ...prev.features_section, ...data.features_section },
        stats_section: { ...prev.stats_section, ...data.stats_section },
        houses_section: { ...prev.houses_section, ...data.houses_section },
        locations_section: { ...prev.locations_section, ...data.locations_section },
        about_section: { ...prev.about_section, ...data.about_section },
        footer_content: { ...prev.footer_content, ...data.footer_content },
        contact_page: { ...prev.contact_page, ...data.contact_page },
        digi_posts: { ...prev.digi_posts, ...data.digi_posts }
      }));
      setLocations(locationsRes.data);
      setHouseTypes(typesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      const dataToSave = value || settings[key];
      await api.put(`/settings/${key}`, dataToSave);
      toast.success('Saved!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;
    try {
      const res = await api.post('/settings/locations', { name: newLocation.trim() });
      setLocations([...locations, res.data]);
      setNewLocation('');
      toast.success('Added');
    } catch (e) { toast.error('Failed'); }
  };

  const handleDeleteLocation = async (id) => {
    try {
      await api.delete(`/settings/locations/${id}`);
      setLocations(locations.filter(l => l.id !== id));
      toast.success('Removed');
    } catch (e) { toast.error('Failed'); }
  };

  const handleAddHouseType = async () => {
    if (!newHouseType.trim()) return;
    try {
      const res = await api.post('/settings/house-types', { name: newHouseType.trim() });
      setHouseTypes([...houseTypes, res.data]);
      setNewHouseType('');
      toast.success('Added');
    } catch (e) { toast.error('Failed'); }
  };

  const handleDeleteHouseType = async (id) => {
    try {
      await api.delete(`/settings/house-types/${id}`);
      setHouseTypes(houseTypes.filter(t => t.id !== id));
      toast.success('Removed');
    } catch (e) { toast.error('Failed'); }
  };

  const tabs = [
    { id: 'brand', label: 'Brand', icon: Palette },
    { id: 'hero', label: 'Hero', icon: Image },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'houses', label: 'Houses', icon: Home },
    { id: 'locations_display', label: 'Locations', icon: Globe },
    { id: 'about', label: 'About', icon: FileText },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'footer', label: 'Footer', icon: FileText },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'animations', label: 'Animations', icon: Zap },
    { id: 'dropdown_options', label: 'Options', icon: MapPin }
  ];

  if (loading) {
    return <AdminLayout><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold">Site Settings</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto border-b" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex min-w-max">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6 overflow-x-auto">
            {/* Brand Settings */}
            {activeTab === 'brand' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Brand Settings</h3>
                
                {/* Logo Upload */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo (Image or SVG)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {settings.brand_settings.logo ? (
                      <div className="relative">
                        <img src={settings.brand_settings.logo} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain bg-white rounded border p-2" />
                        <button onClick={() => setSettings(prev => ({
                          ...prev, brand_settings: { ...prev.brand_settings, logo: '' }
                        }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-32 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                        No logo
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <ImageUpload
                        value={settings.brand_settings.logo || ''}
                        onChange={(url) => setSettings(prev => ({
                          ...prev, brand_settings: { ...prev.brand_settings, logo: url }
                        }))}
                        label=""
                      />
                      <p className="text-xs text-gray-500">Supports PNG, JPG, SVG. Recommended: transparent background.</p>
                    </div>
                  </div>
                </div>

                {/* Brand Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name (Header)</label>
                    <input type="text" value={settings.brand_settings.name} onChange={(e) => setSettings(prev => ({
                      ...prev, brand_settings: { ...prev.brand_settings, name: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Split Position: {settings.brand_settings.splitPosition || 4}
                    </label>
                    <input type="range" min="1" max={settings.brand_settings.name?.length || 9} step="1" 
                      value={settings.brand_settings.splitPosition || 4}
                      onChange={(e) => setSettings(prev => ({
                        ...prev, brand_settings: { ...prev.brand_settings, splitPosition: parseInt(e.target.value) }
                      }))} className="w-full mt-2" />
                  </div>
                </div>

                {/* Brand Name Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name Color 1</label>
                    <div className="flex gap-2">
                      <input type="color" value={settings.brand_settings.primaryColor} onChange={(e) => setSettings(prev => ({
                        ...prev, brand_settings: { ...prev.brand_settings, primaryColor: e.target.value }
                      }))} className="w-10 h-10 rounded cursor-pointer border" />
                      <input type="text" value={settings.brand_settings.primaryColor} onChange={(e) => setSettings(prev => ({
                        ...prev, brand_settings: { ...prev.brand_settings, primaryColor: e.target.value }
                      }))} className="input-field flex-1 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name Color 2</label>
                    <div className="flex gap-2">
                      <input type="color" value={settings.brand_settings.secondaryColor} onChange={(e) => setSettings(prev => ({
                        ...prev, brand_settings: { ...prev.brand_settings, secondaryColor: e.target.value }
                      }))} className="w-10 h-10 rounded cursor-pointer border" />
                      <input type="text" value={settings.brand_settings.secondaryColor} onChange={(e) => setSettings(prev => ({
                        ...prev, brand_settings: { ...prev.brand_settings, secondaryColor: e.target.value }
                      }))} className="input-field flex-1 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Name Preview */}
                <div className="p-3 bg-white border rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Name Preview:</p>
                  <span style={{ color: settings.brand_settings.primaryColor }} className="text-2xl font-bold">
                    {settings.brand_settings.name?.slice(0, settings.brand_settings.splitPosition || 4) || 'DIGI'}
                  </span>
                  <span style={{ color: settings.brand_settings.secondaryColor }} className="text-2xl font-bold">
                    {settings.brand_settings.name?.slice(settings.brand_settings.splitPosition || 4) || 'HOMES'}
                  </span>
                </div>

                {/* Site Theme Color */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Site Theme Color</h4>
                  <p className="text-xs text-gray-500 mb-3">This color affects the homepage background, buttons, icons, hover effects, and all accent colors across the site.</p>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={settings.brand_settings.themeColor || '#2563eb'} onChange={(e) => setSettings(prev => ({
                      ...prev, brand_settings: { ...prev.brand_settings, themeColor: e.target.value }
                    }))} className="w-12 h-12 rounded cursor-pointer border" />
                    <div className="flex-1">
                      <input type="text" value={settings.brand_settings.themeColor || '#2563eb'} onChange={(e) => setSettings(prev => ({
                        ...prev, brand_settings: { ...prev.brand_settings, themeColor: e.target.value }
                      }))} className="input-field" placeholder="#2563eb" />
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: settings.brand_settings.themeColor || '#2563eb' }}>
                    <p className="text-white text-sm font-medium">Theme Color Preview</p>
                    <p className="text-white/80 text-xs">This is how your buttons and backgrounds will look</p>
                  </div>
                </div>

                {/* Hamburger Menu Settings */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Mobile Menu (Hamburger) Settings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Menu Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.brand_settings.hamburgerMenuBg?.replace(/rgba?\([^)]+\)/, '#ffffff') || '#ffffff'} 
                          onChange={(e) => {
                            const opacity = settings.brand_settings.hamburgerMenuOpacity || 0.7;
                            const hex = e.target.value;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            setSettings(prev => ({
                              ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuBg: `rgba(${r},${g},${b},${opacity})` }
                            }));
                          }} className="w-10 h-10 rounded cursor-pointer border" />
                        <input type="text" value={settings.brand_settings.hamburgerMenuBg || 'rgba(255,255,255,0.7)'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuBg: e.target.value }
                          }))} className="input-field flex-1 text-sm" placeholder="rgba(255,255,255,0.7)" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Menu Opacity: {(settings.brand_settings.hamburgerMenuOpacity || 0.7).toFixed(1)}</label>
                      <input type="range" min="0.1" max="1" step="0.1" value={settings.brand_settings.hamburgerMenuOpacity || 0.7}
                        onChange={(e) => {
                          const opacity = parseFloat(e.target.value);
                          const currentBg = settings.brand_settings.hamburgerMenuBg || 'rgba(255,255,255,0.7)';
                          const match = currentBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                          if (match) {
                            setSettings(prev => ({
                              ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuOpacity: opacity, hamburgerMenuBg: `rgba(${match[1]},${match[2]},${match[3]},${opacity})` }
                            }));
                          }
                        }} className="w-full mt-2" />
                    </div>
                  </div>
                </div>

                {/* Hamburger Menu Text Colors */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Mobile Menu Text Colors</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link Text Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.brand_settings.hamburgerMenuTextColor || '#374151'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuTextColor: e.target.value }
                          }))} className="w-10 h-10 rounded cursor-pointer border" />
                        <input type="text" value={settings.brand_settings.hamburgerMenuTextColor || '#374151'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuTextColor: e.target.value }
                          }))} className="input-field flex-1 text-sm" placeholder="#374151" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Active Page Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.brand_settings.hamburgerMenuActiveColor || '#2563eb'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuActiveColor: e.target.value }
                          }))} className="w-10 h-10 rounded cursor-pointer border" />
                        <input type="text" value={settings.brand_settings.hamburgerMenuActiveColor || '#2563eb'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, brand_settings: { ...prev.brand_settings, hamburgerMenuActiveColor: e.target.value }
                          }))} className="input-field flex-1 text-sm" placeholder="#2563eb" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Colors for navigation links in the mobile hamburger menu. Active page shows current page color.</p>
                </div>

                <button onClick={() => handleSave('brand_settings', settings.brand_settings)} disabled={saving} className="btn-primary w-full sm:w-auto">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Brand Settings
                </button>
              </div>
            )}


            {/* Hero Section */}
            {activeTab === 'hero' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="font-semibold">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" value={settings.hero_content.title} onChange={(e) => setSettings(prev => ({
                      ...prev, hero_content: { ...prev.hero_content, title: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Text</label>
                    <input type="text" value={settings.hero_content.highlight} onChange={(e) => setSettings(prev => ({
                      ...prev, hero_content: { ...prev.hero_content, highlight: e.target.value }
                    }))} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={settings.hero_content.description} onChange={(e) => setSettings(prev => ({
                    ...prev, hero_content: { ...prev.hero_content, description: e.target.value }
                  }))} rows={3} className="input-field resize-none" />
                </div>

                {/* Background Images */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Background Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploadField label="Desktop Background" value={settings.hero_content.backgroundImage}
                      onChange={(url) => setSettings(prev => ({ ...prev, hero_content: { ...prev.hero_content, backgroundImage: url } }))} />
                    <ImageUploadField label="Mobile Background" value={settings.hero_content.backgroundImageMobile || ''}
                      onChange={(url) => setSettings(prev => ({ ...prev, hero_content: { ...prev.hero_content, backgroundImageMobile: url } }))} />
                  </div>
                </div>

                {/* Overlay Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Overlay Settings (Desktop)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.hero_content.overlayColor || '#000000'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, overlayColor: e.target.value }
                        }))} className="w-12 h-10 rounded cursor-pointer" />
                        <input type="text" value={settings.hero_content.overlayColor || '#000000'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, overlayColor: e.target.value }
                        }))} className="input-field flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Opacity ({Math.round((settings.hero_content.overlayOpacity ?? 0.5) * 100)}%)</label>
                      <input type="range" min="0" max="1" step="0.05" value={settings.hero_content.overlayOpacity ?? 0.5} onChange={(e) => setSettings(prev => ({
                        ...prev, hero_content: { ...prev.hero_content, overlayOpacity: parseFloat(e.target.value) }
                      }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Overlay Settings (Mobile)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Overlay Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.hero_content.overlayColorMobile || settings.hero_content.overlayColor || '#000000'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, overlayColorMobile: e.target.value }
                        }))} className="w-12 h-10 rounded cursor-pointer" />
                        <input type="text" value={settings.hero_content.overlayColorMobile || settings.hero_content.overlayColor || '#000000'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, overlayColorMobile: e.target.value }
                        }))} className="input-field flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Overlay Opacity ({Math.round((settings.hero_content.overlayOpacityMobile ?? settings.hero_content.overlayOpacity ?? 0.6) * 100)}%)</label>
                      <input type="range" min="0" max="1" step="0.05" value={settings.hero_content.overlayOpacityMobile ?? settings.hero_content.overlayOpacity ?? 0.6} onChange={(e) => setSettings(prev => ({
                        ...prev, hero_content: { ...prev.hero_content, overlayOpacityMobile: parseFloat(e.target.value) }
                      }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Text Colors</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title Highlight Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.hero_content.highlightColor || '#bfdbfe'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, highlightColor: e.target.value }
                        }))} className="w-12 h-10 rounded cursor-pointer" />
                        <input type="text" value={settings.hero_content.highlightColor || '#bfdbfe'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, highlightColor: e.target.value }
                        }))} className="input-field flex-1 text-sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Color of highlighted text in title</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description Text Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.hero_content.descriptionHighlightColor || '#bfdbfe'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, descriptionHighlightColor: e.target.value }
                        }))} className="w-12 h-10 rounded cursor-pointer" />
                        <input type="text" value={settings.hero_content.descriptionHighlightColor || '#bfdbfe'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, descriptionHighlightColor: e.target.value }
                        }))} className="input-field flex-1 text-sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Color of description text</p>
                    </div>
                  </div>
                </div>

                {/* Positioning Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Content Positioning</h4>
                  <p className="text-xs text-gray-500 mb-4">Position content as a percentage from the bottom of the hero section</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Desktop Settings */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm text-gray-800">Desktop (Large Screens)</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Height</label>
                        <select value={settings.hero_content.desktopHeight || '100vh'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, desktopHeight: e.target.value }
                        }))} className="input-field">
                          <option value="100vh">Full Screen (100vh)</option>
                          <option value="90vh">90% Screen</option>
                          <option value="80vh">80% Screen</option>
                          <option value="70vh">70% Screen</option>
                          <option value="60vh">60% Screen</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Position (% from bottom)</label>
                        <input 
                          type="range" 
                          min="5" 
                          max="50" 
                          step="5" 
                          value={settings.hero_content.desktopAlign || '10'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, hero_content: { ...prev.hero_content, desktopAlign: e.target.value }
                          }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>5%</span>
                          <span className="font-medium">{settings.hero_content.desktopAlign || '10'}%</span>
                          <span>50%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Settings */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm text-gray-800">Mobile (Small Screens)</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Height</label>
                        <select value={settings.hero_content.mobileHeight || '100vh'} onChange={(e) => setSettings(prev => ({
                          ...prev, hero_content: { ...prev.hero_content, mobileHeight: e.target.value }
                        }))} className="input-field">
                          <option value="100vh">Full Screen (100vh)</option>
                          <option value="90vh">90% Screen</option>
                          <option value="80vh">80% Screen</option>
                          <option value="70vh">70% Screen</option>
                          <option value="60vh">60% Screen</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Position (% from bottom)</label>
                        <input 
                          type="range" 
                          min="5" 
                          max="50" 
                          step="5" 
                          value={settings.hero_content.mobileAlign || '10'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, hero_content: { ...prev.hero_content, mobileAlign: e.target.value }
                          }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>5%</span>
                          <span className="font-medium">{settings.hero_content.mobileAlign || '10'}%</span>
                          <span>50%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleSave('hero_content', settings.hero_content)} disabled={saving} className="btn-primary mt-4">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Hero Settings
                </button>
              </div>
            )}

            {/* Features */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                    <input type="text" value={settings.features_section.title} onChange={(e) => setSettings(prev => ({
                      ...prev, features_section: { ...prev.features_section, title: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
                    <input type="text" value={settings.features_section.subtitle} onChange={(e) => setSettings(prev => ({
                      ...prev, features_section: { ...prev.features_section, subtitle: e.target.value }
                    }))} className="input-field" />
                  </div>
                </div>
                <button onClick={() => handleSave('features_section', settings.features_section)} disabled={saving} className="btn-secondary text-sm mb-4">Save Titles</button>
                
                <h4 className="font-medium text-sm">Feature Items</h4>
                {settings.features.map((feature, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select value={feature.icon} onChange={(e) => {
                        const newFeatures = [...settings.features];
                        newFeatures[index].icon = e.target.value;
                        setSettings(prev => ({ ...prev, features: newFeatures }));
                      }} className="input-field w-full sm:w-32 text-sm">
                        {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <input type="text" value={feature.title} onChange={(e) => {
                        const newFeatures = [...settings.features];
                        newFeatures[index].title = e.target.value;
                        setSettings(prev => ({ ...prev, features: newFeatures }));
                      }} placeholder="Title" className="input-field flex-1 text-sm" />
                      <button onClick={() => {
                        const newFeatures = settings.features.filter((_, i) => i !== index);
                        setSettings(prev => ({ ...prev, features: newFeatures }));
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-start"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea value={feature.description} onChange={(e) => {
                      const newFeatures = [...settings.features];
                      newFeatures[index].description = e.target.value;
                      setSettings(prev => ({ ...prev, features: newFeatures }));
                    }} placeholder="Description" rows={2} className="input-field w-full resize-none text-sm" />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSettings(prev => ({
                    ...prev, features: [...prev.features, { title: '', description: '', icon: 'Building' }]
                  }))} className="btn-secondary text-sm"><Plus className="w-4 h-4" /> Add</button>
                  <button onClick={() => handleSave('features', settings.features)} disabled={saving} className="btn-primary text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                </div>
              </div>
            )}

            {/* Stats Section */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Stats Section</h3>
                <p className="text-sm text-gray-600">This section appears below "Why Choose DIGIHOMES?" with count-up animations when scrolled into view.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title (optional)</label>
                    <input type="text" value={settings.stats_section?.title || ''} onChange={(e) => setSettings(prev => ({
                      ...prev, stats_section: { ...prev.stats_section, title: e.target.value }
                    }))} className="input-field" placeholder="Our Impact" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle (optional)</label>
                    <input type="text" value={settings.stats_section?.subtitle || ''} onChange={(e) => setSettings(prev => ({
                      ...prev, stats_section: { ...prev.stats_section, subtitle: e.target.value }
                    }))} className="input-field" placeholder="Numbers that speak for themselves" />
                  </div>
                </div>
                
                <h4 className="font-medium text-sm">Stats Items</h4>
                {(settings.stats_section?.stats || []).map((stat, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 bg-gray-50 rounded-lg">
                    <input type="text" value={stat.value} onChange={(e) => {
                      const newStats = [...(settings.stats_section?.stats || [])];
                      newStats[index].value = e.target.value;
                      setSettings(prev => ({ ...prev, stats_section: { ...prev.stats_section, stats: newStats } }));
                    }} placeholder="100+" className="input-field w-full sm:w-24" />
                    <input type="text" value={stat.label} onChange={(e) => {
                      const newStats = [...(settings.stats_section?.stats || [])];
                      newStats[index].label = e.target.value;
                      setSettings(prev => ({ ...prev, stats_section: { ...prev.stats_section, stats: newStats } }));
                    }} placeholder="Label" className="input-field flex-1" />
                    <button onClick={() => {
                      const newStats = (settings.stats_section?.stats || []).filter((_, i) => i !== index);
                      setSettings(prev => ({ ...prev, stats_section: { ...prev.stats_section, stats: newStats } }));
                    }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    stats_section: { 
                      ...prev.stats_section, 
                      stats: [...(prev.stats_section?.stats || []), { value: '', label: '' }] 
                    } 
                  }))} className="btn-secondary text-sm mb-4">
                    <Plus className="w-4 h-4" /> Add Stat
                  </button>

                {/* Stats Section Colors */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Stats Section Colors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.stats_section?.backgroundColor || '#1f2937'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, stats_section: { ...prev.stats_section, backgroundColor: e.target.value }
                          }))} className="w-10 h-10 rounded cursor-pointer border" />
                        <input type="text" value={settings.stats_section?.backgroundColor || '#1f2937'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, stats_section: { ...prev.stats_section, backgroundColor: e.target.value }
                          }))} className="input-field flex-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.stats_section?.numberColor || '#ffffff'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, stats_section: { ...prev.stats_section, numberColor: e.target.value }
                          }))} className="w-10 h-10 rounded cursor-pointer border" />
                        <input type="text" value={settings.stats_section?.numberColor || '#ffffff'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, stats_section: { ...prev.stats_section, numberColor: e.target.value }
                          }))} className="input-field flex-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label Text Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.stats_section?.textColor || '#9ca3af'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, stats_section: { ...prev.stats_section, textColor: e.target.value }
                          }))} className="w-10 h-10 rounded cursor-pointer border" />
                        <input type="text" value={settings.stats_section?.textColor || '#9ca3af'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, stats_section: { ...prev.stats_section, textColor: e.target.value }
                          }))} className="input-field flex-1 text-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="mt-4 p-4 rounded-lg text-center" style={{ backgroundColor: settings.stats_section?.backgroundColor || '#1f2937' }}>
                    <span className="text-3xl font-bold" style={{ color: settings.stats_section?.numberColor || '#ffffff' }}>100+</span>
                    <p className="text-sm mt-1" style={{ color: settings.stats_section?.textColor || '#9ca3af' }}>Preview Label</p>
                  </div>
                </div>

                <button onClick={() => handleSave('stats_section', settings.stats_section)} disabled={saving} className="btn-primary text-sm mt-4">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Stats
                </button>
              </div>
            )}

            {/* Houses Section */}
            {activeTab === 'houses' && (
              <div className="space-y-4 max-w-lg">
                <h3 className="font-semibold">Houses Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={settings.houses_section.title} onChange={(e) => setSettings(prev => ({
                    ...prev, houses_section: { ...prev.houses_section, title: e.target.value }
                  }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input type="text" value={settings.houses_section.subtitle} onChange={(e) => setSettings(prev => ({
                    ...prev, houses_section: { ...prev.houses_section, subtitle: e.target.value }
                  }))} className="input-field" />
                </div>
                <button onClick={() => handleSave('houses_section', settings.houses_section)} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            )}

            {/* Locations Display */}
            {activeTab === 'locations_display' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Locations Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" value={settings.locations_section.title} onChange={(e) => setSettings(prev => ({
                      ...prev, locations_section: { ...prev.locations_section, title: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input type="text" value={settings.locations_section.subtitle} onChange={(e) => setSettings(prev => ({
                      ...prev, locations_section: { ...prev.locations_section, subtitle: e.target.value }
                    }))} className="input-field" />
                  </div>
                </div>
                
                <h4 className="font-medium text-sm">Location Cards</h4>
                {(settings.locations_section.locations || []).map((loc, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-start">
                      <input type="text" value={loc.name} onChange={(e) => {
                        const newLocs = [...settings.locations_section.locations];
                        newLocs[index].name = e.target.value;
                        setSettings(prev => ({ ...prev, locations_section: { ...prev.locations_section, locations: newLocs } }));
                      }} placeholder="Name" className="input-field flex-1 text-sm" />
                      <button onClick={() => {
                        const newLocs = settings.locations_section.locations.filter((_, i) => i !== index);
                        setSettings(prev => ({ ...prev, locations_section: { ...prev.locations_section, locations: newLocs } }));
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input type="text" value={loc.description} onChange={(e) => {
                      const newLocs = [...settings.locations_section.locations];
                      newLocs[index].description = e.target.value;
                      setSettings(prev => ({ ...prev, locations_section: { ...prev.locations_section, locations: newLocs } }));
                    }} placeholder="Description" className="input-field w-full text-sm" />
                    <ImageUploadField label="Card Image" value={loc.image} onChange={(url) => {
                      const newLocs = [...settings.locations_section.locations];
                      newLocs[index].image = url;
                      setSettings(prev => ({ ...prev, locations_section: { ...prev.locations_section, locations: newLocs } }));
                    }} />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSettings(prev => ({
                    ...prev, locations_section: { ...prev.locations_section, locations: [...(prev.locations_section.locations || []), { name: '', description: '', image: '' }] }
                  }))} className="btn-secondary text-sm"><Plus className="w-4 h-4" /> Add</button>
                  <button onClick={() => handleSave('locations_section', settings.locations_section)} disabled={saving} className="btn-primary text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                </div>
              </div>
            )}

            {/* About Section */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="font-semibold">About Us Section</h3>
                <p className="text-sm text-gray-600">This section appears below "Our Locations" on the homepage.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Badge)</label>
                  <input type="text" value={settings.about_section?.subtitle || ''} onChange={(e) => setSettings(prev => ({
                    ...prev, about_section: { ...prev.about_section, subtitle: e.target.value }
                  }))} className="input-field" placeholder="About Us" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={settings.about_section?.title || ''} onChange={(e) => setSettings(prev => ({
                    ...prev, about_section: { ...prev.about_section, title: e.target.value }
                  }))} className="input-field" placeholder="Your Trusted Property Partner" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (Desktop)</label>
                    <textarea 
                      value={settings.about_section?.content || ''} 
                      onChange={(e) => setSettings(prev => ({
                        ...prev, about_section: { ...prev.about_section, content: e.target.value }
                      }))} 
                      className="input-field min-h-[150px]" 
                      placeholder="Desktop content - shown on larger screens"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown on desktop/tablet screens</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (Mobile)</label>
                    <textarea 
                      value={settings.about_section?.contentMobile || ''} 
                      onChange={(e) => setSettings(prev => ({
                        ...prev, about_section: { ...prev.about_section, contentMobile: e.target.value }
                      }))} 
                      className="input-field min-h-[150px]" 
                      placeholder="Mobile content - shorter version for small screens (optional)"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown on mobile screens. Leave empty to use desktop content.</p>
                  </div>
                </div>
                <ImageUploadField 
                  label="Section Image (optional)" 
                  value={settings.about_section?.image || ''} 
                  onChange={(url) => setSettings(prev => ({
                    ...prev, about_section: { ...prev.about_section, image: url }
                  }))} 
                />

                {/* Layout Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3">Content Layout</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Desktop Settings */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm text-gray-800">Desktop (Large Screens)</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Width (%)</label>
                        <input type="range" min="40" max="100" step="5" 
                          value={settings.about_section?.desktopWidth || '60'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, about_section: { ...prev.about_section, desktopWidth: e.target.value }
                          }))} className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>40%</span>
                          <span className="font-medium">{settings.about_section?.desktopWidth || '60'}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                        <select value={settings.about_section?.desktopAlign || 'left'} onChange={(e) => setSettings(prev => ({
                          ...prev, about_section: { ...prev.about_section, desktopAlign: e.target.value }
                        }))} className="input-field">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Mobile Settings */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm text-gray-800">Mobile (Small Screens)</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Width (%)</label>
                        <input type="range" min="80" max="100" step="5" 
                          value={settings.about_section?.mobileWidth || '100'} 
                          onChange={(e) => setSettings(prev => ({
                            ...prev, about_section: { ...prev.about_section, mobileWidth: e.target.value }
                          }))} className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>80%</span>
                          <span className="font-medium">{settings.about_section?.mobileWidth || '100'}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                        <select value={settings.about_section?.mobileAlign || 'center'} onChange={(e) => setSettings(prev => ({
                          ...prev, about_section: { ...prev.about_section, mobileAlign: e.target.value }
                        }))} className="input-field">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleSave('about_section', settings.about_section)} disabled={saving} className="btn-primary mt-4">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save About Section
                </button>
              </div>
            )}

            {/* Company Info */}
            {activeTab === 'company' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Company Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" value={settings.company_info.name} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, name: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input type="text" value={settings.company_info.tagline} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, tagline: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <ImageUploadField label="Logo" value={settings.company_info.logo} onChange={(url) => setSettings(prev => ({
                    ...prev, company_info: { ...prev.company_info, logo: url }
                  }))} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone 1</label>
                    <input type="text" value={settings.company_info.phone} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, phone: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone 2</label>
                    <input type="text" value={settings.company_info.phone2} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, phone2: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={settings.company_info.email} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, email: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input type="text" value={settings.company_info.whatsapp} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, whatsapp: e.target.value }
                    }))} placeholder="254700000000" className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input type="url" value={settings.company_info.facebook} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, facebook: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input type="url" value={settings.company_info.instagram} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, instagram: e.target.value }
                    }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input type="url" value={settings.company_info.twitter} onChange={(e) => setSettings(prev => ({
                      ...prev, company_info: { ...prev.company_info, twitter: e.target.value }
                    }))} className="input-field" />
                  </div>
                </div>
                <button onClick={() => handleSave('company_info', settings.company_info)} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            )}

            {/* Footer */}
            {activeTab === 'footer' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Footer Content</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input type="text" value={settings.footer_content.tagline} onChange={(e) => setSettings(prev => ({
                    ...prev, footer_content: { ...prev.footer_content, tagline: e.target.value }
                  }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={settings.footer_content.description} onChange={(e) => setSettings(prev => ({
                    ...prev, footer_content: { ...prev.footer_content, description: e.target.value }
                  }))} rows={3} className="input-field resize-none" />
                </div>
                <h4 className="font-medium text-sm">Quick Links</h4>
                {(settings.footer_content.quickLinks || []).map((link, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={link.label} onChange={(e) => {
                      const newLinks = [...(settings.footer_content.quickLinks || [])];
                      newLinks[index].label = e.target.value;
                      setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, quickLinks: newLinks } }));
                    }} placeholder="Label" className="input-field flex-1 text-sm" />
                    <input type="text" value={link.url} onChange={(e) => {
                      const newLinks = [...(settings.footer_content.quickLinks || [])];
                      newLinks[index].url = e.target.value;
                      setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, quickLinks: newLinks } }));
                    }} placeholder="/path" className="input-field flex-1 text-sm" />
                    <button onClick={() => {
                      const newLinks = (settings.footer_content.quickLinks || []).filter((_, i) => i !== index);
                      setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, quickLinks: newLinks } }));
                    }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setSettings(prev => ({
                    ...prev, footer_content: { ...prev.footer_content, quickLinks: [...(prev.footer_content.quickLinks || []), { label: '', url: '' }] }
                  }))} className="btn-secondary text-sm mb-4"><Plus className="w-4 h-4" /> Add Link</button>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Contact Info (Footer)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Locations</label>
                      {(settings.footer_content.contactLocations || []).map((loc, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input type="text" value={loc} onChange={(e) => {
                            const newLocs = [...(settings.footer_content.contactLocations || [])];
                            newLocs[index] = e.target.value;
                            setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, contactLocations: newLocs } }));
                          }} placeholder="Nakuru Town, Kenya" className="input-field flex-1 text-sm" />
                          <button onClick={() => {
                            const newLocs = (settings.footer_content.contactLocations || []).filter((_, i) => i !== index);
                            setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, contactLocations: newLocs } }));
                          }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => setSettings(prev => ({
                        ...prev, footer_content: { ...prev.footer_content, contactLocations: [...(prev.footer_content.contactLocations || []), ''] }
                      }))} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add Location</button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
                      {(settings.footer_content.contactPhones || []).map((phone, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input type="text" value={phone} onChange={(e) => {
                            const newPhones = [...(settings.footer_content.contactPhones || [])];
                            newPhones[index] = e.target.value;
                            setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, contactPhones: newPhones } }));
                          }} placeholder="+254 700 000 000" className="input-field flex-1 text-sm" />
                          <button onClick={() => {
                            const newPhones = (settings.footer_content.contactPhones || []).filter((_, i) => i !== index);
                            setSettings(prev => ({ ...prev, footer_content: { ...prev.footer_content, contactPhones: newPhones } }));
                          }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => setSettings(prev => ({
                        ...prev, footer_content: { ...prev.footer_content, contactPhones: [...(prev.footer_content.contactPhones || []), ''] }
                      }))} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add Phone</button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={settings.footer_content.contactEmail || ''} onChange={(e) => setSettings(prev => ({
                        ...prev, footer_content: { ...prev.footer_content, contactEmail: e.target.value }
                      }))} placeholder="info@digihomes.co.ke" className="input-field text-sm" />
                    </div>
                  </div>
                </div>

                {/* Footer Colors */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Footer Colors</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.footer_content.backgroundColor || '#111827'} onChange={(e) => setSettings(prev => ({
                          ...prev, footer_content: { ...prev.footer_content, backgroundColor: e.target.value }
                        }))} className="w-12 h-10 rounded cursor-pointer" />
                        <input type="text" value={settings.footer_content.backgroundColor || '#111827'} onChange={(e) => setSettings(prev => ({
                          ...prev, footer_content: { ...prev.footer_content, backgroundColor: e.target.value }
                        }))} className="input-field flex-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={settings.footer_content.textColor || '#d1d5db'} onChange={(e) => setSettings(prev => ({
                          ...prev, footer_content: { ...prev.footer_content, textColor: e.target.value }
                        }))} className="w-12 h-10 rounded cursor-pointer" />
                        <input type="text" value={settings.footer_content.textColor || '#d1d5db'} onChange={(e) => setSettings(prev => ({
                          ...prev, footer_content: { ...prev.footer_content, textColor: e.target.value }
                        }))} className="input-field flex-1 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleSave('footer_content', settings.footer_content)} disabled={saving} className="btn-primary mt-4">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Footer
                </button>
              </div>
            )}

            {/* Contact Page */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Contact Page Header</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input type="text" value={settings.contact_page.title} onChange={(e) => setSettings(prev => ({
                        ...prev, contact_page: { ...prev.contact_page, title: e.target.value }
                      }))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                      <input type="text" value={settings.contact_page.subtitle} onChange={(e) => setSettings(prev => ({
                        ...prev, contact_page: { ...prev.contact_page, subtitle: e.target.value }
                      }))} className="input-field" />
                    </div>
                  </div>
                  <ImageUploadField 
                    label="Background Image" 
                    value={settings.contact_page.backgroundImage || ''} 
                    onChange={(url) => setSettings(prev => ({
                      ...prev, contact_page: { ...prev.contact_page, backgroundImage: url }
                    }))} 
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Working Hours</h4>
                  {(settings.contact_page.workingHours || []).map((hour, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={hour} onChange={(e) => {
                        const newHours = [...(settings.contact_page.workingHours || [])];
                        newHours[index] = e.target.value;
                        setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, workingHours: newHours } }));
                      }} placeholder="Monday - Friday: 8AM - 6PM" className="input-field flex-1 text-sm" />
                      <button onClick={() => {
                        const newHours = (settings.contact_page.workingHours || []).filter((_, i) => i !== index);
                        setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, workingHours: newHours } }));
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setSettings(prev => ({
                    ...prev, contact_page: { ...prev.contact_page, workingHours: [...(prev.contact_page.workingHours || []), ''] }
                  }))} className="btn-secondary text-sm"><Plus className="w-4 h-4" /> Add</button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Offices</h4>
                  {(settings.contact_page.offices || []).map((office, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Office {index + 1}</span>
                        <button onClick={() => {
                          const newOffices = settings.contact_page.offices.filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, offices: newOffices } }));
                        }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="text" value={office.name} onChange={(e) => {
                          const newOffices = [...settings.contact_page.offices];
                          newOffices[index].name = e.target.value;
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, offices: newOffices } }));
                        }} placeholder="Name" className="input-field text-sm" />
                        <input type="text" value={office.address} onChange={(e) => {
                          const newOffices = [...settings.contact_page.offices];
                          newOffices[index].address = e.target.value;
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, offices: newOffices } }));
                        }} placeholder="Address" className="input-field text-sm" />
                        <input type="text" value={office.phone} onChange={(e) => {
                          const newOffices = [...settings.contact_page.offices];
                          newOffices[index].phone = e.target.value;
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, offices: newOffices } }));
                        }} placeholder="Phone" className="input-field text-sm" />
                        <input type="email" value={office.email} onChange={(e) => {
                          const newOffices = [...settings.contact_page.offices];
                          newOffices[index].email = e.target.value;
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, offices: newOffices } }));
                        }} placeholder="Email" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Map Embed URL</label>
                        <input type="url" value={office.mapEmbed || ''} onChange={(e) => {
                          const newOffices = [...settings.contact_page.offices];
                          newOffices[index].mapEmbed = e.target.value;
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, offices: newOffices } }));
                        }} placeholder="https://www.google.com/maps/embed?..." className="input-field text-sm" />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setSettings(prev => ({
                    ...prev, contact_page: { ...prev.contact_page, offices: [...(prev.contact_page.offices || []), { name: '', address: '', phone: '', email: '', mapEmbed: '' }] }
                  }))} className="btn-secondary text-sm"><Plus className="w-4 h-4" /> Add Office</button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">FAQs</h4>
                  {(settings.contact_page.faqs || []).map((faq, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2 mb-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input type="text" value={faq.question} onChange={(e) => {
                            const newFaqs = [...settings.contact_page.faqs];
                            newFaqs[index].question = e.target.value;
                            setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, faqs: newFaqs } }));
                          }} placeholder="Question" className="input-field text-sm" />
                          <textarea value={faq.answer} onChange={(e) => {
                            const newFaqs = [...settings.contact_page.faqs];
                            newFaqs[index].answer = e.target.value;
                            setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, faqs: newFaqs } }));
                          }} placeholder="Answer" rows={2} className="input-field resize-none text-sm" />
                        </div>
                        <button onClick={() => {
                          const newFaqs = settings.contact_page.faqs.filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, contact_page: { ...prev.contact_page, faqs: newFaqs } }));
                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setSettings(prev => ({
                    ...prev, contact_page: { ...prev.contact_page, faqs: [...(prev.contact_page.faqs || []), { question: '', answer: '' }] }
                  }))} className="btn-secondary text-sm"><Plus className="w-4 h-4" /> Add FAQ</button>
                </div>

                <button onClick={() => handleSave('contact_page', settings.contact_page)} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Contact Page
                </button>
              </div>
            )}

            {/* Animation Settings */}
            {activeTab === 'animations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Animation Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control animations across the website. Elements appear one by one when scrolled into view.
                  </p>
                </div>

                {/* Master Controls */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-800 mb-4">Master Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.animation_settings.enabled !== false}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            animation_settings: { ...prev.animation_settings, enabled: e.target.checked }
                          }))}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Enable Animations</span>
                          <p className="text-xs text-gray-500">Turn all scroll animations on/off</p>
                        </div>
                      </label>
                    </div>

                  </div>
                </div>

                {/* Hero Text Animations */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-800 mb-4">Hero Section Text</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Delay: {settings.animation_settings.heroTextDelay || 400}ms
                      </label>
                      <input
                        type="range"
                        min="200"
                        max="1500"
                        step="100"
                        value={settings.animation_settings.heroTextDelay || 400}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          animation_settings: { ...prev.animation_settings, heroTextDelay: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Wait before hero text appears on page load</p>
                    </div>

                  </div>
                </div>

                {/* Stats Counter */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-800 mb-4">Stats Counter</h4>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Count Duration: {(settings.animation_settings.statsCountDuration || 2000) / 1000}s
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="5000"
                      step="250"
                      value={settings.animation_settings.statsCountDuration || 2000}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        animation_settings: { ...prev.animation_settings, statsCountDuration: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">How long stats numbers take to count up when scrolled into view</p>
                  </div>
                </div>

                {/* Card & Section Animations */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-800 mb-4">Cards & Sections</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Delay: {settings.animation_settings.baseDelay || 150}ms
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="400"
                        step="25"
                        value={settings.animation_settings.baseDelay || 150}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          animation_settings: { ...prev.animation_settings, baseDelay: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Time between each item</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-gray-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Stagger: {settings.animation_settings.cardStaggerMultiplier || 1}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={settings.animation_settings.cardStaggerMultiplier || 1}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          animation_settings: { ...prev.animation_settings, cardStaggerMultiplier: parseFloat(e.target.value) }
                        }))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Product card speed</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-gray-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Stagger: {settings.animation_settings.sectionStaggerMultiplier || 1.5}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={settings.animation_settings.sectionStaggerMultiplier || 1.5}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          animation_settings: { ...prev.animation_settings, sectionStaggerMultiplier: parseFloat(e.target.value) }
                        }))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Section heading speed</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> How it works
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Elements appear one by one as you scroll down the page</li>
                    <li>• Higher delay values = slower, more dramatic reveals</li>
                    <li>• Works on all pages: Homepage, Houses, Services, Buy, Rent, Contact</li>
                    <li>• Animations are purely visual - content always loads normally</li>
                  </ul>
                </div>

                <button onClick={() => handleSave('animation_settings', settings.animation_settings)} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Animation Settings
                </button>
              </div>
            )}

            {/* Dropdown Options */}
            {activeTab === 'dropdown_options' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Location Options</h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="New location" className="input-field flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()} />
                    <button onClick={handleAddLocation} className="btn-primary whitespace-nowrap"><Plus className="w-4 h-4" /> Add</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {locations.map(loc => (
                      <div key={loc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <span className="truncate text-sm">{loc.name}</span>
                        </div>
                        <button onClick={() => handleDeleteLocation(loc.id)} className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">House Type Options</h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input type="text" value={newHouseType} onChange={(e) => setNewHouseType(e.target.value)}
                      placeholder="New house type" className="input-field flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAddHouseType()} />
                    <button onClick={handleAddHouseType} className="btn-primary whitespace-nowrap"><Plus className="w-4 h-4" /> Add</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {houseTypes.map(type => (
                      <div key={type.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <Home className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <span className="truncate text-sm">{type.name}</span>
                        </div>
                        <button onClick={() => handleDeleteHouseType(type.id)} className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          Animation Settings
        </h2>
        
        <div className="space-y-6">
          {/* Global Animation Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Enable Animations</label>
              <p className="text-sm text-gray-500">Turn all animations on or off</p>
            </div>
            <input
              type="checkbox"
              checked={settings.animation_settings?.enabled || false}
              onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, enabled: e.target.checked }}))}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </div>

          {/* Hero Text Animations */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Hero Text Animations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Animation Style</label>
                <select
                  value={settings.animation_settings?.heroAnimationStyle || 'pop'}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, heroAnimationStyle: e.target.value }}))}
                  className="input-field"
                >
                  <option value="pop">Pop Up</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide Up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Delay (ms)</label>
                <input
                  type="number"
                  value={settings.animation_settings?.heroTextDelay || 400}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, heroTextDelay: parseInt(e.target.value) || 400 }}))}
                  className="input-field"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stagger Delay (ms)</label>
                <input
                  type="number"
                  value={settings.animation_settings?.heroTextStagger || 200}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, heroTextStagger: parseInt(e.target.value) || 200 }}))}
                  className="input-field"
                  min="0"
                  step="50"
                />
              </div>
            </div>
          </div>

          {/* Card Animations */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Property Card Animations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Animation Style</label>
                <select
                  value={settings.animation_settings?.cardAnimationStyle || 'pop'}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, cardAnimationStyle: e.target.value }}))}
                  className="input-field"
                >
                  <option value="pop">Pop Up</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide Up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Delay (ms)</label>
                <input
                  type="number"
                  value={settings.animation_settings?.cardBaseDelay || 150}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, cardBaseDelay: parseInt(e.target.value) || 150 }}))}
                  className="input-field"
                  min="0"
                  step="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stagger Delay (ms)</label>
                <input
                  type="number"
                  value={settings.animation_settings?.cardStaggerDelay || 100}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, cardStaggerDelay: parseInt(e.target.value) || 100 }}))}
                  className="input-field"
                  min="0"
                  step="25"
                />
              </div>
            </div>
          </div>

          {/* Section Animations */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Section Animations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Animation Style</label>
                <select
                  value={settings.animation_settings?.sectionAnimationStyle || 'pop'}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, sectionAnimationStyle: e.target.value }}))}
                  className="input-field"
                >
                  <option value="pop">Pop Up</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide Up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Delay (ms)</label>
                <input
                  type="number"
                  value={settings.animation_settings?.sectionBaseDelay || 200}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, sectionBaseDelay: parseInt(e.target.value) || 200 }}))}
                  className="input-field"
                  min="0"
                  step="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stagger Delay (ms)</label>
                <input
                  type="number"
                  value={settings.animation_settings?.sectionStaggerDelay || 150}
                  onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, sectionStaggerDelay: parseInt(e.target.value) || 150 }}))}
                  className="input-field"
                  min="0"
                  step="25"
                />
              </div>
            </div>
          </div>

          {/* Stats Animation */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Stats Counter Animation</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count Duration (ms)</label>
              <input
                type="number"
                value={settings.animation_settings?.statsCountDuration || 2000}
                onChange={(e) => setSettings(prev => ({ ...prev, animation_settings: { ...prev.animation_settings, statsCountDuration: parseInt(e.target.value) || 2000 }}))}
                className="input-field w-full md:w-64"
                min="500"
                step="100"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6">
            <button
              onClick={() => handleSave('animation_settings')}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Animation Settings'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SiteSettings;
