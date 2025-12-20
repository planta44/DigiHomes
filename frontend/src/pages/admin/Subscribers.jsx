import { useState, useEffect } from 'react';
import { Users, Search, Trash2, Mail, Download, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, subscriber: null });
  const [selectedIds, setSelectedIds] = useState([]);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ subject: '', content: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/newsletter/subscribers');
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.subscriber) return;

    try {
      await api.delete(`/newsletter/subscribers/${deleteModal.subscriber.id}`);
      toast.success('Subscriber removed');
      setSubscribers(subscribers.filter(s => s.id !== deleteModal.subscriber.id));
      setDeleteModal({ show: false, subscriber: null });
    } catch (error) {
      toast.error('Failed to remove subscriber');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Verified', 'Subscribed Date'];
    const data = subscribers.map(s => [
      s.name || '',
      s.email,
      s.verified ? 'Yes' : 'No',
      new Date(s.created_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscribers exported');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const verifiedIds = filteredSubscribers.filter(s => s.verified).map(s => s.id);
    if (selectedIds.length === verifiedIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(verifiedIds);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastData.subject.trim() || !broadcastData.content.trim()) {
      toast.error('Please fill in subject and content');
      return;
    }

    setSending(true);
    try {
      const response = await api.post('/newsletter/broadcast', {
        subject: broadcastData.subject,
        htmlContent: broadcastData.content,
        subscriberIds: selectedIds.length > 0 ? selectedIds : undefined
      });
      toast.success(response.data.message);
      setBroadcastModal(false);
      setBroadcastData({ subject: '', content: '' });
      setSelectedIds([]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const verifiedCount = subscribers.filter(s => s.verified).length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
            <p className="text-gray-600">
              {subscribers.length} total • {verifiedCount} verified
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {verifiedCount > 0 && (
              <button 
                onClick={() => setBroadcastModal(true)} 
                className="btn-primary"
              >
                <Send className="w-4 h-4" />
                {selectedIds.length > 0 ? `Broadcast to ${selectedIds.length}` : 'Broadcast All'}
              </button>
            )}
            {subscribers.length > 0 && (
              <button onClick={exportToCSV} className="btn-secondary">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Subscribers List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSubscribers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full min-w-[650px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-4 px-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === filteredSubscribers.filter(s => s.verified).length && selectedIds.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Subscribed</th>
                    <th className="text-right py-4 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(subscriber.id)}
                          onChange={() => toggleSelect(subscriber.id)}
                          disabled={!subscriber.verified}
                          className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-900">{subscriber.name || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {subscriber.verified ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">
                            <XCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(subscriber.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteModal({ show: true, subscriber })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Remove"
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
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers yet</h3>
            <p className="text-gray-500">
              When visitors subscribe to your newsletter, they'll appear here.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Subscriber</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <strong>{deleteModal.subscriber?.email}</strong> from the newsletter list?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, subscriber: null })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Send className="w-5 h-5 inline mr-2" />
              Broadcast Email
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedIds.length > 0 
                ? `Sending to ${selectedIds.length} selected subscriber(s)`
                : `Sending to all ${verifiedCount} verified subscribers`
              }
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., New Properties Available!"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported) *</label>
                <textarea
                  value={broadcastData.content}
                  onChange={(e) => setBroadcastData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="<h2>Hello!</h2><p>We have exciting news...</p>"
                  rows={8}
                  className="input-field font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">You can use HTML tags for formatting (h1, h2, p, strong, a, etc.)</p>
              </div>

              {broadcastData.content && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                  <div 
                    className="border rounded-lg p-4 bg-gray-50 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: broadcastData.content }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setBroadcastModal(false);
                  setBroadcastData({ subject: '', content: '' });
                }}
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={sending}
                className="btn-primary"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Subscribers;
