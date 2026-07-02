import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delay`ms have
 * passed without `value` changing. Used to avoid re-filtering / re-rendering /
 * navigating on every keystroke while searching.
 */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
