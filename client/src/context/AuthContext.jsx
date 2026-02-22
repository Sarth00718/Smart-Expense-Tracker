import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'
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
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    let unsubscribe = null
    
    const initializeAuth = async () => {
      try {
        // Check localStorage first (fastest) - synchronous
        const storedUser = authService.getCurrentUser()
        const authMethod = authService.getAuthMethod()
        const storedToken = localStorage.getItem('token')

        // If we have stored user and token, use them immediately
        if (storedUser && storedToken) {
          setUser(storedUser)
          setLoading(false) // Set loading false immediately
          setInitialCheckDone(true)

          // Only set up Firebase listener if using Firebase auth (async, non-blocking)
          if (authMethod === 'firebase') {
            setTimeout(() => {
              unsubscribe = setupFirebaseListener()
            }, 0)
          }
          return
        }

        // No stored user - set loading false immediately to show login
        setLoading(false)
        setInitialCheckDone(true)

        // Check for Firebase redirect result in background (only if no stored user)
        if (authMethod === 'firebase') {
          firebaseAuth.handleRedirectResult()
            .then(result => {
              if (result) {
                localStorage.setItem('token', result.token)
                localStorage.setItem('user', JSON.stringify(result.user))
                localStorage.setItem('authMethod', 'firebase')
                setUser(result.user)
                unsubscribe = setupFirebaseListener()
              } else {
                unsubscribe = setupFirebaseListener()
              }
            })
            .catch(error => {
              console.error('Redirect result error:', error)
              unsubscribe = setupFirebaseListener()
            })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
        setInitialCheckDone(true)
      }
    }

    const setupFirebaseListener = () => {
      // Only set up listener once
      if (unsubscribe) return unsubscribe

      return firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in with Firebase
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
            console.error('Firebase token error:', error)
          }
        } else {
          // Only clear if we don't have a backend or biometric user
          const authMethod = localStorage.getItem('authMethod')
          if (authMethod === 'firebase') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('authMethod')
            setUser(null)
          }
        }
        
        setLoading(false)
        setInitialCheckDone(true)
      })
    }

    initializeAuth()

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
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
