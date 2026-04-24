import { MapPin, Zap, Gauge, Circle, Star, Navigation, Battery, Clock, IndianRupee } from 'lucide-react';

const ChargerCard = ({ charger, onClick, compact = false, onGetDirections }) => {
  const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "bg-[var(--accent-dim)] text-[var(--accent)]";
    case "occupied":
      return "bg-[rgba(239,68,68,0.1)] text-[var(--red)]";
    case "maintenance":
      return "bg-[rgba(251,191,36,0.1)] text-[var(--yellow)]";
    default:
      return "bg-[var(--bg3)] text-[var(--text2)]";
  }
};

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <Circle className="w-2 h-2 fill-[var(--accent)] text-[var(--accent)]" />;
      case 'occupied':
        return <Circle className="w-2 h-2 fill-[var(--red)] text-[var(--red)]" />;
      default:
        return <Circle className="w-2 h-2 fill-[var(--yellow)] text-[var(--yellow)]" />;
    }
  };

  const handleGetDirections = (e) => {
    e.stopPropagation();
    if (onGetDirections) {
      onGetDirections(charger);
    }
  };

  // Calculate available slots (mock - you can replace with actual data)
  const availableSlots = charger.availableSlots ?? 0;
  const totalSlots = charger.totalSlots ?? 0;
  const rating = charger.rating ?? 0;
  const reviewCount = charger.reviewCount ?? 0;
  const price = charger.price ?? 0;

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(charger)}
        className="bg-[var(--card)]rounded-lg shadow-sm border border-[var(--border)] p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-[var(--text)] text-sm">{charger.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
            {charger.status || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text2)] mb-2">
          <MapPin className="w-3 h-3" />
          <span>{charger.address?.split(',')[0]}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[var(--blue)]" />
            <span>{charger.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[var(--purple)]" />
            <span>{charger.power} kW</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(charger)}
      className="bg-[var(--card)]rounded-2xl shadow-md border border-[var(--border)] hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="p-5">
        {/* Header with Name and Status */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-[var(--text)] mb-1">{charger.name}</h3>
            <div className="flex items-center gap-2 text-sm text-[var(--text2)]">
              <MapPin className="w-4 h-4" />
              <span>{charger.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text2)] mt-0.5">
              <span>{charger.city}</span>
              {charger.distance && (
                <>
                  <span>·</span>
                  <span>{charger.distance} km</span>
                </>
              )}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(charger.status)}`}>
            {getStatusIcon(charger.status)}
            <span>{charger.status || 'Unknown'}</span>
          </div>
        </div>

        {/* Charger Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-[var(--border)]">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-[var(--blue)]" />
              <span className="text-xs text-[var(--text2)] uppercase font-medium">Type</span>
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">{charger.type}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gauge className="w-4 h-4 text-[var(--purple)]" />
              <span className="text-xs text-[var(--text2)] uppercase font-medium">Power</span>
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">{charger.power} kW</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Battery className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs text-[var(--text2)] uppercase font-medium">Slots</span>
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">
              {availableSlots}/{totalSlots} free
            </p>
          </div>
        </div>

        {/* Price and Rating Row */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-baseline gap-1">
            <IndianRupee className="w-4 h-4 text-[var(--text2)]" />
            <span className="text-2xl font-bold text-[var(--text)]">{price}</span>
            <span className="text-sm text-[var(--text2)]">/kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'fill-[var(--yellow)] text-[var(--yellow)]'
                      : 'text-[var(--border2)]'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-[var(--text2)]">{rating}</span>
            <span className="text-sm text-[var(--text2)]">({reviewCount})</span>
          </div>
        </div>

        {/* View on Map Button */}
        <button
          onClick={handleGetDirections}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-blackrounded-xl hover:opacity-90 transition-all duration-200 text-sm font-semibold group-hover:shadow-md"
        >
          <Navigation className="w-4 h-4" />
          View on Map
        </button>
      </div>
    </div>
  );
};

export default ChargerCard;