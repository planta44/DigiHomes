import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2, GripVertical, Image, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import ImageUpload from '../../components/ImageUpload';
import api from '../../config/api';

const ManageReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image',
    thumbnail_url: '',
    display_order: 0
  });

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await api.get('/reels');
      setReels(response.data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.media_url) {
      toast.error('Title and media are required');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/reels/${editingId}`, formData);
        toast.success('Reel updated');
      } else {
        await api.post('/reels', { ...formData, display_order: reels.length });
        toast.success('Reel created');
      }
      fetchReels();
      resetForm();
    } catch (error) {
      console.error('Error saving reel:', error);
      toast.error('Failed to save reel');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reel) => {
    setFormData({
      title: reel.title || '',
      description: reel.description || '',
      media_url: reel.media_url || '',
      media_type: reel.media_type || 'image',
      thumbnail_url: reel.thumbnail_url || '',
      display_order: reel.display_order || 0
    });
    setEditingId(reel.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reel?')) return;
    
    try {
      await api.delete(`/reels/${id}`);
      toast.success('Reel deleted');
      fetchReels();
    } catch (error) {
      console.error('Error deleting reel:', error);
      toast.error('Failed to delete reel');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_url: '',
      media_type: 'image',
      thumbnail_url: '',
      display_order: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleActive = async (reel) => {
    try {
      await api.put(`/reels/${reel.id}`, { is_active: !reel.is_active });
      toast.success(reel.is_active ? 'Reel hidden' : 'Reel visible');
      fetchReels();
    } catch (error) {
      toast.error('Failed to update reel');
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Digi Reels</h1>
            <p className="text-gray-600">Add and manage promotional images and videos</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Reel
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Reel' : 'Add New Reel'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="Enter reel title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                  <select
                    value={formData.media_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media *</label>
                <ImageUpload
                  value={formData.media_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, media_url: url }))}
                  label={formData.media_type === 'video' ? 'Upload Video' : 'Upload Image'}
                />
              </div>

              {formData.media_type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail (for videos)</label>
                  <ImageUpload
                    value={formData.thumbnail_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                    label="Upload Thumbnail"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reels List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {reels.length > 0 ? (
            <div className="divide-y">
              {reels.map((reel) => (
                <div key={reel.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {reel.thumbnail_url || reel.media_url ? (
                      <img
                        src={reel.thumbnail_url || reel.media_url}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {reel.media_type === 'video' ? (
                          <Video className="w-8 h-8 text-gray-300" />
                        ) : (
                          <Image className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{reel.title}</h3>
                    {reel.description && (
                      <p className="text-sm text-gray-500 truncate">{reel.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        reel.media_type === 'video' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {reel.media_type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        reel.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {reel.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(reel)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        reel.is_active 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {reel.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleEdit(reel)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(reel.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reels Yet</h3>
              <p className="text-gray-500 mb-4">Add your first reel to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" /> Add Your First Reel
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageReels;
