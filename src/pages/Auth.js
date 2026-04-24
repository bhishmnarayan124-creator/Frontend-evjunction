import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    city: '',
    role: 'user',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  return (
    <div className="auth-page" data-testid="auth-page">
      <div className="auth-glow"></div>
      <div className="auth-card">
        <div className="auth-logo">
          EV<em>Junctions</em>
        </div>
        <div className="auth-title" data-testid="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </div>
        <div className="auth-sub">
          {mode === 'login' ? 'Sign in to your account' : 'Join the EV revolution'}
        </div>
        
        <button className="social-btn">
          <span style={{ fontSize: '18px' }}>G</span> Continue with Google
        </button>
        <button className="social-btn">
          <span style={{ fontSize: '18px' }}>📱</span> Continue with Phone OTP
        </button>
        
        <div className="auth-divider"><span>or with email</span></div>
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">I want to join as</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {['user', 'vendor'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleChange('role', role)}
                      data-testid={`role-btn-${role}`}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formData.role === role
                          ? '2px solid var(--primary, #3b82f6)'
                          : '1.5px solid rgba(255,255,255,0.15)',
                        background: formData.role === role
                          ? 'rgba(59,130,246,0.12)'
                          : 'rgba(255,255,255,0.04)',
                        color: formData.role === role
                          ? 'var(--primary, #3b82f6)'
                          : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                        {role === 'user' ? '🙋' : '🏪'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {role === 'user' ? 'User' : 'Vendor'}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.75 }}>
                        {role === 'user' ? 'Find & explore' : 'List & manage'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Email</label>
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
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Phone</label>
              <input 
                className="form-input" 
                type="tel" 
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                data-testid="input-phone"
              />
            </div>
          )}
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Password</label>
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
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
            data-testid="submit-auth-btn"
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>
        
        <div className="auth-footer">
          {mode === 'login' ? (
            <>Don't have an account? <a onClick={() => setMode('register')} data-testid="switch-to-register">Sign up free</a></>
          ) : (
            <>Already have an account? <a onClick={() => setMode('login')} data-testid="switch-to-login">Sign in</a></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;