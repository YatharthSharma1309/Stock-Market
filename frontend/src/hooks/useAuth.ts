import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function useAuth() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const payload = token ? parseJwt(token) : null
  const isAuthenticated = !!token && !!payload && payload.exp * 1000 > Date.now()

  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    navigate('/login')
  }, [navigate])

  return { token, payload, isAuthenticated, login, logout }
}
