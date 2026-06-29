import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'

// Cached in sessionStorage so the badge survives client-side navigation
// without re-hitting the network — and so the previous count shows up
// instantly on the next admin page load instead of flashing 0.
const CACHE_KEY = 'admin:inquiries-unread-count'

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw == null ? null : Number(raw)
  } catch {
    return null
  }
}

function writeCache(n) {
  try { sessionStorage.setItem(CACHE_KEY, String(n)) } catch { /* private mode */ }
}

// One source of truth for the unread-inquiry badge. AdminLayout mounts it
// once. The Inquiries page calls `refresh()` after mark-read / delete so the
// count stays accurate without polling on every navigation.
export function useUnreadInquiries() {
  const [count, setCount] = useState(() => readCache() ?? 0)

  const refresh = useCallback(async () => {
    try {
      const { count: c } = await api.adminUnreadInquiryCount()
      setCount(c)
      writeCache(c)
    } catch {
      // Keep the last-known value rather than flipping to 0 on a transient
      // network blip; the badge isn't critical enough to surface an error.
    }
  }, [])

  // Fetch once on mount. No route-change dependency on purpose.
  // setState happens after the await resolves, not synchronously here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  return { count, refresh }
}
