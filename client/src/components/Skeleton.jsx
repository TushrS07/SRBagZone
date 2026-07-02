/**
 * A single shimmer placeholder block. Give it a size via `className`
 * (e.g. "h-5 w-3/4"). Used to replace "Loading…" text so content areas
 * keep their shape while data loads (no layout shift, no spinner text).
 */
export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <span className={`skeleton block ${rounded} ${className}`} aria-hidden="true" />
}
