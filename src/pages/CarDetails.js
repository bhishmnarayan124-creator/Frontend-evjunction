import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { evCarsAPI } from "../lib/api";
import {
  Battery,
  Zap,
  Gauge,
  MapPin,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  Heart,
  Link2,
  Printer,
  Star,
  Eye,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  CalendarCheck,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  Edit,
} from "lucide-react";

/* ─── Fade variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── TABS ─── */
const TABS = ["Description", "Full Specs", "Features", "Vehicle History", "Financing"];

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imgFading, setImgFading] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {

        await evCarsAPI.incrementView(id);

        const res = await evCarsAPI.getById(id);
        setCar(res.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const imageURL = (img) => img;

  const switchImage = (index) => {
    if (index === activeImage) return;
    setImgFading(true);
    setTimeout(() => { setActiveImage(index); setImgFading(false); }, 200);
  };
  const prevImage = () => switchImage((activeImage - 1 + (car?.images?.length ?? 1)) % (car?.images?.length ?? 1));
  const nextImage = () => switchImage((activeImage + 1) % (car?.images?.length ?? 1));

  if (loading) return <PageLoader />;
  if (!car) return <NotFound />;

  const batteryPct = car.battery_health_score ?? 0;
  const hasImages = car.images?.length > 0;
  const hasMultiple = car.images?.length > 1;
  const currentImageURL = hasImages ? car.images[activeImage] : null;

  const batteryLabel = car.battery_health_status
    ? car.battery_health_status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Unknown";

  const batteryColor =
    car.battery_health_status === "excellent"
      ? "var(--accent)"
      : car.battery_health_status === "good"
        ? "var(--blue)"
        : car.battery_health_status === "fair"
          ? "var(--yellow)"
          : "var(--red)";

  /* mock extras — swap with real data as available */
  const rating = car.rating ?? 4.9;
  const reviewCount = car.review_count ?? 38;
  const views = car.views ?? 0;
  const listedDays = car.listed_days ?? 0;
  const sellerRating = car.seller_rating ?? 4.9;
  const sellerCarsListed = car.seller_cars_listed ?? 12;
  const responseRate = car.response_rate ?? 98;
  const avgResponse = car.avg_response ?? "<2H";
  const drivetrain = car.drivetrain ?? "All-Wheel Drive";
  const horsepower = car.horsepower ?? null;
  const zeroSixty = car.zero_sixty ?? null;
  const topSpeed = car.top_speed ?? null;
  const batteryCapacity = car.battery_capacity_kwh ?? null;
  const maxChargeRate = car.max_charge_rate ?? null;
  const exterior = car.exterior_color ?? null;
  const interior = car.interior_color ?? null;
  const owners = car.owners ?? null;
  const titleStatus = car.title_status ?? "clean";

  const tags = [
    car.vehicle_type ?? "EV",
    drivetrain,
    owners === 1 ? "1 Owner" : null,
    titleStatus === "clean" ? "Clean Title" : null,
  ].filter(Boolean);

  /* ── Normalise features into grouped format ──
     Supports two shapes from the API:
       A) Grouped:   [{ category: "Safety", items: ["...", "..."] }, ...]
       B) Flat list: ["Feature A", "Feature B", ...]
  ── */
  const normaliseFeatures = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    if (typeof raw[0] === "object" && raw[0] !== null && raw[0].category) {
      // Already grouped
      return raw;
    }
    // Flat → single group with no category header
    return [{ category: null, items: raw }];
  };

  const featureGroups = normaliseFeatures(car.features);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── BREADCRUMB ── */}
      <div className="bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-[var(--text2)]">
          <button onClick={() => navigate("/")} className="hover:text-[var(--accent)] transition-colors">Home</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate("/listings")} className="hover:text-[var(--accent)] transition-colors">Find EV/Hybrid</button>
          <ChevronRight size={14} />
          <span className="hover:text-[var(--accent)] cursor-pointer transition-colors">{car.brand}</span>
          <ChevronRight size={14} />
          <span className="text-[var(--text)] font-medium">{car.year} {car.brand} {car.model}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── TITLE CARD ── */}
        <motion.div
          className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm px-8 py-6 mb-5"
          variants={fadeUp} initial="hidden" animate="show" custom={0}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, i) => (
                  <span key={i}
                    className={`text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border ${i === 0 ? "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]"
                        : i === 1 ? "bg-[var(--purple-dim)] text-[var(--purple)] border-[var(--purple)]"
                          : "bg-[rgba(251,146,60,0.1)] text-[var(--orange)] border-[var(--orange)]"
                      }`}
                  >{tag}</span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-[var(--text)] tracking-tight mb-2">
                {car.year} {car.brand.toUpperCase()} {car.model.toUpperCase()}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text2)]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={i < Math.round(rating) ? "#F59E0B" : "none"} stroke="var(--yellow)" strokeWidth={1.5} />
                  ))}
                  <span className="ml-1 text-[var(--text)] font-semibold">{rating}</span>
                  <span className="text-[var(--text3)]">({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--red)]" />
                  {car.city}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--red)]" />
                  Listed {listedDays} days ago
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={13} />
                  {views} views
                </div>
              </div>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${wishlisted ? "bg-[rgba(239,68,68,0.1)] border-[var(--red)] text-[var(--red)]" : "bg-[var(--card2)] border-[var(--border)] text-[var(--text3)] hover:text-red-400"
                  }`}
              >
                <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--card2)] flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] transition-colors">
                <Link2 size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--card2)] flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] transition-colors">
                <Edit size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN 2-COL LAYOUT ── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">

            {/* IMAGE GALLERY */}
            <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden"
              variants={fadeUp} initial="hidden" animate="show" custom={1}
            >
              {/* Main image */}
              <div className="relative aspect-[16/9] bg-[var(--bg3)]">
                {currentImageURL ? (
                  <img
                    src={currentImageURL}
                    alt={`${car.brand} ${car.model}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgFading ? "opacity-0" : "opacity-100"}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text3)] text-sm">No image</div>
                )}

                {/* EV badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[var(--accent)] text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow">
                  <Zap size={11} fill="white" /> {car.vehicle_type ?? "Electric"}
                </div>

                {/* Arrows */}
                {hasMultiple && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--card)]/90 shadow border border-[var(--border)] flex items-center justify-center hover:bg-[var(--card)]transition-colors">
                      <ChevronLeft size={16} className="text-gray-700" />
                    </button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--card)]/90 shadow border border-[var(--border)] flex items-center justify-center hover:bg-[var(--card)]transition-colors">
                      <ChevronRight size={16} className="text-gray-700" />
                    </button>
                    <div className="absolute bottom-3 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide">
                      {activeImage + 1} / {car.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {hasMultiple && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {car.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`view ${i + 1}`}
                      onClick={() => switchImage(i)}
                      className={`w-20 h-14 object-cover rounded-lg cursor-pointer flex-shrink-0 transition-all ${i === activeImage
                          ? "ring-2 ring-[var(--accent)] ring-offset-1 opacity-100"
                          : "opacity-50 hover:opacity-80"
                        }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* PERFORMANCE STATS */}
            {(horsepower || zeroSixty || car.range_km || batteryCapacity || topSpeed || maxChargeRate) && (
              <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
                variants={fadeUp} initial="hidden" animate="show" custom={2}
              >
                <p className="text-xs text-[var(--accent)] font-bold tracking-widest uppercase mb-1">// Performance</p>
                <h2 className="text-xl font-bold text-[var(--text)] mb-1">At a Glance</h2>
                <p className="text-sm text-[var(--text2)] mb-5">Key performance figures for the {car.year} {car.brand} {car.model}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {horsepower && <StatCard icon="⚡" value={horsepower} unit="HP" label="Peak Horsepower" accent="#F59E0B" />}
                  {zeroSixty && <StatCard icon="🏁" value={zeroSixty} unit="SEC" label="0–60 MPH" accent="#6366F1" />}
                  {car.range_km && <StatCard icon="🗺️" value={car.range_km} unit="KM" label="Range" accent="#16A34A" />}
                  {batteryCapacity && <StatCard icon="🔋" value={batteryCapacity} unit="KWH" label="Battery Capacity" accent="#16A34A" />}
                  {topSpeed && <StatCard icon="⚙️" value={topSpeed} unit="KM/H" label="Top Speed" accent="#6366F1" />}
                  {maxChargeRate && <StatCard icon="🔌" value={maxChargeRate} unit="KW" label="Max Charge Rate" accent="#F59E0B" />}
                </div>
              </motion.div>
            )}

            {/* TABS SECTION */}
            <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden"
              variants={fadeUp} initial="hidden" animate="show" custom={3}
            >
              {/* Tab bar */}
              <div className="flex border-b border-[var(--border)] overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-transparent text-[var(--text2)] hover:text-gray-800"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {/* ── DESCRIPTION TAB ── */}
                {activeTab === "Description" && (
                  <div>
                    {car.is_verified && (
                      <div className="flex items-start gap-3 bg-[var(--accent-dim)] border border-[var(--accent)] rounded-xl p-4 mb-5">
                        <CheckCircle2 size={18} className="text-[var(--accent)]" />
                        <p className="text-sm text-gray-700">
                          This vehicle has been{" "}
                          <span className="font-semibold text-[var(--accent)]">verified by the platform</span>.
                        </p>
                      </div>
                    )}
                    <p className="text-gray-600 leading-relaxed text-[0.95rem]">
                      {car.description || "No description available for this listing."}
                    </p>
                  </div>
                )}

                {/* ── FEATURES TAB ── */}
                {activeTab === "Features" && (
                  <div className="space-y-8">
                    {featureGroups.length > 0 ? (
                      featureGroups.map((group, gi) => (
                        <div key={gi}>
                          {/* Category heading — only shown when category exists */}
                          {group.category && (
                            <p className="text-[11px] font-extrabold tracking-widest uppercase text-[var(--accent)] mb-4">
                              // {group.category}
                            </p>
                          )}
                          {/* 2-column feature grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(group.items ?? []).map((feat, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5 bg-[var(--accent-dim)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)]"
                              >
                                <CheckCircle2 size={15} className="text-[var(--accent)] flex-shrink-0" />
                                {feat}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[var(--text3)] text-sm">No features listed.</p>
                    )}
                  </div>
                )}

                {/* ── FULL SPECS TAB ── */}
                {activeTab === "Full Specs" && (
                  <div>
                    <div className="grid grid-cols-2 pb-3 mb-1 border-b-2 border-[var(--border)]">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--text3)]">Specification</span>
                      <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--text3)]">Value</span>
                    </div>

                    <SpecGroup title="Overview" rows={[
                      ["Year", car.year],
                      ["Make", car.brand],
                      ["Model", car.model],
                      ["Trim", car.trim ?? "Standard"],
                      ["Body Style", car.body_style ?? "—"],
                      ["Doors", car.doors ?? "—"],
                      ["Seating Capacity", car.seating_capacity ?? "—"],
                      ["VIN", car.vin ?? "—"],
                      ["Stock Number", car.stock_number ?? "—"],
                    ]} />

                    <SpecGroup title="Performance" rows={[
                      ["Drivetrain", drivetrain],
                      ["Horsepower", horsepower ? `${horsepower} hp` : "—"],
                      ["Torque", car.torque ?? "—"],
                      ["0–60 mph", zeroSixty ? `${zeroSixty} seconds` : "—"],
                      ["Quarter Mile", car.quarter_mile ?? "—"],
                      ["Top Speed", topSpeed ? `${topSpeed} mph` : "—"],
                    ]} />

                    <SpecGroup title="Battery & Charging" rows={[
                      ["Battery Capacity", batteryCapacity ? `${batteryCapacity} kWh (usable)` : "—"],
                      ["EPA Estimated Range", car.range_km ? `${car.range_km} km` : "—"],
                      ["Battery Health", `${batteryPct}% — ${batteryLabel}`],
                      ["Max DC Charge Rate", maxChargeRate ? `${maxChargeRate} kW` : "—"],
                      ["Max AC Charge Rate", car.max_ac_charge_rate ?? "—"],
                      ["Charge Port", car.charge_port ?? "—"],
                      ["Est. Supercharge Time (10–80%)", car.charge_time ?? "—"],
                    ]} />

                    <SpecGroup title="Exterior" rows={[
                      ["Exterior Color", exterior ?? "—"],
                      ["Wheels", car.wheels ?? "—"],
                      ["Roof", car.roof ?? "—"],
                      ["Length", car.length ?? "—"],
                      ["Width", car.width ?? "—"],
                      ["Height", car.height ?? "—"],
                      ["Curb Weight", car.curb_weight ?? "—"],
                    ]} />

                    <SpecGroup title="Interior" rows={[
                      ["Interior Color", interior ?? "—"],
                      ["Upholstery", car.upholstery ?? "—"],
                      ["Infotainment Screen", car.infotainment ?? "—"],
                      ["Rear Screen", car.rear_screen ?? "—"],
                      ["Steering", car.steering ?? "—"],
                      ["Audio", car.audio ?? "—"],
                    ]} />
                  </div>
                )}

                {/* ── VEHICLE HISTORY TAB ── */}
                {activeTab === "Vehicle History" && (
                  <p className="text-[var(--text3)] text-sm">Information not available for this listing.</p>
                )}

                {/* ── FINANCING TAB ── */}
                {activeTab === "Financing" && (
                  <FinancingCalculator carPrice={car.price ?? 0} />
                )}

              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-4 self-start sticky top-6">

            {/* PRICE + CTA CARD */}
            <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              variants={fadeUp} initial="hidden" animate="show" custom={1}
            >
              <p className="text-xs text-[var(--text2)] tracking-widest uppercase font-semibold mb-1">Asking Price</p>
              <p className="text-4xl font-bold text-[var(--accent)] tracking-tight mb-1">
                ₹ {car.price?.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text3)] mb-5">EMI options available · <span className="text-[var(--accent)] cursor-pointer hover:underline">Calculate →</span></p>

              <button className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-sm py-3.5 rounded-xl shadow-md shadow-green-200 transition-all active:scale-[0.98] mb-2.5">
                <MessageSquare size={15} /> Contact Seller
              </button>
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button className="flex items-center justify-center gap-1.5 border border-[var(--border)] text-gray-700 font-medium text-sm py-3 rounded-xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                  <Phone size={14} /> Call
                </button>
                <button className="flex items-center justify-center gap-1.5 border border-[var(--border)] text-gray-700 font-medium text-sm py-3 rounded-xl hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
                  <MessageSquare size={14} /> Text
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 border border-[var(--border)] text-gray-700 font-medium text-sm py-3 rounded-xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                <CalendarCheck size={14} /> Schedule Test Drive
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 text-[11px] text-[var(--text2)]">
                <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[var(--accent)]" /> No hidden fees</div>
                <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[var(--accent)]" /> Direct contact</div>
                <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[var(--accent)]" /> Verified listing</div>
              </div>
            </motion.div>

            {/* VEHICLE OVERVIEW */}
            <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              variants={fadeUp} initial="hidden" animate="show" custom={2}
            >
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--text2)] mb-4">Vehicle Overview</p>
              <div className="space-y-0">
                {[
                  { icon: <Calendar size={14} />, label: "Year", value: car.year },
                  { icon: <Gauge size={14} />, label: "Mileage", value: car.mileage_km ? `${car.mileage_km.toLocaleString()} km` : "—" },
                  { icon: <Zap size={14} />, label: "Drivetrain", value: drivetrain },
                  { icon: <MapPin size={14} />, label: "Range", value: car.range_km ? `${car.range_km} km` : "—" },
                  { icon: <MapPin size={14} />, label: "Location", value: car.city },
                  { icon: <Shield size={14} />, label: "Title", value: titleStatus, green: titleStatus === "clean" },
                  owners && { icon: <User size={14} />, label: "Owners", value: `${owners} (${car.seller_type ?? "user"})` },
                ].filter(Boolean).map(({ icon, label, value, green }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2 text-[var(--text3)] text-sm">{icon} {label}</div>
                    <span className={`text-sm font-semibold ${green ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
                      {green ? `${value} ✓` : value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* BATTERY HEALTH */}
            <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              variants={fadeUp} initial="hidden" animate="show" custom={3}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--text2)]">Battery Health</p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${batteryColor}18`, color: batteryColor }}>
                  {batteryLabel}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold" style={{ color: batteryColor }}>{batteryPct}</span>
                <span className="text-[var(--text3)] text-sm font-medium">%</span>
              </div>
              <div className="h-2 bg-[var(--bg3)] rounded-full relative overflow-hidden">
                <div className="absolute h-full rounded-full transition-all" style={{ width: `${batteryPct}%`, backgroundColor: batteryColor }} />
              </div>
            </motion.div>

            {/* SELLER CARD */}
            <motion.div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              variants={fadeUp} initial="hidden" animate="show" custom={4}
            >
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--text2)] mb-4">Listed By</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {car.seller_name?.split(" ").map(n => n[0]).join("").slice(0, 2) ?? "S"}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{car.seller_name}</p>
                  <p className="text-xs text-[var(--text3)] capitalize">{car.seller_type} · {car.city}</p>
                </div>
              </div>
              {car.is_verified && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-dim)] border border-[var(--accent)] px-3 py-1.5 rounded-full mb-4">
                  <CheckCircle2 size={12} /> Identity Verified
                </span>
              )}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: sellerCarsListed, label: "Cars Listed" },
                  { value: sellerRating, label: "Seller Rating" },
                  { value: `${responseRate}%`, label: "Response Rate" },
                  { value: avgResponse, label: "Avg. Response" },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-[var(--card2)] rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-lg font-bold text-[var(--text)]">{value}</p>
                    <p className="text-[10px] text-[var(--text3)] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SAFETY REMINDER */}
            <motion.div className="bg-[rgba(251,146,60,0.1)] border border-[var(--orange)] rounded-2xl p-5"
              variants={fadeUp} initial="hidden" animate="show" custom={5}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={15} className="text-[var(--orange)]" />
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--orange)]">Safety Reminder</p>
              </div>
              <p className="text-xs text-[#92400E] leading-relaxed mb-3">
                Always meet in a safe, public location. Never send payment before a physical inspection. This platform never asks for wire transfers.
              </p>
              <button className="flex items-center gap-1 text-xs font-semibold text-[var(--orange)] hover:underline">
                Report this listing <ExternalLink size={11} />
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════ */

