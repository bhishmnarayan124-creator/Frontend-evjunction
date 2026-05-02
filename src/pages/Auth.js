import { useState, useEffect, useRef } from 'react';
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

// ─── OTP Input Component ────────────────────────────────────────────────────
const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputs = useRef([]);

  const handleKey = (e, index) => {
    if (e.key === 'Backspace') {
      const newVal = value.split('');
      newVal[index] = '';
      onChange(newVal.join(''));
      if (index > 0) inputs.current[index - 1]?.focus();
    }
  };

  const handleChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const newVal = value.padEnd(length, ' ').split('');
    newVal[index] = digit;
    const joined = newVal.join('').trimEnd();
    onChange(joined);
    if (digit && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-[var(--border)] bg-[var(--bg2)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-all duration-200"
        />
      ))}
    </div>
  );
};

// ─── Forgot Password Flow ────────────────────────────────────────────────────
/*
  Steps:
    'input'    → user enters email + phone
    'otp'      → user enters OTP sent to phone
    'account'  → show matched account (name + masked email)
    'reset'    → user sets new password
    'done'     → success screen
*/
const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [accountInfo, setAccountInfo] = useState(null); // { name, maskedEmail }
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Start 60s resend countdown
  const startTimer = () => {
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Step 1: Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email && !phone) {
      toast.error('Please enter your email or phone number');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPasswordSendOTP({ email: email || undefined, phone: phone || undefined });
      toast.success('OTP sent to your registered phone number!');
      setStep('otp');
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOTP = async () => {
    if (otp.replace(/\s/g, '').length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPasswordVerifyOTP({
        email: email || undefined,
        phone: phone || undefined,
        otp,
      });
      // Expected response: { reset_token, account: { name, masked_email } }
      setResetToken(res.data.reset_token);
      setAccountInfo(res.data.account); // { name, masked_email }
      toast.success('OTP verified!');
      setStep('account');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await authAPI.forgotPasswordSendOTP({ email: email || undefined, phone: phone || undefined });
      toast.success('OTP resent!');
      setOtp('');
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 → 4: Proceed to reset ──
  const handleProceedToReset = () => setStep('reset');

  // ── Step 4: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPasswordReset({
        reset_token: resetToken,
        new_password: newPassword,
      });
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared back button ──
  const BackBtn = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-[var(--text2)] hover:text-[var(--text)] transition-colors duration-200 mb-2"
    >
      ← Back
    </button>
  );

  // ════════════════════════════
  //  STEP: input
  // ════════════════════════════
  if (step === 'input') return (
    <div className="flex flex-col gap-4">
      <BackBtn onClick={onBack} />
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-head)' }}>
          Forgot Password?
        </h2>
        <p className="text-xs text-[var(--text2)] mt-1 leading-relaxed">
          Enter your registered email <span className="text-[var(--text2)]/60">or</span> phone number. We'll send an OTP to your linked mobile number.
        </p>
      </div>

      <form onSubmit={handleSendOTP} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Email Address</label>
          <input
            className="form-input"
            type="email"
            placeholder="yourname@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="forgot-email"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[11px] text-[var(--text2)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Phone Number</label>
          <input
            className="form-input"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="forgot-phone"
          />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)]/60 p-3 flex items-start gap-2.5">
          <span className="text-base mt-0.5">📱</span>
          <p className="text-[11px] text-[var(--text2)] leading-relaxed">
            OTP will be sent to the <strong className="text-[var(--text)]">mobile number</strong> linked to your account. Make sure your phone is accessible.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="forgot-send-otp-btn"
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending OTP…' : 'Send OTP →'}
        </button>
      </form>
    </div>
  );

  // ════════════════════════════
  //  STEP: otp
  // ════════════════════════════
  if (step === 'otp') return (
    <div className="flex flex-col gap-4">
      <BackBtn onClick={() => setStep('input')} />
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-head)' }}>
          Enter OTP
        </h2>
        <p className="text-xs text-[var(--text2)] mt-1 leading-relaxed">
          A 6-digit OTP has been sent to the phone number linked with{' '}
          <span className="text-[var(--text)] font-semibold">{email || phone}</span>
        </p>
      </div>

      <div className="flex flex-col gap-5 py-2">
        <OTPInput value={otp} onChange={setOtp} length={6} />

        <div className="text-center">
          <span className="text-[11px] text-[var(--text2)]">Didn't receive it? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            className={
              'text-[11px] font-semibold transition-colors duration-200 ' +
              (resendTimer > 0
                ? 'text-[var(--text2)] cursor-not-allowed'
                : 'text-[var(--accent)] hover:underline cursor-pointer')
            }
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleVerifyOTP}
        disabled={loading || otp.replace(/\s/g, '').length < 6}
        data-testid="verify-otp-btn"
        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying…' : 'Verify OTP →'}
      </button>
    </div>
  );

  // ════════════════════════════
  //  STEP: account
  // ════════════════════════════
  if (step === 'account') return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-head)' }}>
          Account Found ✓
        </h2>
        <p className="text-xs text-[var(--text2)] mt-1">
          We found the following account linked to your details.
        </p>
      </div>

      {/* Account Card */}
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-emerald-400/15 flex items-center justify-center text-xl shrink-0">
          👤
        </div>
        <div>
          <div className="text-sm font-bold text-[var(--text)]">
            {accountInfo?.name || 'Account Holder'}
          </div>
          <div className="text-xs text-[var(--text2)] mt-0.5">
            {accountInfo?.masked_email || '••••••@••••.com'}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">Verified via OTP</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)]/60 p-3 flex items-start gap-2.5">
        <span className="text-sm mt-0.5">🔐</span>
        <p className="text-[11px] text-[var(--text2)] leading-relaxed">
          You are about to reset the password for this account. Make sure you choose a strong, unique password.
        </p>
      </div>

      <button
        type="button"
        onClick={handleProceedToReset}
        data-testid="proceed-reset-btn"
        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 transition-all duration-200"
      >
        Reset Password for this Account →
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-[var(--text2)] border border-[var(--border)] hover:text-[var(--text)] hover:border-white/20 transition-all duration-200"
      >
        This is not my account
      </button>
    </div>
  );

  // ════════════════════════════
  //  STEP: reset
  // ════════════════════════════
  if (step === 'reset') return (
    <div className="flex flex-col gap-4">
      <BackBtn onClick={() => setStep('account')} />
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-head)' }}>
          Set New Password
        </h2>
        <p className="text-xs text-[var(--text2)] mt-1">
          Create a new password for{' '}
          <span className="text-[var(--text)] font-semibold">{accountInfo?.name}</span>'s account.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">New Password</label>
          <div className="relative">
            <input
              className="form-input pr-10"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              data-testid="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text2)] hover:text-[var(--text)] text-sm"
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map((level) => {
                const strength = newPassword.length < 6 ? 1 : newPassword.length < 8 ? 2 : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4 : 3;
                return (
                  <div
                    key={level}
                    className={
                      'flex-1 h-1 rounded-full transition-all duration-300 ' +
                      (level <= strength
                        ? strength === 1 ? 'bg-red-400'
                          : strength === 2 ? 'bg-orange-400'
                          : strength === 3 ? 'bg-yellow-400'
                          : 'bg-emerald-400'
                        : 'bg-[var(--border)]')
                    }
                  />
                );
              })}
              <span className="text-[10px] text-[var(--text2)] ml-1">
                {newPassword.length < 6 ? 'Weak' : newPassword.length < 8 ? 'Fair' : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'Strong' : 'Good'}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Confirm Password</label>
          <input
            className={
              'form-input ' +
              (confirmPassword && confirmPassword !== newPassword ? 'border-red-400/60 focus:border-red-400' : '')
            }
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            data-testid="confirm-password"
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-[11px] text-red-400">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          data-testid="reset-password-btn"
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating…' : 'Update Password →'}
        </button>
      </form>
    </div>
  );

  // ════════════════════════════
  //  STEP: done
  // ════════════════════════════
  if (step === 'done') return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-400/15 flex items-center justify-center text-3xl">
        ✅
      </div>
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-head)' }}>
          Password Reset!
        </h2>
        <p className="text-xs text-[var(--text2)] mt-2 leading-relaxed max-w-xs">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 transition-all duration-200"
      >
        Go to Sign In →
      </button>
    </div>
  );

  return null;
};

