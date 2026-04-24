import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';
import {
  Zap, MapPin, Phone, Clock, Wifi, Coffee, Car,
  Utensils, ShoppingBag, Droplets, ChevronRight,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Plus, X, Navigation, Info,
} from 'lucide-react';
import { chargersAPI } from '@/lib/api';

/* ── Constants ── */


const STATUS_OPTIONS = [
  { id: 'available', label: 'Available', dot: 'bg-emerald-500' },
  { id: 'occupied',  label: 'Occupied',  dot: 'bg-amber-500' },
  { id: 'maintenance', label: 'Maintenance', dot: 'bg-orange-500' },
  { id: 'offline',  label: 'Offline',   dot: 'bg-red-500' },
];



const CHARGER_COLORS = {
  emerald: 'border-emerald-400 bg-emerald-50 text-emerald-800',
  blue:    'border-blue-400 bg-blue-50 text-blue-800',
  slate:   'border-slate-400 bg-slate-100 text-slate-800',
  violet:  'border-violet-400 bg-violet-50 text-violet-800',
  amber:   'border-amber-400 bg-amber-50 text-amber-800',
  teal:    'border-teal-400 bg-teal-50 text-teal-800',
};

/* ── Step indicator ── */
const STEPS = [
  { n: 1, label: 'Location' },
  { n: 2, label: 'Charger specs' },
  { n: 3, label: 'Facilities' },
  { n: 4, label: 'Review' },
];

