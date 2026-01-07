import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Home,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import HouseCard from '../components/HouseCard';
import api from '../config/api';

const HouseDetailsPage = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animationSettings, setAnimationSettings] = useState({
    type: 'fade-up',
    duration: 600
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHouse();
    fetchAnimationSettings();
  }, [id]);

  const fetchAnimationSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data?.animation_settings) {
        setAnimationSettings(response.data.animation_settings);
      }
    } catch (error) {
      console.error('Error fetching animation settings:', error);
    }
  };

  // Apply animations on mount and when settings change
  useEffect(() => {
    if (!house) return;
    
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach((el, index) => {
      // Reset animation
      el.style.opacity = '0';
      el.style.transform = getInitialTransform(animationSettings.type);
      
      // Trigger animation with stagger
      setTimeout(() => {
        el.style.transition = `opacity ${animationSettings.duration}ms ease-out, transform ${animationSettings.duration}ms ease-out`;
        el.style.opacity = '1';
        el.style.transform = 'translate3d(0, 0, 0) scale(1)';
      }, index * 100);
    });
  }, [house, animationSettings]);

  const getInitialTransform = (type) => {
    const transforms = {
      'fade': 'translate3d(0, 0, 0) scale(1)',
      'fade-up': 'translate3d(0, 30px, 0) scale(1)',
      'fade-down': 'translate3d(0, -30px, 0) scale(1)',
      'fade-left': 'translate3d(30px, 0, 0) scale(1)',
      'fade-right': 'translate3d(-30px, 0, 0) scale(1)',
      'zoom-in': 'translate3d(0, 0, 0) scale(0.8)',
      'zoom-out': 'translate3d(0, 0, 0) scale(1.2)',
      'slide-up': 'translate3d(0, 50px, 0) scale(1)',
      'slide-down': 'translate3d(0, -50px, 0) scale(1)',
      'slide-left': 'translate3d(50px, 0, 0) scale(1)',
      'slide-right': 'translate3d(-50px, 0, 0) scale(1)'
    };
    return transforms[type] || transforms['fade-up'];
  };

  const fetchHouse = async () => {
    try {
      const response = await api.get(`/houses/${id}`);
      const houseData = response.data;
      setHouse(houseData);
      
      // Fetch similar properties with loosened logic
      const allPropertiesRes = await api.get('/houses');
      let similar = [];
      
      if (houseData.property_type === 'house') {
        // For houses: same location, same house_type OR +/-1 bedrooms, same listing_type
        similar = allPropertiesRes.data
          .filter(p => 
            p.id !== parseInt(id) && 
            p.vacancy_status === 'available' &&
            p.property_type === 'house' &&
            p.listing_type === houseData.listing_type &&
            p.location === houseData.location &&
            (p.house_type === houseData.house_type || 
             Math.abs(p.bedrooms - houseData.bedrooms) <= 1)
          )
          .slice(0, 3);
      } else if (houseData.property_type === 'land') {
        // For land: same location only, towns and listing_type may vary
        similar = allPropertiesRes.data
          .filter(p => 
            p.id !== parseInt(id) && 
            p.vacancy_status === 'available' &&
            p.property_type === 'land' &&
            p.location === houseData.location
          )
          .slice(0, 3);
      }
      
      setSimilarProperties(similar);
    } catch (error) {
      console.error('Error fetching house:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=60';
    // Handle both Cloudinary (full URL) and local uploads (relative path)
    if (image.image_url?.startsWith('http')) {
      return image.image_url;
    }
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${image.image_url}`;
  };

  const nextImage = () => {
    if (house?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % house.images.length);
    }
  };

  const prevImage = () => {
    if (house?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + house.images.length) % house.images.length);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!house) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">House Not Found</h2>
          <p className="text-gray-600 mb-6">The house you're looking for doesn't exist or has been removed.</p>
          <Link to="/houses" className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Houses
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const images = house.images?.length > 0 ? house.images : [null];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to={house.property_type === 'land' ? '/buy' : '/houses'}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {house.property_type === 'land' ? 'Back to Lands' : 'Back to Houses'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Description (Desktop) / Images Only (Mobile) */}
          <div className="lg:col-span-2 space-y-6 order-1">
            {/* Image Gallery */}
            <div data-aos className="relative rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(images[currentImageIndex])}
                alt={house.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`badge ${house.vacancy_status === 'available' ? 'badge-available' : 'badge-occupied'}`}>
                  {house.vacancy_status === 'available' ? 'Available' : 'Occupied'}
                </span>
                {house.featured && (
                  <span className="badge bg-yellow-100 text-yellow-800">Featured</span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${house.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description - Hidden on mobile, shown on desktop */}
            <div data-aos className="hidden lg:block bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {house.description || 'No description available for this property.'}
              </p>
            </div>

            {/* Internal Features - Hidden on mobile */}
            {house.property_type === 'house' && house.internal_features && house.internal_features.length > 0 && (
              <div data-aos className="hidden lg:block bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Internal Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {house.internal_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Features - Hidden on mobile */}
            {house.property_type === 'house' && house.external_features && house.external_features.length > 0 && (
              <div data-aos className="hidden lg:block bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">External Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {house.external_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Land Features - Hidden on mobile */}
            {house.property_type === 'land' && house.land_features && house.land_features.length > 0 && (
              <div data-aos className="hidden lg:block bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Land Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {house.land_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details (shows second on mobile, first on desktop via order) */}
          <div className="space-y-6 order-2 lg:order-3">
            {/* Main Info Card */}
            <div data-aos className="bg-white rounded-xl shadow-md p-6">
              {/* Listing Type Banner */}
              {house.listing_type !== 'rent' && (
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                  house.listing_type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  For {house.listing_type === 'buy' ? 'Sale' : 'Lease'}
                </div>
              )}

              <div className="mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(house.rent_price)}
                </span>
                {/* Only show /month for rent, show duration for lease, nothing for buy */}
                {house.listing_type === 'rent' && (
                  <span className="text-gray-500">/month</span>
                )}
                {house.listing_type === 'lease' && house.lease_duration && (
                  <span className="text-gray-500">/{house.lease_duration} {house.lease_duration_type === 'months' ? 'mos' : 'yrs'}</span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">{house.title}</h1>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                {house.location}{house.town ? `, ${house.town}` : ''}
              </div>

              {/* Size and Dimensions for Land */}
              {house.property_type === 'land' && (
                <div className="space-y-2 py-4 border-t border-b border-gray-100">
                  {house.size_acres && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-semibold text-gray-900">{house.size_acres} Acres</span>
                    </div>
                  )}
                  {house.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-semibold text-gray-900">{house.dimensions}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Property Details - Only show for houses, not land */}
              {house.property_type !== 'land' && (
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
                  <div className="text-center">
                    <Bed className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <div className="font-semibold text-gray-900">{house.bedrooms}</div>
                    <div className="text-xs text-gray-500">Bedroom{house.bedrooms > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-center">
                    <Bath className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <div className="font-semibold text-gray-900">{house.bathrooms}</div>
                    <div className="text-xs text-gray-500">Bathroom{house.bathrooms > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-center">
                    <Home className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <div className="font-semibold text-gray-900 text-sm">{house.house_type}</div>
                    <div className="text-xs text-gray-500">Type</div>
                  </div>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500 mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                Listed on {formatDate(house.created_at)}
              </div>
            </div>

            {/* Contact Card */}
            <div data-aos className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Interested in this property?</h3>
              <div className="space-y-3">
                <a
                  href="tel:+254700000000"
                  className="btn-primary w-full"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
                <a
                  href={`https://wa.me/254700000000?text=Hi, I'm interested in the property: ${house.title} (${formatPrice(house.rent_price)}/month) in ${house.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Mobile only - Description and Features shown after details */}
          <div className="lg:hidden space-y-6 order-3">
            {/* Description - Mobile */}
            <div data-aos className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {house.description || 'No description available for this property.'}
              </p>
            </div>

            {/* Internal Features - Mobile */}
            {house.property_type === 'house' && house.internal_features && house.internal_features.length > 0 && (
              <div data-aos className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Internal Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {house.internal_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Features - Mobile */}
            {house.property_type === 'house' && house.external_features && house.external_features.length > 0 && (
              <div data-aos className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">External Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {house.external_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Land Features - Mobile */}
            {house.property_type === 'land' && house.land_features && house.land_features.length > 0 && (
              <div data-aos className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Land Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {house.land_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agency Info - Above Similar Properties */}
        <div data-aos className="mt-16 bg-gray-50 rounded-xl p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">DIGI Homes Agencies</h3>
          <p className="text-gray-600 text-sm mb-4">
            Your trusted housing agency in Nakuru and Nyahururu, Kenya.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>📧 info@digihomes.co.ke</p>
            <p>📞 +254 700 000 000</p>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map(property => (
                <HouseCard key={property.id} house={property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default HouseDetailsPage;
