import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminHotelAPI } from "../lib/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

/* ─────────────────────────── STEP CONFIG ─────────────────────────── */

const STEPS = [
  {
    id: "basic", label: "Basic Info",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>),
    fields: ["name", "hotel_type", "star_category", "rating", "reviews"],
  },
  {
    id: "location", label: "Location",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>),
    fields: ["address", "city", "state", "pincode"],
  },
  {
    id: "contact", label: "Contact",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16z"/></svg>),
    fields: ["phone", "email"],
  },
  {
    id: "charging", label: "EV Charging",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>),
    fields: ["chargers_available", "charger_type", "charging_power_kw", "charging_cost"],
  },
  {
    id: "checkinout", label: "Check-in / Out",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="16" r="2"/></svg>),
    fields: ["check_in_time", "check_out_time", "early_checkin", "late_checkout", "min_age"],
  },
  {
    id: "amenities", label: "Amenities",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
    fields: ["amenities"],
  },
  {
    id: "policies", label: "Policies",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
    fields: [
      "cancellation_policy", "refund_policy",
      "pet_policy", "smoking_policy",
      "visitor_policy", "couple_policy",
      "extra_bed_policy", "child_policy",
      "damage_policy", "payment_methods",
      "id_proof_accepted", "safety_features",
    ],
  },
  {
    id: "description", label: "Description",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    fields: ["description"],
  },
  {
    id: "rooms", label: "Rooms",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 12h20"/></svg>),
    fields: [],
  },
  {
    id: "images", label: "Hotel Images",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
    fields: [],
  },
];

/* ─────────────────────────── FIELD CONFIG ─────────────────────────── */

const FIELD_CONFIG = {
  // Basic Info
  name:               { label: "Hotel Name",              type: "text",     placeholder: "e.g. The Spark Residency",        span: 2 },
  hotel_type:         { label: "Hotel Type",              type: "select",   options: ["Budget","Boutique","Business","Luxury","Resort","Eco-Lodge","Motel"], span: 1 },
  star_category:      { label: "Star Category",           type: "select",   options: ["1 Star","2 Star","3 Star","4 Star","5 Star","Unrated"], span: 1 },
  rating:             { label: "Rating (1.0–5.0)",        type: "number",   placeholder: "e.g. 4.5",                        span: 1 },
  reviews:            { label: "Total Reviews",           type: "number",   placeholder: "e.g. 342",                        span: 1 },

  // Location
  address:            { label: "Full Address",            type: "text",     placeholder: "Street, Area",                    span: 2 },
  city:               { label: "City",                    type: "text",     placeholder: "e.g. Mumbai",                     span: 1 },
  state:              { label: "State",                   type: "text",     placeholder: "e.g. Maharashtra",                span: 1 },
  pincode:            { label: "PIN Code",                type: "text",     placeholder: "e.g. 400001",                     span: 1 },

  // Contact
  phone:              { label: "Phone Number",            type: "text",     placeholder: "+91 98765 43210",                 span: 1 },
  email:              { label: "Email Address",           type: "email",    placeholder: "reservations@hotel.com",          span: 1 },

  // EV Charging
  chargers_available: { label: "Chargers Available",      type: "number",   placeholder: "e.g. 12",                        span: 1 },
  charger_type:       { label: "Charger Type",            type: "text",     placeholder: "Level 2 & DC Fast Charge",        span: 1 },
  charging_power_kw:  { label: "Max Power (kW)",          type: "number",   placeholder: "e.g. 150",                       span: 1 },
  charging_cost:      { label: "Charging Cost",           type: "text",     placeholder: "Free for guests / ₹12 per kWh",  span: 1 },

  // Check-in / Check-out
  check_in_time:      { label: "Check-In Time",           type: "time",     span: 1 },
  check_out_time:     { label: "Check-Out Time",          type: "time",     span: 1 },
  early_checkin:      { label: "Early Check-In",          type: "select",   options: ["Available (extra charge)","Available (free)","Not available","Subject to availability"], span: 1 },
  late_checkout:      { label: "Late Check-Out",          type: "select",   options: ["Available (extra charge)","Available (free)","Not available","Subject to availability"], span: 1 },
  min_age:            { label: "Min. Check-In Age",       type: "number",   placeholder: "e.g. 18",                        span: 1 },

  // Amenities
  amenities:          { label: "Amenities",               type: "checkbox",                                                span: 2 },

  // Policies
  cancellation_policy: { label: "Cancellation Policy",   type: "select",   options: ["Free cancellation 24hrs","Free cancellation 48hrs","Non-refundable","Partial refund","Flexible"], span: 2 },
  refund_policy:       { label: "Refund Method",         type: "select",   options: ["Original payment method","Bank transfer","Hotel credit","No refund"], span: 1 },
  pet_policy:          { label: "Pet Policy",            type: "select",   options: ["Pets allowed","No pets","Service animals only","Small pets only"], span: 1 },
  smoking_policy:      { label: "Smoking Policy",        type: "select",   options: ["No smoking","Smoking rooms available","Smoking in designated areas only"], span: 1 },
  visitor_policy:      { label: "Visitor Policy",        type: "select",   options: ["Visitors allowed (limited hours)","Overnight visitors not allowed","No visitors","Reception check-in mandatory"], span: 1 },
  couple_policy:       { label: "Couple Policy",         type: "select",   options: ["All couples welcome","Married couples only","Valid ID required","18+ mandatory"], span: 1 },
  extra_bed_policy:    { label: "Extra Bed",             type: "select",   options: ["Available (chargeable)","Available (free)","Not available"], span: 1 },
  child_policy:        { label: "Child Policy",          type: "select",   options: ["Children below 5 free","Extra bed chargeable","No children","Children welcome"], span: 1 },
  damage_policy:       { label: "Damage Policy",         type: "textarea", placeholder: "e.g. Any damage to property will be charged to guest…", span: 2 },
  payment_methods:     { label: "Accepted Payment Methods", type: "checkboxInline", options: ["Cash","Credit Card","Debit Card","UPI","Net Banking","Online Advance"], span: 2 },
  id_proof_accepted:   { label: "Accepted ID Proofs",    type: "checkboxInline", options: ["Aadhaar Card","Passport","Driving License","Voter ID","PAN Card"], span: 2 },
  safety_features:     { label: "Safety & Security",     type: "checkboxInline", options: ["CCTV Surveillance","Fire Safety","Locker Facility","Emergency Support","Security Guard","First Aid"], span: 2 },

  // Description
  description:        { label: "Hotel Description",       type: "textarea", placeholder: "Describe what makes this hotel unique for EV travellers…", span: 2 },
};

