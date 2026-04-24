import React from 'react';
import HotelListCard from './HotelListCard';
import HotelCard from './HotelCard'; // Import your existing grid card component

const HotelsListLayout = ({
  hotels,
  filters,
  sortBy,
  viewMode,           // NEW: current view mode
  setViewMode,        // NEW: function to change view mode
  propertyTypesList,
  starCategoriesList,
  onHotelNameChange,
  onPriceRangeChange,
  onPropertyTypeChange,
  onStarCategoryChange,
  onSortChange,
  onResetFilters,
  onHotelClick,
  onWishlist,
  wishlistedIds = [],
  totalHotelsCount,
  locationName = 'Ahmedabad',
  loading = false
}) => {

  const handlePriceChange = (e, index) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(e.target.value);
    onPriceRangeChange(newRange);
  };

  // Quick filter chips
  const quickFilters = [
    { label: 'All', value: 'all' },
    { label: '5 Star', value: 5 },
    { label: '4 Star', value: 4 },
    { label: 'Budget', value: 'budget' },
    { label: 'Free Charging', value: 'free_charging' },
    { label: 'Fast Charger', value: 'fast_charger' },
    { label: 'DC Available', value: 'dc_available' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto font-sans bg-[var(--bg)]">
      {/* Hero Header Section */}
      <div
        className="pt-nav"
        style={{
          padding: "80px 40px 40px",
          background: "var(--bg2)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-sm text-[var(--accent)] font-semibold mb-2">
            🏨 Stay & Charge
          </div>

          <div className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-3">
            Hotels with EV Charging
          </div>

          <p className="text-[var(--text2)] mb-6 max-w-2xl">
            Discover hotels across India that offer dedicated EV charging for guests.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
            <input
              className="px-4 py-2.5 border border-[var(--border)] bg-[var(--card)] text-[var(--text)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
              placeholder="City (e.g. Goa, Delhi)"
            />
            <input
              className="px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] bg-[var(--card)] text-[var(--text)]"
              type="date"
              placeholder="Check-in"
            />
            <input
              className="px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] bg-[var(--card)] text-[var(--text)]"
              type="date"
              placeholder="Check-out"
            />
            <button className="bg-[var(--accent)] hover:opacity-90 text-black  font-semibold px-6 py-2.5 rounded-xl transition-all">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="px-4 md:px-8 py-4 border-b border-[var(--border)] bg-[var(--card)] flex flex-wrap gap-2 items-center">
        {quickFilters.map((filter) => (
          <button
            key={filter.label}
            className="px-4 py-1.5 text-sm rounded-full border border-[var(--border)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
          >
            {filter.label}
          </button>
        ))}

        <select
          className="ml-auto px-4 py-1.5 pr-8 border border-[var(--border)] rounded-full text-sm bg-[var(--card)] cursor-pointer focus:outline-none focus:border-[var(--accent)] bg-[var(--card)] text-[var(--text)] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:14px] bg-[right_12px_center] bg-no-repeat"
        >
          <option>Sort: Relevance</option>
          <option>Price: Low to High</option>
          <option>Rating: High</option>
        </select>
      </div>

      {/* Main Content with Filters and Hotels */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-6 md:py-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-72 w-full bg-[var(--card)] rounded-2xl p-5 shadow-sm h-fit lg:sticky lg:top-5">
          <h2 className="text-xl font-bold text-[var(--text)] mb-5 pb-3 border-b-2 border-[var(--border)]">Filter</h2>

          {/* Hotel Name Filter */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wide mb-2">Hotel Name</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-[var(--border)] bg-[var(--bg3)] text-[var(--text)] focus:ring-[var(--accent-dim)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] bg-[var(--card)] text-[var(--text)] focus:ring-2  transition-all"
              placeholder="Search by Hotel Name"
              value={filters.hotelName}
              onChange={(e) => onHotelNameChange(e.target.value)}
            />
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wide mb-2">Price</label>
            <div className="mt-2">
              <div className="flex justify-between items-center bg-[var(--bg3)] px-3 py-2 rounded-lg mb-3">
                <span className="font-semibold text-gray-700">${filters.priceRange[0]}</span>
                <span className="text-gray-400">-</span>
                <span className="font-semibold text-gray-700">${filters.priceRange[1]}</span>
              </div>
              <div className="relative h-8">
                <input
                  type="range"
                  min="0"
                  max="1500"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="absolute w-full h-1 bg-[var(--border)] rounded-lg appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                />
                <input
                  type="range"
                  min="0"
                  max="1500"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="absolute w-full h-1 bg-gray-200 rounded-lg appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Property Types Filter */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wide mb-2">Property Types</label>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {propertyTypesList.map(type => (
                <label key={type} className="flex items-center gap-2.5 text-sm text-[var(--text2)] cursor-pointer hover:text-[var(--accent)] transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.propertyTypes.includes(type)}
                    onChange={() => onPropertyTypeChange(type)}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Star Category Filter */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wide mb-2">Star Category</label>
            <div className="space-y-2.5">
              {starCategoriesList.map(cat => (
                <label key={cat.stars} className="flex items-center gap-2.5 text-sm text-[var(--text2)] cursor-pointer hover:text-[var(--accent)] transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.starCategories.includes(cat.stars)}
                    onChange={() => onStarCategoryChange(cat.stars)}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                  />
                  <span className="tracking-wide">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={onResetFilters}
            className="w-full mt-4 bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text)] font-medium py-2.5 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header with count, sort, and VIEW TOGGLE */}
          <div className="bg-[var(--card)] rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[var(--text)]">
                {locationName}: <span className="text-[var(--accent)] text-2xl font-bold">{totalHotelsCount}</span> Hotels found
              </div>
              <div className="text-xs text-[var(--text2)] mt-0.5">Prices inclusive of taxes</div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 bg-[var(--bg3)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    flex items-center gap-1.5
                    ${viewMode === 'grid'
                      ? 'bg-[var(--card)] text-[var(--accent)] shadow-sm'
                      : 'text-[var(--text2)] hover:text-[var(--text)]'}
                  `}
                  aria-label="Grid view"
                >
                  <i className="fas fa-th"></i>
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    flex items-center gap-1.5
                    ${viewMode === 'list'
                      ? 'bg-[var(--card)] text-[var(--accent)] shadow-sm'
                      : 'text-[var(--text2)] hover:text-[var(--text)]'}
                  `}
                  aria-label="List view"
                >
                  <i className="fas fa-list"></i>
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--text2)] hidden sm:block">Sort By:</span>
                <select
                  className="px-4 py-2 pr-8 border border-[var(--border)]  rounded-full text-sm font-medium bg-[var(--card)] cursor-pointer focus:outline-none focus:border-[var(--accent)] bg-[var(--card)] text-[var(--text)] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:14px] bg-[right_12px_center] bg-no-repeat"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                >
                  <option>Popularity</option>
                  <option>Rating</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Rendering based on viewMode */}
          {loading ? (
            <div className="text-center py-16">
              <i className="fas fa-spinner fa-spin text-4xl text-[var(--accent)]"></i>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW - Using HotelCard component */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hotels.map(hotel => (
                <HotelCard
                  key={hotel._id}
                  hotel={hotel}
                  onClick={onHotelClick}
                  onWishlist={onWishlist}
                  wishlistedIds={wishlistedIds}
                  compact={false}
                />
              ))}
            </div>
          ) : (
            /* LIST VIEW - Using HotelListCard component */
            <HotelListCard
              hotels={hotels}
              onHotelClick={onHotelClick}
              onWishlist={onWishlist}
              wishlistedIds={wishlistedIds}
            />
          )}

          {/* Empty state */}
          {!loading && hotels.length === 0 && (
            <div className="text-center py-16 bg-[var(--card)] rounded-2xl">
              <i className="fas fa-hotel text-6xl text-gray-300 mb-4"></i>
              <p className="text-[var(--text2)] text-lg mb-5">No hotels found matching your filters.</p>
              <button
                onClick={onResetFilters}
                className="bg-[var(--bg3)] hover:bg-[var(--bg4)] text-[var(--text)] font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HotelsListLayout;