import { useState, useEffect } from 'react';
import { Save, Trash2, Star, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [featuredIds, setFeaturedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [housesRes, settingsRes] = await Promise.all([
        api.get('/houses'),
        api.get('/settings')
      ]);
      
      const allHouses = housesRes.data || [];
      setProperties(allHouses);
      
      const savedIds = settingsRes.data?.featured_properties || [];
      setFeaturedIds(savedIds);
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
      await api.put('/settings/featured_properties', featuredIds);
      toast.success('Featured properties saved!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(featuredIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFeaturedIds(items);
  };

  const addProperty = (id) => {
    if (featuredIds.length >= 9) {
      toast.error('Maximum 9 properties allowed');
      return;
    }
    setFeaturedIds([...featuredIds, id]);
  };

  const removeProperty = (id) => {
    setFeaturedIds(featuredIds.filter(fid => fid !== id));
  };

  const featuredProperties = featuredIds
    .map(id => properties.find(p => p.id === id))
    .filter(Boolean);

  const availableProperties = properties.filter(p => !featuredIds.includes(p.id));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Featured Properties</h1>
            <p className="text-gray-600">Select up to 9 properties to feature on homepage</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Properties - Left Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Featured Properties ({featuredIds.length}/9)
              </h2>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>

            {featuredIds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No featured properties yet</p>
                <p className="text-sm">Add properties from the right panel</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="featured">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {featuredProperties.map((property, index) => (
                        <Draggable
                          key={property.id}
                          draggableId={property.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-300"
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <img
                                src={property.images?.[0] || 'https://via.placeholder.com/100'}
                                alt={property.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{property.title}</p>
                                <p className="text-sm text-gray-500">{property.location}</p>
                              </div>
                              <button
                                onClick={() => removeProperty(property.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Available Properties - Right Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Available Properties</h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {availableProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>All properties are featured</p>
                </div>
              ) : (
                availableProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={property.images?.[0] || 'https://via.placeholder.com/100'}
                      alt={property.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-sm text-gray-500">{property.location}</p>
                    </div>
                    <button
                      onClick={() => addProperty(property.id)}
                      disabled={featuredIds.length >= 9}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeaturedProperties;
