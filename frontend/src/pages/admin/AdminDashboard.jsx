import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  CheckCircle, 
  XCircle, 
  Users, 
  MapPin,
  Plus,
  ArrowRight
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentHouses, setRecentHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, housesRes] = await Promise.all([
        api.get('/houses/admin/stats'),
        api.get('/houses')
      ]);
      setStats(statsRes.data);
      setRecentHouses(housesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
