import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Image as ImageIcon,
  Star,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import ComboInput from '../../components/ComboInput';
import api from '../../config/api';

const AddEditHouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    house_type: '',
    bedrooms: 1,
    bathrooms: 1,
    rent_price: '',
    vacancy_status: 'available',
    featured: false
  });

  const [locations, setLocations] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);

  useEffect(() => {
    fetchOptions();
    if (isEditing) {
      fetchHouse();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [locRes, typesRes] = await Promise.all([
        api.get('/settings/locations'),
        api.get('/settings/house-types')
      ]);
      setLocations(locRes.data);
      setHouseTypes(typesRes.data);
      
      // Set defaults if not editing
      if (!isEditing) {
        setFormData(prev => ({
          ...prev,
          location: locRes.data[0]?.name || '',
          house_type: typesRes.data[0]?.name || ''
        }));
      }
    } catch (error) {
      // Use fallback defaults
      setLocations([{ id: 1, name: 'Nakuru' }, { id: 2, name: 'Nyahururu' }]);
      setHouseTypes([{ id: 1, name: '1 Bedroom' }, { id: 2, name: '2 Bedroom' }]);
    }
  };

  const fetchHouse = async () => {
    try {
      const response = await api.get(`/houses/${id}`);
      const house = response.data;
      setFormData({
        title: house.title,
        description: house.description || '',
        location: house.location,
        house_type: house.house_type,
        bedrooms: house.bedrooms,
        bathrooms: house.bathrooms,
        rent_price: house.rent_price,
        vacancy_status: house.vacancy_status,
        featured: house.featured
      });
      setImages(house.images || []);
    } catch (error) {
      toast.error('Failed to load house details');
      navigate('/admin/houses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.rent_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/houses/${id}`, formData);
        toast.success('House updated successfully');
      } else {
        const response = await api.post('/houses', formData);
        toast.success('House created successfully');
        navigate(`/admin/houses/edit/${response.data.id}`);
        return;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!id) {
      toast.error('Please save the house first before uploading images');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formDataUpload.append('images', files[i]);
    }

    try {
      const response = await api.post(`/upload/house/${id}`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages([...images, ...response.data.images]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await api.delete(`/upload/image/${imageId}`);
      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await api.put(`/upload/image/${imageId}/primary`);
      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      toast.success('Primary image updated');
    } catch (error) {
      toast.error('Failed to set primary image');
    }
  };

  const getImageUrl = (image) => {
    // Handle both Cloudinary (full URL) and local uploads (relative path)
    if (image.image_url?.startsWith('http')) {
      return image.image_url;
    }
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${image.image_url}`;
  };

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/houses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit House' : 'Add New House'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update property details' : 'Create a new property listing'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Modern 2 Bedroom Apartment"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the property..."
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <ComboInput
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    options={locations}
                    placeholder="Select or type location..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose from list or type a custom location</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House Type <span className="text-red-500">*</span>
                  </label>
                  <ComboInput
                    name="house_type"
                    value={formData.house_type}
                    onChange={handleChange}
                    options={houseTypes}
                    placeholder="Select or type house type..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose from list or type a custom type</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rent Price (KES) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="rent_price"
                    value={formData.rent_price}
                    onChange={handleChange}
                    placeholder="15000"
                    min="0"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vacancy Status
                  </label>
                  <select
                    name="vacancy_status"
                    value={formData.vacancy_status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Property</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h2>
            
            {!isEditing && (
              <p className="text-amber-600 text-sm mb-4 bg-amber-50 p-3 rounded-lg">
                Save the house first to upload images
              </p>
            )}

            {isEditing && (
              <>
                {/* Upload Button */}
                <div className="mb-4">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </span>
                  </label>
                </div>

                {/* Image Grid */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={getImageUrl(image)}
                          alt="Property"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {image.is_primary && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Primary
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          {!image.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(image.id)}
                              className="p-2 bg-white rounded-full hover:bg-yellow-100"
                              title="Set as primary"
                            >
                              <Star className="w-4 h-4 text-yellow-600" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-white rounded-full hover:bg-red-100"
                            title="Delete"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No images uploaded yet</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/houses')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update House' : 'Create House'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddEditHouse;
