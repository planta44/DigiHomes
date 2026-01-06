import { useState, useEffect } from 'react';
import { Play, Image as ImageIcon, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useHeroAnimation } from '../hooks/useAnimations';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';

const DigiReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState(null);
  const [visibleReels, setVisibleReels] = useState([]);
  const { colors } = useTheme();
  const heroRef = useHeroAnimation();
  const heroRef2 = useHeroAnimation();

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

  // Staggered visibility animation
  useEffect(() => {
    setVisibleReels([]);
    reels.forEach((_, index) => {
      setTimeout(() => {
        setVisibleReels(prev => [...prev, index]);
      }, index * 150);
    });
  }, [reels]);

  const openLightbox = (reel) => {
    setSelectedReel(reel);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedReel(null);
    document.body.style.overflow = 'unset';
  };

  const navigateReel = (direction) => {
    const currentIndex = reels.findIndex(r => r.id === selectedReel.id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex === reels.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? reels.length - 1 : currentIndex - 1;
    }
    setSelectedReel(reels[newIndex]);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: colors[200], borderTopColor: colors[600] }}></div>
            <p className="text-gray-500">Loading reels...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div 
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors[800]} 0%, ${colors[600]} 50%, ${colors[700]} 100%)` }}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${colors[400]} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${colors[400]} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-6`}>
            <Play className="w-4 h-4" />
            Featured Content
          </div>
          <h1 ref={heroRef} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Digi Reels
          </h1>
          <p ref={heroRef2} className="text-xl text-white/80 max-w-2xl mx-auto">
            Explore our latest property showcases, announcements, and updates
          </p>
        </div>
      </div>

      {/* Reels Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {reels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                onClick={() => openLightbox(reel)}
                className={`group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                  visibleReels.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
              >
                <img
                  src={reel.thumbnail_url || reel.media_url}
                  alt={reel.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">{reel.title}</h3>
                    {reel.description && (
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">{reel.description}</p>
                    )}
                  </div>
                </div>

                {/* Media type indicator */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  {reel.media_type === 'video' ? (
                    <Play className="w-4 h-4 text-white" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Reels Yet</h3>
            <p className="text-gray-500">Check back soon for exciting content!</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedReel && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation arrows */}
          {reels.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateReel('prev'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all animate-pulse-nav"
                style={{ animation: 'pulseNav 2s ease-in-out infinite' }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateReel('next'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all animate-pulse-nav"
                style={{ animation: 'pulseNav 2s ease-in-out infinite 1s' }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Content */}
          <div 
            className="max-w-4xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedReel.media_type === 'video' ? (
              <video
                src={selectedReel.media_url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-lg"
              />
            ) : (
              <img
                src={selectedReel.media_url}
                alt={selectedReel.title}
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
              />
            )}
            
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{selectedReel.title}</h3>
              {selectedReel.description && (
                <p className="text-white/70 mt-2">{selectedReel.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default DigiReelsPage;
