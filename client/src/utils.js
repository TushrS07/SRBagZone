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
