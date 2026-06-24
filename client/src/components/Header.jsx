import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import { clearUser } from '../userAuth'

export default function Header() {
  const { cartCount, setCartOpen, setToast } = useApp()
  const user = useUser()
  const isAdmin = user && user.role === 'admin'
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // best-effort cookie clear
    }
    clearUser()
    setMenuOpen(false)
    setToast('Signed out')
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="SR Bag Zone home">
          <span className="brand-mark">SR</span>
          <span className="brand-name">
            SR Bag <span>Zone</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <NavLink to="/">Shop</NavLink>
          <NavLink to="/?cat=Handbags">Handbags</NavLink>
          <NavLink to="/?cat=Backpacks">Backpacks</NavLink>
          <NavLink to="/?cat=School Bags">School</NavLink>
          <NavLink to="/?cat=Travel">Travel</NavLink>
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
            <span>Cart</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
