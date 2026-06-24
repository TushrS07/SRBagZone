// Single unified auth — both customer and admin use the same /api/auth/* endpoints.
// The JWT lives in an HttpOnly cookie set by the server; localStorage holds only
// the user profile for UI display (name, role, etc.).

const PROFILE_KEY = 'srbag_user'
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

export function setUserAuth(user) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(EVENT))
}

export function clearUser() {
  localStorage.removeItem(PROFILE_KEY)
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
