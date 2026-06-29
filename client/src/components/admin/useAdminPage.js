import { useEffect, useRef } from 'react'
import { useAdminUI } from './adminUI'

// Lets an admin page declare what the AdminLayout topbar should show, plus
// register an `onRefresh` callback that the global topbar Refresh button
// wires to. `onRefresh` is expected to *bypass* the cache and refetch.
export function useAdminPage({ title, subtitle, right, onRefresh }) {
  const { setHeader, registerRefresh } = useAdminUI()
  const titleRef = useRef(title)
  const subtitleRef = useRef(subtitle)

  useEffect(() => {
    titleRef.current = title
    subtitleRef.current = subtitle
    setHeader((h) => ({ ...h, title, subtitle }))
  }, [title, subtitle, setHeader])

  useEffect(() => {
    setHeader((h) => ({ ...h, right }))
  }, [right, setHeader])

  // Register on mount, deregister on unmount. The Refresh button hides
  // automatically when no page has supplied a refresher.
  useEffect(() => {
    if (!onRefresh) return undefined
    registerRefresh(() => onRefresh)
    return () => registerRefresh(() => null)
  }, [onRefresh, registerRefresh])
}
