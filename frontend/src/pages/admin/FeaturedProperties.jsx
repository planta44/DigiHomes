import { useState, useEffect } from 'react';
import { Save, Loader2, GripVertical, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const FeaturedProperties = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [featuredIds, setFeaturedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, settingsRes] = await Promise.all([
        api.get('/houses'),
        api.get('/settings')
      ]);
      setAllProperties(propertiesRes.data || []);
      setFeaturedIds(settingsRes.data?.featured_properties || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { featured_properties: featuredIds });
      toast.success('Featured properties saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addProperty = (propertyId) => {
    if (featuredIds.length >= 9) {
      toast.error('Maximum 9 featured properties allowed');
      return;
    }
    if (!featuredIds.includes(propertyId)) {
      setFeaturedIds([...featuredIds, propertyId]);
    }
  };

  const removeProperty = (propertyId) => {
    setFeaturedIds(featuredIds.filter(id => id !== propertyId));
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newFeaturedIds = [...featuredIds];
    const draggedId = newFeaturedIds[draggedItem];
    newFeaturedIds.splice(draggedItem, 1);
    newFeaturedIds.splice(index, 0, draggedId);

    setFeaturedIds(newFeaturedIds);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const featuredProperties = featuredIds
    .map(id => allProperties.find(p => p.id === id || p._id === id))
    .filter(Boolean);

  const availableProperties = allProperties.filter(
    p => !featuredIds.includes(p.id || p._id)
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h1>
          <p className="text-gray-600">
            Select up to 9 properties to display on the homepage. Drag to reorder.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Properties List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Featured ({featuredIds.length}/9)
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>

            {featuredProperties.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No featured properties selected. Add properties from the available list.
              </p>
            ) : (
              <div className="space-y-2">
                {featuredProperties.map((property, index) => (
                  <div
                    key={property.id || property._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 transition-all cursor-move ${
                      draggedItem === index ? 'border-primary-500 opacity-50' : 'border-transparent'
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {property.location} • {property.house_type}
                      </p>
                    </div>
                    <button
                      onClick={() => removeProperty(property.id || property._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Properties List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Properties ({availableProperties.length})
            </h2>

            {availableProperties.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                All properties are already featured or no properties available.
              </p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {availableProperties.map((property) => (
                  <div
                    key={property.id || property._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {property.location} • {property.house_type}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        KSh {property.rent_price?.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => addProperty(property.id || property._id)}
                      disabled={featuredIds.length >= 9}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 ${
                        featuredIds.length >= 9
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" /> How it works
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select up to 9 properties to feature on the homepage</li>
            <li>• Drag and drop to reorder featured properties</li>
            <li>• The order you set here will be displayed on the homepage</li>
            <li>• Click "Save" to apply changes</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeaturedProperties;
