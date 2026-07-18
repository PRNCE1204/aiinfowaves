import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import GoogleCallbackPage from './pages/GoogleCallbackPage/GoogleCallbackPage'

import ContactPage from './pages/ContactPage/ContactPage'
import CareerPage from './pages/CareerPage/CareerPage'
import ServicesPage from './pages/ServicesPage/ServicesPage'
import OpenProjectCallPage from './pages/OpenProjectCallPage/OpenProjectCallPage'
import InternshipPage from './pages/InternshipPage/InternshipPage'
import InternshipAdminPage from './pages/AdminDashboard/InternshipAdminPage'
import BookingPage from './pages/BookingPage/BookingPage'
import ScrollToTop from './components/ScrollToTop'
import SessionGuard from './components/SessionGuard'

export default function App() {
  return (
    <>
      <ScrollToTop />
      {/* Enforces 1-hour session limit on every route change and tab focus */}
      <SessionGuard />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          {/* Google OAuth callback — no Layout wrapper needed */}
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />

          <Route path="contact" element={<ContactPage />} />
          <Route path="career" element={<CareerPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="open-project-call" element={<OpenProjectCallPage />} />
          <Route path="internship" element={<InternshipPage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="admin/internships" element={<InternshipAdminPage />} />
        </Route>
      </Routes>
    </>
  )
}

