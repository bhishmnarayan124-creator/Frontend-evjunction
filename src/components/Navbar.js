import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/chargers', label: 'Chargers' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/hotels', label: 'Hotels' },
    { path: '/trip-planner', label: 'Trip Planner' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6"
      style={{ 
        background: 'rgba(5, 9, 15, 0.85)', 
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)'
      }}
      data-testid="navbar"
    >
      <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
          <span className="font-clash font-bold text-xl text-white">
            EV<span className="text-[var(--accent)] italic">Junctions</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              data-testid={`nav-link-${link.path.slice(1) || 'home'}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text2)] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
                {!isAdmin && (
                  <Link
                    to="/notifications"
                    className="p-2 rounded-lg text-[var(--text2)] hover:text-white hover:bg-white/5 relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full"></span>
                  </Link>
                )}
              <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
                <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)] font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-white">{user?.name?.split(' ')[0]}</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="btn btn-sm"
                    style={{ background: 'var(--purple-dim)', border: '1px solid var(--purple)', color: 'var(--purple)' }}
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-sm text-[var(--text3)] hover:text-[var(--red)]"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/auth"
                className="btn btn-ghost"
                data-testid="login-btn"
              >
                Login
              </Link>
              <Link 
                to="/auth?mode=register"
                className="btn btn-primary"
                data-testid="signup-btn"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[var(--text2)] hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="absolute top-16 left-0 right-0 md:hidden"
          style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-all ${
                  location.pathname === link.path
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'text-[var(--text2)] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] pt-4 mt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-[var(--text2)] hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-[var(--red)] hover:bg-[var(--red)]/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link 
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-outline flex-1"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/auth?mode=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary flex-1"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
