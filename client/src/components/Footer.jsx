import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            SR Bag <span>Zone</span>
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
            <li><a href="#">Contact</a></li>
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
        © {new Date().getFullYear()} SR Bag Zone. All rights reserved.
      </div>
    </footer>
  )
}
