import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            SR Bagz <span>Zone</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Thoughtfully designed bags for the modern explorer, student, and professional.
          </p>
          <div className="footer-contact">
            <span className="footer-contact-label">Need help? Call us</span>
            <a href="tel:+918890308955" className="footer-contact-num">
              +91 88903 08955
            </a>
          </div>
          <address className="footer-address">
            Sangria Road, Hanumangarh Jn.<br />
            Hanumangarh, Rajasthan 335512
          </address>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/sr_bag_zone_/"
              target="_blank"
              rel="noreferrer"
              aria-label="SR Bagz Zone on Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span>@sr_bag_zone_</span>
            </a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/?cat=Handbags">Handbags</Link></li>
            <li><Link to="/?cat=Backpacks">Backpacks</Link></li>
            <li><Link to="/?cat=School Bags">School Bags</Link></li>
            <li><Link to="/?cat=Laptop Bags">Laptop Bags</Link></li>
            <li><Link to="/?cat=Travel">Travel</Link></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Careers</a></li>
            <li><Link to="/admin/login">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} SR Bagz Zone. All rights reserved.
      </div>
    </footer>
  )
}
