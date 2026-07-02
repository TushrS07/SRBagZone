import { useState } from 'react'
import { FALLBACK_IMG } from '../utils'

/**
 * Image with a shimmer skeleton + lazy loading, wrapped in a box that reserves
 * space so images never cause layout shift (CLS).
 *
 * - `className` styles the WRAPPER — give it the reserved size (e.g.
 *   "w-[78px] h-[78px] rounded-[10px]" or "absolute inset-0"). The wrapper is
 *   always position:relative and clips overflow.
 * - `imgClassName` styles the <img> itself (object-fit, hover transforms, …).
 * - `eager` opts out of lazy loading for above-the-fold / LCP images.
 *
 * The skeleton overlays the image and fades out on load, so the <img> keeps its
 * own transitions (e.g. hover scale) without conflict.
 */
export default function SmartImage({
  src,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  eager = false,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <img
        src={errored ? FALLBACK_IMG : src || FALLBACK_IMG}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true)
          setLoaded(true)
        }}
        className={imgClassName}
        {...rest}
      />
      <span
        className={`img-skeleton absolute inset-0 transition-opacity duration-500 ${
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
      />
    </span>
  )
}
