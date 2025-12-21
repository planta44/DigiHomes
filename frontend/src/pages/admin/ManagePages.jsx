import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Plus, Trash2, Image, FileText, Upload, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

// Image Upload Field Component
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
      // Handle both Cloudinary URLs and local URLs
      const imageUrl = response.data.url;
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
      {value && <img src={value} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />}
    </div>
  );
};

const ManagePages = () => {
  const [pages, setPages] = useState({
    services: { content: { hero: { title: '', subtitle: '', backgroundImage: '' }, sections: [] } },
    buy: { content: { hero: { title: '', subtitle: '', backgroundImage: '' }, sections: [], callToAction: { title: '', description: '', buttonText: '', buttonLink: '' } } },
    rent: { content: { hero: { title: '', subtitle: '', backgroundImage: '' } } }
  });
  const [activeTab, setActiveTab] = useState('services');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const [servicesRes, buyRes, rentRes] = await Promise.all([
        api.get('/pages/services').catch(() => ({ data: null })),
        api.get('/pages/buy').catch(() => ({ data: null })),
        api.get('/pages/rent').catch(() => ({ data: null }))
      ]);
      
      setPages(prev => ({
        services: servicesRes.data || prev.services,
        buy: buyRes.data || prev.buy,
        rent: rentRes.data || prev.rent
      }));
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageSlug) => {
    setSaving(true);
    try {
      await api.put(`/pages/${pageSlug}`, { content: pages[pageSlug].content });
      toast.success(`${pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1)} page saved!`);
    } catch (error) {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const updatePageContent = (pageSlug, path, value) => {
    setPages(prev => {
      const newPages = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid mutation issues
      const keys = path.split('.');
      let obj = newPages[pageSlug].content;
      
      // Navigate to the parent object, creating intermediate objects if needed
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].includes('[')) {
          const [key, idx] = keys[i].replace(']', '').split('[');
          if (!obj[key]) obj[key] = [];
          if (!obj[key][parseInt(idx)]) obj[key][parseInt(idx)] = {};
          obj = obj[key][parseInt(idx)];
        } else {
          if (!obj[keys[i]]) obj[keys[i]] = {};
          obj = obj[keys[i]];
        }
      }
      obj[keys[keys.length - 1]] = value;
      return newPages;
    });
  };

  const addSection = (pageSlug) => {
    setPages(prev => ({
      ...prev,
      [pageSlug]: {
        ...prev[pageSlug],
        content: {
          ...prev[pageSlug].content,
          sections: [...(prev[pageSlug].content.sections || []), { title: '', description: '', icon: 'Building', items: [] }]
        }
      }
    }));
  };

  const removeSection = (pageSlug, index) => {
    setPages(prev => ({
      ...prev,
      [pageSlug]: {
        ...prev[pageSlug],
        content: {
          ...prev[pageSlug].content,
          sections: prev[pageSlug].content.sections.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const addSectionItem = (pageSlug, sectionIndex) => {
    setPages(prev => {
      const newPages = { ...prev };
      newPages[pageSlug].content.sections[sectionIndex].items.push('');
      return { ...newPages };
    });
  };

  const removeSectionItem = (pageSlug, sectionIndex, itemIndex) => {
    setPages(prev => {
      const newPages = { ...prev };
      newPages[pageSlug].content.sections[sectionIndex].items = 
        newPages[pageSlug].content.sections[sectionIndex].items.filter((_, i) => i !== itemIndex);
      return { ...newPages };
    });
  };

  const iconOptions = ['Building', 'Home', 'Users', 'Shield', 'MapPin', 'Clock', 'Star', 'CheckCircle', 'Briefcase'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Pages</h1>
        <p className="text-gray-600">Edit content for Services, Buy, and Rent pages</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b overflow-x-auto">
          <div className="flex min-w-max">
            {['services', 'buy', 'rent'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                {tab} Page
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Image className="w-5 h-5" /> Hero Section
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={pages[activeTab]?.content?.hero?.title || ''}
                  onChange={(e) => updatePageContent(activeTab, 'hero.title', e.target.value)}
                  className="input-field"
                  placeholder="Page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={pages[activeTab]?.content?.hero?.subtitle || ''}
                  onChange={(e) => updatePageContent(activeTab, 'hero.subtitle', e.target.value)}
                  className="input-field"
                  placeholder="Page subtitle"
                />
              </div>
            </div>
            <ImageUploadField
              label="Background Image"
              value={pages[activeTab]?.content?.hero?.backgroundImage || ''}
              onChange={(url) => updatePageContent(activeTab, 'hero.backgroundImage', url)}
            />
          </div>

          {/* Sections */}
          {(activeTab === 'services' || activeTab === 'buy') && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Content Sections</h3>
                <button onClick={() => addSection(activeTab)} className="btn-secondary text-sm">
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>
              
              {(pages[activeTab]?.content?.sections || []).map((section, sIndex) => (
                <div key={sIndex} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-600">Section {sIndex + 1}</span>
                    <button onClick={() => removeSection(activeTab, sIndex)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={section.title || ''}
                      onChange={(e) => {
                        const newSections = [...pages[activeTab].content.sections];
                        newSections[sIndex].title = e.target.value;
                        setPages(prev => ({
                          ...prev,
                          [activeTab]: { ...prev[activeTab], content: { ...prev[activeTab].content, sections: newSections } }
                        }));
                      }}
                      className="input-field text-sm"
                      placeholder="Section title"
                    />
                    <select
                      value={section.icon || 'Building'}
                      onChange={(e) => {
                        const newSections = [...pages[activeTab].content.sections];
                        newSections[sIndex].icon = e.target.value;
                        setPages(prev => ({
                          ...prev,
                          [activeTab]: { ...prev[activeTab], content: { ...prev[activeTab].content, sections: newSections } }
                        }));
                      }}
                      className="input-field text-sm"
                    >
                      {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => {
                      const newSections = [...pages[activeTab].content.sections];
                      newSections[sIndex].description = e.target.value;
                      setPages(prev => ({
                        ...prev,
                        [activeTab]: { ...prev[activeTab], content: { ...prev[activeTab].content, sections: newSections } }
                      }));
                    }}
                    className="input-field text-sm resize-none"
                    rows={2}
                    placeholder="Section description"
                  />
                  
                  {/* Items */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500">List Items</span>
                    {(section.items || []).map((item, iIndex) => (
                      <div key={iIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newSections = [...pages[activeTab].content.sections];
                            newSections[sIndex].items[iIndex] = e.target.value;
                            setPages(prev => ({
                              ...prev,
                              [activeTab]: { ...prev[activeTab], content: { ...prev[activeTab].content, sections: newSections } }
                            }));
                          }}
                          className="input-field text-sm flex-1"
                          placeholder="List item"
                        />
                        <button onClick={() => removeSectionItem(activeTab, sIndex, iIndex)} className="p-2 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addSectionItem(activeTab, sIndex)} className="text-sm text-primary-600 hover:text-primary-700">
                      + Add item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action (Buy page) */}
          {activeTab === 'buy' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-lg">Call to Action</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                  <input
                    type="text"
                    value={pages.buy?.content?.callToAction?.title || ''}
                    onChange={(e) => updatePageContent('buy', 'callToAction.title', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={pages.buy?.content?.callToAction?.buttonText || ''}
                    onChange={(e) => updatePageContent('buy', 'callToAction.buttonText', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={pages.buy?.content?.callToAction?.description || ''}
                  onChange={(e) => updatePageContent('buy', 'callToAction.description', e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={pages.buy?.content?.callToAction?.buttonLink || ''}
                  onChange={(e) => updatePageContent('buy', 'callToAction.buttonLink', e.target.value)}
                  className="input-field"
                  placeholder="/contact"
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t">
            <button onClick={() => handleSave(activeTab)} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManagePages;
