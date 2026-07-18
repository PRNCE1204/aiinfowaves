/**
 * GoogleCallbackPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Handles the redirect from Google OAuth.
 * Extracts the JWT token from URL params, stores it,
 * then redirects — to /admin/dashboard if admin, else home.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token   = searchParams.get('token')
    const name    = searchParams.get('name')
    const email   = searchParams.get('email')
    const error   = searchParams.get('error')
    const isAdmin = searchParams.get('isAdmin') === 'true'

    if (error || !token) {
      navigate('/login?error=google_auth_failed')
      return
    }

    // Store regular user token + info
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ name, email }))

    if (isAdmin) {
      // Admin Google login — get a proper adminToken from the backend
      // by calling the admin login endpoint with a special Google flag
      // We store a lightweight adminToken using the regular token + admin flag
      // The backend already confirmed this email is admin via ADMIN_EMAIL env
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminEmail', email)
      navigate('/admin/dashboard', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07071a',
      fontFamily: 'Inter, sans-serif',
      flexDirection: 'column',
      gap: '16px',
      color: '#a5b4fc',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(99,102,241,0.2)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p>Signing you in with Google...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
