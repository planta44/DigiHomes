import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  MoreVertical,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const ManageHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, house: null });

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const response = await api.get('/houses');
      setHouses(response.data);
    } catch (error) {
      console.error('Error fetching houses:', error);
      toast.error('Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.house) return;

    try {
      await api.delete(`/houses/${deleteModal.house.id}`);
      toast.success('House deleted successfully');
      setHouses(houses.filter(h => h.id !== deleteModal.house.id));
      setDeleteModal({ show: false, house: null });
    } catch (error) {
      toast.error('Failed to delete house');
    }
  };

  const toggleStatus = async (house) => {
    const newStatus = house.vacancy_status === 'available' ? 'occupied' : 'available';
    try {
      await api.put(`/houses/${house.id}`, { vacancy_status: newStatus });
      setHouses(houses.map(h => 
        h.id === house.id ? { ...h, vacancy_status: newStatus } : h
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredHouses = houses.filter(house => {
    const matchesSearch = house.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         house.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || house.location === filterLocation;
    const matchesStatus = !filterStatus || house.vacancy_status === filterStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const getImageUrl = (house) => {
    const primaryImage = house.images?.find(img => img.is_primary) || house.images?.[0];
    if (!primaryImage) return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&auto=format&fit=crop&q=60';
    // Handle both Cloudinary (full URL) and local uploads (relative path)
    if (primaryImage.image_url?.startsWith('http')) {
      return primaryImage.image_url;
    }
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${primaryImage.image_url}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Properties</h1>
            <p className="text-gray-600">Add, edit, or remove property listings</p>
          </div>
          <Link to="/admin/houses/new" className="btn-primary">
            <Plus className="w-5 h-5" />
            Add New Property
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search houses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="input-field"
            >
              <option value="">All Locations</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Nyahururu">Nyahururu</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>

        {/* Houses List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredHouses.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Property</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Location</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Price</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-4 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHouses.map((house) => (
                    <tr key={house.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(house)}
                            alt={house.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{house.title}</p>
                            <p className="text-sm text-gray-500">{house.bedrooms} bed, {house.bathrooms} bath</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {house.location}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{house.house_type}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">{formatPrice(house.rent_price)}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleStatus(house)}
                          className={`badge cursor-pointer ${house.vacancy_status === 'available' ? 'badge-available' : 'badge-occupied'}`}
                        >
                          {house.vacancy_status}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/houses/${house.id}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/admin/houses/edit/${house.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, house })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No houses found matching your criteria</p>
            <Link to="/admin/houses/new" className="btn-primary">
              <Plus className="w-5 h-5" />
              Add Your First House
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete House</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.house?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, house: null })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageHouses;
