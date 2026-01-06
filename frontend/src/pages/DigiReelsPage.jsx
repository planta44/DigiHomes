import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Eye, Send, X, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const DigiReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const videoRefs = useRef([]);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await api.get('/reels');
      setReels(response.data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  // Record view when reel is shown
  useEffect(() => {
    if (reels.length > 0 && reels[currentIndex]) {
      recordView(reels[currentIndex].id || reels[currentIndex]._id);
      
      // Play current video, pause others
      videoRefs.current.forEach((video, idx) => {
        if (video) {
          if (idx === currentIndex) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      });
    }
  }, [currentIndex, reels]);

  const recordView = async (reelId) => {
    try {
      await api.post(`/reels/${reelId}/view`);
      // Update local state
      setReels(prev => prev.map(r => 
        (r.id === reelId || r._id === reelId) ? { ...r, views: (r.views || 0) + 1 } : r
      ));
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Swipe gesture handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentIndex < reels.length - 1) {
        // Swiped up - next reel
        setCurrentIndex(prev => prev + 1);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        // Swiped down - previous reel
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // Handle like
  const handleLike = async (reelId) => {
    try {
      const response = await api.post(`/reels/${reelId}/like`);
      setReels(prev => prev.map(r => 
        (r.id === reelId || r._id === reelId) 
          ? { ...r, likes: response.data.likes, isLiked: response.data.isLiked }
          : r
      ));
      toast.success(response.data.isLiked ? 'Liked!' : 'Unliked');
    } catch (error) {
      console.error('Error liking reel:', error);
      toast.error('Please log in to like reels');
    }
  };

  // Fetch comments
  const fetchComments = async (reelId) => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/reels/${reelId}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Post comment
  const handlePostComment = async (reelId) => {
    if (!newComment.trim()) return;
    
    try {
      const response = await api.post(`/reels/${reelId}/comments`, { text: newComment });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // Delete comment (admin only)
  const handleDeleteComment = async (reelId, commentId) => {
    try {
      await api.delete(`/reels/${reelId}/comments/${commentId}`);
      setComments(prev => prev.filter(c => (c.id || c._id) !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Open comments
  const handleOpenComments = (reelId) => {
    setShowComments(true);
    fetchComments(reelId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">No Reels Available</p>
          <p className="text-white/60 mt-2">Check back soon!</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const reelId = currentReel.id || currentReel._id;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Reels container with swipe gestures */}
      <div
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => {
          const id = reel.id || reel._id;
          return (
            <div key={id} className="h-full w-full snap-start relative flex items-center justify-center">
              {/* Video/Image */}
              {reel.media_type === 'video' ? (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={reel.media_url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={false}
                />
              ) : (
                <img
                  src={reel.media_url}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Content overlay - bottom left */}
              <div className="absolute bottom-20 left-4 right-20 text-white z-10">
                <h3 className="text-lg font-semibold mb-2">{reel.title}</h3>
                {reel.description && (
                  <p className="text-sm text-white/80 line-clamp-2">{reel.description}</p>
                )}
              </div>

              {/* Action buttons - right side (TikTok style) */}
              <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-10">
                {/* Like button */}
                <button
                  onClick={() => handleLike(id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    reel.isLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
                  }`}>
                    <Heart
                      className={`w-6 h-6 ${reel.isLiked ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {reel.likes || 0}
                  </span>
                </button>

                {/* Comment button */}
                <button
                  onClick={() => handleOpenComments(id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {reel.comments?.length || 0}
                  </span>
                </button>

                {/* Views */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {reel.views || 0}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="absolute top-4 right-4 text-white text-sm font-medium z-10">
                {index + 1} / {reels.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">
                {comments.length} Comments
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-white/60 text-center py-8">No comments yet. Be the first!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id || comment._id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {comment.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{comment.user?.name || 'User'}</p>
                      <p className="text-white/80 text-sm mt-1">{comment.text}</p>
                      <p className="text-white/40 text-xs mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteComment(reelId, comment.id || comment._id)}
                        className="text-red-400 hover:text-red-300 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Comment input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePostComment(reelId)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => handlePostComment(reelId)}
                  disabled={!newComment.trim()}
                  className="w-10 h-10 rounded-full bg-primary-600 disabled:bg-gray-700 flex items-center justify-center text-white transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigiReelsPage;