const StatCard = ({ icon, value, unit, label, accent }) => (
  <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card2)] hover:shadow-sm transition-shadow">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-2xl font-bold" style={{ color: accent }}>{value}</span>
      <span className="text-xs text-[var(--text3)] font-semibold uppercase">{unit}</span>
    </div>
    <p className="text-[11px] text-[var(--text3)] uppercase tracking-wider font-medium">{label}</p>
  </div>
);

const PageLoader = () => (
  <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[#16A34A] rounded-full animate-spin" />
      <p className="text-[var(--text3)] text-sm font-medium tracking-wide">Loading vehicle…</p>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
    <p className="text-[var(--text3)] text-lg">Vehicle not found.</p>
  </div>
);

const SpecGroup = ({ title, rows }) => (
  <div className="mt-5">
    <p className="text-[12px] font-extrabold tracking-widest uppercase text-[var(--accent)] mb-3">{title}</p>
    {rows.map(([label, value], i) => (
      <div
        key={label}
        className={`grid grid-cols-2 py-3 border-b border-gray-100 text-sm ${i % 2 === 1 ? "bg-[var(--card2)]" : ""}`}
      >
        <span className="text-[var(--text2)] pl-1">{label}</span>
        <span className="font-medium text-[var(--text)]">{value ?? "—"}</span>
      </div>
    ))}
  </div>
);

/* ── FINANCING CALCULATOR ── */
const FinancingCalculator = ({ carPrice }) => {
  const [vehiclePrice, setVehiclePrice] = useState(carPrice);
  const [downPayment, setDownPayment] = useState(Math.round(carPrice * 0.1));
  const [loanTerm, setLoanTerm] = useState(60);
  const [apr, setApr] = useState(5.9);

  const loanAmount = Math.max(0, vehiclePrice - downPayment);
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / loanTerm
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);

  const fmt = (n) =>
    isNaN(n) || !isFinite(n)
      ? "—"
      : "₹ " + Math.round(n).toLocaleString("en-IN");

  const TERMS = [
    { label: "12 months (1 year)", value: 12 },
    { label: "24 months (2 years)", value: 24 },
    { label: "36 months (3 years)", value: 36 },
    { label: "48 months (4 years)", value: 48 },
    { label: "60 months (5 years)", value: 60 },
    { label: "72 months (6 years)", value: 72 },
    { label: "84 months (7 years)", value: 84 },
  ];

  const inputCls =
    "w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] bg-[var(--card2)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all";

  return (
    <div className="space-y-5">
      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 bg-[var(--accent-dim)] border border-[var(--accent)] rounded-xl p-4">
        <span className="text-lg leading-none mt-0.5">💡</span>
        <p className="text-sm text-gray-600 leading-relaxed">
          Estimated payments for illustrative purposes only. Actual rates depend on credit approval.{" "}
          <span className="text-[var(--accent)] font-medium cursor-pointer hover:underline">Contact us for pre-approval.</span>
        </p>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vehicle Price */}
        <div>
          <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--text3)] mb-2">
            Vehicle Price (₹)
          </label>
          <input
            type="number"
            className={inputCls}
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(Number(e.target.value))}
            min={0}
          />
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--text3)] mb-2">
            Down Payment (₹)
          </label>
          <input
            type="number"
            className={inputCls}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            min={0}
          />
        </div>

        {/* Loan Term */}
        <div>
          <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--text3)] mb-2">
            Loan Term
          </label>
          <select
            className={inputCls + " cursor-pointer"}
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
          >
            {TERMS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--text3)] mb-2">
            Interest Rate (APR %)
          </label>
          <input
            type="number"
            className={inputCls}
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            min={0}
            step={0.1}
          />
        </div>
      </div>

      {/* Result card */}
      <div className="bg-[var(--accent-dim)] border border-[var(--accent)] rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-[var(--text2)] mb-1">Estimated Monthly Payment</p>
          <p className="text-4xl font-bold text-[var(--accent)] tracking-tight">{fmt(monthlyPayment)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text2)] mb-1">Total Loan Amount</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{fmt(loanAmount)}</p>
        </div>
      </div>

      {/* Disclaimer footnote */}
      <p className="text-[11px] text-[var(--text3)] leading-relaxed">
        * Calculation does not include taxes, registration fees, insurance, or dealer fees. Rates shown are illustrative; actual financing rates are subject to credit approval and lender terms.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md shadow-green-200 transition-all active:scale-[0.98]">
          Apply for Financing
        </button>
        <button className="flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-[var(--accent-dim)] transition-all">
          Get Pre-Approved
        </button>
      </div>
    </div>
  );
};

export default CarDetails;