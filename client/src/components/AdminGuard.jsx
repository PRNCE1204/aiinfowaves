/**
 * AdminGuard.jsx
 * ─────────────────────────────────────────────────────────────
 * Protects admin-only routes.
 * Reads adminToken from localStorage.
 * If missing or expired, redirects to the regular /login page.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(base64))
  } catch {
    return null
  }
}

export default function AdminGuard({ children }) {
  const navigate = useNavigate()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')

    if (!token) {
      // Redirect to regular login page
      navigate('/login', { replace: true, state: { from: '/admin/dashboard' } })
      return
    }

    const decoded = parseJwt(token)
    if (!decoded) {
      localStorage.removeItem('adminToken')
      navigate('/login', { replace: true, state: { from: '/admin/dashboard' } })
      return
    }

    // Check expiry
    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now()
    if (isExpired) {
      localStorage.removeItem('adminToken')
      navigate('/login', { replace: true, state: { from: '/admin/dashboard' } })
      return
    }

    setAllowed(true)
  }, [navigate])

  if (!allowed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07071a',
      }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return children
}
