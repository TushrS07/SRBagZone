export const FREE_SHIPPING_THRESHOLD = 2000
export const SHIPPING_FEE = 99

export const CATEGORIES = ['All', 'Handbags', 'Backpacks', 'School Bags', 'Laptop Bags', 'Travel']

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f4e6d2"/><text x="50%25" y="50%25" font-family="serif" font-size="22" fill="%238a531c" text-anchor="middle" dy=".3em">Bag</text></svg>'

const inrFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
export const formatINR = (n) => inrFmt.format(n || 0)

/**
 * Ranked, case-insensitive search over a product list. Every whitespace-
 * separated term must appear somewhere (name / category / brand / description);
 * results are ordered by relevance (name matches rank highest).
 */
export function searchProducts(products, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)
  const scored = []
  for (const p of products) {
    const name = (p.name || '').toLowerCase()
    const cat = (p.category || '').toLowerCase()
    const brand = (p.brand || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()
    const haystack = `${name} ${cat} ${brand} ${desc}`
    if (!terms.every((t) => haystack.includes(t))) continue
    let score = 0
    if (name.startsWith(q)) score += 100
    else if (name.includes(q)) score += 60
    if (cat.includes(q)) score += 20
    if (brand.includes(q)) score += 15
    if (desc.includes(q)) score += 5
    scored.push({ p, score })
  }
  scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
  return scored.map((s) => s.p)
}
