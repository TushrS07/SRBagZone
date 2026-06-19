import { useEffect, useMemo, useState } from 'react'

const PRODUCTS = [
  {
    id: 1,
    name: 'Aspen Leather Tote',
    category: 'Handbags',
    price: 3999,
    was: 4999,
    rating: 4.8,
    reviews: 124,
    badge: 'Bestseller',
    image:
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Trailhead 30L Backpack',
    category: 'Backpacks',
    price: 2499,
    rating: 4.7,
    reviews: 312,
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Junior Pack Pro',
    category: 'School Bags',
    price: 999,
    was: 1399,
    rating: 4.6,
    reviews: 421,
    badge: 'Sale',
    image:
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Meridian Laptop Brief',
    category: 'Laptop Bags',
    price: 2999,
    rating: 4.9,
    reviews: 88,
    image:
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    name: 'Voyage Weekend Duffel',
    category: 'Travel',
    price: 3499,
    rating: 4.5,
    reviews: 56,
    image:
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    name: 'Lila Crossbody Mini',
    category: 'Handbags',
    price: 1799,
    rating: 4.7,
    reviews: 219,
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 7,
    name: 'Campus Classic Backpack',
    category: 'School Bags',
    price: 1299,
    rating: 4.4,
    reviews: 503,
    image:
      'https://images.unsplash.com/photo-1564422170194-896b89110ef8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8,
    name: 'Atlas Carryall Backpack',
    category: 'Backpacks',
    price: 2799,
    was: 3499,
    rating: 4.6,
    reviews: 174,
    badge: 'Sale',
    image:
      'https://images.unsplash.com/photo-1622560480654-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 9,
    name: 'Noir Quilted Shoulder',
    category: 'Handbags',
    price: 4499,
    rating: 4.9,
    reviews: 67,
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 10,
    name: 'Globetrotter 45L Roller',
    category: 'Travel',
    price: 4799,
    rating: 4.6,
    reviews: 91,
    image:
      'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 11,
    name: 'Executive Slim Folio',
    category: 'Laptop Bags',
    price: 3499,
    rating: 4.8,
    reviews: 132,
    image:
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 12,
    name: 'Stella Top Handle',
    category: 'Handbags',
    price: 4199,
    was: 5299,
    rating: 4.7,
    reviews: 188,
    badge: 'Sale',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  },
]

const CATEGORIES = ['All', 'Handbags', 'Backpacks', 'School Bags', 'Laptop Bags', 'Travel']

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f4e6d2"/><text x="50%25" y="50%25" font-family="serif" font-size="22" fill="%238a531c" text-anchor="middle" dy=".3em">Bag</text></svg>'

const inrFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const formatINR = (n) => inrFmt.format(n)

const FREE_SHIPPING_THRESHOLD = 2000
const SHIPPING_FEE = 99

function Stars({ rating }) {
  const full = Math.round(rating)
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  )
}

