import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import { clearUser } from '../userAuth'
import MobileMenu from './MobileMenu'
import SearchOverlay from './SearchOverlay'

export default function Header() {
  const { cartCount, setCartOpen, setToast } = useApp()
  const user = useUser()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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
    <header className="sticky top-0 z-40 bg-bg border-b border-line shadow-sm">
      <div className="max-w-[1240px] mx-auto px-7 py-4 flex items-center justify-between gap-6 max-lg:px-[22px] max-lg:py-[14px] max-sm:px-[14px] max-sm:py-3 max-sm:gap-2">
        {/* Hamburger — hidden on desktop, shown on phones */}
        <button
          type="button"
          className="hidden max-sm:inline-flex flex-col justify-center gap-1 w-10 h-10 px-2 py-[10px] bg-transparent rounded-lg"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <span className="block h-0.5 w-full bg-ink rounded-sm" />
          <span className="block h-0.5 w-full bg-ink rounded-sm" />
          <span className="block h-0.5 w-full bg-ink rounded-sm" />
        </button>

        <Link
          to="/"
          className="flex items-center gap-[10px] font-serif text-[26px] tracking-[0.5px] font-semibold text-ink whitespace-nowrap shrink-0 min-w-0 max-sm:text-[18px] max-sm:shrink"
          aria-label="SR Bagz Zone home"
        >
          {/* <span className="w-9 h-9 rounded-[10px] bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-[#ffffff] grid place-items-center font-serif font-bold text-[18px] shrink-0 max-sm:w-[30px] max-sm:h-[30px] max-sm:text-[14px]">
            SR
          </span> */}
          <img src="/sr-logo.png" alt="SR Bagz Zone" className="w-9 h-9 rounded-[10px] shrink-0 max-sm:w-[30px] max-sm:h-[30px]" />
          <span className="min-w-0 truncate max-sm:text-[17px] max-xs:hidden">
            SR Bagz <span className="text-accent">Zone</span>
          </span>
        </Link>

        <nav
          className="flex gap-7 max-lg:gap-5 max-tablet:gap-[14px] max-sm:hidden"
          aria-label="Primary"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `no-underline text-[14.5px] font-medium tracking-[0.4px] uppercase transition-colors duration-200 max-tablet:text-[13px] ${isActive ? 'text-accent' : 'text-ink-soft hover:text-accent'}`
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/handbags"
            className={({ isActive }) =>
              `no-underline text-[14.5px] font-medium tracking-[0.4px] uppercase transition-colors duration-200 max-tablet:text-[13px] ${isActive ? 'text-accent' : 'text-ink-soft hover:text-accent'}`
            }
          >
            Handbags
          </NavLink>
          <NavLink
            to="/backpacks"
            className={({ isActive }) =>
              `no-underline text-[14.5px] font-medium tracking-[0.4px] uppercase transition-colors duration-200 max-tablet:text-[13px] ${isActive ? 'text-accent' : 'text-ink-soft hover:text-accent'}`
            }
          >
            Backpacks
          </NavLink>
          <NavLink
            to="/school"
            className={({ isActive }) =>
              `no-underline text-[14.5px] font-medium tracking-[0.4px] uppercase transition-colors duration-200 max-tablet:text-[13px] ${isActive ? 'text-accent' : 'text-ink-soft hover:text-accent'}`
            }
          >
            School
          </NavLink>
          <NavLink
            to="/travel"
            className={({ isActive }) =>
              `no-underline text-[14.5px] font-medium tracking-[0.4px] uppercase transition-colors duration-200 max-tablet:text-[13px] ${isActive ? 'text-accent' : 'text-ink-soft hover:text-accent'}`
            }
          >
            Travel
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `no-underline text-[14.5px] font-medium tracking-[0.4px] uppercase transition-colors duration-200 max-tablet:text-[13px] ${isActive ? 'text-accent' : 'text-ink-soft hover:text-accent'}`
            }
          >
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-[14px] max-sm:gap-1.5 max-sm:flex-1 max-sm:min-w-0 max-sm:justify-end">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="grid place-items-center w-10 h-10 rounded-full text-ink-soft transition-colors hover:text-accent-deep hover:bg-surface shrink-0"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          {user ? (
            <div className="relative shrink-0">
              <button
                type="button"
                className="px-[14px] py-2 bg-bg border border-line rounded-full text-[14px] font-semibold text-ink cursor-pointer hover:bg-surface shrink-0 max-sm:w-10 max-sm:h-10 max-sm:p-0 max-sm:grid max-sm:place-items-center"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                <span className="max-sm:hidden">Hi, {user.name.split(' ')[0]} ▾</span>
                <svg className="hidden max-sm:block" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-surface border border-line rounded-md shadow-md p-3 flex flex-col gap-2 z-20 max-sm:min-w-[240px] max-sm:max-w-[calc(100vw-28px)]"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex flex-col px-[6px] py-2 border-b border-line">
                    <strong className="text-[14px] text-ink">{user.name}</strong>
                    <span className="text-[12px] text-muted">{user.email}</span>
                  </div>
                  {isAdmin ? (
                    <Link
                      to="/admin/products"
                      className="px-[10px] py-2 rounded-lg text-[14px] font-medium text-left bg-transparent text-ink-soft hover:bg-bg hover:text-ink"
                    >
                      Admin panel
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/account"
                        className="px-[10px] py-2 rounded-lg text-[14px] font-medium text-left bg-transparent text-ink-soft hover:bg-bg hover:text-ink"
                      >
                        My account
                      </Link>
                      <Link
                        to="/my-orders"
                        className="px-[10px] py-2 rounded-lg text-[14px] font-medium text-left bg-transparent text-ink-soft hover:bg-bg hover:text-ink"
                      >
                        My orders
                      </Link>
                      <Link
                        to="/addresses"
                        className="px-[10px] py-2 rounded-lg text-[14px] font-medium text-left bg-transparent text-ink-soft hover:bg-bg hover:text-ink"
                      >
                        My addresses
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="px-[10px] py-2 rounded-lg text-[14px] font-medium text-left bg-transparent text-ink-soft hover:bg-bg hover:text-ink"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop: text sign-in / sign-up buttons */}
              <div className="flex items-center gap-3 text-[14px] max-sm:hidden">
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="px-[14px] py-2 border border-ink rounded-full text-ink font-semibold transition-colors duration-200 hover:bg-ink hover:text-[#ffffff]"
                  >
                    Sign in
                  </Link>
                )}
                {location.pathname !== '/signup' && (
                  <Link
                    to="/signup"
                    className="px-[14px] py-2 border border-ink rounded-full text-ink font-semibold transition-colors duration-200 hover:bg-ink hover:text-[#ffffff]"
                  >
                    Sign up
                  </Link>
                )}
              </div>
              {/* Phone: compact account icon → sign in */}
              <Link
                to="/login"
                aria-label="Sign in"
                className="hidden max-sm:grid place-items-center w-10 h-10 rounded-full bg-bg border border-line text-ink shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </>
          )}
          {!isAdmin && (
            <button
              type="button"
              className="inline-flex items-center gap-[10px] px-[18px] py-[10px] rounded-full bg-ink text-[#ffffff] text-[14px] font-semibold transition-all duration-[180ms] hover:bg-accent-deep hover:-translate-y-px shrink-0 max-sm:gap-[6px] max-sm:text-[13px] max-sm:h-10 max-sm:px-[14px]"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart with ${cartCount} items`}
            >
              <span className="max-sm:hidden">Cart</span>
              <svg className="hidden max-sm:block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="inline-grid place-items-center bg-accent text-[#ffffff] min-w-[22px] h-[22px] rounded-full text-[12px] font-bold px-[6px]">
                {cartCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
