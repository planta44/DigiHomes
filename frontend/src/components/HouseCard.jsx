import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, ArrowRight } from 'lucide-react';

const HouseCard = ({ house }) => {
  const primaryImage = house.images?.find(img => img.is_primary) || house.images?.[0];
  const imageUrl = primaryImage?.image_url 
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${primaryImage.image_url}`
    : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=60';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={house.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${house.vacancy_status === 'available' ? 'badge-available' : 'badge-occupied'}`}>
            {house.vacancy_status === 'available' ? 'Available' : 'Occupied'}
          </span>
          {house.featured && (
            <span className="badge bg-yellow-100 text-yellow-800">Featured</span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-lg font-semibold text-sm">
            {formatPrice(house.rent_price)}/mo
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {house.title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          {house.location}, Kenya
        </div>

        <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{house.bedrooms} Bed{house.bedrooms > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{house.bathrooms} Bath{house.bathrooms > 1 ? 's' : ''}</span>
          </div>
          <div className="text-primary-600 font-medium">
            {house.house_type}
          </div>
        </div>

        <Link
          to={`/houses/${house.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-600 hover:text-white transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default HouseCard;
