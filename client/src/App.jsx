import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { AppProvider } from './AppContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import RequireAuth from './components/admin/RequireAuth'
import RequireCustomerAuth from './components/RequireCustomerAuth'
import AdminLayout from './components/admin/AdminLayout'

import Home from './pages/Home'
import Search from './pages/Search'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirm from './pages/OrderConfirm'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyOrders from './pages/MyOrders'
import Addresses from './pages/Addresses'
import Account from './pages/Account'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Contact from './pages/Contact'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import SizeGuide from './pages/SizeGuide'
import OurStory from './pages/OurStory'
import Sustainability from './pages/Sustainability'
import Careers from './pages/Careers'
const LegalPage = lazy(() => import('./pages/Legal'))

import AdminLogin from './pages/admin/Login'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminBrands from './pages/admin/Brands'
import AdminCategories from './pages/admin/Categories'
import AdminInquiries from './pages/admin/Inquiries'

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
          <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
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
          <Route
            path="/account"
            element={
              <PublicLayout>
                <RequireCustomerAuth><Account /></RequireCustomerAuth>
              </PublicLayout>
            }
          />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
          <Route path="/verify-email" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/shipping" element={<PublicLayout><Shipping /></PublicLayout>} />
          <Route path="/returns" element={<PublicLayout><Returns /></PublicLayout>} />
          <Route path="/size-guide" element={<PublicLayout><SizeGuide /></PublicLayout>} />
          <Route path="/our-story" element={<PublicLayout><OurStory /></PublicLayout>} />
          <Route path="/sustainability" element={<PublicLayout><Sustainability /></PublicLayout>} />
          <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
          <Route path="/legal" element={<PublicLayout><Suspense fallback={null}><LegalPage /></Suspense></PublicLayout>} />
          <Route path="/handbags" element={<PublicLayout><CategoryPage category="Handbags" /></PublicLayout>} />
          <Route path="/backpacks" element={<PublicLayout><CategoryPage category="Backpacks" /></PublicLayout>} />
          <Route path="/school" element={<PublicLayout><CategoryPage category="School Bags" /></PublicLayout>} />
          <Route path="/travel" element={<PublicLayout><CategoryPage category="Travel" /></PublicLayout>} />

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
            <Route path="inquiries" element={<AdminInquiries />} />
          </Route>

          {/* 404 → home */}
          <Route path="*" element={<PublicLayout><Home /></PublicLayout>} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
