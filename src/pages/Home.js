import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


import { toast } from 'sonner';
import { chargersAPI, evCarsAPI, hotelsAPI } from "../lib/api";
import HotelCard from '@/components/HotelCard';
import ChargerCard from '@/components/Chargercard';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('charger');
  const [chargers, setChargers] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [evs, setEvs] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [searchBrand, setSearchBrand] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [brands, setBrands] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [distanceRange, setDistanceRange] = useState("");
  const [tripFrom, setTripFrom] = useState("");
  const [tripTo, setTripTo] = useState("");
  const [availability, setAvailability] = useState("");
  const [batteryRange, setBatteryRange] = useState("");
  const stats = [
    { value: '12,400+', label: 'Charging Points' },
    { value: '860+', label: 'EV Hotels' },
    { value: '5,200+', label: 'EVs Listed' },
    { value: '50K+', label: 'EV Drivers' },
  ];



  const news = [
    { id: 1, icon: '🔋', tag: 'Policy', tagClass: 'badge-green', title: 'India to Add 10,000 New EV Chargers by 2026 Under FAME III', date: 'Dec 18, 2025' },
    { id: 2, icon: '🚗', tag: 'Launch', tagClass: 'badge-blue', title: 'Tata Motors Unveils Harrier EV with 600km Range at Auto Expo', date: 'Dec 15, 2025' },
    { id: 3, icon: '⚡', tag: 'Tech', tagClass: 'badge-purple', title: 'Solid State Batteries: What It Means for Indian EV Range', date: 'Dec 12, 2025' },
    { id: 4, icon: '🌏', tag: 'Finance', tagClass: 'badge-yellow', title: 'EV Loan Rates Drop to 6.5% — Best Banks for EV Financing in India', date: 'Dec 10, 2025' },
  ];

  const handleSearch = () => {

    if (activeTab === "charger") {

      const params = new URLSearchParams();

      if (searchCity) params.append("city", searchCity);
      if (selectedType) params.append("type", selectedType);
      if (availability) params.append("status", availability);
      if (distanceRange) params.append("distance", distanceRange);

      navigate(`/chargers${params.toString() ? `?${params.toString()}` : ""}`);


    } else if (activeTab === "ev") {

      const params = new URLSearchParams();

      if (searchBrand) params.append("brand", searchBrand);
      if (searchCity) params.append("city", searchCity);

      if (searchBudget === "under10") {
        params.append("maxPrice", 1000000);
      }

      if (searchBudget === "10to20") {
        params.append("minPrice", 1000000);
        params.append("maxPrice", 2000000);
      }

      if (searchBudget === "20to40") {
        params.append("minPrice", 2000000);
        params.append("maxPrice", 4000000);
      }

      navigate(`/marketplace${params.toString() ? `?${params.toString()}` : ""}`);


    } else if (activeTab === "hotel") {

      const params = new URLSearchParams();

      if (searchCity) params.append("city", searchCity);

      navigate(`/hotels${params.toString() ? `?${params.toString()}` : ""}`);


    } else if (activeTab === "trip") {

      if (!tripFrom || !tripTo || !batteryRange) {
        toast.error("Please fill all trip planner fields");
        return;
      }

      const params = new URLSearchParams();

      params.set("from", tripFrom);
      params.set("to", tripTo);
      params.set("range", batteryRange);

      navigate(`/trip-planner?${params.toString()}`);
    }
  };

  useEffect(() => {
    const fetchEVs = async () => {
      try {
        const res = await evCarsAPI.getAll({
          status: "approved",
        });

        // backend response safe handling
        const cars = res.data?.cars || res.data || [];

        setEvs(cars.slice(0, 4));

      } catch (err) {
        console.error("EV fetch error:", err);
      }
    };

    fetchEVs();
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelsAPI.getAll();

        const hotelsData = res.data?.hotels || res.data || [];

        setHotels(hotelsData.slice(0, 4));

      } catch (err) {
        console.error("Hotels fetch error:", err);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchChargers = async () => {
      try {
        const res = await chargersAPI.getAll();

        const chargersData = res.data?.chargers || res.data || [];

        const formattedChargers = chargersData.map((charger) => ({
          ...charger,
          type: charger.charger_type ?? "Unknown",
          power: charger.power_kw ?? 0,
          price: charger.pricePerKwh ?? 0,
          totalSlots: charger.number_of_connectors ?? 0,
          availableSlots:
            charger.status === "available"
              ? charger.number_of_connectors ?? 0
              : 0,
          rating: charger.rating ?? 0,
          reviewCount: charger.reviewCount ?? 0,
        }));

        setChargers(formattedChargers.slice(0, 4));
      } catch (err) {
        console.error("Chargers fetch error:", err);
      }
    };

    fetchChargers();
  }, []);

  useEffect(() => {

    const fetchBrands = async () => {

      const res = await evCarsAPI.getBrands();

      setBrands(res.data);

    };

    fetchBrands();

  }, []);

  useEffect(() => {

    const fetchCities = async () => {

      const res = await evCarsAPI.getCities();

      setCities(res.data);

    };

    fetchCities();

  }, []);

  useEffect(() => {
    setSelectedType("");
    setDistanceRange("");
    setAvailability("");
  }, [activeTab]);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <div className="hero">
        <div className="hero-bg">
          <div className="hero-grid"></div>
          <div className="hero-glow1"></div>
          <div className="hero-glow2"></div>
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="hero-tag-dot"></span> India's #1 EV Platform · 28 States
            </div>
            <h1 className="hero-h1">
              Charge Smarter.<br />
              <span className="accent">Drive</span> <span className="blue">Farther.</span><br />
              Go Electric.
            </h1>
            <p className="hero-sub">
              Find charging stations, discover EV-friendly hotels, buy or sell electric vehicles, and plan zero-anxiety journeys across India.
            </p>
            <div className="hero-btns">
              <Link to="/chargers" className="btn btn-primary btn-lg" data-testid="hero-find-chargers">
                ⚡ Find Chargers Near Me
              </Link>
              <Link to="/trip-planner" className="btn btn-outline btn-lg">
                🗺️ Plan a Trip
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <div className="hero-stat-num">{stat.value}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SEARCH WIDGET */}
          <div className="search-widget">
            <div className="search-tabs">
              <button className={`stab ${activeTab === 'charger' ? 'active' : ''}`} onClick={() => setActiveTab('charger')}>⚡ Chargers</button>
              <button className={`stab ${activeTab === 'hotel' ? 'active' : ''}`} onClick={() => setActiveTab('hotel')}>🏨 Hotels</button>
              <button className={`stab ${activeTab === 'ev' ? 'active' : ''}`} onClick={() => setActiveTab('ev')}>🚗 Buy EV</button>
              <button className={`stab ${activeTab === 'trip' ? 'active' : ''}`} onClick={() => setActiveTab('trip')}>🗺️ Trip</button>
            </div>

            {activeTab === 'charger' && (
              <div className="search-form">
                <div className="form-group">
                  <label className="form-label">Your Location</label>
                  <input
                    className="form-input"
                    placeholder="City or area (e.g. Mumbai, MH)"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    data-testid="hero-search-input"
                  />
                </div>
                <div className="search-row">
                  <div className="form-group">
                    <label className="form-label">Charger Type</label>
                    <select
                      className="form-input"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="AC Level 2">AC Level 2</option>
                      <option value="DC Fast">DC Fast</option>
                      <option value="CCS2">CCS2</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Distance</label>
                    <select
                      className="form-input"
                      value={distanceRange}
                      onChange={(e) => setDistanceRange(e.target.value)}
                    >
                      <option value="">Any Distance</option>
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                    </select>
                  </div>
                </div>
                <div className="search-filters">
                  <div className={`filter-chip ${selectedType === "DC Fast" ? "on" : ""}`} onClick={() => setSelectedType(selectedType === "DC Fast" ? "" : "DC Fast")}>
                    ⚡ Fast
                  </div>
                  <div className="filter-chip">🆓 Free</div>
                  <div className="filter-chip">🏨 Hotel</div>
                  <div className={`filter-chip ${availability === "available" ? "on" : ""}`} onClick={() => setAvailability(availability === "available" ? "" : "available")}>
                    ✅ Available
                  </div>

                </div>
                <button className="btn btn-primary search-btn" onClick={handleSearch} data-testid="hero-search-btn">
                  Search Chargers →
                </button>
              </div>
            )}

            {activeTab === 'hotel' && (
              <div className="search-form">
                <div className="form-group">
                  <label className="form-label">Destination City</label>
                  <input className="form-input" placeholder="e.g. Goa, Delhi, Bangalore" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
                </div>
                <div className="search-row">
                  <div className="form-group">
                    <label className="form-label">Check-in</label>
                    <input type="date" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-out</label>
                    <input type="date" className="form-input" />
                  </div>
                </div>
                <button className="btn btn-primary search-btn" onClick={handleSearch}>
                  Search Hotels →
                </button>
              </div>
            )}

            {activeTab === 'ev' && (
              <div className="search-form">
                <div className="search-row">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <select
                      className="form-input"
                      value={searchBrand}
                      onChange={(e) => setSearchBrand(e.target.value)}
                    >
                      <option value="">All Brands</option>

                      {brands.map((brand) => (

                        <option key={brand} value={brand}>
                          {brand}
                        </option>

                      ))}

                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget</label>
                    <select
                      className="form-input"
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                    >
                      <option value="">Any Budget</option>
                      <option value="under10">Under ₹10L</option>
                      <option value="10to20">₹10–₹20L</option>
                      <option value="20to40">₹20–₹40L</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select
                    className="form-input"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  >
                    <option value="">All Cities</option>

                    {cities.map((city) => (

                      <option key={city} value={city}>
                        {city}
                      </option>

                    ))}

                  </select>
                </div>
                <button className="btn btn-primary search-btn" onClick={handleSearch}>
                  Browse EVs →
                </button>
              </div>
            )}

            {activeTab === 'trip' && (
              <div className="search-form">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input className="form-input" placeholder="Start city" value={tripFrom} onChange={(e) => setTripFrom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input className="form-input" placeholder="Destination city" value={tripTo} onChange={(e) => setTripTo(e.target.value)} />
                </div>
                <button className="btn btn-primary search-btn" onClick={handleSearch}>
                  Plan Route →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAP SECTION */}
      {/* MAP SECTION */}
      <div className="bg-[var(--bg2)] px-4 sm:px-8 lg:px-10 py-10">

        {/* Section Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--accent)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              📍 Live Map
            </div>
            <h2
              className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text)] leading-tight"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              Charging Stations<br className="sm:hidden" /> Across India
            </h2>
          </div>
          <Link
            to="/chargers"
            className="shrink-0 ml-3 text-xs sm:text-sm font-semibold text-[var(--accent)] border border-[var(--accent)]/60 rounded-full px-3 sm:px-4 py-1.5 hover:bg-[var(--accent)] hover:text-black transition-all duration-200 whitespace-nowrap"
          >
            Full Map →
          </Link>
        </div>

        {/* Map Container */}
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
          style={{ height: 'clamp(380px, 55vw, 520px)' }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[#070d18]">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
            {/* Glow pools */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 65% 55% at 38% 52%, rgba(16,185,129,0.14) 0%, transparent 70%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 45% 40% at 68% 28%, rgba(59,130,246,0.13) 0%, transparent 65%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 35% 30% at 25% 70%, rgba(168,85,247,0.08) 0%, transparent 60%)' }} />
          </div>

          {/* SVG road lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <line x1="0" y1="48%" x2="100%" y2="43%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="8 10" />
            <line x1="22%" y1="0" x2="36%" y2="100%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5 12" />
            <line x1="58%" y1="0" x2="72%" y2="100%" stroke="#10b981" strokeWidth="1" strokeDasharray="5 9" />
            <line x1="0" y1="22%" x2="100%" y2="68%" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 14" />
          </svg>

          {/* ── TOP BAR ── */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-0 bg-[#0d1525]/80 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-lg">
              <span className="text-sm shrink-0 opacity-60">🔍</span>
              <input
                className="bg-transparent text-[var(--text)] placeholder-[var(--text2)] text-xs sm:text-sm outline-none w-full truncate"
                placeholder="Search city or station..."
              />
            </div>
            {/* Legend dots — always visible, labels only on sm+ */}
            <div className="flex items-center gap-2 bg-[#0d1525]/80 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-lg shrink-0">
              {[
                { color: 'bg-emerald-400', shadow: 'shadow-emerald-400/50', label: 'DC' },
                { color: 'bg-blue-400', shadow: 'shadow-blue-400/50', label: 'AC' },
                { color: 'bg-orange-400', shadow: 'shadow-orange-400/50', label: 'Ultra' },
                { color: 'bg-purple-400', shadow: 'shadow-purple-400/50', label: 'Hotel' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm ${item.shadow}`} />
                  <span className="text-[10px] text-[var(--text2)] hidden sm:inline font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── USER LOCATION ── */}
          <div className="absolute z-10" style={{ top: '47%', left: '37%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-400/20 animate-ping" />
              <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-400/8 animate-pulse" />
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-400 border-2 border-white shadow-xl shadow-blue-400/70 z-10" />
            </div>
          </div>

          {/* ── CHARGER PINS ── */}
          {[
            { icon: '⚡', label: 'Tata Power', top: '22%', left: '35%', glow: 'shadow-emerald-400/40', border: 'border-emerald-400/50', dot: 'bg-emerald-400', text: 'text-emerald-300' },
            { icon: '🔌', label: 'EESL BKC', top: '38%', left: '56%', glow: 'shadow-blue-400/40', border: 'border-blue-400/50', dot: 'bg-blue-400', text: 'text-blue-300' },
            { icon: '🚀', label: 'Zeon Dadar', top: '62%', left: '27%', glow: 'shadow-orange-400/40', border: 'border-orange-400/50', dot: 'bg-orange-400', text: 'text-orange-300' },
            { icon: '⚡', label: 'MG Powai', top: '26%', left: '67%', glow: 'shadow-emerald-400/40', border: 'border-emerald-400/50', dot: 'bg-emerald-400', text: 'text-emerald-300' },
            { icon: '🏨', label: 'Taj Hotel', top: '67%', left: '58%', glow: 'shadow-purple-400/40', border: 'border-purple-400/50', dot: 'bg-purple-400', text: 'text-purple-300' },
          ].map((pin) => (
            <div
              key={pin.label}
              className="absolute z-10 group cursor-pointer"
              style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -100%)' }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-lg bg-[#0d1525]/95 backdrop-blur-sm border border-white/10 text-[11px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl">
                {pin.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]" />
              </div>
              {/* Bubble */}
              <div className={`flex items-center gap-1.5 bg-[#0d1525]/85 backdrop-blur-xl border ${pin.border} rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg ${pin.glow} hover:scale-110 active:scale-95 transition-transform duration-150`}>
                <div className={`w-2 h-2 rounded-full ${pin.dot} animate-pulse`} />
                <span className="text-xs sm:text-sm leading-none">{pin.icon}</span>
                <span className={`text-[10px] sm:text-xs font-semibold ${pin.text} hidden sm:inline`}>{pin.label}</span>
              </div>
              {/* Stem + base */}
              <div className="w-px h-2 bg-white/20 mx-auto" />
              <div className={`w-1.5 h-1.5 rounded-full ${pin.dot} mx-auto opacity-70`} />
            </div>
          ))}

          {/* ── BOTTOM FILTER CHIPS ── */}
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: '⚡ Fast Charger', active: true, activeClass: 'bg-emerald-400/15 border-emerald-400/50 text-emerald-300' },
                { label: '🆓 Free', active: false, activeClass: '' },
                { label: '🏨 Hotels', active: false, activeClass: '' },
                { label: '✅ Available Now', active: true, activeClass: 'bg-blue-400/15 border-blue-400/50 text-blue-300' },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className={`
              cursor-pointer text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border backdrop-blur-md transition-all duration-150 select-none whitespace-nowrap
              ${chip.active
                      ? chip.activeClass
                      : 'bg-[#0d1525]/70 border-white/10 text-[var(--text2)] hover:border-white/25 hover:text-[var(--text)]'
                    }
            `}
                >
                  {chip.label}
                </div>
              ))}
            </div>
          </div>

          {/* Corner glows */}
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-36 h-36 rounded-full bg-blue-500/8 blur-2xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-purple-500/6 blur-2xl pointer-events-none" />
        </div>

      
      </div>

      {/* FEATURED CHARGERS */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <div className="section-label">⚡ Live Network</div>
            <div className="section-title">Nearby Charging Stations</div>
          </div>
          <Link to="/chargers" className="see-all-btn">
            View all →
          </Link>
        </div>

        <div className="grid-auto">
          {chargers.map((charger) => (
            <ChargerCard
              key={charger._id}
              charger={charger}
              onGetDirections={(charger) =>
                navigate("/chargers", { state: { selectedCharger: charger } })
              }
            />
          ))}
        </div>
      </div>

      {/* HOTELS SECTION */}
      <div className="section" style={{ background: 'var(--bg2)', padding: '60px 40px' }}>
        <div className="section-header">
          <div>
            <div className="section-label">🏨 Stay & Charge</div>
            <div className="section-title">Hotels with EV Charging</div>
          </div>
          <Link to="/hotels" className="see-all-btn">View all→</Link>
        </div>
        <div className="grid-4">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel._id}
              hotel={hotel}
              compact={false}
              onClick={() => navigate(`/hotels/${hotel._id}`)}
            />
          ))}
        </div>
      </div>

      {/* MARKETPLACE PREVIEW */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-label">🚗 Marketplace</div>
            <div className="section-title">Featured Electric Vehicles</div>
          </div>
          <Link to="/marketplace" className="see-all-btn">Browse all 5,200+ EVs →</Link>
        </div>
        <div className="grid-auto">
          {evs.map((car) => (
            <Link key={car._id} to={`/marketplace/${car._id}`} className="ev-card" data-testid={`ev-card-${car._id}`}>
              <div className="ev-img-wrap">
                {car.images?.[0] ? (
                  <img
                    src={car.images[0]}
                    alt={car.model}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🚗"
                )}
                <div className="ev-img-overlay"></div>
                <div className="ev-img-tag mt-[-55px]"><span className="badge badge-green">{car.battery_health_status || "Good"}</span></div>
                <div className="ev-img-wishlist">♡</div>
              </div>
              <div className="ev-body">
                <div className="ev-name">{car.brand} {car.model}</div>
                <div className="ev-specs">
                  <div className="ev-spec"><div className="ev-spec-label">Battery</div><div className="ev-spec-val">{car.battery_capacity_kwh} kWh</div></div>
                  <div className="ev-spec"><div className="ev-spec-label">Range</div><div className="ev-spec-val">{car.range_km} km</div></div>
                  <div className="ev-spec"><div className="ev-spec-label">KM done</div><div className="ev-spec-val">{car.mileage_km} km</div></div>
                  <div className="ev-spec"><div className="ev-spec-label">Condition</div><div className="ev-spec-val">{car.condition}</div></div>
                </div>
                <div className="ev-footer">
                  <div className="ev-price">₹{car.price.toLocaleString()}</div>
                  <button className="btn btn-sm" style={{ background: 'var(--purple-dim)', border: '1px solid rgba(139,92,246,.4)', color: '#a78bfa' }}>
                    Chat Seller
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* TRIP PLANNER */}
      <div className="section-sm" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="trip-planner">
          <div className="section-label">🗺️ AI Trip Planner</div>
          <div className="section-title">Plan Your EV Journey</div>
          <p style={{ color: 'var(--text2)', fontSize: '15px', marginTop: '4px' }}>
            Smart route with auto-suggested charging stops based on your EV's range.
          </p>
          <div className="trip-form">
            <div className="form-group">
              <label className="form-label">Start</label>
              <input className="form-input" placeholder="e.g. Mumbai" value={tripFrom} onChange={(e) => setTripFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input className="form-input" placeholder="e.g. Pune" value={tripTo} onChange={(e) => setTripTo(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Battery Range</label>
              <select
                className="form-input"
                value={batteryRange}
                onChange={(e) => setBatteryRange(e.target.value)}
              >
                <option value="">Select Range</option>
                <option value="437">437 km (Nexon Max)</option>
                <option value="461">461 km (MG ZS)</option>
                <option value="300">300 km</option>
              </select>
            </div>
            <button
              onClick={() => {
                if (!tripFrom || !tripTo || !batteryRange) {
                  toast.error("Please fill all trip planner fields");
                  return;
                }

                const params = new URLSearchParams();

                params.set("from", tripFrom);
                params.set("to", tripTo);
                params.set("range", batteryRange);

                navigate(`/trip-planner?${params.toString()}`);
              }}
              className="btn btn-primary"
              style={{ padding: "12px 24px" }}
            >
              Plan Route →
            </button>
          </div>
        </div>
      </div>

      {/* NEWS */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-label">📰 EV News</div>
            <div className="section-title">Latest from the EV World</div>
          </div>
          <button className="see-all-btn">Read all articles →</button>
        </div>
        <div className="grid-4">
          {news.map((n) => (
            <div key={n.id} className="news-card">
              <div className="news-img">{n.icon}</div>
              <div className="news-body">
                <div className="news-tag"><span className={`badge ${n.tagClass}`}>{n.tag}</span></div>
                <div className="news-title">{n.title}</div>
                <div className="news-date">{n.date}</div>
                <div className="news-read">Read More →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="section-sm" style={{ padding: '0 40px 72px' }}>
        <div className="cta-strip">
          <div>
            <div className="section-label">🚀 Join 50,000+ EV Owners</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Ready to List Your EV or Register Your Charger?</h2>
          </div>
          <div className="cta-strip-btns">
            <Link to="/sell" className="btn btn-primary btn-lg">📋 List Your EV Free</Link>
            <button className="btn btn-outline btn-lg">⚡ Register Charger</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
