import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppProvider } from './AppContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import RequireAuth from './components/admin/RequireAuth'
import RequireCustomerAuth from './components/RequireCustomerAuth'
import AdminLayout from './components/admin/AdminLayout'

import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirm from './pages/OrderConfirm'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyOrders from './pages/MyOrders'
import Addresses from './pages/Addresses'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import AdminLogin from './pages/admin/Login'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminBrands from './pages/admin/Brands'
import AdminCategories from './pages/admin/Categories'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
          <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
          <Route
            path="/checkout"
            element={
              <PublicLayout>
                <RequireCustomerAuth><Checkout /></RequireCustomerAuth>
              </PublicLayout>
            }
          />
          <Route
            path="/order/:id"
            element={
              <PublicLayout>
                <RequireCustomerAuth><OrderConfirm /></RequireCustomerAuth>
              </PublicLayout>
            }
          />
          <Route
            path="/my-orders"
            element={
              <PublicLayout>
                <RequireCustomerAuth><MyOrders /></RequireCustomerAuth>
              </PublicLayout>
            }
          />
          <Route
            path="/addresses"
            element={
              <PublicLayout>
                <RequireCustomerAuth><Addresses /></RequireCustomerAuth>
              </PublicLayout>
            }
          />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
          <Route path="/verify-email" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          {/* 404 → home */}
          <Route path="*" element={<PublicLayout><Home /></PublicLayout>} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
