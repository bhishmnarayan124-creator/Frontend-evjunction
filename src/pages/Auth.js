import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

const ROLES = [
  {
    value: 'user',
    label: 'User',
    icon: '🙋',
    tagline: "Explore India's EV network",
    desc: 'Best for EV owners & enthusiasts who want to find chargers, hotels and plan trips.',
    activeTab: 'border-emerald-400/70 bg-emerald-400/10 text-emerald-300',
    activeBtnBg: 'bg-emerald-500 hover:bg-emerald-600',
    activeLink: 'text-emerald-400',
    iconBg: 'bg-emerald-400/15',
    allowDot: 'bg-emerald-400',
    perms: [
      { type: 'allow', text: 'Find & filter 12,000+ charging stations across India' },
      { type: 'allow', text: 'Browse & contact sellers in the EV marketplace' },
      { type: 'allow', text: 'Book EV-friendly hotels with charging facilities' },
      { type: 'allow', text: 'Use AI trip planner with auto charging stop suggestions' },
      { type: 'allow', text: 'Save favourites and track charging history' },
      { type: 'deny', text: 'Cannot list or manage chargers / hotels' },
      { type: 'deny', text: 'No access to admin or vendor dashboard' },
    ],
  },
  {
    value: 'vendor',
    label: 'Vendor',
    icon: '🏪',
    tagline: 'List & manage your business',
    desc: 'For charger operators, hotel owners and EV sellers who want to reach lakhs of EV drivers.',
    activeTab: 'border-blue-400/70 bg-blue-400/10 text-blue-300',
    activeBtnBg: 'bg-blue-500 hover:bg-blue-600',
    activeLink: 'text-blue-400',
    iconBg: 'bg-blue-400/15',
    allowDot: 'bg-blue-400',
    perms: [
      { type: 'allow', text: 'List and manage charging stations with live status' },
      { type: 'allow', text: 'Register your hotel as an EV-friendly property' },
      { type: 'allow', text: 'Sell EVs on the marketplace with photo uploads' },
      { type: 'allow', text: 'View analytics — visits, bookings, revenue dashboard' },
      { type: 'allow', text: 'Respond to reviews and customer queries' },
      { type: 'deny', text: 'Listings go live only after admin approval' },
      { type: 'deny', text: 'No access to platform-wide admin controls' },
    ],
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: '🛡️',
    tagline: 'Full platform control',
    desc: 'Internal role for platform moderators with full access to manage users and listings.',
    activeTab: 'border-purple-400/70 bg-purple-400/10 text-purple-300',
    activeBtnBg: 'bg-purple-500 hover:bg-purple-600',
    activeLink: 'text-purple-400',
    iconBg: 'bg-purple-400/15',
    allowDot: 'bg-purple-400',
    perms: [
      { type: 'allow', text: 'Approve, reject or suspend vendor listings' },
      { type: 'allow', text: 'Manage all users, vendors and their permissions' },
      { type: 'allow', text: 'Access platform-wide analytics and reports' },
      { type: 'allow', text: 'Moderate reviews and handle dispute resolution' },
      { type: 'allow', text: 'Configure charger types, city zones and pricing rules' },
      { type: 'deny', text: 'Requires approval from super admin' },
    ],
  },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [mode, setMode] = useState(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    city: '',
    role: 'user',
  });

  const selectedRole = ROLES.find((r) => r.value === formData.role);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
     console.log("Submitting role:", formData.role);
    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        login(response.data.access_token, response.data.user);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        const response = await authAPI.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          role: formData.role,
        });
        login(response.data.access_token, response.data.user);
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const renderLeftPanel = () => {
    if (mode === 'login') {
      return (
        <div className="flex-1 flex flex-col justify-center gap-4">
          <h2
            className="text-2xl font-bold text-[var(--text)] leading-tight"
            style={{ fontFamily: 'var(--font-head)' }}
          >
            Welcome back!
          </h2>
          <p className="text-sm text-[var(--text2)] leading-relaxed">
            Sign in to access your EV dashboard — find chargers, manage listings, and plan your next electric journey.
          </p>
          {[
            { dot: 'bg-emerald-400', text: '12,000+ charging stations' },
            { dot: 'bg-blue-400', text: '5,200+ electric vehicles' },
            { dot: 'bg-purple-400', text: 'AI-powered trip planner' },
            { dot: 'bg-orange-400', text: '860+ EV-friendly hotels' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5 text-xs text-[var(--text2)]">
              <div className={'w-2 h-2 rounded-full shrink-0 ' + item.dot} />
              {item.text}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 flex-1">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--text2)]">
          Select your role
        </div>

        <div className="flex gap-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => handleChange('role', role.value)}
              data-testid={'role-btn-' + role.value}
              className={
                'flex-1 py-2 px-1 text-xs font-semibold rounded-xl border-2 transition-all duration-200 ' +
                (formData.role === role.value
                  ? role.activeTab
                  : 'border-[var(--border)] text-[var(--text2)] hover:border-white/20 hover:text-[var(--text)]')
              }
            >
              {role.icon} {role.label}
            </button>
          ))}
        </div>

        <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className={'w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ' + selectedRole.iconBg}>
              {selectedRole.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text)] leading-tight flex flex-wrap items-center gap-2">
                {selectedRole.label}
                <span className={'text-[10px] font-semibold px-2 py-0.5 rounded-full border ' + selectedRole.activeTab}>
                  {selectedRole.tagline}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text2)] mt-1 leading-relaxed">
                {selectedRole.desc}
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-2">
            {selectedRole.perms.map((perm, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className={
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ' +
                    (perm.type === 'allow' ? selectedRole.allowDot : 'bg-red-400')
                  }
                />
                <span
                  className={
                    'text-[11px] leading-relaxed ' +
                    (perm.type === 'allow' ? 'text-[var(--text2)]' : 'text-red-400/70')
                  }
                >
                  {perm.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
  if (mode === 'login') {
    return (
      <p className="text-xs text-center text-[var(--text2)]">
        Don&apos;t have an account?{' '}
        <span
          onClick={() => setMode('register')}
          className="cursor-pointer hover:underline font-semibold text-[var(--accent)]"
          data-testid="switch-to-register"
        >
          Sign up free
        </span>
      </p>
    );
  }

  return (
    <p className="text-xs text-center text-[var(--text2)]">
      Already have an account?{' '}
      <span
        onClick={() => setMode('login')}
        className="cursor-pointer hover:underline font-semibold text-[var(--accent)]"
        data-testid="switch-to-login"
      >
        Sign in
      </span>
    </p>
  );
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--bg)]"
      data-testid="auth-page"
    >
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="text-center mb-6">
          <span
            className="text-2xl font-bold tracking-tight text-[var(--text)]"
            style={{ fontFamily: 'var(--font-head)' }}
          >
            EV<em className="text-[var(--accent)] not-italic">Junctions</em>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl shadow-black/40">

          {/* LEFT PANEL */}
          <div className="lg:w-[42%] bg-[var(--bg2)] p-6 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-[var(--border)]">
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
              {['register', 'login'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={
                    'flex-1 py-2 text-sm font-semibold capitalize transition-all duration-200 ' +
                    (mode === m
                      ? 'bg-[var(--bg)] text-[var(--text)]'
                      : 'text-[var(--text2)] hover:text-[var(--text)]')
                  }
                >
                  {m === 'register' ? 'Register' : 'Sign in'}
                </button>
              ))}
            </div>

            {renderLeftPanel()}
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 bg-[var(--bg)] p-6 flex flex-col gap-4">
            <div>
              <h2
                className="text-xl font-bold text-[var(--text)]"
                style={{ fontFamily: 'var(--font-head)' }}
                data-testid="auth-title"
              >
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              {mode === 'register' && (
                <p className="text-xs text-[var(--text2)] mt-1">
                  Registering as{' '}
                  <span className={'font-semibold ' + selectedRole.activeLink}>
                    {selectedRole.icon} {selectedRole.label}
                  </span>
                </p>
              )}
              {mode === 'login' && (
                <p className="text-xs text-[var(--text2)] mt-1">
                  Sign in to continue your EV journey
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {mode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">
                    Full Name
                  </label>
                  <input
                    className="form-input"
                    placeholder="Rahul Kumar"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    data-testid="input-name"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">
                  Email
                </label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="yourname@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">
                      Phone
                    </label>
                    <input
                      className="form-input"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">
                      City
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Mumbai, Delhi…"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      data-testid="input-city"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">
                    Password
                  </label>
                  {mode === 'login' && (
                    <a className="text-xs text-[var(--accent)] cursor-pointer hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="submit-auth-btn"
                className={
                  'w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed ' +
                  (mode === 'login'
                    ? 'bg-[var(--accent)] hover:opacity-90'
                    : selectedRole.activeBtnBg)
                }
              >
                {loading
                  ? 'Please wait…'
                  : mode === 'login'
                  ? 'Sign In →'
                  : 'Create ' + selectedRole.label + ' Account →'}
              </button>
            </form>

            {renderFooter()}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--text2)]">or continue with</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)] hover:border-white/20 transition-all duration-200">
                <span className="text-base font-bold">G</span> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)] hover:border-white/20 transition-all duration-200">
                <span className="text-base">📱</span> Phone OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;