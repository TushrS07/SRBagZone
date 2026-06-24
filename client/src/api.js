import { clearUser } from './userAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const finalHeaders = { ...headers }
  let payload = body
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
    credentials: 'include', // HttpOnly auth cookie travels here
  })

  if (res.status === 401) {
    clearUser()
  }

  if (!res.ok) {
    let detail
    try {
      detail = await res.json()
    } catch {
      detail = await res.text()
    }
    const message =
      detail?.detail?.message || detail?.detail || detail?.message || res.statusText
    const error = new Error(message)
    error.status = res.status
    error.detail = detail
    throw error
  }

  if (res.status === 204) return null
  return res.json()
}

// Normalize a backend product into the shape the UI components consume.
export function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    stock: p.stock_quantity ?? 0,
    stock_quantity: p.stock_quantity ?? 0,
    is_active: p.is_active,
    // category/brand exposed both as id and name for the UI
    category: p.category_name,
    category_id: p.category_id,
    category_name: p.category_name,
    brand: p.brand_name,
    brand_id: p.brand_id,
    brand_name: p.brand_name,
    // Image: prefer the legacy image_url, else first item in images[]
    image: p.image_url || (p.images?.[0]?.url ?? ''),
    image_url: p.image_url,
    images: p.images || [],
    media: p.images || [], // backward compat alias
    created_at: p.created_at,
    updated_at: p.updated_at,
    // Legacy/no-op fields the old UI referenced — keep undefined to avoid crashes
    rating: 0,
    reviews: 0,
    badge: undefined,
    was: undefined,
  }
}

function qs(params) {
  const cleaned = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return cleaned.length ? `?${new URLSearchParams(cleaned).toString()}` : ''
}

export const api = {
  // ── Auth (unified) ────────────────────────────────────────────────────
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (body) =>
    request('/api/auth/register', { method: 'POST', body }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  verifyEmail: (token) =>
    request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: () =>
    request('/api/auth/resend-verification', { method: 'POST' }),
  forgotPassword: (email) =>
    request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, new_password) =>
    request('/api/auth/reset-password', { method: 'POST', body: { token, new_password } }),

  // ── Public products ───────────────────────────────────────────────────
  listProducts: async (params = {}) => {
    const data = await request(`/api/products${qs(params)}`)
    return data.map(normalizeProduct)
  },
  getProduct: async (id) => normalizeProduct(await request(`/api/products/${id}`)),

  // ── Categories / brands (public reads) ────────────────────────────────
  listCategories: () => request('/api/categories'),
  listBrands: () => request('/api/brands'),

  // ── Addresses ─────────────────────────────────────────────────────────
  listMyAddresses: () => request('/api/addresses/me'),
  createAddress: (body) => request('/api/addresses', { method: 'POST', body }),
  updateAddress: (id, body) => request(`/api/addresses/${id}`, { method: 'PUT', body }),
  deleteAddress: (id) => request(`/api/addresses/${id}`, { method: 'DELETE' }),

  // ── Orders ────────────────────────────────────────────────────────────
  placeOrder: (body) => request('/api/orders', { method: 'POST', body }),
  getOrder: (id) => request(`/api/orders/${id}`),
  listMyOrders: () => request('/api/orders/me'),

  // ── Payment (customer-side) ───────────────────────────────────────────
  submitPayment: (orderId, file, upi_reference_number) => {
    const fd = new FormData()
    fd.append('screenshot', file)
    if (upi_reference_number) fd.append('upi_reference_number', upi_reference_number)
    return request(`/api/orders/${orderId}/payment`, { method: 'POST', body: fd })
  },

  // ── Admin: products ───────────────────────────────────────────────────
  adminListProducts: async () => {
    const data = await request('/api/admin/products')
    return data.map(normalizeProduct)
  },
  adminCreateProduct: (formData) =>
    request('/api/admin/products', { method: 'POST', body: formData }),
  adminUpdateProduct: (id, formData) =>
    request(`/api/admin/products/${id}`, { method: 'PUT', body: formData }),
  adminToggleProduct: (id) =>
    request(`/api/admin/products/${id}/toggle`, { method: 'PATCH' }),
  adminDeleteProduct: (id) =>
    request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  adminDeleteProductImage: (productId, imageId) =>
    request(`/api/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' }),

  // ── Admin: categories ─────────────────────────────────────────────────
  adminCreateCategory: (body) => request('/api/categories', { method: 'POST', body }),
  adminUpdateCategory: (id, body) =>
    request(`/api/categories/${id}`, { method: 'PUT', body }),
  adminDeleteCategory: (id) =>
    request(`/api/categories/${id}`, { method: 'DELETE' }),

  // ── Admin: brands ─────────────────────────────────────────────────────
  adminCreateBrand: (formData) =>
    request('/api/brands', { method: 'POST', body: formData }),
  adminUpdateBrand: (id, body) =>
    request(`/api/brands/${id}`, { method: 'PUT', body }),
  adminDeleteBrand: (id) =>
    request(`/api/brands/${id}`, { method: 'DELETE' }),

  // ── Admin: orders ─────────────────────────────────────────────────────
  adminListOrders: () => request('/api/admin/orders'),
  adminUpdateOrderStatus: (id, order_status) =>
    request(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { order_status } }),
  adminDeleteOrder: (id) =>
    request(`/api/admin/orders/${id}`, { method: 'DELETE' }),

  // ── Admin: payments ───────────────────────────────────────────────────
  adminConfirmPayment: (id, remarks) =>
    request(`/api/admin/payments/${id}/confirm`, { method: 'PATCH', body: { remarks } }),
  adminRejectPayment: (id, remarks) =>
    request(`/api/admin/payments/${id}/reject`, { method: 'PATCH', body: { remarks } }),

  health: () => request('/api/health'),
}
