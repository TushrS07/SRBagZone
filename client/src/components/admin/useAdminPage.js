import { useEffect, useRef } from 'react'
import { useAdminUI } from './adminUI'

// Lets an admin page declare what the AdminLayout topbar should show.
// Call with { title, subtitle, right } — the `right` slot is re-applied on
// every render so live values (counts, status pills) update naturally.
export function useAdminPage({ title, subtitle, right }) {
  const { setHeader } = useAdminUI()
  const titleRef = useRef(title)
  const subtitleRef = useRef(subtitle)

  // Update title/subtitle only when they actually change (string identity).
  useEffect(() => {
    titleRef.current = title
    subtitleRef.current = subtitle
    setHeader((h) => ({ ...h, title, subtitle }))
  }, [title, subtitle, setHeader])

  // The right slot can be a node that changes every render — apply unconditionally.
  useEffect(() => {
    setHeader((h) => ({ ...h, right }))
  }, [right, setHeader])
}
