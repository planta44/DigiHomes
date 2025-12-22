import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, ArrowRight, Ruler, LandPlot } from 'lucide-react';

const HouseCard = ({ house, index = 0, isVisible = true, animSettings = {} }) => {
  const primaryImage = house.images?.find(img => img.is_primary) || house.images?.[0];
  const imageUrl = primaryImage?.image_url 
    ? (primaryImage.image_url.startsWith('http') 
        ? primaryImage.image_url 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${primaryImage.image_url}`)
    : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=60';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isLand = house.property_type === 'land';
  const isForSale = house.listing_type === 'buy';
  const isForLease = house.listing_type === 'lease';

  const getPriceLabel = () => {
    if (isForSale || isForLease) return '';
    return '/mo';
  };

  const duration = animSettings.duration || 600;
  const stagger = animSettings.staggerDelay || 150;

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden transition-all hover:shadow-2xl"
      style={{
        transitionProperty: 'opacity, box-shadow',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${index * stagger}ms`,
        opacity: isVisible ? 1 : 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={house.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=60'; }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              house.vacancy_status === 'available' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {house.vacancy_status === 'available' ? 'Available' : 'Occupied'}
          </span>
        </div>

        {/* Type Badges - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {house.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
              ★ Featured
            </span>
          )}
          {isLand && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Land
            </span>
          )}
          {isForLease && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
              Lease
            </span>
          )}
          {isForSale && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
              For Sale
            </span>
          )}
        </div>

        {/* Price - Bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-white">
            <span className="text-2xl font-bold">{formatPrice(house.rent_price)}</span>
            <span className="text-white/80 text-sm">{getPriceLabel()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {house.title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1.5 text-primary-500" />
          <span className="truncate">{house.location}, Kenya</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-gray-600 text-sm pb-4 border-b border-gray-100">
          {isLand ? (
            <>
              {house.size_acres && (
                <div className="flex items-center gap-1.5">
                  <LandPlot className="w-4 h-4 text-primary-500" />
                  <span>{house.size_acres} Acres</span>
                </div>
              )}
              {house.dimensions && (
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-primary-500" />
                  <span>{house.dimensions}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-primary-500" />
                <span>{house.bedrooms} Bed{house.bedrooms > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-primary-500" />
                <span>{house.bathrooms} Bath{house.bathrooms > 1 ? 's' : ''}</span>
              </div>
              {house.house_type && (
                <span className="text-primary-600 font-medium ml-auto">
                  {house.house_type}
                </span>
              )}
            </>
          )}
        </div>

        {/* Action */}
        <Link
          to={`/houses/${house.id}`}
          className="flex items-center justify-between w-full pt-4 text-primary-600 font-semibold group/link"
        >
          <span>View Details</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default HouseCard;
