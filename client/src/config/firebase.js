import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app)

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Firebase persistence error:', error)
})

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Helper function to convert Firebase errors to user-friendly messages
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address format',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/popup-blocked': 'Popup was blocked by your browser',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/account-exists-with-different-credential': 'An account already exists with this email'
  }
  
  return errorMessages[errorCode] || 'Authentication failed. Please try again'
}

// Auth functions
export const firebaseAuth = {
  // Register with email and password
  register: async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name
      if (fullName) {
        await updateProfile(userCredential.user, {
          displayName: fullName
        })
      }
      
      return {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          fullName: userCredential.user.displayName || fullName,
          emailVerified: userCredential.user.emailVerified
        },
        token: await userCredential.user.getIdToken()
      }
    } catch (error) {
      const message = getFirebaseErrorMessage(error.code)
      throw new Error(message)
    }
  },

  // Login with email and password
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      return {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          fullName: userCredential.user.displayName,
          emailVerified: userCredential.user.emailVerified
        },
        token: await userCredential.user.getIdToken()
      }
    } catch (error) {
      const message = getFirebaseErrorMessage(error.code)
      throw new Error(message)
    }
  },

  // Login with Google (with fallback to redirect)
  loginWithGoogle: async () => {
    try {
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider)
      
      return {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.displayName,
          picture: result.user.photoURL,
          emailVerified: result.user.emailVerified
        },
        token: await result.user.getIdToken()
      }
    } catch (error) {
      // If popup is blocked, use redirect
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider)
        // Redirect will happen, no return needed
        return null
      }
      const message = getFirebaseErrorMessage(error.code)
      throw new Error(message)
    }
  },

  // Handle redirect result (call this on app load)
  handleRedirectResult: async () => {
    try {
      const result = await getRedirectResult(auth)
      if (result) {
        return {
          user: {
            uid: result.user.uid,
            email: result.user.email,
            fullName: result.user.displayName,
            picture: result.user.photoURL,
            emailVerified: result.user.emailVerified
          },
          token: await result.user.getIdToken()
        }
      }
      return null
    } catch (error) {
      console.error('Redirect result error:', error)
      return null
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(error.message)
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback)
  },

  // Get ID token
  getIdToken: async () => {
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken()
    }
    return null
  }
}

export default app