/* ─────────────────────────── AMENITY OPTIONS ─────────────────────────── */

const AMENITY_OPTIONS = [
  "Free WiFi","Swimming Pool","Gym","Spa","Restaurant","Bar",
  "Room Service","Concierge","Laundry","Business Center",
  "Conference Hall","Valet Parking","Airport Shuttle","Kids Club",
  "24/7 Reception","EV Charging","Solar Power","Rooftop Terrace",
  "Pet Friendly","Wheelchair Access",
];

/* ─────────────────────────── CHECKBOX GRID ─────────────────────────── */

const CheckboxGrid = ({ options, value, onChange }) => {
  const selected = value ? value.split(",").map(a => a.trim()).filter(Boolean) : [];
  const toggle = (item) => {
    const next = selected.includes(item) ? selected.filter(a => a !== item) : [...selected, item];
    onChange(next.join(", "));
  };
  return (
    <div className="grid grid-cols-2 gap-2 mt-1">
      {options.map(item => {
        const checked = selected.includes(item);
        return (
          <button key={item} type="button" onClick={() => toggle(item)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-150 group
              ${checked
                ? "bg-green-500/10 border-green-500/40 text-green-300"
                : "bg-white/[0.03] border-white/[0.08] text-ev-text3 hover:border-white/20 hover:bg-white/5 hover:text-white"}`}
          >
            <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150
              ${checked ? "bg-green-500 border-green-500" : "border-white/20 group-hover:border-white/40"}`}>
              {checked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </span>
            <span className="text-xs font-mono leading-tight">{item}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ─────────────────────────── ROOM FEATURES OPTIONS ─────────────────────────── */

const ROOM_FEATURE_OPTIONS = [
  "Free WiFi", "Air Conditioning", "TV", "Safe", "Mini Bar", "Bathtub",
  "City View", "Pool View", "Balcony", "Living Room", "Jacuzzi",
  "Butler Service", "EV Charger Access", "Smart Controls", "Panoramic View",
  "Espresso Machine", "Private Terrace", "Hot Tub", "360° View", "Sofa Bed",
  "Kids Amenities", "Large Bathroom", "Work Desk", "Kitchenette",
];

const BED_OPTIONS = ["1 King Bed", "1 Queen Bed", "2 Queen Beds", "2 Double Beds", "1 Single Bed", "Twin Beds", "Bunk Beds"];

const EMPTY_ROOM = {
  id: Date.now(),
  type: "", size: "", bed: "", price: "", maxGuests: "2",
  features: [], image: null, imagePreview: null,
};

/* ─────────────────────────── ROOMS STEP ─────────────────────────── */

const RoomsStep = ({ rooms, onChange }) => {
  const imgRefs = useRef({});

  const addRoom = () =>
    onChange(prev => [...prev, { ...EMPTY_ROOM, id: Date.now() }]);

  const removeRoom = (id) =>
    onChange(prev => prev.filter(r => r.id !== id));

  const updateRoom = (id, key, value) =>
    onChange(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));

  const toggleFeature = (id, feat) =>
    onChange(prev => prev.map(r => {
      if (r.id !== id) return r;
      const has = r.features.includes(feat);
      return { ...r, features: has ? r.features.filter(f => f !== feat) : [...r.features, feat] };
    }));

  const handleImage = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => updateRoom(id, "imagePreview", e.target.result);
    reader.readAsDataURL(file);
    updateRoom(id, "image", file);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-ev-text3 text-xs uppercase tracking-widest font-mono">
          {rooms.length} room type{rooms.length !== 1 ? "s" : ""} added
        </p>
        <button
          type="button"
          onClick={addRoom}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 rounded-xl transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Room Type
        </button>
      </div>

      {rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center border-2 border-dashed border-white/10 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/25"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 12h20"/></svg>
          </div>
          <div>
            <p className="text-white/40 text-sm font-clash font-medium">No rooms added yet</p>
            <p className="text-ev-text3 text-xs mt-1 font-mono">Click "Add Room Type" to start adding rooms</p>
          </div>
        </div>
      )}

      {rooms.map((room, idx) => (
        <div key={room.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          {/* Room header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/50 text-[10px] font-mono font-bold">{idx + 1}</span>
              <span className="text-white text-sm font-clash font-medium">{room.type || `Room Type ${idx + 1}`}</span>
            </div>
            <button
              type="button"
              onClick={() => removeRoom(room.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Row 1: image + basic details */}
            <div className="flex gap-4">
              {/* Room image upload */}
              <div
                className="shrink-0 rounded-xl border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] cursor-pointer overflow-hidden flex items-center justify-center transition-all"
                style={{ width: 120, height: 88 }}
                onClick={() => imgRefs.current[room.id]?.click()}
              >
                <input
                  ref={el => imgRefs.current[room.id] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImage(room.id, e.target.files[0])}
                />
                {room.imagePreview ? (
                  <img src={room.imagePreview} alt="room" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-white/25">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span className="text-[9px] font-mono text-center leading-tight">Upload<br/>Photo</span>
                  </div>
                )}
              </div>

              {/* Basic fields */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-ev-text3 text-[10px] uppercase tracking-wider mb-1 font-mono">Room Type Name <span className="text-red-400">*</span></label>
                  <Input
                    placeholder="e.g. Deluxe Room"
                    value={room.type}
                    onChange={(e) => updateRoom(room.id, "type", e.target.value)}
                    className="bg-ev-bg border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-ev-text3 text-[10px] uppercase tracking-wider mb-1 font-mono">Room Size</label>
                  <Input
                    placeholder="e.g. 36 m²"
                    value={room.size}
                    onChange={(e) => updateRoom(room.id, "size", e.target.value)}
                    className="bg-ev-bg border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-ev-text3 text-[10px] uppercase tracking-wider mb-1 font-mono">Max Guests</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2"
                    value={room.maxGuests}
                    onChange={(e) => updateRoom(room.id, "maxGuests", e.target.value)}
                    className="bg-ev-bg border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: bed + price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ev-text3 text-[10px] uppercase tracking-wider mb-1 font-mono">Bed Type <span className="text-red-400">*</span></label>
                <select
                  value={room.bed}
                  onChange={(e) => updateRoom(room.id, "bed", e.target.value)}
                  className="w-full bg-ev-bg border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff60' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="" disabled className="bg-ev-bg">Select bed type…</option>
                  {BED_OPTIONS.map(b => <option key={b} value={b} className="bg-ev-bg">{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-ev-text3 text-[10px] uppercase tracking-wider mb-1 font-mono">Price / Night (₹) <span className="text-red-400">*</span></label>
                <Input
                  type="number"
                  placeholder="e.g. 4500"
                  value={room.price}
                  onChange={(e) => updateRoom(room.id, "price", e.target.value)}
                  className="bg-ev-bg border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm"
                />
              </div>
            </div>

            {/* Row 3: features */}
            <div>
              <label className="block text-ev-text3 text-[10px] uppercase tracking-wider mb-2 font-mono">Room Features</label>
              <div className="flex flex-wrap gap-2">
                {ROOM_FEATURE_OPTIONS.map(feat => {
                  const on = room.features.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(room.id, feat)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all
                        ${on
                          ? "bg-green-500/15 border-green-500/40 text-green-300"
                          : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
                        }`}
                    >
                      {on && "✓ "}{feat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {rooms.length > 0 && (
        <button
          type="button"
          onClick={addRoom}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-ev-text3 hover:text-white text-xs font-mono transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Another Room Type
        </button>
      )}
    </div>
  );
};

/* ─────────────────────────── HOTEL IMAGE UPLOAD STEP ─────────────────────────── */

const HotelImageUploadStep = ({ images, primaryIndex, onImagesChange, onPrimaryChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!valid.length) return;
    Promise.all(valid.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve({ file, preview: e.target.result, id: `${Date.now()}-${Math.random()}` });
      reader.readAsDataURL(file);
    }))).then(newImgs => onImagesChange(prev => [...prev, ...newImgs]));
  }, [onImagesChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleRemove = (idx) => {
    onImagesChange(prev => prev.filter((_, i) => i !== idx));
    if (primaryIndex === idx) onPrimaryChange(0);
    else if (primaryIndex > idx) onPrimaryChange(primaryIndex - 1);
  };

  return (
    <div className="space-y-5">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 select-none
          ${dragging ? "border-white/50 bg-white/10" : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"}`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => processFiles(e.target.files)} />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${dragging ? "bg-white/20" : "bg-white/[0.08]"}`}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-clash font-medium">{dragging ? "Drop images here" : "Drag & drop or click to upload"}</p>
          <p className="text-ev-text3 text-xs mt-1 font-mono">PNG, JPG, WEBP — multiple files supported</p>
        </div>
        {images.length > 0 && (
          <div className="absolute top-3 right-3 bg-white/10 text-white text-xs font-mono px-2 py-0.5 rounded-full">
            {images.length} file{images.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-ev-text3 text-xs uppercase tracking-wider mb-3 font-mono">Uploaded Photos — click to set as cover</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => {
              const isPrimary = idx === primaryIndex;
              return (
                <div key={img.id}
                  className={`relative group rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200
                    ${isPrimary ? "border-green-400/80" : "border-white/10 hover:border-white/30"}`}
                  style={{ aspectRatio: "4/3" }}
                  onClick={() => onPrimaryChange(idx)}
                >
                  <img src={img.preview} alt={`Hotel photo ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                  {isPrimary && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Cover
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/80">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white/70 text-[10px] font-mono px-1.5 py-0.5 rounded">{idx + 1}</div>
                </div>
              );
            })}
            <div onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 hover:bg-white/5 cursor-pointer transition-all duration-200 text-ev-text3 hover:text-white"
              style={{ aspectRatio: "4/3" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="text-xs font-mono">Add more</span>
            </div>
          </div>
          {images[primaryIndex] && (
            <div className="mt-4 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <img src={images[primaryIndex].preview} alt="Primary" className="w-10 h-10 rounded-lg object-cover border border-green-400/30 shrink-0" />
              <div>
                <p className="text-green-400 text-xs font-mono font-bold uppercase tracking-wider">Cover Photo Selected</p>
                <p className="text-ev-text3 text-xs mt-0.5 font-mono truncate max-w-xs">{images[primaryIndex].file.name}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── FIELD RENDERER ─────────────────────────── */

const FieldRenderer = ({ fieldKey, cfg, value, onChange }) => {
  if (cfg.type === "checkbox") {
    return <CheckboxGrid options={AMENITY_OPTIONS} value={value} onChange={(v) => onChange(fieldKey, v)} />;
  }
  if (cfg.type === "checkboxInline") {
    const selected = value ? value.split(",").map(a => a.trim()).filter(Boolean) : [];
    const toggle = (item) => {
      const next = selected.includes(item) ? selected.filter(a => a !== item) : [...selected, item];
      onChange(fieldKey, next.join(", "));
    };
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {cfg.options.map(item => {
          const on = selected.includes(item);
          return (
            <button key={item} type="button" onClick={() => toggle(item)}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all
                ${on ? "bg-green-500/15 border-green-500/40 text-green-300" : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"}`}>
              {on && "✓ "}{item}
            </button>
          );
        })}
      </div>
    );
  }
  if (cfg.type === "textarea") {
    return (
      <textarea rows={5} placeholder={cfg.placeholder} value={value}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        className="w-full bg-ev-bg border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 resize-none transition-colors"
      />
    );
  }
  if (cfg.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(fieldKey, e.target.value)}
        className="w-full bg-ev-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff60' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
      >
        <option value="" disabled className="bg-ev-bg">Select…</option>
        {cfg.options.map(opt => <option key={opt} value={opt} className="bg-ev-bg">{opt}</option>)}
      </select>
    );
  }
  return (
    <Input type={cfg.type} placeholder={cfg.placeholder} value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      className="bg-ev-bg border-white/10 rounded-xl text-white placeholder:text-white/25 focus:border-white/30"
    />
  );
};

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

const AddHotel = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "", hotel_type: "", star_category: "", rating: "", reviews: "",
    address: "", city: "", state: "", pincode: "",
    phone: "", email: "",
    chargers_available: "", charger_type: "", charging_power_kw: "", charging_cost: "",
    check_in_time: "14:00", check_out_time: "11:00",
    early_checkin: "", late_checkout: "", min_age: "",
    amenities: "",
    cancellation_policy: "", refund_policy: "",
    pet_policy: "", smoking_policy: "",
    visitor_policy: "", couple_policy: "",
    extra_bed_policy: "", child_policy: "",
    damage_policy: "",
    payment_methods: "", id_proof_accepted: "", safety_features: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [rooms, setRooms] = useState([]);

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const requiredByStep = {
    basic:       ["name", "hotel_type", "rating", "reviews"],
    location:    ["address", "city", "state", "pincode"],
    contact:     ["phone", "email"],
    charging:    ["chargers_available", "charger_type", "charging_power_kw", "charging_cost"],
    checkinout:  ["check_in_time", "check_out_time"],
    amenities:   ["amenities"],
    policies:    ["cancellation_policy"],
    description: ["description"],
    rooms:       [],
    images:      [],
  };

  const isStepComplete = (stepIndex) => {
    const step = STEPS[stepIndex];
    if (step.id === "images") return images.length > 0;
    if (step.id === "rooms") return rooms.length > 0 && rooms.every(r => r.type && r.bed && r.price);
    const required = requiredByStep[step.id] || [];
    return required.every(f => formData[f]?.toString().trim() !== "");
  };

  const handleSubmit = async () => {
    const incompleteIdx = STEPS.findIndex((_, i) => !isStepComplete(i));
    if (incompleteIdx !== -1) {
      setActiveStep(incompleteIdx);
      toast.error(`Please complete "${STEPS[incompleteIdx].label}" before publishing.`);
      return;
    }
    try {
      const data = new FormData();
      const payload = {
        ...formData,
        chargers_available: formData.chargers_available ? Number(formData.chargers_available) : undefined,
        charging_power_kw:  formData.charging_power_kw  ? Number(formData.charging_power_kw)  : undefined,
        rating:             formData.rating             ? Number(formData.rating)             : undefined,
        reviews:            formData.reviews            ? Number(formData.reviews)            : undefined,
        min_age:            formData.min_age            ? Number(formData.min_age)            : undefined,
        star_rating:        formData.star_category      ? parseInt(formData.star_category)    : undefined,
        amenities: formData.amenities
          ? formData.amenities.split(",").map(a => a.trim()).filter(Boolean)
          : [],
        payment_methods:  formData.payment_methods  ? formData.payment_methods.split(",").map(a => a.trim()).filter(Boolean)  : [],
        id_proof_accepted: formData.id_proof_accepted ? formData.id_proof_accepted.split(",").map(a => a.trim()).filter(Boolean) : [],
        safety_features:  formData.safety_features  ? formData.safety_features.split(",").map(a => a.trim()).filter(Boolean)  : [],
        rooms: rooms.map(r => ({
          type:      r.type,
          size:      r.size,
          bed:       r.bed,
          price:     r.price ? Number(r.price) : 0,
          maxGuests: r.maxGuests ? Number(r.maxGuests) : 2,
          features:  r.features,
        })),
      };
      Object.entries(payload).forEach(([k, v]) =>
        data.append(k, Array.isArray(v) ? JSON.stringify(v) : v ?? "")
      );
      images.forEach(img => data.append("images", img.file));
      data.append("primary_image_index", primaryIndex);
      rooms.forEach((r, idx) => {
        if (r.image) data.append(`room_image_${idx}`, r.image);
      });

      await adminHotelAPI.createHotel(data);
      toast.success("Hotel added successfully 🚀");
      navigate("/admin");
    } catch {
      toast.error("Failed to add hotel ❌");
    }
  };

  const completedCount = STEPS.filter((_, i) => isStepComplete(i)).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);
  const currentStep = STEPS[activeStep];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-ev-text3 text-xs uppercase tracking-widest mb-1 font-mono">Admin / New Listing</p>
            <h1 className="text-white font-clash text-4xl font-semibold leading-none">Add EV Hotel</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #4ade80, #22d3ee)" }} />
            </div>
            <span className="text-ev-text3 text-xs font-mono tabular-nums">{completedCount}/{STEPS.length}</span>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex gap-6 items-start">

          {/* SIDEBAR */}
          <aside className="w-48 shrink-0 sticky top-24">
            <nav className="glass-panel rounded-2xl p-3 space-y-1 border border-white/10">
              {STEPS.map((step, i) => {
                const done = isStepComplete(i);
                const active = activeStep === i;
                return (
                  <button key={step.id} onClick={() => setActiveStep(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
                      ${active ? "bg-white/10 text-white" : "text-ev-text3 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-200
                      ${done ? "bg-green-500/20 text-green-400" : active ? "bg-white/15 text-white" : "bg-white/5 text-ev-text3 group-hover:bg-white/10"}`}>
                      {done
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span className="text-xs font-mono">{i + 1}</span>
                      }
                    </span>
                    <span className="text-sm font-medium truncate font-clash">{step.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleSubmit}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold font-clash text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #4ade80, #22d3ee)" }}
            >
              Publish Hotel
            </button>

            <div className="mt-3 glass-panel rounded-xl border border-white/10 p-3">
              <p className="text-ev-text3 text-[10px] uppercase tracking-widest font-mono mb-2">Progress</p>
              {STEPS.map((step, i) => {
                const done = isStepComplete(i);
                return (
                  <div key={step.id} className="flex items-center gap-2 py-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? "bg-green-400" : "bg-white/15"}`} />
                    <span className={`text-[10px] font-mono truncate ${done ? "text-green-400/80" : "text-white/20"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* FORM PANEL */}
          <div className="flex-1 glass-panel rounded-2xl border border-white/10 overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-white">
                {currentStep.icon}
              </span>
              <div>
                <h2 className="text-white font-clash text-xl font-semibold leading-none">{currentStep.label}</h2>
                <p className="text-ev-text3 text-xs mt-0.5 font-mono">Step {activeStep + 1} of {STEPS.length}</p>
              </div>
              {/* Step dots */}
              <div className="ml-auto flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button key={i} onClick={() => setActiveStep(i)}
                    className={`rounded-full transition-all duration-200
                      ${i === activeStep ? "w-5 h-2 bg-white" : isStepComplete(i) ? "w-2 h-2 bg-green-400/70" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`}
                  />
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="p-6">
              {currentStep.id === "images" ? (
                <HotelImageUploadStep
                  images={images}
                  primaryIndex={primaryIndex}
                  onImagesChange={setImages}
                  onPrimaryChange={setPrimaryIndex}
                />
              ) : currentStep.id === "rooms" ? (
                <RoomsStep rooms={rooms} onChange={setRooms} />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {currentStep.fields.map((fieldKey) => {
                    const cfg = FIELD_CONFIG[fieldKey];
                    const colSpan = cfg.span === 2 ? "col-span-2" : "col-span-1";
                    return (
                      <div key={fieldKey} className={colSpan}>
                        <label className="block text-ev-text3 text-xs uppercase tracking-wider mb-1.5 font-mono">
                          {cfg.label}
                          {requiredByStep[currentStep.id]?.includes(fieldKey) && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </label>
                        <FieldRenderer
                          fieldKey={fieldKey}
                          cfg={cfg}
                          value={formData[fieldKey]}
                          onChange={handleChange}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="flex items-center gap-2 text-ev-text3 text-sm hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-clash"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Previous
              </button>

              <span className="text-ev-text3 text-xs font-mono">{activeStep + 1} / {STEPS.length}</span>

              {activeStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                  className="flex items-center gap-2 text-white text-sm hover:text-white/80 transition-colors font-clash"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ) : (
                <button onClick={handleSubmit}
                  className="flex items-center gap-2 text-green-400 text-sm hover:text-green-300 transition-colors font-clash font-semibold"
                >
                  Publish
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHotel;