import { hotelsAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/* ── Icons ── */
const IconZap = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconStar = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "var(--yellow)" : "none"} stroke="var(--yellow)" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.36a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.07 6.07l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBed = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 12h20" />
  </svg>
);
const IconAccessibility = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="4" r="1" /><path d="M9 9h6M9 9l-1 5M15 9l1 5M10 14l-1 6M14 14l1 6" />
  </svg>
);
const IconPolicy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);
const IconOverview = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

/* ── Stars ── */
const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => <IconStar key={n} filled={n <= Math.round(rating)} />)}
  </div>
);

/* ── Section heading ── */
const SectionTitle = ({ children }) => (
  <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2 mb-4">
    <span className="w-1.5 h-5 rounded-full bg-[var(--accent)] inline-block shrink-0" />
    {children}
  </h2>
);

const MAX_VISIBLE_THUMBS = 7;
const TABS = [
  { key: "overview", label: "Overview", icon: <IconOverview /> },
  { key: "rooms", label: "Rooms", icon: <IconBed /> },
  { key: "accessibility", label: "Accessibility", icon: <IconAccessibility /> },
  { key: "policies", label: "Policies", icon: <IconPolicy /> },
];

/* ════════ TAB CONTENT COMPONENTS ════════ */

const TabOverview = ({ hotel }) => {
  const hotelType = hotel.hotel_type || hotel.type || "Luxury";
  const starCount = hotel.star_rating || hotel.stars || Math.round(hotel.rating);
  const [mapPopup, setMapPopup] = useState(false);
  const [amenitiesPopup, setAmenitiesPopup] = useState(false);
  const [amenitiesTab, setAmenitiesTab] = useState("amenities");

  const mapQuery = encodeURIComponent(
    [hotel.name, hotel.address, hotel.city, hotel.state].filter(Boolean).join(", ")
  );
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`;

  return (
    <>
      {mapPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setMapPopup(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)]"
            style={{ height: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMapPopup(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-[var(--bg2)] hover:bg-[var(--bg3)] text-[var(--text)] rounded-full shadow-md transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-[var(--bg2)] backdrop-blur-sm px-4 py-3 border-t border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--text)] leading-snug">
                {[hotel.address, hotel.city, hotel.state, hotel.pincode].filter(Boolean).join(", ") || `${hotel.city}, ${hotel.state}`}
              </p>
            </div>
            <iframe
              title="Hotel Location Full"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
            />
          </div>
        </div>
      )}

      {amenitiesPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setAmenitiesPopup(false)}
        >
          <div
            className="relative w-full max-w-xl bg-[var(--bg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAmenitiesPopup(false)}
              className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center border border-[var(--border)] rounded-full hover:bg-[var(--bg2)] transition-all text-[var(--text)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="flex border-b border-[var(--border)] pt-2 mt-1">
              {["amenities", "about"].map((t) => (
                <button
                  key={t}
                  onClick={() => setAmenitiesTab(t)}
                  className={`flex-1 py-4 text-sm font-semibold capitalize transition-all relative
                ${amenitiesTab === t ? "text-[var(--text)]" : "text-[var(--text2)] hover:text-[var(--text)]"}`}
                >
                  {t === "amenities" ? "Amenities" : "About"}
                  {amenitiesTab === t && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-7" style={{ scrollbarWidth: "thin" }}>
              {amenitiesTab === "amenities" && (
                <>
                  <h2 className="text-xl font-bold text-[var(--text)]">All property amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hotel.amenities?.length ? (
                      hotel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-[var(--text2)]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {amenity}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--text2)]">Amenities not available</p>
                    )}
                  </div>
                </>
              )}

              {amenitiesTab === "about" && (
                <>
                  <h2 className="text-xl font-bold text-[var(--text)]">About this property</h2>
                  <p className="text-sm text-[var(--text2)] leading-relaxed">{hotel.description || "No description available"}</p>
                  <div className="space-y-3 mt-4">
                    {[
                      { label: "Hotel type", value: hotel.hotel_type },
                      { label: "Check-in", value: hotel.check_in_time },
                      { label: "Check-out", value: hotel.check_out_time },
                      { label: "EV Charging Cost", value: hotel.charging_cost },
                      { label: "City", value: hotel.city },
                      { label: "State", value: hotel.state },
                    ].map(
                      ({ label, value }) =>
                        value && (
                          <div key={label} className="flex gap-4 text-sm border-b border-[var(--border)] pb-3">
                            <span className="text-[var(--text2)] w-32 shrink-0">{label}</span>
                            <span className="text-[var(--text)] font-medium">{value}</span>
                          </div>
                        )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-5">
          <div className="pb-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-white text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--orange)" }}>
                {hotelType}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="17" height="17" viewBox="0 0 24 24"
                    fill={i < starCount ? "var(--yellow)" : "none"}
                    stroke="var(--yellow)" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>

            <h1 className="text-[1.85rem] font-extrabold text-[var(--text)] leading-tight tracking-tight mb-3">
              {hotel.name}{hotel.city ? `, ${hotel.city}` : ""}
            </h1>

            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-white text-[13px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--accent)" }}>
                {hotel.rating}
              </span>
              <span className="text-sm font-semibold text-[var(--text)]">
                {hotel.rating >= 4.8 ? "Exceptional"
                  : hotel.rating >= 4.5 ? "Excellent"
                    : hotel.rating >= 4.0 ? "Very Good"
                      : hotel.rating >= 3.5 ? "Good"
                        : "Satisfactory"}
              </span>
              <span className="text-sm text-[var(--accent)] underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity">
                {hotel.review_count?.toLocaleString()} reviews
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--text2)]">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            <div className="h-px bg-[var(--border)] mb-5" />
            <p className="text-[15px] leading-relaxed text-[var(--text2)]">{hotel.description}</p>
          </div>

          <div className="py-2">
            <h3 className="text-base font-bold text-[var(--text)] mb-1">About this property</h3>
            <p className="text-sm text-[var(--text2)] mb-4">{hotel.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 mb-5">
              {(hotel.amenities || []).slice(0, 8).map((amenity) => (
                <div key={amenity} className="flex items-center gap-3">
                  <span className="text-[var(--text2)] shrink-0">✓</span>
                  <span className="text-sm text-[var(--text)]">{amenity}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAmenitiesPopup(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] underline underline-offset-4 hover:text-[var(--accent)] transition-colors"
            >
              See all about this property
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent)]/10 shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--accent)]" style={{ color: "var(--accent)" }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-[var(--text)]">EV Charging</h3>
              <span className="ml-auto text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-1 rounded-full">
                {hotel.chargers_available} spots available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "Charger Type", value: hotel.charger_type, icon: "M13 2 3 14h9l-1 8 10-12h-9z" },
                { label: "Max Power", value: `${hotel.charging_power_kw} kW`, icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
                { label: "Charging Cost", value: hotel.charging_cost, icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
                { label: "Availability", value: "24 / 7", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-4 py-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--accent)]/10 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--accent)" }}>
                      <path d={icon} />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text2)]">{label}</p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text2)] font-medium">Charger availability</span>
                <span className="text-xs font-bold text-[var(--accent)]">{hotel.chargers_available} free</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--blue)]"
                  style={{ width: `${Math.min(100, (hotel.chargers_available / 16) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="w-full overflow-hidden" style={{ height: "200px" }}>
              <iframe
                title="Hotel Location"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  [hotel.address, hotel.city, hotel.state].filter(Boolean).join(", ")
                )}&z=14&output=embed`}
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-[var(--text)] font-medium leading-snug mb-2">
                {[hotel.address, hotel.city, hotel.state, hotel.pincode].filter(Boolean).join(", ") ||
                  `${hotel.city}, ${hotel.state}`}
              </p>
              <button
                onClick={() => setMapPopup(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline underline-offset-2 transition-all"
              >
                View in a map
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const ADDONS = [
  { id: "breakfast", label: "Breakfast", desc: "Daily buffet for 2", price: 25 },
  { id: "parking", label: "EV Parking", desc: "Dedicated charging bay", price: 15 },
  { id: "spa", label: "Spa Access", desc: "Full day pass", price: 40 },
  { id: "airport", label: "Airport Transfer", desc: "Private cab both ways", price: 60 },
  { id: "laundry", label: "Laundry", desc: "Per day", price: 10 },
];

const TabRooms = ({ hotel }) => {

  const imgSrc = (path) =>
    `${process.env.REACT_APP_BACKEND_URL}${path}`;
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState([]);
  const [nights, setNights] = useState(1);
  const [bookingDone, setBookingDone] = useState(false);

  const rooms = hotel.rooms || [];

  const toggleAddon = (id) =>
    setAddons((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const addonTotal = addons.reduce((sum, id) => {
    const a = ADDONS.find((a) => a.id === id);
    return sum + (a ? a.price : 0);
  }, 0);

  const roomTotal = selected ? selected.price * qty * nights : 0;
  const grandTotal = roomTotal + addonTotal * qty * nights;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {rooms.map((room, index) => {
          const isActive = selected?.type === room.type;
          return (
            <div
              key={room.type}
              onClick={() => { setSelected(room); setQty(1); setAddons([]); setNights(1); setBookingDone(false); }}
              className={`bg-[var(--bg2)] border rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200
                ${isActive
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-[1.02]"
                  : "border-[var(--border)] hover:border-[var(--accent)]/50 hover:scale-[1.01]"
                }`}
            >
              <div className="relative w-full overflow-hidden" style={{ height: "170px" }}>
                <img
                  src={
                    hotel.room_images?.[index]?.[0]
                      ? imgSrc(hotel.room_images[index][0])
                      : "https://via.placeholder.com/600x400"
                  }
                  alt={room.type}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  Max {room.maxGuests}
                </div>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-bold text-[var(--text)] text-[15px] mb-1">{room.type}</h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text2)]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 12h20" /></svg>
                    {room.bed}
                    <span className="text-[var(--border)]">·</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                    {room.size}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {room.features.map((f) => (
                    <span key={f} className="text-[10px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text2)] rounded-full px-2 py-0.5">{f}</span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <div>
                    <span className="text-lg font-black text-[var(--accent)]">${room.price}</span>
                    <span className="text-xs text-[var(--text2)] ml-1">/ night</span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all
                    ${isActive
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                    }`}>
                    {isActive ? "Selected ✓" : "Select"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && !bookingDone && (
        <div className="bg-[var(--bg2)] border border-[var(--accent)]/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[var(--text)] text-base">Booking: {selected.type}</h3>
              <p className="text-xs text-[var(--text2)] mt-0.5">${selected.price} / night · Max {selected.maxGuests} guests</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--bg)] transition-all text-[var(--text2)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--text2)] mb-2">Rooms</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-[var(--text)] font-bold text-lg">−</button>
                    <span className="text-lg font-bold text-[var(--text)] w-6 text-center">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(5, q + 1))} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-[var(--text)] font-bold text-lg">+</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--text2)] mb-2">Nights</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setNights((n) => Math.max(1, n - 1))} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-[var(--text)] font-bold text-lg">−</button>
                    <span className="text-lg font-bold text-[var(--text)] w-6 text-center">{nights}</span>
                    <button onClick={() => setNights((n) => Math.min(30, n + 1))} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-[var(--text)] font-bold text-lg">+</button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text2)] mb-3">Add-ons <span className="normal-case font-normal text-[var(--text2)]">(per room per night)</span></p>
                <div className="space-y-2">
                  {ADDONS.map((a) => {
                    const on = addons.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        onClick={() => toggleAddon(a.id)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
                          ${on ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] hover:border-[var(--accent)]/40"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                            ${on ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"}`}>
                            {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">{a.label}</p>
                            <p className="text-xs text-[var(--text2)]">{a.desc}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${on ? "text-[var(--accent)]" : "text-[var(--text2)]"}`}>+${a.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 self-start">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text2)]">Price Summary</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text2)]">{selected.type} × {qty} × {nights}n</span>
                  <span className="font-semibold text-[var(--text)]">${roomTotal}</span>
                </div>
                {addons.length > 0 && addons.map((id) => {
                  const a = ADDONS.find((a) => a.id === id);
                  return (
                    <div key={id} className="flex justify-between text-xs">
                      <span className="text-[var(--text2)]">{a.label} × {qty} × {nights}n</span>
                      <span className="text-[var(--text2)]">+${a.price * qty * nights}</span>
                    </div>
                  );
                })}
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between font-bold">
                  <span className="text-[var(--text)]">Total</span>
                  <span className="text-[var(--accent)] text-lg">${grandTotal}</span>
                </div>
              </div>
              <button
                onClick={() => setBookingDone(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--blue)] text-white font-bold text-[15px] rounded-xl py-3.5 shadow-md hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                Confirm Booking
              </button>
              <p className="text-xs text-center text-[var(--text2)]">Free cancellation · No booking fees</p>
            </div>
          </div>
        </div>
      )}

      {bookingDone && (
        <div className="bg-[var(--bg2)] border border-[var(--accent)]/40 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: "var(--accent)" }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-1">Booking Confirmed!</h3>
          <p className="text-sm text-[var(--text2)] mb-1">{selected.type} · {qty} room{qty > 1 ? "s" : ""} · {nights} night{nights > 1 ? "s" : ""}</p>
          <p className="text-2xl font-black text-[var(--accent)] mb-5">${grandTotal} total</p>
          <button onClick={() => { setSelected(null); setBookingDone(false); }} className="text-sm font-semibold text-[var(--accent)] underline underline-offset-2 hover:opacity-80 transition-opacity">
            Book another room
          </button>
        </div>
      )}
    </div>
  );
};

