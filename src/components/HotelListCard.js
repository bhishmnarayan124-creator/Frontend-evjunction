  import React, { useState } from 'react';
  import { WishlistHeart } from '@/pages/Wishlist';

  const HotelListCard = ({ hotels, onHotelClick, onWishlist, wishlistedIds = [] }) => {
    const [imgError, setImgError] = useState({});

    const renderStars = (rating) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars.push(<i key={i} className="fas fa-star text-yellow-400 text-xs"></i>);
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400 text-xs"></i>);
        } else {
          stars.push(<i key={i} className="far fa-star text-yellow-400 text-xs"></i>);
        }
      }
      return stars;
    };


    const getRoomCount = (hotel) => {
      if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0)
        return hotel.rooms.length;

      if (Array.isArray(hotel.room_types) && hotel.room_types.length > 0)
        return hotel.room_types.length;

      if (hotel.room_count != null)
        return Number(hotel.room_count);

      return null;
    };

    if (!hotels || hotels.length === 0) {
      return (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl">
          <i className="fas fa-hotel text-6xl text-gray-300 mb-4"></i>
          <p className="text-[var(--text2)] text-lg mb-5">No hotels found matching your filters.</p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {hotels.map(hotel => {

          const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

          const imageSrc = hotel.images?.[0]
            ? hotel.images[0].startsWith('http')
              ? hotel.images[0]
              : `${backendUrl}${hotel.images[0]}`
            : hotel.image || null;

          const roomCount = getRoomCount(hotel);   // ✅ ADD THIS LINE

          const handleCardClick = () => {
            if (onHotelClick) onHotelClick(hotel);
          };
          return (
            <div
              key={hotel._id}
              onClick={handleCardClick}
              className="group bg-[var(--card)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col md:flex-row"
            >
              {/* Image Section - Left side */}
              <div className="relative md:w-80 w-full h-56 md:h-auto overflow-hidden bg-[var(--bg3)] flex-shrink-0">
                {imageSrc && !imgError[hotel._id] ? (
                  <img
                    src={imageSrc}
                    alt={hotel.name}
                    onError={() => setImgError(prev => ({ ...prev, [hotel.id]: true }))}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg3)] to-[var(--bg4)]">
                    <i className="fas fa-hotel text-5xl text-gray-300"></i>
                    <span className="text-xs text-gray-400 mt-2 font-medium">{hotel.name}</span>
                  </div>
                )}



                {/* Wishlist Button */}
                <WishlistHeart
                  type="hotel"
                  id={hotel._id || hotel.id}
                  savedIds={wishlistedIds}
                  className="absolute top-3 right-3"
                />
              </div>

              {/* Content Section - Right side */}
              <div className="flex-1 p-5 flex flex-col gap-2">
                {/* Hotel Name and Rating */}
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-xl font-bold text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                    {hotel.name}
                  </h3>
                  <div className="bg-[var(--accent)] text-black  px-2.5 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 flex-shrink-0">
                    <span>{hotel.rating?.toFixed?.(1) || '—'}</span>
                    <i className="fas fa-star text-xs"></i>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-[var(--text2)]">
                  <i className="fas fa-map-marker-alt text-gray-400 text-xs"></i>
                  <span> {[hotel.city, hotel.state].filter(Boolean).join(', ') || hotel.address || 'Location unavailable'}</span>
                </div>

                {/* Rating Stars and Review Count */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {renderStars(hotel.rating)}
                  </div>
                  <span className="font-semibold text-[var(--text)] text-sm">{hotel.ratingText}</span>
                  <span className="text-[var(--text2)] text-sm">({hotel.reviews} reviews)</span>
                </div>

                {/* Last Booked */}


                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {hotel.amenities.slice(0, 5).map((amenity, index) => (
                      <span key={index} className="text-xs text-[var(--text2)] bg-[var(--bg3)] px-2.5 py-1 rounded-full">
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 5 && (
                      <span className="text-xs text-[var(--text2)]">+{hotel.amenities.length - 5} more</span>
                    )}
                  </div>
                )}

                {roomCount != null && (
                  <div className="text-xs text-[var(--text2)] flex items-center gap-1 mt-1">
                    <i className="fas fa-bed"></i>
                    {roomCount} room {roomCount === 1 ? 'type' : 'types'} available
                  </div>
                )}

                {/* Book Button Only */}
                <div className="flex justify-end mt-3 pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                    className="bg-[var(--accent)] text-black hover:opacity-90 font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  >
                    View Rooms
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  export default HotelListCard;