// ─── Main Auth Component ─────────────────────────────────────────────────────
const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [adminExists, setAdminExists] = useState(false);

  const [mode, setMode] = useState(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
    const checkAdmin = async () => {
      try {
        const res = await authAPI.checkAdminExists();
        setAdminExists(res.data.adminExists);
      } catch (err) {
        console.error('Admin check failed', err);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        login(response.data.access_token, response.data.user);
        toast.success('Welcome back!');
        if (response.data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
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
        if (response.data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (error) {
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
              onClick={() => {
                if (role.value === 'admin' && adminExists) {
                  toast.error('Admin account already exists.');
                  return;
                }
                handleChange('role', role.value);
              }}
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
                <div className={'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ' + (perm.type === 'allow' ? selectedRole.allowDot : 'bg-red-400')} />
                <span className={'text-[11px] leading-relaxed ' + (perm.type === 'allow' ? 'text-[var(--text2)]' : 'text-red-400/70')}>
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
            {!showForgotPassword && (
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
            )}

            {showForgotPassword ? (
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-2xl">
                  🔑
                </div>
                <h3 className="text-sm font-bold text-[var(--text)]">Secure Password Recovery</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: '📧', text: 'Enter your email or phone' },
                    { icon: '📱', text: 'Receive OTP on linked mobile' },
                    { icon: '👤', text: 'Confirm your account identity' },
                    { icon: '🔐', text: 'Set a new strong password' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg)]/60 flex items-center justify-center text-sm shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-[11px] text-[var(--text2)]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              renderLeftPanel()
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 bg-[var(--bg)] p-6 flex flex-col gap-4">

            {/* ── FORGOT PASSWORD MODE ── */}
            {showForgotPassword ? (
              <ForgotPassword
                onBack={() => {
                  setShowForgotPassword(false);
                  setMode('login');
                }}
              />
            ) : (
              <>
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
                      <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Full Name</label>
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
                    <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Email</label>
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
                        <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Phone</label>
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
                        <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">City</label>
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
                      <label className="text-xs font-semibold text-[var(--text2)] tracking-wide">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-[var(--accent)] cursor-pointer hover:underline"
                          data-testid="forgot-password-link"
                        >
                          Forgot password?
                        </button>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;