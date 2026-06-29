// Single unified auth — both customer and admin use the same /api/auth/* endpoints.
// Two storage layers:
//   • Backend sets an HttpOnly cookie (works same-origin, in prod behind HTTPS).
//   • Frontend ALSO stores the token in localStorage so the API client can send
//     it as a Bearer header. This fallback is essential for cross-origin dev
//     (e.g. localhost:5173 → 192.168.1.11:8000 from a LAN-shared dev server).
//
// localStorage tokens are XSS-readable; treat that as a dev-only trade-off.

const PROFILE_KEY = 'srbag_user'
const TOKEN_KEY = 'srbag_token'
const EVENT = 'srbag-auth-change'

export function getUser() {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setUserAuth(user, token) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user))
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  window.dispatchEvent(new Event(EVENT))
}

export function clearUser() {
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function isLoggedIn() {
  return Boolean(getUser())
}

export function isAdmin() {
  return getUser()?.role === 'admin'
}

export function isCustomer() {
  return getUser()?.role === 'customer'
}

export function onAuthChange(cb) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