/* ── Field wrapper ── */
const Field = ({ label, hint, error, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {hint && (
        <span className="ml-1 text-slate-400 font-normal normal-case tracking-normal">{hint}</span>
      )}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-rose-600">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

/* ── Input ── */
const Input = ({ className = '', ...props }) => (
  <input
    className={`
      w-full px-3.5 py-2.5 text-sm rounded-xl
      bg-white border border-slate-200
      text-slate-900 placeholder-slate-400
      focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
      transition-all
      ${className}
    `}
    {...props}
  />
);

/* ── Select ── */
const Select = ({ className = '', children, ...props }) => (
  <select
    className={`
      w-full px-3.5 py-2.5 text-sm rounded-xl
      bg-white border border-slate-200
      text-slate-900
      focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
      transition-all cursor-pointer
      ${className}
    `}
    {...props}
  >
    {children}
  </select>
);

/* ════════════════════════════════════════════════════
   STEP 1 — LOCATION
════════════════════════════════════════════════════ */
const StepLocation = ({ form, errors, onChange }) => {
  const [detecting, setDetecting] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onChange('latitude',  String(pos.coords.latitude.toFixed(6)));
        onChange('longitude', String(pos.coords.longitude.toFixed(6)));
        setDetecting(false);
        toast.success('Location detected!');
      },
      () => { setDetecting(false); toast.error('Could not detect location'); }
    );
  };

  return (
    <div className="space-y-5">
      <Field label="Station name" required error={errors.name}>
        <Input
          placeholder="e.g. Tata Power EV Hub – Kolhapur"
          value={form.name}
          onChange={e => onChange('name', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" required error={errors.city}>
          <Input placeholder="Kolhapur" value={form.city} onChange={e => onChange('city', e.target.value)} />
        </Field>
        <Field label="State">
          <Input placeholder="Maharashtra" value={form.state} onChange={e => onChange('state', e.target.value)} />
        </Field>
      </div>

      <Field label="Full address">
        <Input placeholder="NH-66, Near Toll Plaza, Kolhapur, MH 416001" value={form.address} onChange={e => onChange('address', e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude" required error={errors.latitude}>
          <Input type="number" step="0.000001" placeholder="16.7050" value={form.latitude} onChange={e => onChange('latitude', e.target.value)} />
        </Field>
        <Field label="Longitude" required error={errors.longitude}>
          <Input type="number" step="0.000001" placeholder="74.2433" value={form.longitude} onChange={e => onChange('longitude', e.target.value)} />
        </Field>
      </div>

      <button
        type="button"
        onClick={detectLocation}
        disabled={detecting}
        className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        {detecting ? 'Detecting location...' : 'Use my current location'}
      </button>

      {/* Map preview placeholder */}
      {form.latitude && form.longitude && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-40 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-slate-600">{form.latitude}, {form.longitude}</p>
            <p className="text-xs text-slate-400 mt-0.5">Coordinates captured</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════
   STEP 2 — CHARGER SPECS
════════════════════════════════════════════════════ */
const StepChargerSpecs = ({form,errors, onChange,chargerTypes}) => (
  <div className="space-y-5">
    {/* Charger type cards */}
    <Field label="Charger type" required error={errors.chargerType}>
      <div className="grid grid-cols-3 gap-2.5">
        {chargerTypes.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => onChange("chargerType", type)}
            className={`
              flex flex-col items-start gap-0.5 p-3 rounded-xl border-2 text-left transition-all
              ${
                form.chargerType === type
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }
            `}
          >
            <span className="text-sm font-semibold leading-tight">
              {type}
            </span>
          </button>
        ))}
      </div>
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Power output" hint="(kW)" required error={errors.powerKw}>
        <div className="relative">
          <Input
            type="number"
            placeholder="150"
            value={form.powerKw}
            onChange={e => onChange('powerKw', e.target.value)}
            className="pr-12"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">kW</span>
        </div>
      </Field>
      <Field label="Connectors" error={errors.numberOfConnectors}>
        <Input
          type="number"
          placeholder="4"
          min="1"
          value={form.numberOfConnectors}
          onChange={e => onChange('numberOfConnectors', e.target.value)}
        />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Price per kWh" hint="(₹)" required error={errors.pricePerKwh}>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₹</span>
          <Input
            type="number"
            placeholder="12"
            value={form.pricePerKwh}
            onChange={e => onChange('pricePerKwh', e.target.value)}
            className="pl-8"
          />
        </div>
      </Field>
      <Field label="Avg wait time" hint="(min)">
        <Input
          type="number"
          placeholder="20"
          value={form.waitTimeMin}
          onChange={e => onChange('waitTimeMin', e.target.value)}
        />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Network operator">
        <Input placeholder="e.g. Tata Power" value={form.networkProvider} onChange={e => onChange('networkProvider', e.target.value)} />
      </Field>
      <Field label="Contact phone">
        <Input type="tel" placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => onChange('contactPhone', e.target.value)} />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Status">
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map(s => (
            <label key={s.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value={s.id}
                checked={form.status === s.id}
                onChange={() => onChange('status', s.id)}
                className="accent-emerald-600"
              />
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{s.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Open 24 hours?">
        <div className="flex flex-col gap-2 mt-1">
          {[{ val: true, lbl: 'Yes, open 24/7' }, { val: false, lbl: 'Limited hours' }].map(o => (
            <label key={String(o.val)} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="open24Hours"
                checked={form.open24Hours === o.val}
                onChange={() => onChange('open24Hours', o.val)}
                className="accent-emerald-600"
              />
              <span className="text-sm text-slate-700">{o.lbl}</span>
            </label>
          ))}
        </div>
      </Field>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════
   STEP 3 — FACILITIES
════════════════════════════════════════════════════ */
const StepFacilities = ({form,onChange,amenitiesList}) => {
  const [customAmenity, setCustomAmenity] = useState('');

  const toggleAmenity = (label) => {
    const current = form.amenities || [];
    const next = current.includes(label)
      ? current.filter(a => a !== label)
      : [...current, label];
    onChange('amenities', next);
  };

  const addCustom = () => {
    const v = customAmenity.trim();
    if (!v) return;
    const current = form.amenities || [];
    if (!current.includes(v)) onChange('amenities', [...current, v]);
    setCustomAmenity('');
  };

  return (
    <div className="space-y-5">
      <Field label="Nearby amenities" hint="(select all that apply)">
        <div className="grid grid-cols-3 gap-2.5">
          {amenitiesList.map(label => {
            const active = (form.amenities || []).includes(label);
            return (
              <button
                key={label}
                 onClick={() => toggleAmenity(label)}
                className={`
                  flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center
                  ${active
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }
                `}
              >
                <span className="text-xs font-medium leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Custom amenity */}
      <Field label="Add custom amenity">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. EV accessories shop"
            value={customAmenity}
            onChange={e => setCustomAmenity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          />
          <button
            type="button"
            onClick={addCustom}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Field>

      {/* Custom amenity tags */}
      {(form.amenities || []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(form.amenities || []).map(a => (
            <span key={a} className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1">
              {a}
              <button type="button" onClick={() => toggleAmenity(a)} className="hover:text-rose-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Field label="Nearby hotel / landmark">
        <Input
          placeholder="e.g. Hotel Pearl, ₹1800/night"
          value={form.hotelNearby}
          onChange={e => onChange('hotelNearby', e.target.value)}
        />
      </Field>
    </div>
  );
};

/* ════════════════════════════════════════════════════
   STEP 4 — REVIEW
════════════════════════════════════════════════════ */
const ReviewRow = ({ label, value, fallback = '—' }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-medium text-right max-w-[60%]">{value || fallback}</span>
  </div>
);

const StepReview = ({ form }) => (
  <div className="space-y-5">
    {/* Location */}
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Location</span>
      </div>
      <ReviewRow label="Station name" value={form.name} />
      <ReviewRow label="City" value={`${form.city}${form.state ? ', ' + form.state : ''}`} />
      <ReviewRow label="Address" value={form.address} />
      <ReviewRow label="Coordinates" value={form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : null} />
    </div>

    {/* Charger specs */}
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Charger specs</span>
      </div>
      <ReviewRow label="Type" value={form.chargerType} />
      <ReviewRow label="Power" value={form.powerKw ? `${form.powerKw} kW` : null} />
      <ReviewRow label="Connectors" value={form.numberOfConnectors} />
      <ReviewRow label="Price" value={form.pricePerKwh ? `₹${form.pricePerKwh} / kWh` : null} />
      <ReviewRow label="Avg wait" value={form.waitTimeMin ? `${form.waitTimeMin} min` : null} />
      <ReviewRow label="Network" value={form.networkProvider} />
      <ReviewRow label="Status" value={form.status} />
      <ReviewRow label="Open 24/7" value={form.open24Hours ? 'Yes' : 'No'} />
    </div>

    {/* Facilities */}
    {(form.amenities || []).length > 0 && (
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coffee className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Facilities</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(form.amenities || []).map(a => (
            <span key={a} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2.5 py-1">{a}</span>
          ))}
        </div>
      </div>
    )}

    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex gap-3">
      <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-emerald-800 leading-relaxed">
        Your station will be live immediately after submission. You can edit it anytime from the admin dashboard.
      </p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
════════════════════════════════════════════════════ */
const INITIAL_FORM = {
  name: '', city: '', state: '', address: '',
  latitude: '', longitude: '',
  chargerType: 'DC Fast', powerKw: '', numberOfConnectors: '',
  pricePerKwh: '', waitTimeMin: '', networkProvider: '',
  status: 'available', open24Hours: true,
  contactPhone: '', hotelNearby: '', amenities: [],
};

const AddChargerStation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef(null);

  const [chargerTypes, setChargerTypes] = useState([]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await chargersAPI.getTypes();
        setChargerTypes(res.data);
      } catch {
        toast.error("Failed to load charger types");
      }
    };

    loadTypes();
  }, []);

  const [amenitiesList, setAmenitiesList] = useState([]);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const res = await chargersAPI.getAmenities();
        setAmenitiesList(res.data);
      } catch {
        toast.error("Failed to load amenities");
      }
    };

    loadAmenities();
  }, []); 

  const onChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim())      e.name      = 'Station name is required';
      if (!form.city.trim())      e.city      = 'City is required';
      if (!form.latitude)         e.latitude  = 'Latitude is required';
      if (!form.longitude)        e.longitude = 'Longitude is required';
    }
    if (step === 2) {
      if (!form.chargerType)      e.chargerType  = 'Select a charger type';
      if (!form.powerKw)          e.powerKw      = 'Power output is required';
      if (!form.pricePerKwh)      e.pricePerKwh  = 'Price per kWh is required';
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(currentStep);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setCurrentStep(s => Math.min(s + 1, 4));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goBack = () => {
    setCurrentStep(s => Math.max(s - 1, 1));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        city: form.city,
        state: form.state,
        address: form.address,

        latitude: Number(form.latitude),
        longitude: Number(form.longitude),

        charger_type: form.chargerType,
        power_kw: Number(form.powerKw) || 50,

        number_of_connectors:
          Number(form.numberOfConnectors) || 2,

        pricePerKwh:
          Number(form.pricePerKwh) || 12,

        wait_time_min:
          Number(form.waitTimeMin) || 20,

        network_provider:
          form.networkProvider,

        contactPhone:
          form.contactPhone,

        nearby_hotel:
          form.hotelNearby,

        amenities:
          form.amenities,

        status:
          form.status,

        open24Hours:
          form.open24Hours,

        source: "manual",
      };
      await chargersAPI.create(payload);
      setSubmitted(true);
      toast.success('Charging station added successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add station');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Station added!</h2>
          <p className="text-sm text-slate-500 mb-8">
            <span className="font-semibold text-slate-800">{form.name}</span> in {form.city} is now live on EV Junctions.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/chargers')}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
            >
              View all chargers
            </button>
            <button
              onClick={() => { setForm(INITIAL_FORM); setCurrentStep(1); setSubmitted(false); }}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Add another station
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = { 1: 'Location', 2: 'Charger specs', 3: 'Facilities', 4: 'Review & submit' };
  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" ref={topRef}>
      {/* ── Top header ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex-1">
            {/* Progress bar */}
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">{currentStep} / 4</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Step indicators ── */}
        <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const done    = currentStep > s.n;
            const active  = currentStep === s.n;
            return (
              <div key={s.n} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${active  ? 'bg-emerald-700 text-white'       : ''}
                  ${done    ? 'bg-emerald-100 text-emerald-800'  : ''}
                  ${!active && !done ? 'bg-slate-100 text-slate-500' : ''}
                `}>
                  <span className={`
                    w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${active  ? 'bg-white text-emerald-700' : ''}
                    ${done    ? 'bg-emerald-500 text-white' : ''}
                    ${!active && !done ? 'bg-slate-300 text-white' : ''}
                  `}>
                    {done ? '✓' : s.n}
                  </span>
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px ${currentStep > s.n ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Page title ── */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-200">
              <Zap className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add charging station</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            {currentStep === 1 && 'Tell us where your station is located'}
            {currentStep === 2 && 'Configure your charger specifications'}
            {currentStep === 3 && 'Add nearby facilities for EV drivers'}
            {currentStep === 4 && 'Review everything before publishing'}
          </p>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Step {currentStep} — {stepLabels[currentStep]}
            </span>
          </div>

          {currentStep === 1 && <StepLocation    form={form} errors={errors} onChange={onChange} />}
          {currentStep === 2 && (<StepChargerSpecs form={form} errors={errors} onChange={onChange} chargerTypes={chargerTypes}/>)}
          {currentStep === 3 && (<StepFacilities form={form} onChange={onChange} amenitiesList={amenitiesList}/>)}
          {currentStep === 4 && <StepReview      form={form} />}
        </div>

        {/* ── Navigation buttons ── */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-md shadow-emerald-200"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-md shadow-emerald-200 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : (
                <><Zap className="w-4 h-4" /> Publish station</>
              )}
            </button>
          )}
        </div>

        {/* ── Step progress dots (mobile) ── */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map(s => (
            <div
              key={s.n}
              className={`rounded-full transition-all duration-300 ${
                currentStep === s.n
                  ? 'w-6 h-2 bg-emerald-600'
                  : currentStep > s.n
                    ? 'w-2 h-2 bg-emerald-300'
                    : 'w-2 h-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddChargerStation;