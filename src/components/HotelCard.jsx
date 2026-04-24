import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Zap, Wifi, Car, Coffee,
  Waves, ArrowRight, Dumbbell, Utensils, BedDouble,
} from 'lucide-react';
import { WishlistHeart } from '@/pages/Wishlist';

/* ─────────────────────────────────────────────────────
   AMENITY CONFIG
───────────────────────────────────────────────────── */
const AMENITY_ICONS = {
  wifi: { icon: Wifi, label: 'Free WiFi' },
  parking: { icon: Car, label: 'Parking' },
  breakfast: { icon: Coffee, label: 'Breakfast' },
  pool: { icon: Waves, label: 'Pool' },
  gym: { icon: Dumbbell, label: 'Gym' },
  restaurant: { icon: Utensils, label: 'Restaurant' },
};

/* ─────────────────────────────────────────────────────
   ROOM COUNT — derive from hotel data
   Supports:
     hotel.room_types = [{...}, ...]   ← preferred
     hotel.room_count = 3              ← simple number fallback
───────────────────────────────────────────────────── */
const getRoomCount = (hotel) => {
  if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0)
    return hotel.rooms.length;

  if (Array.isArray(hotel.room_types) && hotel.room_types.length > 0)
    return hotel.room_types.length;

  if (hotel.room_count != null)
    return Number(hotel.room_count);

  return null;
};

/* ─────────────────────────────────────────────────────
   EV BADGE
───────────────────────────────────────────────────── */
const EvBadge = ({ count, chargerType }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
    <Zap className="w-3 h-3" />
    {count} {count === 1 ? 'Charger' : 'Chargers'}
    {chargerType && ` · ${chargerType}`}
  </span>
);

/* ─────────────────────────────────────────────────────
   STAR BADGE
───────────────────────────────────────────────────── */
const StarBadge = ({ rating }) =>
  rating ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
      {rating} Star
    </span>
  ) : null;

/* ─────────────────────────────────────────────────────
   CARD IMAGE
───────────────────────────────────────────────────── */
const CardImage = ({
  hotelId,
  images,
  name,
  chargers_available,
  charger_type,
  star_rating,
  isNew,
  wishlistedIds,
}) => {
  const [imgError, setImgError] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const src = images?.[0]
    ? (images[0].startsWith('http') ? images[0] : `${backendUrl}${images[0]}`)
    : null;

  return (
    <div className="relative h-48 overflow-hidden bg-[var(--border)]">
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover "
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg3)] to-[var(--bg4)]">
          <svg
            className="w-12 h-12 text-slate-300"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-xs text-slate-400 mt-2 font-medium">{name}</span>
        </div>
      )}

      {/* Top-left badges */}
      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
        {chargers_available > 0 && (
          <EvBadge count={chargers_available} chargerType={charger_type} />
        )}
        {star_rating && <StarBadge rating={star_rating} />}
        {isNew && (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            New
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <WishlistHeart
        type="hotel"
        id={hotelId}
        savedIds={wishlistedIds}
        className="absolute top-3 right-3 z-10"
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   AMENITY CHIPS
───────────────────────────────────────────────────── */
const AmenityChips = ({ amenities = [] }) => {
  if (!amenities.length) return null;

  const chips = amenities.slice(0, 4).map((a) => {
    const key = Object.keys(AMENITY_ICONS).find((k) =>
      a.toLowerCase().includes(k)
    );
    const cfg = AMENITY_ICONS[key];
    return { label: cfg?.label || a, Icon: cfg?.icon };
  });

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {chips.map(({ label, Icon }, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 rounded-md px-2 py-1 border border-slate-100"
        >
          {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
          {label}
        </span>
      ))}
    </div>
  );
};

const HotelCard = ({
  hotel = {},
  onClick,
  onWishlist,
  wishlistedIds = [],
  compact = false,
  className = '',
}) => {
  const navigate = useNavigate();

  const {
    _id, id,
    name = 'Hotel',
    city = '',
    state = '',
    address = '',
    star_rating,
    chargers_available = 0,
    charger_type,
    amenities = [],
    images = [],
    review_count,
    avg_rating,
    created_at,
  } = hotel;

  const hotelId = _id || id;
  const roomCount = getRoomCount(hotel);

  const isNew = created_at
    ? Date.now() - new Date(created_at).getTime() < 14 * 24 * 60 * 60 * 1000
    : false;

  const handleClick = () => {
    if (onClick) { onClick(hotel); return; }
    if (hotelId) navigate(`/hotels/${hotelId}`);
  };

  const locationStr =
    [city, state].filter(Boolean).join(', ') || address || '—';

  return (
    <div
      role="article"
      aria-label={`Hotel: ${name}`}
      onClick={handleClick}
      className={`
        group relative bg-[var(--card)] rounded-2xl border border-[var(--border)]
        overflow-hidden cursor-pointer
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg hover:border-slate-300
        ${compact ? 'max-w-xs' : ''}
        ${className}
      `}
    >
      {/* ── Image ── */}
      <CardImage
        hotelId={hotelId}
        images={images}
        name={name}
        chargers_available={chargers_available}
        charger_type={charger_type}
        star_rating={star_rating}
        isNew={isNew}
        wishlistedIds={wishlistedIds}
      />

      {/* ── Body ── */}
      <div className="p-4">

        {/* Hotel name */}
        <h3 className="text-[15px] font-semibold text-[var(--text)] leading-snug mb-1 truncate">
          {name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-[var(--text2)] mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{locationStr}</span>
        </div>

        {/* Amenity chips — hidden in compact mode */}
        {!compact && <AmenityChips amenities={amenities} />}
        {/* ── EV charger bar — hidden in compact mode ── */}
        {chargers_available > 0 && !compact && (
          <div className="mt-3 flex items-center gap-2 bg-[var(--accent-dim)] rounded-lg px-3 py-2 border border-[var(--border)]">
            <Zap className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span className="text-[11px] text-[var(--accent)] font-medium">
              {chargers_available} EV charging{' '}
              {chargers_available === 1 ? 'point' : 'points'} available
              {charger_type && ` · ${charger_type}`}
            </span>
          </div>
        )}
        {/* Divider */}
        <div className="h-px bg-[var(--border)] mb-3" />

        {/* ── Footer: rating + room hint + CTA ── */}
        <div className="flex items-center justify-between gap-2">

          {/* Left: rating + room count */}
          <div className="min-w-0">

            {/* Rating */}
            {avg_rating ? (
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[13px] font-semibold text-slate-800">
                  {Number(avg_rating).toFixed(1)}
                </span>
                {review_count > 0 && (
                  <span className="text-[11px] text-[var(--text2)]">
                    ({review_count} reviews)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] text-[var(--text2)]">No reviews yet</span>
              </div>
            )}

            {/* Room count hint */}
            {roomCount != null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <BedDouble className="w-3 h-3 flex-shrink-0" />
                <span>
                  {roomCount} room {roomCount === 1 ? 'type' : 'types'} available
                </span>
              </div>
            )}
          </div>

          {/* Right: CTA button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="
              flex-shrink-0 flex items-center gap-1.5
              text-xs font-semibold px-4 py-2 rounded-lg
              bg-emerald-700 hover:bg-emerald-800 active:scale-95
              text-white transition-all duration-150
            "
          >
            {compact ? 'View' : 'Check rooms'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>


      </div>
    </div>
  );
};

export default HotelCard;