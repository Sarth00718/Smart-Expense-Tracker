import React, { createContext, useState, useContext, useEffect, useMemo, useCallback, useRef } from 'react'
import { authService } from '../services/authService'
import { firebaseAuth } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage first (synchronous — fastest path)
        const storedUser = authService.getCurrentUser()
        const authMethod = authService.getAuthMethod()
        const storedToken = localStorage.getItem('token')

        if (storedUser && storedToken) {
          setUser(storedUser)
          setLoading(false)

          // Only set up Firebase listener if this user actually uses Firebase
          if (authMethod === 'firebase') {
            unsubscribeRef.current = setupFirebaseListener()
          }
          return
        }

        // No stored session — show login immediately
        setLoading(false)

        // Only bother with Firebase redirect result if the auth method was Firebase
        if (authMethod === 'firebase') {
          firebaseAuth.handleRedirectResult()
            .then(result => {
              if (result) {
                localStorage.setItem('token', result.token)
                localStorage.setItem('user', JSON.stringify(result.user))
                localStorage.setItem('authMethod', 'firebase')
                setUser(result.user)
              }
              unsubscribeRef.current = setupFirebaseListener()
            })
            .catch(() => {
              unsubscribeRef.current = setupFirebaseListener()
            })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    const setupFirebaseListener = () => {
      // Guard: don't set up duplicate listeners
      if (unsubscribeRef.current) return unsubscribeRef.current

      return firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken()
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName,
              picture: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified
            }
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('authMethod', 'firebase')
            setUser(userData)
          } catch (error) {
            console.error('Firebase token refresh error:', error)
          }
        } else {
          const currentMethod = localStorage.getItem('authMethod')
          if (currentMethod === 'firebase') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('authMethod')
            setUser(null)
          }
        }
      })
    }

    initializeAuth()

    // Listen for 401 unauthorized events dispatched by api.js interceptor
    const handleUnauthorized = () => {
      setUser(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    const data = await authService.register(email, password, fullName)
    setUser(data.user)
    return data
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const data = await authService.loginWithGoogle()
    if (data) {
      setUser(data.user)
    }
    return data
  }, [])

  const logout = useCallback(async () => {
    // Clean up Firebase listener before logout
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    setUser
  }), [user, loading, login, register, loginWithGoogle, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
