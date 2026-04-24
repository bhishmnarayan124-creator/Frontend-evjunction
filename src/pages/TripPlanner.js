import { tripAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/* ─────────────────────────── EV DATABASE ─────────────────────────── */
const EV_CARS = [
  { name: "Tata Nexon EV Max", range: 437, brand: "Tata" },
  { name: "Tata Nexon EV Prime", range: 312, brand: "Tata" },
  { name: "Tata Tiago EV", range: 315, brand: "Tata" },
  { name: "MG ZS EV", range: 461, brand: "MG" },
  { name: "MG Comet EV", range: 230, brand: "MG" },
  { name: "BYD Atto 3", range: 521, brand: "BYD" },
  { name: "BYD Seal", range: 650, brand: "BYD" },
  { name: "Hyundai Ioniq 5", range: 631, brand: "Hyundai" },
  { name: "Kia EV6", range: 708, brand: "Kia" },
  { name: "Mahindra XEV 9e", range: 656, brand: "Mahindra" },
  { name: "Mahindra BE 6", range: 682, brand: "Mahindra" },
  { name: "BMW iX", range: 630, brand: "BMW" },
  { name: "Mercedes EQS", range: 770, brand: "Mercedes" },
  { name: "Generic 300km EV", range: 300, brand: "Other" },
  { name: "Generic 200km EV", range: 200, brand: "Other" },
];

/* ─────────────────────────── ROUTE DATABASE ─────────────────────────── */
const ROUTES = {
  "Mumbai-Pune": { distance: 148, highway: "NH-48", via: [] },
  "Mumbai-Nashik": { distance: 167, highway: "NH-160", via: [] },
  "Mumbai-Goa": { distance: 585, highway: "NH-66", via: ["Kolhapur"] },
  "Mumbai-Ahmedabad": { distance: 524, highway: "NH-48", via: ["Vadodara"] },
  "Mumbai-Hyderabad": { distance: 711, highway: "NH-65", via: ["Pune", "Solapur"] },
  "Delhi-Jaipur": { distance: 280, highway: "NH-48", via: [] },
  "Delhi-Agra": { distance: 233, highway: "NH-19", via: [] },
  "Delhi-Chandigarh": { distance: 262, highway: "NH-44", via: [] },
  "Delhi-Dehradun": { distance: 300, highway: "NH-58", via: [] },
  "Delhi-Lucknow": { distance: 555, highway: "NH-27", via: ["Kanpur"] },
  "Delhi-Mumbai": { distance: 1415, highway: "NH-48", via: ["Vadodara", "Pune"] },
  "Bangalore-Chennai": { distance: 350, highway: "NH-44", via: ["Vellore"] },
  "Bangalore-Hyderabad": { distance: 570, highway: "NH-44", via: ["Kurnool"] },
  "Bangalore-Mysore": { distance: 150, highway: "NH-275", via: [] },
  "Bangalore-Goa": { distance: 560, highway: "NH-75", via: ["Hubli"] },
  "Chennai-Pondicherry": { distance: 152, highway: "NH-32", via: [] },
  "Chennai-Madurai": { distance: 460, highway: "NH-38", via: ["Dindigul"] },
  "Hyderabad-Vijayawada": { distance: 274, highway: "NH-65", via: [] },
  "Jaipur-Jodhpur": { distance: 330, highway: "NH-62", via: [] },
  "Kolkata-Bhubaneswar": { distance: 440, highway: "NH-16", via: ["Kharagpur"] },
};

/* ─────────────────────────── CHARGING STATIONS DATABASE ─────────────────────────── */
const CHARGING_HUBS = {
  "Kolhapur": { chargers: 8, power: "150 kW DC", wait: "~15 min", hotel: "Hotel Pearl, ₹1800/night" },
  "Vadodara": { chargers: 12, power: "150 kW DC", wait: "~10 min", hotel: "WelcomHotel, ₹3200/night" },
  "Vellore": { chargers: 6, power: "50 kW DC", wait: "~25 min", hotel: "Green Park, ₹2200/night" },
  "Kurnool": { chargers: 6, power: "50 kW DC", wait: "~25 min", hotel: "Hotel Kurnool, ₹1500/night" },
  "Solapur": { chargers: 8, power: "100 kW DC", wait: "~18 min", hotel: "Hotel Surya, ₹2000/night" },
  "Pune": { chargers: 16, power: "150 kW DC", wait: "~10 min", hotel: "Marriott Pune, ₹6500/night" },
  "Hubli": { chargers: 6, power: "50 kW DC", wait: "~25 min", hotel: "Hotel Naveen, ₹1800/night" },
  "Kanpur": { chargers: 8, power: "100 kW DC", wait: "~18 min", hotel: "Landmark Hotel, ₹2500/night" },
  "Dindigul": { chargers: 4, power: "50 kW DC", wait: "~30 min", hotel: "Hotel Aruna, ₹1200/night" },
  "Kharagpur": { chargers: 6, power: "50 kW DC", wait: "~25 min", hotel: "Hotel Hiland, ₹1600/night" },
  "Midway Stop": { chargers: 6, power: "100 kW DC", wait: "~20 min", hotel: "Highway Hotel, ₹2000/night" },
};

/* ─────────────────────────── CALCULATION ENGINE ─────────────────────────── */
// const calculateTrip = (from, to, evRangeKm, batteryPct) => {
//   const key  = `${from}-${to}`;
//   const rkey = `${to}-${from}`;
//   const route = ROUTES[key] || ROUTES[rkey];

//   let distance, highway, via, isEstimate = false;
//   if (route) {
//     distance = route.distance;
//     highway  = route.highway;
//     via      = [...route.via];
//   } else {
//     // Rough estimate based on random seed from city names
//     distance  = Math.round((from.length + to.length) * 18 + 120);
//     highway   = "NH-XX";
//     via       = distance > 400 ? ["Midway Stop"] : [];
//     isEstimate = true;
//   }

//   const effectiveRange  = Math.round(evRangeKm * (batteryPct / 100));
//   const chargesNeeded   = Math.max(0, Math.ceil(distance / effectiveRange) - 1);
//   const avgSpeed        = 75; // km/h
//   const driveMinutes    = Math.round((distance / avgSpeed) * 60);
//   const chargeMinutes   = chargesNeeded * 30;
//   const totalMinutes    = driveMinutes + chargeMinutes;

//   const h = Math.floor(totalMinutes / 60);
//   const m = totalMinutes % 60;
//   const timeStr = `${h}h ${m > 0 ? m + "m" : ""}`.trim();

//   const chargeCostPerStop = Math.round(effectiveRange * 0.8 * 12); // ₹12/kWh approx
//   const totalCost = chargesNeeded > 0 ? `₹${(chargesNeeded * chargeCostPerStop).toLocaleString()}` : "₹0";

//   // Determine stop cities
//   let stops = [];
//   if (chargesNeeded > 0 && via.length > 0) {
//     stops = via.slice(0, chargesNeeded);
//   } else if (chargesNeeded > 0) {
//     // Generate intermediate stops
//     stops = Array.from({ length: chargesNeeded }, (_, i) => `Stop ${i + 1}`);
//   }

//   const batteryAtEnd = batteryPct - Math.round((distance % effectiveRange) / evRangeKm * 100);
//   const safeToGo     = effectiveRange >= distance * 0.6; // needs at least 60% of distance in range

//   return {
//     distance:       `${distance} km`,
//     distanceKm:     distance,
//     highway,
//     time:           timeStr,
//     cost:           totalCost,
//     chargesNeeded,
//     stops,
//     effectiveRange,
//     batteryAtEnd:   Math.max(5, batteryAtEnd),
//     isEstimate,
//     safeToGo,
//     warning:        effectiveRange < 80 ? "Battery too low for safe travel. Please charge to at least 30% before starting." : null,
//   };
// };

/* ─────────────────────────── ICONS ─────────────────────────── */
const IcoZap = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IcoCar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>;
const IcoPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IcoClock = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
const IcoHotel = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 12h20" /></svg>;
const IcoSwap = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" /></svg>;
const IcoWarn = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IcoInfo = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>;

/* ─────────────────────────── BATTERY BAR ─────────────────────────── */
const BatteryBar = ({ pct, label, color = "var(--accent)" }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "var(--text2)" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
    </div>
    <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width .4s" }} />
    </div>
  </div>
);

/* ─────────────────────────── STAT CARD ─────────────────────────── */
const StatCard = ({ label, value, color }) => (
  <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 14px", border: "1px solid var(--border)" }}>
    <div style={{ fontSize: 9, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: color || "var(--text)", fontFamily: "var(--font-head)", lineHeight: 1.1 }}>{value}</div>
  </div>
);

/* ─────────────────────────── ROUTE VISUAL ─────────────────────────── */
const RouteVisual = ({ from, to, result }) => {
  const allPoints = [from, ...result.stops, to];
  const total = allPoints.length;
  const colors = ["var(--accent)", "var(--blue)", "var(--purple)", "#f59e0b", "#ef4444"];

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {allPoints.map((point, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : 0 }}>
            {/* Node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56 }}>
              <div style={{
                width: i === 0 || i === total - 1 ? 18 : 14,
                height: i === 0 || i === total - 1 ? 18 : 14,
                borderRadius: "50%",
                background: colors[i] || "var(--blue)",
                border: "3px solid var(--bg2)",
                boxShadow: `0 0 0 2px ${colors[i] || "var(--blue)"}`,
              }} />
              <div style={{ fontSize: 10, color: "var(--text2)", marginTop: 6, textAlign: "center", maxWidth: 56, wordBreak: "break-word" }}>
                {point}
              </div>
              {i > 0 && i < total - 1 && (
                <div style={{ marginTop: 4, fontSize: 9, color: "var(--blue)", background: "var(--blue)15", border: "1px solid var(--blue)30", borderRadius: 99, padding: "1px 6px" }}>
                  ⚡ Charge
                </div>
              )}
            </div>
            {/* Line */}
            {i < total - 1 && (
              <div style={{ flex: 1, height: 3, background: `linear-gradient(90deg, ${colors[i]}, ${colors[i + 1] || "var(--purple)"})`, margin: "0 4px", borderRadius: 99 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────── STOP CARD ─────────────────────────── */
const StopCard = ({ stop, idx }) => {
  const hub = CHARGING_HUBS[stop];
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--blue)30", borderRadius: 14, padding: "14px 16px", borderLeft: "3px solid var(--blue)" }}>
      <div style={{ display: "flex", items: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--blue)20", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", fontSize: 12, fontWeight: 700 }}>
          {idx + 1}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{stop}</div>
          <div style={{ fontSize: 11, color: "var(--text2)" }}>Charging Stop</div>
        </div>
      </div>
      {hub ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: <IcoZap />, label: hub.power, color: "var(--accent)" },
            { icon: <IcoClock />, label: hub.wait, color: "var(--blue)" },
            { icon: null, label: `${hub.chargers} chargers`, color: "var(--text2)" },
            { icon: <IcoHotel />, label: hub.hotel, color: "var(--purple)" },
          ].map((item, i) => (
            <div key={i} style={{ fontSize: 11, color: item.color, display: "flex", alignItems: "center", gap: 5 }}>
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "var(--text2)" }}>Charging station data loading…</div>
      )}
    </div>
  );
};

/* ─────────────────────────── POPULAR ROUTES ─────────────────────────── */
const POPULAR = [
  { from: "Mumbai", to: "Goa" },
  { from: "Delhi", to: "Jaipur" },
  { from: "Bangalore", to: "Chennai" },
  { from: "Mumbai", to: "Pune" },
  { from: "Delhi", to: "Agra" },
  { from: "Bangalore", to: "Mysore" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const TripPlanner = () => {

  const [battery, setBattery] = useState(85);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);


  const [searchParams] = useSearchParams();

  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");
  const urlRange = searchParams.get("range");

  const [from, setFrom] = useState(urlFrom || "Mumbai");
  const [to, setTo] = useState(urlTo || "Goa");

  const initialCarIndex = EV_CARS.findIndex(
    (c) => String(c.range) === String(urlRange)
  );

  const [carIdx, setCarIdx] = useState(
    initialCarIndex >= 0 ? initialCarIndex : 0
  );

  const car = EV_CARS[carIdx];

  const handleSwap = () => { const t = from; setFrom(to); setTo(t); };

  const handleCalculate = async () => {
    if (!from.trim() || !to.trim()) return;

    setLoading(true);

    try {
      const response = await tripAPI.calculate({
        from: from.trim(),
        to: to.trim(),
        range: car.range,
        battery: battery,
      });

      setResult(response.data);
    } catch (error) {
      console.error("Trip API error:", error);
    }

    setLoading(false);
  };

  const handlePopular = (route) => {
    setFrom(route.from);
    setTo(route.to);
    setResult(null);
  };

  const readyRange = Math.round(car.range * (battery / 100));



  useEffect(() => {
  if (urlFrom && urlTo && urlRange) {
    handleCalculate();
  }
}, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", minHeight: "100vh", paddingTop: 64 }}>

      {/* ═══════ SIDEBAR ═══════ */}
      <div style={{ background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflowY: "auto", maxHeight: "calc(100vh - 64px)", scrollbarWidth: "thin" }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>⚡ EV Trip Planner</div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0 }}>Plan Your Journey</h2>
        </div>

        {/* Form */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* From / To with swap */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
            <div>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "block", marginBottom: 5 }}>
                From
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--accent)" }}><IcoPin /></span>
                <input
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setResult(null); }}
                  placeholder="Start city"
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 10px 9px 30px", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Swap button */}
            <button onClick={handleSwap}
              style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text2)", zIndex: 1 }}>
              <IcoSwap />
            </button>

            <div>
              <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "block", marginBottom: 5 }}>
                To
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--purple)" }}><IcoPin /></span>
                <input
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setResult(null); }}
                  placeholder="Destination"
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 10px 9px 30px", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* EV Selection */}
          <div>
            <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "block", marginBottom: 5 }}>
              Your EV
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--blue)" }}><IcoCar /></span>
              <select
                value={carIdx}
                onChange={(e) => { setCarIdx(Number(e.target.value)); setResult(null); }}
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 10px 9px 30px", color: "var(--text)", fontSize: 13, outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}
              >
                {EV_CARS.map((c, i) => (
                  <option key={i} value={i} style={{ background: "var(--bg)" }}>{c.name} — {c.range} km</option>
                ))}
              </select>
            </div>
          </div>

          {/* Battery slider */}
          <div>
            <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "block", marginBottom: 8 }}>
              Current Battery
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <input type="range" min="10" max="100" value={battery}
                onChange={(e) => { setBattery(Number(e.target.value)); setResult(null); }}
                style={{ flex: 1, accentColor: battery < 30 ? "#ef4444" : battery < 60 ? "#f59e0b" : "var(--accent)" }}
              />
              <span style={{ fontSize: 14, fontWeight: 800, color: battery < 30 ? "#ef4444" : battery < 60 ? "#f59e0b" : "var(--accent)", minWidth: 38 }}>{battery}%</span>
            </div>
            <BatteryBar
              pct={battery}
              label={`Ready range: ~${readyRange} km`}
              color={battery < 30 ? "#ef4444" : battery < 60 ? "#f59e0b" : "var(--accent)"}
            />
          </div>

          {/* Calculate button */}
          <button onClick={handleCalculate} disabled={loading || !from || !to}
            style={{ background: "linear-gradient(135deg, var(--accent), var(--blue))", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, transition: "opacity .2s" }}>
            {loading ? "Calculating…" : <><IcoZap /> Calculate Route</>}
          </button>

          {/* Popular routes */}
          <div>
            <div style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>Popular Routes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {POPULAR.map((r, i) => (
                <button key={i} onClick={() => handlePopular(r)}
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 99, padding: "4px 10px", fontSize: 11, color: "var(--text2)", cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s" }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text2)"; }}
                >
                  {r.from} → {r.to}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Route header */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-head)", marginBottom: 3 }}>
                {from} → {to}
              </div>
              <div style={{ fontSize: 11, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>via {result.highway}</span>
                {result.isEstimate && (
                  <span style={{ background: "var(--yellow)20", color: "var(--yellow)", border: "1px solid var(--yellow)40", borderRadius: 99, padding: "1px 7px", fontSize: 10 }}>
                    est.
                  </span>
                )}
              </div>
            </div>

            {/* Warning */}
            {result.warning && (
              <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, color: "#ef4444", fontSize: 12 }}>
                <IcoWarn /><span>{result.warning}</span>
              </div>
            )}

            {/* Route visual */}
            <RouteVisual from={from} to={to} result={result} />

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatCard label="Distance" value={result.distance} color="var(--accent)" />
              <StatCard label="Total Time" value={result.time} color="var(--blue)" />
              <StatCard label="Charge Cost" value={result.cost} color="var(--yellow)" />
              <StatCard label="Charge Stops" value={result.chargesNeeded} color="var(--purple)" />
            </div>

            {/* Battery info */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              <BatteryBar pct={battery} label="Start battery" color="var(--accent)" />
              <BatteryBar pct={result.arrivalBattery ?? result.batteryAtEnd} label="Estimated arrival" color={(result.arrivalBattery ?? result.batteryAtEnd) < 20 ? "#ef4444" : "var(--blue)"} />
            </div>

            {/* Stops */}
            {result.stops.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Charging Stops
                </div>
                {result.stops.map((stop, i) => <StopCard key={i} stop={stop} idx={i} />)}
              </div>
            )}

            {/* No stop message */}
            {result.chargesNeeded === 0 && (
              <div style={{ background: "var(--accent)10", border: "1px solid var(--accent)30", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: "var(--accent)", display: "flex", gap: 8 }}>
                <IcoZap />
                <span>Great news! You can reach <strong>{to}</strong> without any charging stop. {result.arrivalBattery}% battery remaining on arrival.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════ MAP PANEL ═══════ */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, #0a1520 0%, #071018 60%, #050a10 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

        {/* Grid lines bg */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(n => (
            <g key={n}>
              <line x1={n} y1={0} x2={n} y2={100} stroke="white" strokeWidth="0.3" />
              <line x1={0} y1={n} x2={100} y2={n} stroke="white" strokeWidth="0.3" />
            </g>
          ))}
        </svg>

        {!result ? (
          /* Empty state */
          <div style={{ textAlign: "center", color: "var(--text2)", padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>🗺️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Ready to Plan</div>
            <div style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
              Enter your start city, destination, and EV details in the sidebar to calculate your optimal route.
            </div>
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {POPULAR.slice(0, 3).map((r, i) => (
                <button key={i} onClick={() => handlePopular(r)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "6px 14px", fontSize: 12, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                  {r.from} → {r.to}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Route map visualization */
          <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>

            {/* Route stats overlay */}
            <div style={{ position: "absolute", top: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>
              {[
                { label: "Distance", value: result.distance, bg: "#4ade8020", color: "#4ade80", border: "#4ade8040" },
                { label: "Time", value: result.time, bg: "#60a5fa20", color: "#60a5fa", border: "#60a5fa40" },
                { label: "Stops", value: result.chargesNeeded, bg: "#a78bfa20", color: "#a78bfa", border: "#a78bfa40" },
              ].map(({ label, value, bg, color, border }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "8px 14px", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* SVG route animation */}
            <svg viewBox="0 0 800 400" style={{ width: "100%", maxWidth: 700 }}>
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#4ade80" />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Route path */}
              {result.stops.length === 0 ? (
                <path d="M80,300 C300,100 500,100 720,80"
                  stroke="#4ade80" strokeWidth="3" fill="none"
                  strokeDasharray="10 5" markerEnd="url(#arrow)" filter="url(#glow)" />
              ) : result.stops.length === 1 ? (
                <path d="M80,300 C200,250 350,180 400,160 C450,140 600,100 720,80"
                  stroke="#4ade80" strokeWidth="3" fill="none"
                  strokeDasharray="10 5" markerEnd="url(#arrow)" filter="url(#glow)" />
              ) : (
                <path d="M80,300 C180,260 280,200 380,180 C480,160 560,120 720,80"
                  stroke="#4ade80" strokeWidth="3" fill="none"
                  strokeDasharray="10 5" markerEnd="url(#arrow)" filter="url(#glow)" />
              )}

              {/* Start */}
              <circle cx="80" cy="300" r="14" fill="#4ade8030" stroke="#4ade80" strokeWidth="2" filter="url(#glow)" />
              <circle cx="80" cy="300" r="6" fill="#4ade80" />
              <text x="80" y="325" fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="700" textAnchor="middle">{from}</text>

              {/* Stop(s) */}
              {result.stops.length === 1 && (
                <>
                  <circle cx="400" cy="160" r="12" fill="#60a5fa30" stroke="#60a5fa" strokeWidth="2" filter="url(#glow)" />
                  <circle cx="400" cy="160" r="5" fill="#60a5fa" />
                  <text x="400" y="148" fill="rgba(255,255,255,0.7)" fontSize="11" textAnchor="middle">{result.stops[0]}</text>
                  <text x="400" y="185" fill="#60a5fa" fontSize="10" textAnchor="middle">⚡ Charge</text>
                </>
              )}
              {result.stops.length >= 2 && (
                <>
                  <circle cx="310" cy="200" r="11" fill="#60a5fa30" stroke="#60a5fa" strokeWidth="2" />
                  <circle cx="310" cy="200" r="5" fill="#60a5fa" />
                  <text x="310" y="190" fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="middle">{result.stops[0]}</text>
                  <circle cx="510" cy="130" r="11" fill="#f59e0b30" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="510" cy="130" r="5" fill="#f59e0b" />
                  <text x="510" y="120" fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="middle">{result.stops[1]}</text>
                </>
              )}

              {/* End */}
              <circle cx="720" cy="80" r="14" fill="#a78bfa30" stroke="#a78bfa" strokeWidth="2" filter="url(#glow)" />
              <circle cx="720" cy="80" r="6" fill="#a78bfa" />
              <text x="720" y="105" fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="700" textAnchor="middle">{to}</text>
            </svg>

            {/* Bottom info bar */}
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 20px" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#4ade80" }}>⬤</span> Start
              </div>
              {result.stops.length > 0 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#60a5fa" }}>⬤</span> Charging Stop
                </div>
              )}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#a78bfa" }}>⬤</span> Destination
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <IcoInfo />{car.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;