function ProductCard({ product, onAdd, justAdded }) {
  const handleImgError = (e) => {
    e.currentTarget.src = FALLBACK_IMG
  }
  return (
    <article className="product-card">
      <div className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" onError={handleImgError} />
        {product.badge && (
          <span className={`product-badge ${product.badge === 'Sale' ? 'sale' : ''}`}>
            {product.badge}
          </span>
        )}
        <button className="product-fav" aria-label="Save to wishlist" type="button">
          ♡
        </button>
      </div>
      <div className="product-info">
        <span className="product-cat">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <Stars rating={product.rating} />
          <span>({product.reviews})</span>
        </div>
        <div className="product-foot">
          <div className="price">
            <span className="price-now">{formatINR(product.price)}</span>
            {product.was && <span className="price-was">{formatINR(product.was)}</span>}
          </div>
          <button
            type="button"
            className={`add-btn ${justAdded ? 'added' : ''}`}
            onClick={() => onAdd(product)}
          >
            {justAdded ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [filter, setFilter] = useState('All')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState(null)
  const [toast, setToast] = useState('')

  const filtered = useMemo(
    () => (filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)),
    [filter]
  )

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0)
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setRecentlyAdded(product.id)
    setToast(`${product.name} added to cart`)
  }

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    )
  }

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  useEffect(() => {
    if (!recentlyAdded) return
    const t = setTimeout(() => setRecentlyAdded(null), 1400)
    return () => clearTimeout(t)
  }, [recentlyAdded])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand" aria-label="SR Bag Zone home">
            <span className="brand-mark">SR</span>
            <span className="brand-name">
              SR Bag <span>Zone</span>
            </span>
          </a>
          <nav className="nav" aria-label="Primary">
            <a href="#shop">Shop</a>
            <a href="#shop">Handbags</a>
            <a href="#shop">Backpacks</a>
            <a href="#shop">School</a>
            <a href="#shop">Travel</a>
          </nav>
          <button
            type="button"
            className="cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart with ${cartCount} items`}
          >
            <span>Cart</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-card">
            <div className="hero-text">
              <span className="hero-eyebrow">Summer Drop · 2026</span>
              <h1 className="hero-title">
                Bags built for <em>every journey.</em>
              </h1>
              <p className="hero-sub">
                Handcrafted leather totes, sturdy school packs, and travel-ready
                duffels. Free shipping on orders over ₹2,000.
              </p>
              <div className="hero-actions">
                <a href="#shop" className="btn btn-primary">
                  Shop the Collection
                </a>
                <a href="#shop" className="btn btn-ghost">
                  View New Arrivals
                </a>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80"
                alt="Featured handbag"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Customer benefits">
          <div className="trust-item">
            <span className="trust-icon">⛟</span>
            <div>
              <strong>Free Shipping</strong>
              On orders over ₹2,000
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">↺</span>
            <div>
              <strong>30-Day Returns</strong>
              Easy & hassle-free
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">★</span>
            <div>
              <strong>2-Year Warranty</strong>
              Built to last
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">♥</span>
            <div>
              <strong>Loved by 50k+</strong>
              4.8/5 average rating
            </div>
          </div>
        </section>

        <section className="section" id="shop">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured Bags</h2>
              <p className="section-sub">
                Hand-picked styles for school, work, and weekend escapes.
              </p>
            </div>
            <div className="filter-bar" role="tablist" aria-label="Filter by category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={filter === cat}
                  className={`filter-pill ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={addToCart}
                justAdded={recentlyAdded === p.id}
              />
            ))}
          </div>
        </section>

        <section className="newsletter">
          <div className="newsletter-card">
            <div>
              <h3>Get 10% off your first order</h3>
              <p>
                Join our newsletter for new arrivals, restock alerts, and
                members-only deals.
              </p>
            </div>
            <form
              className="subscribe"
              onSubmit={(e) => {
                e.preventDefault()
                setToast('Thanks! Check your inbox for the code.')
                e.currentTarget.reset()
              }}
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                aria-label="Email address"
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              SR Bag <span>Zone</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Thoughtfully designed bags for the modern explorer, student, and
              professional.
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
              <li><a href="#shop">Handbags</a></li>
              <li><a href="#shop">Backpacks</a></li>
              <li><a href="#shop">School Bags</a></li>
              <li><a href="#shop">Laptop Bags</a></li>
              <li><a href="#shop">Travel</a></li>
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
              <li><a href="#">Press</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 SR Bag Zone. All rights reserved.
        </div>
      </footer>

      {/* Cart drawer */}
      <div
        className={`drawer-overlay ${cartOpen ? 'open' : ''}`}
        onClick={() => setCartOpen(false)}
        aria-hidden={!cartOpen}
      />
      <aside
        className={`drawer ${cartOpen ? 'open' : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!cartOpen}
      >
        <div className="drawer-head">
          <h3>Your Cart ({cartCount})</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Browse our collection to find your next favorite bag.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />
                <div className="cart-item-info">
                  <div>
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-cat">{item.category}</div>
                  </div>
                  <div className="qty" aria-label="Quantity">
                    <button type="button" onClick={() => changeQty(item.id, -1)} aria-label="Decrease">−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => changeQty(item.id, 1)} aria-label="Increase">+</button>
                  </div>
                </div>
                <div className="cart-item-side">
                  <div className="cart-item-price">{formatINR(item.price * item.qty)}</div>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <button
              type="button"
              className="checkout-btn"
              onClick={() => setToast('Checkout demo — order placed!')}
            >
              Checkout · {formatINR(total)}
            </button>
          </div>
        )}
      </aside>

      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        <span className="toast-check">✓</span>
        {toast}
      </div>
    </>
  )
}
