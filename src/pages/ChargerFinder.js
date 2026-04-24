import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation, MapPin, Zap, Gauge, Compass, Filter, Battery, Wifi, Clock, DollarSign, IndianRupee, RefreshCw, Plus, X, AlertCircle } from 'lucide-react';
import ChargerCardSkeleton from '@/components/ChargerCardSkeleton';
import ChargerCard from '@/components/Chargercard';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { chargersAPI } from '@/lib/api';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

// Haversine formula to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Popup Modal Component
const AccessDeniedPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[var(--bg2)] rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slideIn">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-[var(--text2)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-[var(--text)] mb-2">Access Denied</h3>

            <p className="text-[var(--text2)] mb-4">
              Only <span className="font-semibold text-[var(--accent)]">Vendors</span> and
              <span className="font-semibold text-[var(--accent)]"> Admins</span> can add new charging stations.
            </p>

            <div className="bg-[var(--bg)] rounded-lg p-3 mb-4">
              <p className="text-sm text-[var(--text3)]">
                Please contact your administrator if you need to add a charging station.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChargerFinder = () => {
  const [chargers, setChargers] = useState([]);
  const [filteredChargers, setFilteredChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPower, setSelectedPower] = useState('all');
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();   // ✅ YAHAN ADD KARO


  useEffect(() => {
    const fetchChargers = async () => {
      try {
        setLoading(true);

        const res = await chargersAPI.getAll();

        const data = res.data;

        if (data.success) {
          const chargersWithDistance = data.chargers.map((charger) => {
            let distance = null;

            if (userLocation) {
              distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                charger.latitude,
                charger.longitude
              );
            }

            return {
              ...charger,
              id: charger._id,
              lat: charger.latitude,
              lng: charger.longitude,
              type: charger.charger_type,
              power: charger.power_kw,
              price: charger.pricePerKwh,

              totalSlots: charger.number_of_connectors ?? 0,

              availableSlots:
                charger.status === "available"
                  ? charger.number_of_connectors ?? 0
                  : 0,

              rating: charger.rating ?? 0,
              reviewCount: charger.reviewCount ?? 0,

              distance: distance ? distance.toFixed(1) : null,
            };
          });

          setChargers(chargersWithDistance);
          setFilteredChargers(chargersWithDistance);
        }

      } catch (error) {
        console.error("Failed to fetch chargers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChargers();
  }, [userLocation]);

  useEffect(() => {
    if (location.state?.selectedCharger) {
      const charger = location.state.selectedCharger;

      const lat = charger.latitude ?? charger.lat;
      const lng = charger.longitude ?? charger.lng;

      if (!lat || !lng) return;

      setSelectedCharger({
        ...charger,
        lat,
        lng,
      });

      setMapCenter([lat, lng]);
      setMapZoom(15);
    }
  }, [location.state]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const city = params.get("city");
    const type = params.get("type");
    const status = params.get("status");
    const distanceParam = params.get("distance");

    let filtered = chargers;

    if (city) {
      setSearchTerm(city);

      filtered = filtered.filter((charger) =>
        charger.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (type) {
      setSelectedType(type);
      filtered = filtered.filter((charger) => charger.type === type);
    }

    if (status) {
      filtered = filtered.filter((charger) => charger.status === status);
    }

    if (distanceParam && userLocation) {
      filtered = filtered.filter(
        (charger) =>
          calculateDistance(
            userLocation.lat,
            userLocation.lng,
            charger.lat,
            charger.lng
          ) <= Number(distanceParam)
      );
    }

    if (filtered.length > 0) {
      setFilteredChargers(filtered);

      // auto-center map on first result
      const first = filtered[0];
      setMapCenter([first.lat, first.lng]);
      setMapZoom(13);
    }
  }, [location.search, chargers, userLocation]);
  // Update distances when user location changes
  useEffect(() => {
    if (userLocation && chargers.length > 0) {
      const updatedChargers = chargers.map(charger => {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          charger.lat,
          charger.lng
        );
        return {
          ...charger,
          distance: dist.toFixed(1)
        };
      });
      setChargers(updatedChargers);
      setFilteredChargers(prev =>
        prev.map(charger => {
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            charger.lat,
            charger.lng
          );
          return {
            ...charger,
            distance: dist.toFixed(1)
          };
        })
      );
    }
  }, [userLocation]);

  // Filter chargers based on search and filters
  useEffect(() => {
    let filtered = chargers;

    if (searchTerm) {
      filtered = filtered.filter(charger =>
        charger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charger.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charger.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(charger => charger.type === selectedType);
    }

    if (selectedPower !== 'all') {
      if (selectedPower === 'fast') {
        filtered = filtered.filter(charger => charger.power >= 100 && charger.power < 200);
      } else if (selectedPower === 'ultra-fast') {
        filtered = filtered.filter(charger => charger.power >= 200);
      } else if (selectedPower === 'slow') {
        filtered = filtered.filter(charger => charger.power < 100);
      }
    }

    setFilteredChargers(filtered);
  }, [searchTerm, selectedType, selectedPower, chargers]);

  // Calculate distance when selected charger or user location changes
  useEffect(() => {
    if (selectedCharger && userLocation) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        selectedCharger.lat,
        selectedCharger.lng
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [selectedCharger, userLocation]);

  const handleChargerClick = (charger) => {
    setSelectedCharger(charger);
    setMapCenter([charger.lat, charger.lng]);
    setMapZoom(15);
  };

  const handleGetDirections = (charger) => {
    setSelectedCharger(charger);
    setMapCenter([charger.lat, charger.lng]);
    setMapZoom(15);
    const mapElement = document.getElementById('map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedPower('all');

    navigate("/chargers");
  };

  const handleAddCharger = () => {
    if (user?.role === "admin" || user?.role === "vendor") {
      // open add charger page
      navigate("/add-charger");
    } else {
      setShowPopup(true);
    }
  };

  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  };

  const chargerTypes = [
    'all',
    'DC Fast',
    'AC Level 2',
    'AC Level 1',
    'CCS',
    'CHAdeMO',
    'Type 2'
  ];
  const powerLevels = [
    { value: 'all', label: 'All Power' },
    { value: 'ultra-fast', label: 'Ultra Fast (200kW+)' },
    { value: 'fast', label: 'Fast (100-199kW)' },
    { value: 'slow', label: 'Slow (<100kW)' }
  ];

  // Check if any filter is active
  const isFilterActive = searchTerm !== '' || selectedType !== 'all' || selectedPower !== 'all';

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-16">
      {/* Add Charger Popup */}
      <AccessDeniedPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />

      <header className="bg-[var(--bg2)] border-b border-[var(--border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[var(--text)]">EV Charging Stations</h1>
            <button
              onClick={handleAddCharger}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Charger
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-[var(--bg2)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden sticky top-20" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <div className="p-5 border-b border-[var(--border)] bg-[var(--bg2)] sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[var(--accent)]" />
                    <h2 className="text-lg font-semibold text-[var(--text)]">Charger Finder</h2>
                  </div>
                  {isFilterActive && (
                    <button
                      onClick={handleResetFilters}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--red)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Stats moved here - below Charger Finder heading */}
                <div className="bg-[var(--accent-dim)] border border-[var(--border)] rounded-lg p-4 ">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-[var(--accent)]">{filteredChargers.length}</p>
                      <p className="text-xs text-[var(--text2)] font-medium">Total Stations</p>
                    </div>
                    <div className="w-px h-8 bg-blue-200"></div>
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-[var(--accent)]">
                        {filteredChargers.filter(c => c.status === 'available').length}
                      </p>
                      <p className="text-xs text-[var(--text2)] font-medium">Available</p>
                    </div>
                    <div className="w-px h-8 bg-blue-200"></div>
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-[var(--orange)]">
                        {filteredChargers.filter(c => c.status === 'occupied').length}
                      </p>
                      <p className="text-xs text-[var(--text2)] font-medium">Occupied</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--text2)] mb-2">
                    Search Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, address, or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border bg-[var(--bg3)] border-[var(--border)] text-[var(--text)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Charger Type Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-[var(--text2)]" />
                    <label className="text-sm font-medium text-[var(--text2)]">Charger Type</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chargerTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedType === type
                          ? 'bg-[var(--accent)] text-black'
                          : 'bg-[var(--bg3)] text-[var(--text2)] hover:bg-[var(--card2)]'
                          }`}
                      >
                        {type === 'all' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Power Level Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Battery className="w-4 h-4 text-[var(--text2)]" />
                    <label className="text-sm font-medium text-[var(--text2)]">Power Level</label>
                  </div>
                  <div className="space-y-2">
                    {powerLevels.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setSelectedPower(level.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPower === level.value
                          ? 'bg-[var(--accent)] text-black'
                          : 'bg-[var(--bg3)] text-[var(--text2)] hover:bg-[var(--card2)]'
                          }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset All Filters Button - Full width */}
                {isFilterActive && (
                  <div className="mb-6">
                    <button
                      onClick={handleResetFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgba(239,68,68,0.1)] text-[var(--red)] hover:bg-red-100 rounded-lg transition-colors text-sm font-medium border border-[var(--border)]"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset All Filters
                    </button>
                  </div>
                )}

                {/* Selected Charger Information */}
                {selectedCharger ? (
                  <div className="space-y-4">
                    <div className="pt-2 border-t border-[var(--border)]">
                      <h3 className="text-sm font-medium text-[var(--text3)] mb-3">Selected Charger</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-[var(--text3)]" />
                            <span className="text-sm font-medium text-[var(--text2)]">Name</span>
                          </div>
                          <p className="text-base font-semibold text-[var(--text)] ml-6">{selectedCharger.name}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-[var(--text3)]" />
                            <span className="text-sm font-medium text-[var(--text2)]">Address</span>
                          </div>
                          <p className="text-sm text-[var(--text2)] ml-6">{selectedCharger.address}, {selectedCharger.city}</p>
                        </div>
                        {distance !== null && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Navigation className="w-4 h-4 text-[var(--text3)]" />
                              <span className="text-sm font-medium text-[var(--text2)]">Distance from you</span>
                            </div>
                            <p className="text-sm font-semibold text-[var(--accent)] ml-6">{formatDistance(distance)}</p>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="w-4 h-4 text-[var(--text3)]" />
                            <span className="text-sm font-medium text-[var(--text2)]">Price</span>
                          </div>
                          <p className="text-sm text-[var(--text2)] ml-6">₹{selectedCharger.price}/kWh</p>
                        </div>
                        <button
                          onClick={() => handleGetDirections(selectedCharger)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-black rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mt-4"
                        >
                          <Navigation className="w-4 h-4" />
                          View on Map
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <Compass className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-[var(--text2)] font-medium">No charger selected</p>
                      <p className="text-xs text-[var(--text3)] mt-1">Click "View on Map" on any charger card to see details here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div id="map-section" className="bg-[var(--bg2)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden mb-6 relative">
              <div className="h-[500px] w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater center={mapCenter} />
                  {filteredChargers.map(charger => (
                    <Marker
                      key={charger.id}
                      position={[charger.lat, charger.lng]}
                      eventHandlers={{ click: () => handleChargerClick(charger) }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">{charger.name}</h3>
                          <p className="text-sm text-[var(--text2)]">{charger.address}</p>
                          <button
                            onClick={() => handleGetDirections(charger)}
                            className="mt-2 text-xs bg-[var(--accent)] text-black px-2 py-1 rounded hover:bg-blue-700"
                          >
                            View on Map
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text)]">
                  All Charging Stations
                  <span className="ml-2 text-sm font-normal text-[var(--text3)]">({filteredChargers.length} stations)</span>
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => <ChargerCardSkeleton key={index} />)}
                </div>
              ) : filteredChargers.length === 0 ? (
                <div className="bg-[var(--bg2)] rounded-xl shadow-sm border border-[var(--border)] p-12 text-center">
                  <p className="text-[var(--text3)]">No charging stations found matching your criteria.</p>
                  {isFilterActive && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredChargers.map(charger => (
                    <ChargerCard
                      key={charger.id}
                      charger={charger}
                      onClick={handleChargerClick}
                      onGetDirections={handleGetDirections}
                      compact={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChargerFinder;