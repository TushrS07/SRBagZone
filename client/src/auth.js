// Backward-compat shim — admin auth is now part of unified userAuth.
import { getUser, clearUser } from './userAuth'

export function isAuthenticated() {
  return getUser()?.role === 'admin'
}
export function setAdminSession() {
  // no-op: setting the user via userAuth.setUserAuth happens in login pages
}
export function clearToken() {
  clearUser()
}
export function getToken() {
  return ''
}
export function setToken() {}
