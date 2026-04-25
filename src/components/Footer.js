import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="bg-[var(--bg2)] border-t border-[var(--border)] px-6 pt-12 pb-6 md:px-10"
      data-testid="footer"
    >
      <div className="max-w-[1280px] mx-auto">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link to="/" className="no-underline">
              <span className="font-[var(--font-head)] font-bold text-2xl text-[var(--text)]">
                EV
                <span className="text-[var(--accent)] italic">
                  Junctions
                </span>
              </span>
            </Link>

            <p className="text-[var(--text2)] text-sm mt-4 max-w-[400px] leading-relaxed">
              India's premier EV platform connecting electric vehicle owners with charging stations,
              marketplace, and trip planning tools. Join the electric revolution today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[var(--font-head)] font-bold text-sm text-[var(--text)] mb-4">
              Quick Links
            </h3>

            <ul className="list-none flex flex-col gap-2.5">
              {[
                { to: '/chargers', label: 'Find Chargers' },
                { to: '/marketplace', label: 'EV Marketplace' },
                { to: '/hotels', label: 'EV Hotels' },
                { to: '/trip-planner', label: 'Trip Planner' },
                { to: '/sell', label: 'Sell Your EV' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[var(--text2)] no-underline text-sm hover:text-[var(--accent)] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-[var(--font-head)] font-bold text-sm text-[var(--text)] mb-4">
              Contact
            </h3>

            <ul className="list-none flex flex-col gap-2.5">
              <li>
                <a
                  href="mailto:hello@evjunctions.in"
                  className="text-[var(--text2)] no-underline text-sm hover:text-[var(--accent)] transition-colors duration-200"
                >
                  hello@evjunctions.in
                </a>
              </li>

              <li>
                <a
                  href="tel:+911234567890"
                  className="text-[var(--text2)] no-underline text-sm hover:text-[var(--accent)] transition-colors duration-200"
                >
                  +91 12345 67890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <p className="text-[var(--text3)] text-[13px]">
            © {new Date().getFullYear()} EVJunctions. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-[var(--text3)] text-[13px] no-underline hover:text-[var(--accent)] transition-colors duration-200"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="text-[var(--text3)] text-[13px] no-underline hover:text-[var(--accent)] transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;