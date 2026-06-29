// Tiny in-memory cache for read-heavy public lists. Survives client-side
// navigation (module scope) but is reset on page reload. Use it for data that
// changes rarely and is allowed to be a few seconds stale.
//
// Each entry: { data, ts }. Reads that are within TTL are "fresh" → returned
// directly. Reads that are older are still served but flagged stale so callers
// can show them immediately and re-fetch in the background.

const DEFAULT_TTL_MS = 60 * 1000  // 1 minute

const store = new Map()  // key → { data, ts }

export function readCache(key) {
  const entry = store.get(key)
  if (!entry) return null
  return entry
}

export function writeCache(key, data) {
  store.set(key, { data, ts: Date.now() })
}

export function isFresh(entry, ttl = DEFAULT_TTL_MS) {
  return entry && Date.now() - entry.ts < ttl
}

export function invalidate(key) {
  store.delete(key)
}

export function clearAll() {
  store.clear()
}
