import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-20 px-7 pt-[50px] pb-[30px] bg-[#1a1612] text-[#c8bdb1] max-sm:mt-14 max-sm:px-[18px] max-sm:pt-10 max-sm:pb-6">
      <div className="max-w-[1240px] mx-auto grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 max-lg:grid-cols-[1.4fr_1fr_1fr] max-sm:grid-cols-1 max-sm:gap-7">
        <div>
          <div className="font-serif text-[26px] text-white mb-3">
            SR Bagz <span className="text-accent">Zone</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Thoughtfully designed bags for the modern explorers, students, and professionals.
          </p>
          <div className="mt-[18px] flex flex-col gap-1">
            <span className="text-[12px] uppercase tracking-[1.2px] text-muted">
              Need help? Call us
            </span>
            <a
              href="tel:+918890308955"
              className="font-sans text-[22px] text-white! tracking-[0.5px] no-underline font-semibold hover:text-accent!"
            >
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
          <h4 className="text-white text-[14px] uppercase tracking-[1.2px] mt-0 mb-4 font-semibold">Shop</h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
            <li><Link to="/handbags" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Handbags</Link></li>
            <li><Link to="/backpacks" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Backpacks</Link></li>
            <li><Link to="/school" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">School Bags</Link></li>
            <li><Link to="/travel" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Travel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-[14px] uppercase tracking-[1.2px] mt-0 mb-4 font-semibold">Help</h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
            <li><Link to="/shipping" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Shipping</Link></li>
            <li><Link to="/returns" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Returns</Link></li>
            <li><Link to="/contact" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-[14px] uppercase tracking-[1.2px] mt-0 mb-4 font-semibold">Company</h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
            <li><Link to="/our-story" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Our Story</Link></li>
            <li><Link to="/legal" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Privacy Policy</Link></li>
            <li><Link to="/careers" className="text-[#c8bdb1] no-underline text-[14px] transition-colors duration-200 hover:text-accent">Careers</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1240px] mx-auto mt-10 pt-6 border-t border-white/[0.08] text-center text-[13px] text-[#8a7f74]">
        © {new Date().getFullYear()} SR Bagz Zone. All rights reserved.
      </div>
    </footer>
  )
}
