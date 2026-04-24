import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { evCarsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import {
  Car, Battery, Zap, MapPin,
  ChevronRight, ChevronLeft, Check, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Style tokens ─── */
const S = {
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    marginBottom: '14px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--ev-accent, #00e5a0)',
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: 'var(--ev-accent, #00e5a0)',
  },
  sectionLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ev-text2, #94a3b8)',
    marginBottom: '6px',
    letterSpacing: '0.3px',
  },
  fieldHint: {
    fontSize: '11px',
    color: 'var(--ev-text3, #475569)',
    marginTop: '4px',
  },
  req: { color: 'var(--ev-accent, #00e5a0)' },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '14px',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  inputBase:
    'bg-ev-bg border border-white/10 font-clash rounded-lg focus:border-ev-accent focus:bg-ev-accent/5 transition-colors',
  featureItem: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: selected ? 'rgba(0,229,160,0.08)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${selected ? 'rgba(0,229,160,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  healthBar: (score) => ({
    height: '6px',
    width: `${score}%`,
    borderRadius: '4px',
    background:
      score >= 90
        ? 'var(--ev-accent, #00e5a0)'
        : score >= 75
        ? '#3b9eff'
        : score >= 60
        ? '#f97316'
        : '#ef4444',
    transition: 'width 0.8s ease',
  }),
};

/* ─── Section Heading ─── */
const SectionHeading = ({ label }) => (
  <div style={{ ...S.sectionHeading, marginTop: '22px' }} className="first:mt-0">
    <div style={S.dot} />
    <span style={S.sectionLabel}>{label}</span>
    <div style={S.sectionLine} />
  </div>
);

/* ─── Field Wrapper ─── */
const Field = ({ label, required, children, hint, style }) => (
  <div style={style}>
    <label style={S.fieldLabel}>
      {label} {required && <span style={S.req}>*</span>}
    </label>
    {children}
    {hint && <p style={S.fieldHint}>{hint}</p>}
  </div>
);

/* ─── FIX: StyledInput — value always string, scroll blocked ─── */
const StyledInput = ({ value, onChange, type, ...props }) => (
  <Input
    type={type || 'text'}
    value={value ?? ''}
    onChange={onChange}
    /* Prevent accidental scroll-wheel changes on number inputs */
    onWheel={(e) => type === 'number' && e.currentTarget.blur()}
    /* Better mobile keyboard for numbers */
    inputMode={type === 'number' ? 'decimal' : undefined}
    {...props}
    className={`${S.inputBase} ${props.className || ''}`}
  />
);

/* ─── Styled Select ─── */
const StyledSelect = ({ value, onValueChange, placeholder, children, testId }) => (
  <Select value={value || ''} onValueChange={onValueChange}>
    <SelectTrigger className={S.inputBase} data-testid={testId}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="bg-ev-card border-white/10">
      {children}
    </SelectContent>
  </Select>
);

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const SellEV = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [batteryHealth, setBatteryHealth] = useState(null);

  /* ─── FIX: all numeric fields initialised as '' (never undefined/null) ─── */
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    trim: '',
    year: new Date().getFullYear().toString(),
    vehicle_type: '',
    drivetrain: '',
    owners: '',
    body_style: '',
    doors: '',
    seating_capacity: '',
    battery_capacity_kwh: '',
    range_km: '',
    current_range_km: '',
    max_charge_rate: '',
    max_ac_charge_rate: '',
    charge_port: '',
    charge_time: '',
    horsepower: '',
    torque: '',
    zero_sixty: '',
    top_speed: '',
    quarter_mile: '',
    exterior_color: '',
    interior_color: '',
    seller_location: '',
    city: '',
    state: '',
    vin: '',
    stock_number: '',
    price: '',
    condition: 'good',
    description: '',
    features: [],
    images: [],
    fast_charging_supported: false,
    warranty_remaining_months: '',
    mileage_km: '',
  });

  const brands = ['Tata', 'Mahindra', 'MG', 'Hyundai', 'Kia', 'BYD', 'Tesla', 'Mercedes', 'BMW', 'Audi', 'Other'];
  const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'Pickup Truck'];
  const drivetrains = ['FWD', 'RWD', 'AWD', '4WD'];
  const bodyStyles = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van'];
  const chargePorts = ['CCS2', 'CHAdeMO', 'Type 2 AC', 'GB/T', 'Tesla Proprietary'];
  const featureOptions = [
    'Sunroof', 'Leather Seats', 'ADAS', 'V2L', '360 Camera',
    'Ventilated Seats', 'Wireless Charging', 'Premium Audio',
    'Heated Seats', 'HUD', 'Ambient Lighting', 'Auto Parking',
  ];
  const exteriorColors = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Green', 'Grey', 'Gold', 'Brown', 'Orange', 'Other'];
  const interiorColors = ['Black', 'Beige', 'Grey', 'Brown', 'White', 'Red', 'Other'];

  /* ─── FIX: handleChange always stores string/array, never undefined ─── */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === undefined || value === null ? '' : value,
    }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  /* ─── Battery health ─── */
  const calculateBatteryHealth = async () => {
    if (!formData.range_km || !formData.current_range_km || !formData.year || !formData.mileage_km) {
      toast.error('Please fill in all battery-related fields');
      return;
    }
    try {
      const response = await evCarsAPI.calculateBatteryHealth({
        original_range_km: parseFloat(formData.range_km),
        current_range_km: parseFloat(formData.current_range_km),
        vehicle_age_years: new Date().getFullYear() - parseInt(formData.year),
        mileage_km: parseFloat(formData.mileage_km),
      });
      setBatteryHealth(response.data);
      toast.success('Battery health calculated!');
    } catch (error) {
      console.error('Error calculating battery health:', error);
      toast.error('Failed to calculate battery health');
    }
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to list your EV');
      navigate('/auth');
      return;
    }
    if (!formData.brand || !formData.model || !formData.price || !formData.city || !formData.battery_capacity_kwh || !formData.range_km) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);

    const num = (v) => (v !== '' && v !== undefined ? Number(v) : undefined);

    const submitData = {
      ...formData,
      battery_health_score: batteryHealth?.health_score ?? undefined,
      battery_capacity_kwh: num(formData.battery_capacity_kwh),
      range_km: num(formData.range_km),
      current_range_km: num(formData.current_range_km),
      mileage_km: num(formData.mileage_km) ?? 0,
      price: num(formData.price),
      year: num(formData.year),
      warranty_remaining_months: num(formData.warranty_remaining_months) ?? 0,
      doors: num(formData.doors),
      seating_capacity: num(formData.seating_capacity),
      owners: num(formData.owners),
      horsepower: num(formData.horsepower),
      zero_sixty: num(formData.zero_sixty),
      top_speed: num(formData.top_speed),
      quarter_mile: num(formData.quarter_mile),
      max_charge_rate: num(formData.max_charge_rate),
      max_ac_charge_rate: num(formData.max_ac_charge_rate),
      charge_time: formData.charge_time || undefined,
      torque: formData.torque || undefined,
    };

    if (isNaN(submitData.battery_capacity_kwh) || isNaN(submitData.range_km) || isNaN(submitData.price)) {
      toast.error('Invalid numeric values');
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.keys(submitData).forEach((key) => {
        if (key === 'images') {
          submitData.images.forEach((img) => fd.append('images', img));
        } else if (key === 'features') {
          fd.append('features', JSON.stringify(submitData.features));
        } else {
          if (submitData[key] !== undefined && submitData[key] !== null) {
            fd.append(key, submitData[key]);
          }
        }
      });
      await evCarsAPI.create(fd);
      toast.success('Your EV has been listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Info', icon: Car },
    { num: 2, title: 'Battery & Perf', icon: Battery },
    { num: 3, title: 'Battery Health', icon: Zap },
    { num: 4, title: 'Details & Sell', icon: MapPin },
  ];

  const healthColor =
    batteryHealth?.health_score >= 90 ? 'text-ev-accent' :
    batteryHealth?.health_score >= 75 ? 'text-ev-blue' :
    batteryHealth?.health_score >= 60 ? 'text-ev-orange' : 'text-ev-danger';

  const healthBadgeClass =
    batteryHealth?.health_status === 'excellent' ? 'bg-ev-accent/20 text-ev-accent' :
    batteryHealth?.health_status === 'good'      ? 'bg-ev-blue/20 text-ev-blue' :
    batteryHealth?.health_status === 'fair'      ? 'bg-ev-orange/20 text-ev-orange' :
                                                   'bg-ev-danger/20 text-ev-danger';

  /* ════════════════════════════════════════════════
     STEP RENDERS
  ════════════════════════════════════════════════ */
  const renderStep = () => {
    switch (step) {

      /* ── STEP 1 ── */
      case 1:
        return (
          <div className="space-y-0">
            <SectionHeading label="Basic Info" />
            <div style={S.grid2}>
              <Field label="Brand" required>
                <StyledSelect value={formData.brand} onValueChange={v => handleChange('brand', v)}
                  placeholder="Select brand" testId="select-brand">
                  {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </StyledSelect>
              </Field>
              <Field label="Model" required>
                <StyledInput placeholder="e.g., Nexon EV Max" value={formData.model}
                  onChange={e => handleChange('model', e.target.value)} data-testid="input-model" />
              </Field>
              <Field label="Trim">
                <StyledInput placeholder="e.g., Long Range" value={formData.trim}
                  onChange={e => handleChange('trim', e.target.value)} />
              </Field>
            </div>

            <div style={{ ...S.grid3, marginTop: '14px' }}>
              <Field label="Year" required>
                <StyledSelect value={formData.year.toString()}
                  onValueChange={v => handleChange('year', v)}
                  placeholder="Year" testId="select-year">
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </StyledSelect>
              </Field>
              <Field label="Vehicle Type">
                <StyledSelect value={formData.vehicle_type} onValueChange={v => handleChange('vehicle_type', v)}
                  placeholder="Select type" testId="select-vehicle-type">
                  {vehicleTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </StyledSelect>
              </Field>
              <Field label="Drivetrain">
                <StyledSelect value={formData.drivetrain} onValueChange={v => handleChange('drivetrain', v)}
                  placeholder="Select drivetrain" testId="select-drivetrain">
                  {drivetrains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </StyledSelect>
              </Field>
            </div>

            <div style={{ ...S.grid2, marginTop: '14px' }}>
              <Field label="Previous Owners">
                <StyledInput type="number" placeholder="e.g., 1" value={formData.owners}
                  onChange={e => handleChange('owners', e.target.value)} data-testid="input-owners" />
              </Field>
              <Field label="Condition" required>
                <StyledSelect value={formData.condition} onValueChange={v => handleChange('condition', v)}
                  placeholder="Select condition" testId="select-condition">
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </StyledSelect>
              </Field>
            </div>

            <SectionHeading label="Body" />
            <div style={S.grid3}>
              <Field label="Body Style">
                <StyledSelect value={formData.body_style} onValueChange={v => handleChange('body_style', v)}
                  placeholder="Select style" testId="select-body-style">
                  {bodyStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </StyledSelect>
              </Field>
              <Field label="Doors">
                <StyledInput type="number" placeholder="e.g., 4" value={formData.doors}
                  onChange={e => handleChange('doors', e.target.value)} data-testid="input-doors" />
              </Field>
              <Field label="Seating Capacity">
                <StyledInput type="number" placeholder="e.g., 5" value={formData.seating_capacity}
                  onChange={e => handleChange('seating_capacity', e.target.value)} data-testid="input-seating" />
              </Field>
            </div>

            <SectionHeading label="Color" />
            <div style={S.grid2}>
              <Field label="Exterior Color">
                <StyledSelect value={formData.exterior_color} onValueChange={v => handleChange('exterior_color', v)}
                  placeholder="Select exterior color" testId="select-exterior-color">
                  {exteriorColors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </StyledSelect>
              </Field>
              <Field label="Interior Color">
                <StyledSelect value={formData.interior_color} onValueChange={v => handleChange('interior_color', v)}
                  placeholder="Select interior color" testId="select-interior-color">
                  {interiorColors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </StyledSelect>
              </Field>
            </div>
          </div>
        );

      /* ── STEP 2 ── */
      case 2:
        return (
          <div className="space-y-0">
            <SectionHeading label="Battery Specifications" />
            <div style={S.grid2}>
              <Field label="Battery Capacity (kWh)" required>
                <StyledInput type="number" placeholder="e.g., 40.5" value={formData.battery_capacity_kwh}
                  onChange={e => handleChange('battery_capacity_kwh', e.target.value)}
                  data-testid="input-battery-capacity" />
              </Field>
              <Field label="Original Range (km)" required>
                <StyledInput type="number" placeholder="e.g., 437" value={formData.range_km}
                  onChange={e => handleChange('range_km', e.target.value)} data-testid="input-range" />
              </Field>
            </div>

            <div style={{ ...S.grid2, marginTop: '14px' }}>
              <Field label="Max DC Charge Rate (kW)">
                <StyledInput type="number" placeholder="e.g., 50" value={formData.max_charge_rate}
                  onChange={e => handleChange('max_charge_rate', e.target.value)}
                  data-testid="input-max-charge-rate" />
              </Field>
              <Field label="Max AC Charge Rate (kW)">
                <StyledInput type="number" placeholder="e.g., 7.2" value={formData.max_ac_charge_rate}
                  onChange={e => handleChange('max_ac_charge_rate', e.target.value)}
                  data-testid="input-max-ac-charge-rate" />
              </Field>
            </div>

            <div style={{ ...S.grid2, marginTop: '14px' }}>
              <Field label="Charge Port Type">
                <StyledSelect value={formData.charge_port} onValueChange={v => handleChange('charge_port', v)}
                  placeholder="Select port type" testId="select-charge-port">
                  {chargePorts.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </StyledSelect>
              </Field>
              <Field label="Charge Time 10–80% (mins)">
                <StyledInput type="number" placeholder="e.g., 56" value={formData.charge_time}
                  onChange={e => handleChange('charge_time', e.target.value)} data-testid="input-charge-time" />
              </Field>
            </div>

            <div style={{ ...S.grid2, marginTop: '14px' }}>
              <Field label="Current Mileage (km)" required>
                <StyledInput type="number" placeholder="e.g., 25000" value={formData.mileage_km}
                  onChange={e => handleChange('mileage_km', e.target.value)} data-testid="input-mileage" />
              </Field>
              <Field label="Warranty Remaining (months)">
                <StyledInput type="number" placeholder="e.g., 24" value={formData.warranty_remaining_months}
                  onChange={e => handleChange('warranty_remaining_months', e.target.value)}
                  data-testid="input-warranty" />
              </Field>
            </div>

            <div className="flex items-center gap-3 mt-10 p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',marginTop: '20px'}}>
              <Checkbox id="fast-charging" checked={formData.fast_charging_supported}
                onCheckedChange={v => handleChange('fast_charging_supported', v)}
                className="border-white/20 data-[state=checked]:bg-ev-accent"
                data-testid="checkbox-fast-charging" />
              <label htmlFor="fast-charging" className="text-sm text-ev-text2 font-clash cursor-pointer ">
                Fast Charging Supported
              </label>
            </div>

            <SectionHeading label="Performance" />
            <div style={S.grid2}>
              <Field label="Horsepower (hp)">
                <StyledInput type="number" placeholder="e.g., 143" value={formData.horsepower}
                  onChange={e => handleChange('horsepower', e.target.value)} data-testid="input-horsepower" />
              </Field>
              <Field label="Torque (Nm)">
                <StyledInput type="number" placeholder="e.g., 250" value={formData.torque}
                  onChange={e => handleChange('torque', e.target.value)} data-testid="input-torque" />
              </Field>
            </div>

            <div style={{ ...S.grid3, marginTop: '14px' }}>
              <Field label="0–100 km/h (secs)">
                <StyledInput type="number" step="0.1" placeholder="e.g., 8.9" value={formData.zero_sixty}
                  onChange={e => handleChange('zero_sixty', e.target.value)} data-testid="input-zero-sixty" />
              </Field>
              <Field label="Top Speed (km/h)">
                <StyledInput type="number" placeholder="e.g., 180" value={formData.top_speed}
                  onChange={e => handleChange('top_speed', e.target.value)} data-testid="input-top-speed" />
              </Field>
              <Field label="Quarter Mile (secs)">
                <StyledInput type="number" step="0.1" placeholder="e.g., 16.5" value={formData.quarter_mile}
                  onChange={e => handleChange('quarter_mile', e.target.value)} data-testid="input-quarter-mile" />
              </Field>
            </div>

            <SectionHeading label="Features" />
            <div style={S.grid4}>
              {featureOptions.map(feature => (
                <div
                  key={feature}
                  style={S.featureItem(formData.features.includes(feature))}
                  onClick={() => toggleFeature(feature)}
                >
                  <Checkbox
                    id={`feat-${feature}`}
                    checked={formData.features.includes(feature)}
                    onCheckedChange={() => {}}
                    className="border-white/20 data-[state=checked]:bg-ev-accent pointer-events-none"
                  />
                  <label htmlFor={`feat-${feature}`} className="text-xs text-ev-text2 font-clash cursor-pointer select-none">
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      /* ── STEP 3 ── */
      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-clash text-lg font-semibold text-white mb-2">
                Battery Health Estimation
              </h3>
              <p className="text-ev-text2 text-sm mb-6 leading-relaxed">
                Enter your current range to get an estimated battery health score.
                This helps buyers make informed decisions.
              </p>

              <Field label="Current Range (km)" hint="The range you're currently getting on a full charge">
                <StyledInput
                  type="number"
                  placeholder="e.g., 380"
                  value={formData.current_range_km}
                  onChange={e => handleChange('current_range_km', e.target.value)}
                  data-testid="input-current-range"
                />
              </Field>

              <button
                onClick={calculateBatteryHealth}
                data-testid="calculate-health-btn"
                className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg font-clash font-semibold text-sm transition-all"
                style={{
                  background: 'rgba(0,229,160,0.1)',
                  border: '1px solid rgba(0,229,160,0.3)',
                  color: 'var(--ev-accent, #00e5a0)',
                }}
              >
                <Battery className="w-4 h-4" />
                Calculate Battery Health
              </button>

              {batteryHealth && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ev-text2 font-clash text-sm">Battery Health Score</span>
                    <span className={`text-4xl font-clash font-bold ${healthColor}`}>
                      {batteryHealth.health_score}%
                    </span>
                  </div>

                  <div className="mb-4" style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={S.healthBar(batteryHealth.health_score)} />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize font-clash ${healthBadgeClass}`}>
                      {batteryHealth.health_status}
                    </span>
                    <span className="text-ev-text3 text-sm font-clash">
                      {batteryHealth.estimated_degradation_percent}% degradation
                    </span>
                  </div>

                  <p className="text-ev-text2 text-sm font-clash leading-relaxed">
                    {batteryHealth.recommendation}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        );

      /* ── STEP 4 ── */
      case 4:
        return (
          <div className="space-y-0">
            <SectionHeading label="Pricing" />
            <Field label="Price (₹)" required style={{ maxWidth: '280px' }}>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-ev-accent font-clash text-base pointer-events-none"
                  style={{ zIndex: 1 }}>
                  ₹
                </span>
                <StyledInput
                  type="number"
                  placeholder="e.g., 1650000"
                  value={formData.price}
                  onChange={e => handleChange('price', e.target.value)}
                  className="pl-7"
                  data-testid="input-price"
                />
              </div>
            </Field>

            <SectionHeading label="Location" />
            <Field label="Full Address" style={{ marginBottom: '14px' }}>
              <StyledInput placeholder="Street address..." value={formData.seller_location}
                onChange={e => handleChange('seller_location', e.target.value)} data-testid="input-address" />
            </Field>
            <div style={S.grid2}>
              <Field label="City" required>
                <StyledInput placeholder="e.g., Mumbai" value={formData.city}
                  onChange={e => handleChange('city', e.target.value)} data-testid="input-city" />
              </Field>
              <Field label="State">
                <StyledInput placeholder="e.g., Maharashtra" value={formData.state}
                  onChange={e => handleChange('state', e.target.value)} data-testid="input-state" />
              </Field>
            </div>

            <SectionHeading label="Identification" />
            <div style={S.grid2}>
              <Field label="VIN" hint="Vehicle Identification Number (17 characters)">
                <StyledInput placeholder="e.g., MA3FJHB1S00123456" value={formData.vin}
                  onChange={e => handleChange('vin', e.target.value)}
                  maxLength={17} data-testid="input-vin" />
              </Field>
              <Field label="Stock Number">
                <StyledInput placeholder="e.g., STK-00123" value={formData.stock_number}
                  onChange={e => handleChange('stock_number', e.target.value)} data-testid="input-stock-number" />
              </Field>
            </div>

            <SectionHeading label="Description" />
            <Field label="Description">
              <Textarea
                placeholder="Describe your EV — service history, modifications, reason for sale..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className="bg-ev-bg border-white/10 min-h-[100px] font-clash rounded-lg focus:border-ev-accent focus:bg-ev-accent/5 transition-colors"
                data-testid="input-description"
              />
            </Field>

            <SectionHeading label="Images" />
            <div
              className="rounded-xl p-5"
              style={{ border: '1.5px dashed rgba(255,255,255,0.15)', transition: 'all 0.2s' }}
            >
              <p className="text-ev-text3 text-xs mb-4 font-clash">
                Upload photos of your EV (exterior, interior, charging port, dashboard)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => handleChange('images', Array.from(e.target.files))}
                className="bg-ev-bg border border-white/10 p-2 rounded-lg w-full text-ev-text2 font-clash text-sm
                           file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0
                           file:text-sm file:font-clash file:bg-ev-accent/20 file:text-ev-accent
                           hover:file:bg-ev-accent/30 cursor-pointer transition-colors"
                data-testid="input-images"
              />
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.images.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <button
                        onClick={() => handleChange('images', formData.images.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ev-danger text-white text-xs
                                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        ×
                      </button>
                    </div>
                  ))}
                  <p className="w-full text-ev-text3 text-xs font-clash mt-1">
                    {formData.images.length} image{formData.images.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─── Not authenticated ─── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="sell-login-prompt">
        <div className="text-center glass-panel rounded-2xl p-12 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-ev-accent/10 flex items-center justify-center mx-auto mb-4"
            style={{ border: '1px solid rgba(0,229,160,0.2)' }}>
            <Car className="w-8 h-8 text-ev-accent" />
          </div>
          <h2 className="font-clash text-2xl font-semibold text-white mb-2">Login Required</h2>
          <p className="text-ev-text2 mb-6 font-clash text-sm leading-relaxed">
            Please login or create an account to list your EV
          </p>
          <Button onClick={() => navigate('/auth')} className="ev-button font-clash" data-testid="login-to-sell-btn">
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="sell-ev-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="font-clash text-3xl md:text-4xl font-semibold text-white mb-2">
            Sell Your EV
          </h1>
          <p className="text-ev-text2 font-clash text-sm">
            List your electric vehicle and reach thousands of buyers
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all font-clash text-sm font-semibold ${
                  step === s.num
                    ? 'bg-ev-accent text-ev-bg shadow-lg shadow-ev-accent/20'
                    : step > s.num
                    ? 'bg-ev-accent/15 text-ev-accent border border-ev-accent/30'
                    : 'bg-ev-card text-ev-text3 border border-white/8'
                }`}
              >
                {step > s.num
                  ? <Check className="w-4 h-4" />
                  : <s.icon className="w-4 h-4" />}
                <span className="hidden md:inline">{s.title}</span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-ev-text3 mx-1 md:mx-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Form Panel */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          className="glass-panel rounded-2xl p-6 md:p-8"
        >
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="border-white/10 font-clash text-ev-text2 hover:text-white hover:border-white/20 transition-colors"
              data-testid="prev-step-btn"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="ev-button font-clash"
                data-testid="next-step-btn"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="ev-button font-clash min-w-[160px]"
                data-testid="submit-listing-btn"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  : <><Check className="w-4 h-4 mr-2" /> Submit Listing</>}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellEV;