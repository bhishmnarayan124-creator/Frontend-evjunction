import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { evCarsAPI, wishlistAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import {
  Car, Search, Filter, Battery, Zap, MapPin,
  Calendar, Gauge, Heart, Plus, Loader2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { WishlistHeart } from './Wishlist';

const Marketplace = () => {
  const { isAuthenticated } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();

  // Filters
  const params = new URLSearchParams(location.search);

  const [searchBrand, setSearchBrand] = useState(params.get("brand") || '');
  const [filterCity, setFilterCity] = useState(params.get("city") || '');
  const [filterCondition, setFilterCondition] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minRange, setMinRange] = useState(0);
  const [wishlistCarIds, setWishlistCarIds] = useState([]);

  // Fetch cars
  useEffect(() => {

    const fetchCars = async () => {

      setLoading(true);

      try {

        const urlParams = new URLSearchParams(location.search);

        const params = {
          status: "approved"
        };

        if (urlParams.get("brand"))
          params.brand = urlParams.get("brand");

        if (urlParams.get("city"))
          params.city = urlParams.get("city");

        if (urlParams.get("minPrice"))
          params.minPrice = urlParams.get("minPrice");

        if (urlParams.get("maxPrice"))
          params.maxPrice = urlParams.get("maxPrice");

        if (filterCondition !== "all")
          params.condition = filterCondition;

        if (minRange > 0)
          params.min_range = minRange;

        const response = await evCarsAPI.getAll(params);

        setCars(response.data.cars || []);

      } catch (error) {

        console.error("Error fetching cars:", error);
        toast.error("Failed to load listings");

      } finally {

        setLoading(false);

      }

    };

    fetchCars();

  }, [location.search, filterCondition, minRange]);
  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await evCarsAPI.getBrands();
        setBrands(response.data || [])
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);


  useEffect(() => {
  const loadWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await wishlistAPI.getWishlist();

      setWishlistCarIds(
        res.data.cars?.map(c => c._id) || []
      );
    } catch (err) {
      console.error("Wishlist load failed", err);
    }
  };

  loadWishlist();
}, [isAuthenticated]);
  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return `${(price / 1000).toFixed(0)}K`;
  };

  const getBatteryColor = (score) => {
    if (!score) return 'bg-ev-text3';
    if (score >= 90) return 'bg-ev-accent';
    if (score >= 75) return 'bg-ev-blue';
    if (score >= 60) return 'bg-ev-orange';
    return 'bg-ev-danger';
  };

  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="marketplace-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-clash text-3xl md:text-4xl font-semibold text-white">
              EV Marketplace
            </h1>
            <p className="text-ev-text2 mt-1">
              {cars.length} electric vehicles available
            </p>
          </div>
          <Link to="/sell">
            <Button className="ev-button" data-testid="sell-ev-btn">
              <Plus className="w-4 h-4 mr-2" />
              Sell Your EV
            </Button>
          </Link>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-ev-bg p-6 overflow-y-auto' : 'hidden'
            } lg:block lg:relative lg:w-72 lg:flex-shrink-0`}>
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Mobile close button */}
              <div className="flex items-center justify-between lg:hidden mb-4">
                <h2 className="font-clash text-xl font-medium text-white">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="glass-panel rounded-xl p-4">
                <label className="text-sm text-ev-text2 mb-2 block">Search Brand</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-text3" />
                  <Input
                    placeholder="e.g., Tesla, Tata..."
                    value={searchBrand}
                    onChange={(e) => setSearchBrand(e.target.value)}
                    className="pl-10 bg-ev-bg border-white/10"
                    data-testid="search-brand-input"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="glass-panel rounded-xl p-4">
                <label className="text-sm text-ev-text2 mb-2 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-text3" />
                  <Input
                    placeholder="City..."
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="pl-10 bg-ev-bg border-white/10"
                    data-testid="search-city-input"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="glass-panel rounded-xl p-4">
                <label className="text-sm text-ev-text2 mb-2 block">Condition</label>
                <Select value={filterCondition} onValueChange={setFilterCondition}>
                  <SelectTrigger className="bg-ev-bg border-white/10" data-testid="filter-condition">
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-ev-card border-white/10">
                    <SelectItem value="all">Any Condition</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="glass-panel rounded-xl p-4">
                <label className="text-sm text-ev-text2 mb-4 block">
                  Price Range: ₹{formatPrice(priceRange[0])} - ₹{formatPrice(priceRange[1])}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000000}
                  step={100000}
                  className="[&_[role=slider]]:bg-ev-accent"
                  data-testid="price-slider"
                />
              </div>

              {/* Min Range */}
              <div className="glass-panel rounded-xl p-4">
                <label className="text-sm text-ev-text2 mb-4 block">
                  Minimum Range: {minRange} km
                </label>
                <Slider
                  value={[minRange]}
                  onValueChange={(v) => setMinRange(v[0])}
                  max={600}
                  step={50}
                  className="[&_[role=slider]]:bg-ev-accent"
                  data-testid="range-slider"
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                className="w-full border-white/10"
                onClick={() => {
                  setSearchBrand('');
                  setFilterCity('');
                  setFilterCondition('all');
                  setPriceRange([0, 10000000]);
                  setMinRange(0);
                }}
                data-testid="clear-filters-btn"
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="w-full border-white/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Car Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-ev-accent animate-spin" />
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-2xl">
                <Car className="w-16 h-16 text-ev-text3 mx-auto mb-4" />
                <h3 className="font-clash text-xl text-white mb-2">No EVs Found</h3>
                <p className="text-ev-text2 mb-6">Try adjusting your filters or search criteria</p>
                <Link to="/sell">
                  <Button className="ev-button">
                    <Plus className="w-4 h-4 mr-2" />
                    List Your EV
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car, index) => (
                  <motion.div
                    key={car._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/marketplace/${car._id}`}
                      className="ev-card overflow-hidden group block"
                      data-testid={`ev-card-${car._id}`}
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-ev-bg2 overflow-hidden">
                        {car.images?.[0] ? (
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL}${car.images[0]}`}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-16 h-16 text-ev-text3" />
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className={`${getBatteryColor(car.battery_health_score)} text-white`}>
                            <Battery className="w-3 h-3 mr-1" />
                            {car.battery_health_score || '—'}%
                          </Badge>
                          {car.fast_charging_supported && (
                            <Badge className="bg-ev-blue text-white">
                              <Zap className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>

                        {/* Favorite button */}
                        {isAuthenticated && (
                          <WishlistHeart
                            type="car"
                            id={car._id}
                            savedIds={wishlistCarIds}
                            className="absolute top-3 right-3"
                          />
                        )}

                        {/* Seller type */}
                        {car.seller_type === 'dealer' && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-ev-purple text-white">Dealer</Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-clash font-medium text-white group-hover:text-ev-accent transition-colors">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-ev-text3 text-sm">{car.year}</p>
                          </div>
                          <span className="font-clash font-semibold text-ev-accent">
                            ₹{formatPrice(car.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-ev-text2 mb-3">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            {car.mileage_km?.toLocaleString()} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {car.range_km} km
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-ev-text3 text-xs">
                          <MapPin className="w-3 h-3" />
                          {car.city}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
