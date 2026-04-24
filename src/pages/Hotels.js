import React, { useState, useEffect } from 'react';
import HotelsListLayout from '../components/HotelsListLayout';
import { hotelsAPI, wishlistAPI } from "@/lib/api";
import { useLocation } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';

const Hotels = () => {
  // State for hotels data
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // State for filters
  const [filters, setFilters] = useState({
    hotelName: '',
    priceRange: [0, 1000],
    propertyTypes: [],
    starCategories: []
  });

  // State for sort by
  const [sortBy, setSortBy] = useState('Popularity');

  // State for wishlist
  const [wishlistedIds, setWishlistedIds] = useState([]);

  // NEW: State for view mode (grid or list)
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

  // Fetch hotels from API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await hotelsAPI.getAll();
        const hotelsData = res.data.hotels || [];

        // Transform API data to match component expected format
        const transformedHotels = hotelsData.map((hotel, index) => ({
          id: hotel._id,
          _id: hotel._id,
          name: hotel.name || 'Hotel',
          images: hotel.images || [],
          city: hotel.city || '',
          state: hotel.state || '',
          address: hotel.address || '',
          rooms: hotel.rooms || [],
          room_types: hotel.room_types || [],
          room_count: hotel.room_count ?? null,
          rating: hotel.avg_rating || hotel.rating || 0,
          ratingText: getRatingText(hotel.avg_rating || hotel.rating || 0),
          reviews: hotel.review_count || hotel.reviews || 0,
          lastBooked: hotel.lastBooked || getRandomLastBooked(),
          discount: hotel.discount || getRandomDiscount(),
          price: hotel.price_per_night || hotel.price || 100,
          originalPrice: hotel.original_price || hotel.originalPrice || (hotel.price_per_night ? hotel.price_per_night * 1.2 : 120),

          propertyType: hotel.property_type || hotel.propertyType || 'Hotel',
          starCategory: hotel.star_rating || hotel.starCategory || 3,
          amenities: hotel.amenities || [],
          chargers_available: hotel.chargers_available || 0,
          charger_type: hotel.charger_type || ''
        }));

        setHotels(transformedHotels);
      } catch (err) {
        console.error("Hotels fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
  const loadWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await wishlistAPI.getWishlist();

      setWishlistedIds(
        res.data.hotels?.map(h => h._id) || []
      );

    } catch (err) {
      console.error("Wishlist load failed", err);
    }
  };

  loadWishlist();
}, [isAuthenticated]);


  useEffect(() => {
    if (!hotels.length) return;

    const params = new URLSearchParams(location.search);
    const city = params.get("city");

    if (city) {
      setFilters((prev) => ({
        ...prev,
        hotelName: city,
      }));
    }
  }, [location.search, hotels]);

  // Helper function to get rating text
  const getRatingText = (rating) => {
    if (rating >= 8.5) return 'Excellent';
    if (rating >= 7) return 'Very Good';
    if (rating >= 6) return 'Good';
    if (rating >= 5) return 'Average';
    return 'Poor';
  };

  // Helper for random last booked (for demo)
  const getRandomLastBooked = () => {
    const options = ['1 hour ago', '2 hours ago', '5 hours ago', '1 day ago', '2 days ago'];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Helper for random discount (for demo)
  const getRandomDiscount = () => {
    const discounts = ['10% Off!', '15% Off!', '20% Off!', '25% Off!', '30% Off!'];
    return discounts[Math.floor(Math.random() * discounts.length)];
  };

  // Property types (can also come from API)
  const propertyTypesList = ['Hotel', 'Resort', 'Villa', 'Homestay', 'Motel', 'Guest House', 'Farm House', 'Palace', 'Serviced Apartments'];

  // Star categories
  const starCategoriesList = [
    { stars: 5, label: '5 Star ★★★★★' },
    { stars: 4, label: '4 Star ★★★★☆' },
    { stars: 3, label: '3 Star ★★★☆☆' },
    { stars: 2, label: '2 Star ★★☆☆☆' },
    { stars: 1, label: '1 Star ★☆☆☆☆' }
  ];

  // Filter handlers
  const handleHotelNameChange = (value) => {
    setFilters(prev => ({ ...prev, hotelName: value }));
  };

  const handlePriceRangeChange = (newRange) => {
    setFilters(prev => ({ ...prev, priceRange: newRange }));
  };

  const handlePropertyTypeChange = (type) => {
    setFilters(prev => {
      const updated = prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type];
      return { ...prev, propertyTypes: updated };
    });
  };

  const handleStarCategoryChange = (stars) => {
    setFilters(prev => {
      const updated = prev.starCategories.includes(stars)
        ? prev.starCategories.filter(s => s !== stars)
        : [...prev.starCategories, stars];
      return { ...prev, starCategories: updated };
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleResetFilters = () => {
    setFilters({
      hotelName: '',
      priceRange: [0, 1000],
      propertyTypes: [],
      starCategories: []
    });

    window.history.replaceState({}, "", "/hotels");
  };

  // Wishlist handlers
  const handleWishlist = (hotelId, added) => {
  setWishlistedIds(prev =>
    added
      ? [...prev, hotelId]
      : prev.filter(id => id !== hotelId)
  );
};

  // Handle hotel click navigation
  const handleHotelClick = (hotel) => {
    window.location.href = `/hotels/${hotel.id}`;
  };

  // Filter hotels based on all filters
  const filteredHotels = hotels.filter(hotel => {
    // Filter by hotel name
    if (
      filters.hotelName &&
      !(hotel.name || "").toLowerCase().includes(filters.hotelName.toLowerCase()) &&
      !(hotel.city || "").toLowerCase().includes(filters.hotelName.toLowerCase())
    ) {
      return false;
    }

    // Filter by price
    if (hotel.price < filters.priceRange[0] || hotel.price > filters.priceRange[1]) {
      return false;
    }

    // Filter by property type
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(hotel.propertyType)) {
      return false;
    }

    // Filter by star category
    if (filters.starCategories.length > 0 && !filters.starCategories.includes(hotel.starCategory)) {
      return false;
    }

    return true;
  });

  // Sort hotels
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'Popularity') return (b.reviews || 0) - (a.reviews || 0);
    if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'Price: Low to High') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'Price: High to Low') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'Discount') {
      const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
      const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
      return discountB - discountA;
    }
    return 0;
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 font-sans bg-[var(--bg)]">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-500">Loading hotels...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 font-sans bg-[var(--bg)]">
        <div className="text-center py-16 bg-white rounded-2xl">
          <i className="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
          <p className="text-gray-500 text-lg mb-5">Error loading hotels: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <HotelsListLayout
      hotels={sortedHotels}
      filters={filters}
      sortBy={sortBy}
      viewMode={viewMode}              // Pass viewMode
      setViewMode={setViewMode}        // Pass setter for view mode
      propertyTypesList={propertyTypesList}
      starCategoriesList={starCategoriesList}
      onHotelNameChange={handleHotelNameChange}
      onPriceRangeChange={handlePriceRangeChange}
      onPropertyTypeChange={handlePropertyTypeChange}
      onStarCategoryChange={handleStarCategoryChange}
      onSortChange={handleSortChange}
      onResetFilters={handleResetFilters}
      onHotelClick={handleHotelClick}
      onWishlist={handleWishlist}
      wishlistedIds={wishlistedIds}
      totalHotelsCount={sortedHotels.length}
      locationName="India"
      loading={loading}
    />
  );
};

export default Hotels;