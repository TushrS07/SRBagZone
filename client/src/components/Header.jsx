import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import { clearUser } from '../userAuth'
import MobileMenu from './MobileMenu'

export default function Header() {
  const { cartCount, setCartOpen, setToast } = useApp()
  const user = useUser()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    // Closing is a deliberate side effect when the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [location.pathname, location.search])

  const logout = async () => {
    try { await api.logout() } catch { /* best effort */ }
    clearUser()
    setMenuOpen(false)
    setToast('Signed out')
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          type="button"
          className="hamburger"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <span /><span /><span />
        </button>

        <Link to="/" className="brand" aria-label="SR Bagz Zone home">
          <span className="brand-mark">SR</span>
          <span className="brand-name">
            SR Bagz <span>Zone</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/">Shop</NavLink>
          <NavLink to="/?cat=Handbags">Handbags</NavLink>
          <NavLink to="/?cat=Backpacks">Backpacks</NavLink>
          <NavLink to="/?cat=School Bags">School</NavLink>
          <NavLink to="/?cat=Travel">Travel</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="account-menu">
              <button
                type="button"
                className="account-trigger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                Hi, {user.name.split(' ')[0]} ▾
              </button>
              {menuOpen && (
                <div className="account-dropdown" onClick={() => setMenuOpen(false)}>
                  <div className="account-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {isAdmin ? (
                    <Link to="/admin/products" className="account-action">Admin panel</Link>
                  ) : (
                    <>
                      <Link to="/my-orders" className="account-action">My orders</Link>
                      <Link to="/addresses" className="account-action">My addresses</Link>
                    </>
                  )}
                  <button type="button" onClick={logout} className="account-action">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Sign in</Link>
              <Link to="/signup" className="signup-link">Sign up</Link>
            </div>
          )}
          <button
            type="button"
            className="cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart with ${cartCount} items`}
          >
            <span className="cart-btn-label">Cart</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
