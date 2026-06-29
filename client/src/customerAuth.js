// Backward-compat shim — customer auth is now part of unified userAuth.
import { getUser, setUserAuth, clearUser } from './userAuth'

export function getCustomer() {
  const u = getUser()
  return u && u.role === 'customer' ? u : (u ? u : null)
}

export function setCustomerAuth(_token, profile) {
  setUserAuth(profile)
}

export function updateCustomerProfile(profile) {
  setUserAuth(profile)
}

export function clearCustomer() {
  clearUser()
}

export function getCustomerToken() {
  return getCustomer() ? 'cookie' : ''
}

export function onCustomerChange(cb) {
  const handler = () => cb()
  window.addEventListener('srbag-auth-change', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('srbag-auth-change', handler)
    window.removeEventListener('storage', handler)
  }
}