const TabAccessibility = () => {
  const sections = [
    {
      title: "Mobility access",
      items: [
        "Wheelchair accessible entrance and lobby",
        "Elevator access on all floors",
        "Accessible parking spaces near entrance",
        "Roll-in shower available on request",
        "Grab bars installed in bathroom",
      ],
    },
    {
      title: "Visual & hearing",
      items: [
        "Braille signage throughout the property",
        "Visual fire alarms in all rooms",
        "Hearing loop available at front desk",
        "Large-print menus available on request",
        "Staff trained in sign language assistance",
      ],
    },
    {
      title: "EV charging accessibility",
      items: [
        "Accessible EV bays with wider spacing",
        "Level surface from parking to charger",
        "Low-height charging ports available",
        "Staff assistance available for EV setup",
      ],
    },
    {
      title: "Room features",
      items: [
        "Accessible rooms available on request",
        "Lowered peephole and door latch",
        "Closed captioning on in-room TV",
        "Wider doorways in accessible rooms",
      ],
    },
    {
      title: "Common areas",
      items: [
        "Accessible pool with lift",
        "Ramp access to restaurant and spa",
        "Accessible restrooms on all floors",
        "Tactile pathway in lobby",
      ],
    },
    {
      title: "Service & assistance",
      items: [
        "24-hour accessible front desk support",
        "Wheelchair available for guest use",
        "Luggage assistance on request",
        "Service animals welcome",
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">At a glance</h2>
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {sections.map(({ title, items }) => (
          <div key={title} className="pr-6 pb-8">
            <div className="flex items-start gap-3 mb-2.5">
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round"
                className="shrink-0 mt-0.5 text-[var(--text)]"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[15px] font-semibold text-[var(--text)]">{title}</span>
            </div>
            <ul className="pl-[30px] space-y-1">
              {items.map((item) => (
                <li key={item} className="text-sm text-[var(--text2)] leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════ POLICIES TAB — FIXED ════════ */
const TabPolicies = ({ hotel }) => {
  const policies = [
    {
      title: "Check-in / Check-out",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="16" r="2" />
        </svg>
      ),
      rows: [
        { label: "Check-in time", value: hotel.check_in_time },
        { label: "Check-out time", value: hotel.check_out_time },
        { label: "Early check-in", value: hotel.early_checkin },
        { label: "Late check-out", value: hotel.late_checkout },
        { label: "ID Proof", value: hotel.id_proof_accepted?.join(", ") },
      ],
    },

    {
      title: "Cancellation Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      rows: [
        { label: "Cancellation", value: hotel.cancellation_policy },
      ],
    },

    {
      title: "Refund Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M12 2v20" />
        </svg>
      ),
      rows: [
        { label: "Refund", value: hotel.refund_policy },
      ],
    },

    {
      title: "Child Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      rows: [
        { label: "Child policy", value: hotel.child_policy },
      ],
    },

    {
      title: "Extra Bed Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M2 4v16" />
        </svg>
      ),
      rows: [
        { label: "Extra bed", value: hotel.extra_bed_policy },
      ],
    },

    // ✅ FIXED: ID Proof Required — now shows as rows like Check-in box
    {
      title: "ID Proof Required",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 11H8M12 15H8" />
        </svg>
      ),
      rows: (hotel.id_proof_accepted || []).map((id, i) => ({
        label: i === 0 ? "Accepted IDs" : "",
        value: id,
      })),
    },

    {
      title: "Pet Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M12 21s8-4 8-10" />
        </svg>
      ),
      rows: [
        { label: "Pet policy", value: hotel.pet_policy },
      ],
    },

    {
      title: "Smoking Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      ),
      rows: [
        { label: "Smoking", value: hotel.smoking_policy },
      ],
    },

    {
      title: "Visitor Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      rows: [
        { label: "Visitor", value: hotel.visitor_policy },
      ],
    },

    // ✅ FIXED: Payment Policy — now shows as rows
    {
      title: "Payment Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
      ),
      rows: (hotel.payment_methods || []).map((method, i) => ({
        label: i === 0 ? "Payment methods" : "",
        value: method,
      })),
    },

    {
      title: "Couple Friendly Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M12 21s8-4.5 8-11" />
        </svg>
      ),
      rows: [
        { label: "Couple policy", value: hotel.couple_policy },
      ],
    },

    {
      title: "Damage Policy",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18" />
        </svg>
      ),
      rows: [
        { label: "Damage policy", value: hotel.damage_policy },
      ],
    },

    // ✅ FIXED: Safety & Security — now shows as rows
    {
      title: "Safety & Security",
      color: "var(--bg3)",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      rows: (hotel.safety_features || []).map((item, i) => ({
        label: i === 0 ? "Features" : "",
        value: item,
      })),
    },
  ];

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
    >
      {policies.map(({ title, color, icon, rows = [] }) => (
        <div
          key={title}
          className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color }}
            >
              {icon}
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">{title}</span>
          </div>

          {/* Body — all data as rows */}
          <div className="px-4 py-3">
            {rows.length > 0 ? (
              rows.map(({ label, value }, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0 text-sm"
                >
                  <span className="text-[var(--text2)] shrink-0 min-w-[90px]">{label}</span>
                  <span className="font-medium text-right text-[var(--text)]">{value}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text2)] py-2">No information available</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function HotelDetails() {
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [wishlisted, setWishlisted] = useState(false);

  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const openLightbox = (idx) => { setLbIdx(idx); setLightbox(true); };

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        await hotelsAPI.incrementView(id);
        const res = await hotelsAPI.getById(id);
        setHotel(res.data.hotel);
      } catch (err) {
        console.error("Hotel fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading hotel...</div>;
  if (!hotel) return <div className="text-center mt-20">Hotel not found</div>;

  const images = hotel.images || [];
  const totalImages = images.length;
  const visibleThumbs = images.slice(0, MAX_VISIBLE_THUMBS);
  const hiddenCount = totalImages - MAX_VISIBLE_THUMBS;

  const imgSrc = (path) => `${process.env.REACT_APP_BACKEND_URL}${path}`;
  const lbPrev = () => setLbIdx((p) => (p - 1 + totalImages) % totalImages);
  const lbNext = () => setLbIdx((p) => (p + 1) % totalImages);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-[var(--font-body)]">

      {/* ════════════ TOP BAR ════════════ */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-8 py-3 flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-sm text-[var(--text2)] border border-[var(--border)] rounded-lg px-3 py-1.5 hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-all">
          <IconChevronLeft /> Back
        </button>
        <nav className="flex items-center gap-2 text-sm text-[var(--text2)]">
          <span>Hotels</span>
          <span>/</span>
          <span>{hotel.city}</span>
          <span>/</span>
          <span className="text-[var(--accent)] font-semibold truncate max-w-[160px] sm:max-w-xs">{hotel.name}</span>
        </nav>
      </div>

      {/* ════════════ GALLERY ════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">

        {/* Hero image */}
        <div
          className="w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg2)] cursor-pointer relative group flex items-center justify-center"
          style={{ minHeight: "320px" }}
          onClick={() => openLightbox(activeImg)}
        >
          <img
            src={imgSrc(images[activeImg])}
            alt={hotel.name}
            className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-[1.015]"
            style={{ maxHeight: "520px" }}
          />
          <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20 select-none font-medium">
            {activeImg + 1} / {totalImages}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setWishlisted((w) => !w)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-110 active:scale-95"
              title="Add to Wishlist"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "var(--red)" : "none"} stroke={wishlisted ? "var(--red)" : "white"} strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              onClick={() => { if (navigator.share) { navigator.share({ title: hotel.name, url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); } }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-110 active:scale-95"
              title="Share"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none rounded-2xl" />
        </div>

        {/* Thumbnail strip */}
        {totalImages > 1 && (
          <div className="mt-5 mb-2">
            <div
              className="flex items-center gap-3 overflow-x-auto pb-3 pt-2 pl-2 pr-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {visibleThumbs.map((src, i) => {
                const isLast = i === MAX_VISIBLE_THUMBS - 1;
                const showMore = isLast && hiddenCount > 0;
                const isActive = activeImg === i;
                return (
                  <div
                    key={i}
                    onClick={() => { if (!showMore) setActiveImg(i); }}
                    className={`relative shrink-0 cursor-pointer transition-all duration-200 bg-[var(--bg2)]
                      ${isActive
                        ? "rounded-xl ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)] opacity-100 scale-[1.05]"
                        : "rounded-xl opacity-55 hover:opacity-100"
                      }`}
                    style={{ width: 96, height: 68 }}
                  >
                    <img src={imgSrc(src)} alt={`View ${i + 1}`} className="w-full h-full object-contain rounded-xl" />
                    {showMore && (
                      <div
                        className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-white select-none rounded-xl"
                        onClick={(e) => { e.stopPropagation(); openLightbox(i); }}
                      >
                        <span className="text-base font-bold leading-none">+{hiddenCount}</span>
                        <span className="text-[10px] mt-0.5 opacity-80">more</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════ TABS ════════════ */}
        <div className="mt-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-150
                    ${isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text2)] hover:text-[var(--text)]"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--accent)] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════ TAB CONTENT ════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-7">
        {activeTab === "overview" && <TabOverview hotel={hotel} />}
        {activeTab === "rooms" && <TabRooms hotel={hotel} />}
        {activeTab === "accessibility" && <TabAccessibility />}
        {activeTab === "policies" && <TabPolicies hotel={hotel} />}
      </div>

      {/* ════════════ LIGHTBOX ════════════ */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ width: "100vw", height: "100vh", backgroundColor: "var(--bg)" }}>
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <div className="flex flex-col">
              <span className="text-[var(--text)] font-semibold text-sm leading-tight">{hotel.name}</span>
            </div>
            <button onClick={() => setLightbox(false)} className="w-9 h-9 flex items-center justify-center bg-[var(--bg3)] hover:bg-[var(--bg3)]/20 text-white rounded-full border border-white/20 transition-all">
              <IconX />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {totalImages > 1 && (
              <button onClick={lbPrev} className="absolute left-4 z-10 w-11 h-11 flex items-center justify-center bg-[var(--bg3)] hover:bg-[var(--bg3)]/25 text-white rounded-full border border-white/20 transition-all">
                <IconChevronLeft />
              </button>
            )}
            <img
              src={imgSrc(images[lbIdx])}
              alt="Gallery full view"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "100vw", maxHeight: "100%", width: "auto", height: "auto" }}
              className="object-contain"
            />
            {totalImages > 1 && (
              <button onClick={lbNext} className="absolute right-4 z-10 w-11 h-11 flex items-center justify-center bg-[var(--bg3)] hover:bg-[var(--bg3)]/25 text-white rounded-full border border-white/20 transition-all">
                <IconChevronRight />
              </button>
            )}
            <div className="absolute inset-0 -z-10" onClick={() => setLightbox(false)} />
          </div>
          <div className="flex justify-center gap-2 py-4 flex-wrap shrink-0 relative">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setLbIdx(i)}
                className={`w-2 h-2 rounded-full border-0 transition-all duration-200 ${i === lbIdx ? "bg-[var(--accent)] scale-125" : "bg-[var(--border)] hover:bg-[var(--bg3)]/60"}`}
              />
            ))}
            <span className="absolute right-5 bottom-1/2 translate-y-1/2 text-[var(--text2)] text-xs font-medium select-none">
              {lbIdx + 1} / {totalImages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}