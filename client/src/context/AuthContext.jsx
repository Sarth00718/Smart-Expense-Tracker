import React, { createContext, useState, useContext, useEffect } from 'react'
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
        // Check localStorage first (fastest)
        const storedUser = authService.getCurrentUser()
        const authMethod = authService.getAuthMethod()
        const storedToken = localStorage.getItem('token')

        // If we have stored user and token, use them immediately
        if (storedUser && storedToken) {
          setUser(storedUser)
          setInitialCheckDone(true)

          // Only set up Firebase listener if using Firebase auth
          if (authMethod === 'firebase') {
            setupFirebaseListener()
          } else if (authMethod === 'biometric' || authMethod === 'backend') {
            // Backend or biometric auth - no need for Firebase listener
            setLoading(false)
          } else {
            // Unknown auth method, clear and start fresh
            setLoading(false)
          }
          return
        }

        // Check for Firebase redirect result (only if no stored user)
        if (authMethod === 'firebase') {
          try {
            const result = await firebaseAuth.handleRedirectResult()
            if (result) {
              localStorage.setItem('token', result.token)
              localStorage.setItem('user', JSON.stringify(result.user))
              localStorage.setItem('authMethod', 'firebase')
              setUser(result.user)
              setLoading(false)
              setInitialCheckDone(true)
              setupFirebaseListener()
              return
            }
          } catch (error) {
            console.error('Redirect result error:', error)
          }
        }

        // No stored user, check Firebase auth state (only if Firebase method)
        if (authMethod === 'firebase') {
          setupFirebaseListener()
        } else {
          // Backend auth, no user found
          setLoading(false)
          setInitialCheckDone(true)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
        setInitialCheckDone(true)
      }
    }

    const setupFirebaseListener = () => {
      // Only set up listener once
      if (unsubscribe) return

      // Set loading to false immediately if we already have initial check done
      if (initialCheckDone) {
        setLoading(false)
      }

      unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
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
        
        if (!initialCheckDone) {
          setLoading(false)
          setInitialCheckDone(true)
        }
      })
    }

    initializeAuth()

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    return data
  }

  const register = async (email, password, fullName) => {
    const data = await authService.register(email, password, fullName)
    setUser(data.user)
    return data
  }

  const loginWithGoogle = async () => {
    const data = await authService.loginWithGoogle()
    if (data) {
      setUser(data.user)
    }
    return data
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    setUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
