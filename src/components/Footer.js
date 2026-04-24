import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '48px 40px 24px' }} data-testid="footer">
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '24px', color: 'var(--text)' }}>
                EV<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Junctions</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '16px', maxWidth: '400px', lineHeight: 1.6 }}>
              India's premier EV platform connecting electric vehicle owners with charging stations, 
              marketplace, and trip planning tools. Join the electric revolution today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '16px' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/chargers" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>Find Chargers</Link></li>
              <li><Link to="/marketplace" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>EV Marketplace</Link></li>
              <li><Link to="/hotels" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>EV Hotels</Link></li>
              <li><Link to="/trip-planner" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>Trip Planner</Link></li>
              <li><Link to="/sell" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>Sell Your EV</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '16px' }}>Contact</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="mailto:hello@evjunctions.in" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>hello@evjunctions.in</a></li>
              <li><a href="tel:+911234567890" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px' }}>+91 12345 67890</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
            © {new Date().getFullYear()} EVJunctions. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--text3)', fontSize: '13px', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text3)', fontSize: '13px', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
