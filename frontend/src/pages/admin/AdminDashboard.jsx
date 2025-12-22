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
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentHouses, setRecentHouses] = useState([]);
  const [allHouses, setAllHouses] = useState([]);
  const [featuredIds, setFeaturedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingFeatured, setSavingFeatured] = useState(false);

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
        // Default to first 6 featured properties
        const defaultFeatured = houses.filter(h => h.featured).slice(0, 6).map(h => h.id);
        setFeaturedIds(defaultFeatured);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFeatured = (houseId) => {
    if (featuredIds.length >= 6) {
      toast.error('Maximum 6 featured properties allowed');
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

  const saveFeaturedProperties = async () => {
    setSavingFeatured(true);
    try {
      await api.put('/settings/featured_properties', { value: featuredIds });
      toast.success('Featured properties saved!');
    } catch (error) {
      toast.error('Failed to save featured properties');
    } finally {
      setSavingFeatured(false);
    }
  };

  const getFeaturedHouses = () => {
    return featuredIds.map(id => allHouses.find(h => h.id === id)).filter(Boolean);
  };

  const getAvailableHouses = () => {
    return allHouses.filter(h => !featuredIds.includes(h.id) && h.vacancy_status === 'available');
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
      title: 'Occupied',
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

        {/* Featured Properties Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Homepage Featured Properties</h2>
            </div>
            <button
              onClick={saveFeaturedProperties}
              disabled={savingFeatured}
              className="btn-primary text-sm"
            >
              {savingFeatured ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Order
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">Select up to 6 properties to display on the homepage. Drag to reorder.</p>
          
          {/* Selected Featured Properties */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Featured ({featuredIds.length}/6)</h3>
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
                        disabled={featuredIds.length >= 6}
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
                            {house.vacancy_status}
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
