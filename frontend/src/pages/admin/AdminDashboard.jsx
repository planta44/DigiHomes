import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  CheckCircle, 
  XCircle, 
  Users, 
  MapPin,
  Plus,
  ArrowRight,
  Star,
  GripVertical,
  X,
  Save,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentHouses, setRecentHouses] = useState([]);
  const [allHouses, setAllHouses] = useState([]);
  const [featuredIds, setFeaturedIds] = useState([]);
  const [featuredBuyIds, setFeaturedBuyIds] = useState([]);
  const [featuredRentIds, setFeaturedRentIds] = useState([]);
  const [featuredHousesIds, setFeaturedHousesIds] = useState([]);
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [featuredBuySearch, setFeaturedBuySearch] = useState('');
  const [featuredRentSearch, setFeaturedRentSearch] = useState('');
  const [featuredHousesSearch, setFeaturedHousesSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [savingBuy, setSavingBuy] = useState(false);
  const [savingRent, setSavingRent] = useState(false);
  const [savingHouses, setSavingHouses] = useState(false);
  const [animationSettings, setAnimationSettings] = useState({
    type: 'fade-up',
    duration: 600
  });
  const [savingAnimations, setSavingAnimations] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, housesRes, settingsRes] = await Promise.all([
        api.get('/houses/admin/stats'),
        api.get('/houses'),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);
      setStats(statsRes.data);
      const houses = housesRes.data || [];
      setAllHouses(houses);
      setRecentHouses(houses.slice(0, 5));
      
      // Get featured property IDs from settings or use currently featured ones
      const savedFeaturedIds = settingsRes.data?.featured_properties || [];
      if (savedFeaturedIds.length > 0) {
        setFeaturedIds(savedFeaturedIds);
      } else {
        // Default to first 9 featured properties
        const defaultFeatured = houses.filter(h => h.featured).slice(0, 9).map(h => h.id);
        setFeaturedIds(defaultFeatured);
      }

      // Load featured properties for Buy, Rent, and Houses pages
      // Ensure they are always arrays even if data is malformed
      const buyIds = settingsRes.data?.featured_buy;
      const rentIds = settingsRes.data?.featured_rent;
      const housesIds = settingsRes.data?.featured_houses;
      
      setFeaturedBuyIds(Array.isArray(buyIds) ? buyIds : []);
      setFeaturedRentIds(Array.isArray(rentIds) ? rentIds : []);
      setFeaturedHousesIds(Array.isArray(housesIds) ? housesIds : []);

      // Load animation settings
      if (settingsRes.data?.animation_settings) {
        setAnimationSettings(settingsRes.data.animation_settings);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFeatured = (houseId) => {
    if (featuredIds.length >= 9) {
      toast.error('Maximum 9 featured properties allowed');
      return;
    }
    if (!featuredIds.includes(houseId)) {
      setFeaturedIds(prev => [...prev, houseId]);
    }
  };

  const removeFromFeatured = (houseId) => {
    setFeaturedIds(prev => prev.filter(id => id !== houseId));
  };

  const moveFeatured = (index, direction) => {
    const newIds = [...featuredIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newIds.length) {
      [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
      setFeaturedIds(newIds);
    }
  };

  const moveFeaturedBuy = (index, direction) => {
    const newIds = [...featuredBuyIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newIds.length) {
      [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
      setFeaturedBuyIds(newIds);
    }
  };

  const moveFeaturedRent = (index, direction) => {
    const newIds = [...featuredRentIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newIds.length) {
      [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
      setFeaturedRentIds(newIds);
    }
  };

  const moveFeaturedHouses = (index, direction) => {
    const newIds = [...featuredHousesIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newIds.length) {
      [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
      setFeaturedHousesIds(newIds);
    }
  };

  const saveFeaturedProperties = async () => {
    setSavingHomepage(true);
    try {
      console.log('Saving Homepage featured IDs:', featuredIds);
      const response = await api.put('/settings/featured_properties', { value: featuredIds });
      console.log('Save response:', response);
      toast.success('Homepage featured properties saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save featured properties');
    } finally {
      setSavingHomepage(false);
    }
  };

  const saveFeaturedBuy = async () => {
    setSavingBuy(true);
    try {
      console.log('Saving Buy featured IDs:', featuredBuyIds);
      const response = await api.put('/settings/featured_buy', { value: featuredBuyIds });
      console.log('Save response:', response);
      toast.success('Buy page featured properties saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save Buy featured properties');
    } finally {
      setSavingBuy(false);
    }
  };

  const saveFeaturedRent = async () => {
    setSavingRent(true);
    try {
      console.log('Saving Rent featured IDs:', featuredRentIds);
      const response = await api.put('/settings/featured_rent', { value: featuredRentIds });
      console.log('Save response:', response);
      toast.success('Rent page featured properties saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save Rent featured properties');
    } finally {
      setSavingRent(false);
    }
  };

  const saveFeaturedHouses = async () => {
    setSavingHouses(true);
    try {
      console.log('Saving Houses featured IDs:', featuredHousesIds);
      const response = await api.put('/settings/featured_houses', { value: featuredHousesIds });
      console.log('Save response:', response);
      toast.success('Houses page featured properties saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save Houses featured properties');
    } finally {
      setSavingHouses(false);
    }
  };

  const saveAnimationSettings = async () => {
    setSavingAnimations(true);
    try {
      await api.put('/settings/animation_settings', { value: animationSettings });
      toast.success('Animation settings saved!');
    } catch (error) {
      toast.error('Failed to save animation settings');
    } finally {
      setSavingAnimations(false);
    }
  };

  const getFeaturedHouses = () => {
    return featuredIds.map(id => allHouses.find(h => h.id === id)).filter(Boolean);
  };

  const getAvailableHouses = () => {
    return allHouses.filter(h => {
      const notFeatured = !featuredIds.includes(h.id);
      const matchesSearch = !featuredSearch || 
        h.title?.toLowerCase().includes(featuredSearch.toLowerCase()) ||
        h.location?.toLowerCase().includes(featuredSearch.toLowerCase());
      return notFeatured && matchesSearch;
    });
  };

  const getAvailableBuy = () => {
    return allHouses.filter(h => {
      const notFeatured = !featuredBuyIds.includes(h.id);
      const isBuyOrLease = h.listing_type === 'buy' || h.listing_type === 'lease';
      const matchesSearch = !featuredBuySearch || 
        h.title?.toLowerCase().includes(featuredBuySearch.toLowerCase()) ||
        h.location?.toLowerCase().includes(featuredBuySearch.toLowerCase());
      return notFeatured && isBuyOrLease && matchesSearch;
    });
  };

  const getAvailableRent = () => {
    return allHouses.filter(h => {
      const notFeatured = !featuredRentIds.includes(h.id);
      const isRentOrLease = h.listing_type === 'rent' || h.listing_type === 'lease' || !h.listing_type;
      const matchesSearch = !featuredRentSearch || 
        h.title?.toLowerCase().includes(featuredRentSearch.toLowerCase()) ||
        h.location?.toLowerCase().includes(featuredRentSearch.toLowerCase());
      return notFeatured && isRentOrLease && matchesSearch;
    });
  };

  const getAvailableHousesPage = () => {
    return allHouses.filter(h => {
      const notFeatured = !featuredHousesIds.includes(h.id);
      const isHouseForRent = h.property_type === 'house' && h.listing_type !== 'buy';
      const matchesSearch = !featuredHousesSearch || 
        h.title?.toLowerCase().includes(featuredHousesSearch.toLowerCase()) ||
        h.location?.toLowerCase().includes(featuredHousesSearch.toLowerCase());
      return notFeatured && isHouseForRent && matchesSearch;
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statCards = stats ? [
    {
      title: 'Total Houses',
      value: stats.totalHouses,
      icon: Building,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Available',
      value: stats.availableHouses,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Occupied/Sold',
      value: stats.occupiedHouses,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Subscribers',
      value: stats.subscribers,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ] : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to DIGI Homes Admin</h1>
          <p className="text-primary-100">Manage your properties and monitor your business from here.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-xl p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location Breakdown */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties by Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Nakuru</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.nakuruHouses}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Nyahururu</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.nyahururuHouses}</span>
              </div>
            </div>
          </div>
        )}

        {/* Animation Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Page Animation Settings</h2>
            <button
              onClick={saveAnimationSettings}
              disabled={savingAnimations}
              className="btn-primary text-sm"
            >
              {savingAnimations ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Configure animations for property detail pages</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Type
              </label>
              <select
                value={animationSettings.type}
                onChange={(e) => setAnimationSettings(prev => ({ ...prev, type: e.target.value }))}
                className="input-field"
              >
                <option value="fade">Fade In</option>
                <option value="fade-up">Fade Up</option>
                <option value="fade-down">Fade Down</option>
                <option value="fade-left">Fade Left</option>
                <option value="fade-right">Fade Right</option>
                <option value="zoom-in">Zoom In</option>
                <option value="zoom-out">Zoom Out</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose how elements appear on the page</p>
            </div>

            {/* Animation Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Duration (ms)
              </label>
              <input
                type="number"
                min="100"
                max="2000"
                step="100"
                value={animationSettings.duration}
                onChange={(e) => setAnimationSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Duration in milliseconds (100-2000ms)</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="text-xs text-gray-600">
              Animation: <span className="font-semibold">{animationSettings.type}</span> • 
              Duration: <span className="font-semibold">{animationSettings.duration}ms</span>
            </div>
          </div>
        </div>

        {/* Featured Properties Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Homepage Featured Properties</h2>
            </div>
            <button
              onClick={saveFeaturedProperties}
              disabled={savingHomepage}
              className="btn-primary text-sm"
            >
              {savingHomepage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Homepage
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Select up to 9 properties to display on the homepage. Drag to reorder.</p>
          
          {/* Selected Featured Properties */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Featured ({featuredIds.length}/9)</h3>
            {getFeaturedHouses().length > 0 ? (
              <div className="space-y-2">
                {getFeaturedHouses().map((house, index) => (
                  <div key={house.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-600 font-bold w-6">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{house.title}</p>
                      <p className="text-xs text-gray-500">{house.location} • {formatPrice(house.rent_price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveFeatured(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveFeatured(index, 'down')}
                        disabled={index === featuredIds.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeFromFeatured(house.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center border-2 border-dashed rounded-lg">No featured properties selected</p>
            )}
          </div>

          {/* Available Properties to Add */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Available Properties</h3>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={featuredSearch}
              onChange={(e) => setFeaturedSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {getAvailableHouses().length > 0 ? (
                <div className="divide-y">
                  {getAvailableHouses().slice(0, 20).map(house => (
                    <div key={house.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{house.title}</p>
                        <p className="text-xs text-gray-500">{house.location} • {formatPrice(house.rent_price)}</p>
                      </div>
                      <button
                        onClick={() => addToFeatured(house.id)}
                        disabled={featuredIds.length >= 9}
                        className="ml-2 px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">All available properties are featured</p>
              )}
            </div>
          </div>
        </div>

        {/* Featured for Buy Page */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Featured Properties - Buy Page</h2>
            <button
              onClick={saveFeaturedBuy}
              disabled={savingBuy}
              className="btn-primary text-sm"
            >
              {savingBuy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Buy Featured
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Select up to 10 properties for Buy page ({featuredBuyIds.length}/10)</p>
          <div className="space-y-2">
            {featuredBuyIds.map((id, idx) => {
              const house = allHouses.find(h => h.id === id);
              return house ? (
                <div key={id} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <span className="font-bold w-6">{idx + 1}</span>
                  <span className="flex-1 text-sm">{house.title}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveFeaturedBuy(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFeaturedBuy(idx, 'down')}
                      disabled={idx === featuredBuyIds.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFeaturedBuyIds(prev => prev.filter(i => i !== id))} className="p-1 text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null;
            })}
            <input
              type="text"
              placeholder="Search properties..."
              value={featuredBuySearch}
              onChange={(e) => setFeaturedBuySearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {getAvailableBuy().length > 0 ? (
                <div className="divide-y">
                  {getAvailableBuy().slice(0, 20).map(house => (
                    <div key={house.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{house.title}</p>
                        <p className="text-xs text-gray-500">{house.location} • {house.listing_type}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (featuredBuyIds.length < 10 && !featuredBuyIds.includes(house.id)) {
                            setFeaturedBuyIds([...featuredBuyIds, house.id]);
                          }
                        }}
                        className="btn-sm btn-primary ml-2"
                        disabled={featuredBuyIds.length >= 10}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No properties available</p>
              )}
            </div>
          </div>
        </div>

        {/* Featured for Rent Page */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Featured Properties - Rent Page</h2>
            <button
              onClick={saveFeaturedRent}
              disabled={savingRent}
              className="btn-primary text-sm"
            >
              {savingRent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Rent Featured
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Select up to 10 properties for Rent page ({featuredRentIds.length}/10)</p>
          <div className="space-y-2">
            {featuredRentIds.map((id, idx) => {
              const house = allHouses.find(h => h.id === id);
              return house ? (
                <div key={id} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                  <span className="font-bold w-6">{idx + 1}</span>
                  <span className="flex-1 text-sm">{house.title}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveFeaturedRent(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFeaturedRent(idx, 'down')}
                      disabled={idx === featuredRentIds.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFeaturedRentIds(prev => prev.filter(i => i !== id))} className="p-1 text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null;
            })}
            <input
              type="text"
              placeholder="Search properties..."
              value={featuredRentSearch}
              onChange={(e) => setFeaturedRentSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {getAvailableRent().length > 0 ? (
                <div className="divide-y">
                  {getAvailableRent().slice(0, 20).map(house => (
                    <div key={house.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{house.title}</p>
                        <p className="text-xs text-gray-500">{house.location} • {house.listing_type || 'rent'}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (featuredRentIds.length < 10 && !featuredRentIds.includes(house.id)) {
                            setFeaturedRentIds([...featuredRentIds, house.id]);
                          }
                        }}
                        className="btn-sm btn-primary ml-2"
                        disabled={featuredRentIds.length >= 10}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No properties available</p>
              )}
            </div>
          </div>
        </div>

        {/* Featured for Houses Page */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Featured Properties - Available Houses Page</h2>
            <button
              onClick={saveFeaturedHouses}
              disabled={savingHouses}
              className="btn-primary text-sm"
            >
              {savingHouses ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Houses Featured
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Select up to 10 properties for Houses page ({featuredHousesIds.length}/10)</p>
          <div className="space-y-2">
            {featuredHousesIds.map((id, idx) => {
              const house = allHouses.find(h => h.id === id);
              return house ? (
                <div key={id} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <span className="font-bold w-6">{idx + 1}</span>
                  <span className="flex-1 text-sm">{house.title}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveFeaturedHouses(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFeaturedHouses(idx, 'down')}
                      disabled={idx === featuredHousesIds.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFeaturedHousesIds(prev => prev.filter(i => i !== id))} className="p-1 text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null;
            })}
            <input
              type="text"
              placeholder="Search properties..."
              value={featuredHousesSearch}
              onChange={(e) => setFeaturedHousesSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {getAvailableHousesPage().length > 0 ? (
                <div className="divide-y">
                  {getAvailableHousesPage().slice(0, 20).map(house => (
                    <div key={house.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{house.title}</p>
                        <p className="text-xs text-gray-500">{house.location} • {house.listing_type || 'rent'}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (featuredHousesIds.length < 10 && !featuredHousesIds.includes(house.id)) {
                            setFeaturedHousesIds([...featuredHousesIds, house.id]);
                          }
                        }}
                        className="btn-sm btn-primary ml-2"
                        disabled={featuredHousesIds.length >= 10}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No properties available</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Houses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/admin/houses/new"
                className="flex items-center gap-3 p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New House</span>
              </Link>
              <Link
                to="/admin/houses"
                className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Building className="w-5 h-5" />
                <span className="font-medium">Manage Houses</span>
              </Link>
              <Link
                to="/admin/subscribers"
                className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">View Subscribers</span>
              </Link>
            </div>
          </div>

          {/* Recent Houses */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
              <Link 
                to="/admin/houses" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {recentHouses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Location</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentHouses.map((house) => (
                      <tr key={house.id} className="border-b last:border-0">
                        <td className="py-3">
                          <Link 
                            to={`/admin/houses/edit/${house.id}`}
                            className="font-medium text-gray-900 hover:text-primary-600"
                          >
                            {house.title}
                          </Link>
                        </td>
                        <td className="py-3 text-gray-600">{house.location}</td>
                        <td className="py-3 text-gray-900 font-medium">{formatPrice(house.rent_price)}</td>
                        <td className="py-3">
                          <span className={`badge ${house.vacancy_status === 'available' ? 'badge-available' : 'badge-occupied'}`}>
                            {house.vacancy_status === 'occupied' && house.listing_type === 'buy' ? 'Sold' : house.vacancy_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No houses listed yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
