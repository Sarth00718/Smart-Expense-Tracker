import api from './api'

// Check if WebAuthn is supported
export const isBiometricSupported = () => {
  return window.PublicKeyCredential !== undefined && 
         navigator.credentials !== undefined
}

// Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// Convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export const biometricService = {
  // Register biometric authentication
  register: async (email) => {
    if (!isBiometricSupported()) {
      throw new Error('Biometric authentication not supported on this device')
    }

    try {
      // Create credential options
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const publicKeyOptions = {
        challenge,
        rp: {
          name: 'Smart Expense Tracker',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(email),
          name: email,
          displayName: email
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: 'none'
      }

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      })

      if (!credential) {
        throw new Error('Failed to create credential')
      }

      // Extract credential data
      const credentialId = arrayBufferToBase64(credential.rawId)
      const publicKey = arrayBufferToBase64(credential.response.getPublicKey())

      // Register with backend
      const response = await api.post('/biometric/register', {
        credentialId,
        publicKey,
        counter: 0
      })

      // Store credential ID locally
      localStorage.setItem('biometricCredentialId', credentialId)
      localStorage.setItem('biometricEmail', email)

      return response.data

    } catch (error) {
      console.error('Biometric registration error:', error)
      throw new Error(error.message || 'Failed to register biometric authentication')
    }
  },

  // Authenticate using biometric
  authenticate: async (email) => {
    if (!isBiometricSupported()) {
      throw new Error('Biometric authentication not supported on this device')
    }

    try {
      const storedEmail = localStorage.getItem('biometricEmail')
      const credentialId = localStorage.getItem('biometricCredentialId')

      if (!credentialId || (email && email !== storedEmail)) {
        throw new Error('No biometric credential found. Please register biometric authentication first.')
      }

      // Create authentication challenge
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const publicKeyOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
        allowCredentials: [{
          type: 'public-key',
          id: base64ToArrayBuffer(credentialId)
        }]
      }

      // Get credential
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions
      })

      if (!assertion) {
        throw new Error('Biometric authentication was cancelled or failed')
      }

      // Send to backend for verification
      const response = await api.post('/biometric/authenticate', {
        email: email || storedEmail,
        credentialId,
        signature: arrayBufferToBase64(assertion.response.signature),
        authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData),
        clientDataJSON: arrayBufferToBase64(assertion.response.clientDataJSON)
      })

      // Store auth data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('authMethod', 'biometric')
      }

      return response.data

    } catch (error) {
      console.error('Biometric authentication error:', error)
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled')
      } else if (error.name === 'InvalidStateError') {
        throw new Error('Biometric credential is invalid. Please re-register.')
      } else if (error.response?.status === 401) {
        throw new Error('Biometric authentication failed. Please try again or use another method.')
      } else if (error.response?.status === 429) {
        throw new Error('Too many attempts. Please wait a few minutes and try again.')
      } else {
        throw new Error(error.message || 'Biometric authentication failed. Please try another login method.')
      }
    }
  },

  // Check if biometric is registered
  isRegistered: () => {
    return localStorage.getItem('biometricCredentialId') !== null
  },

  // Get registered credentials
  getCredentials: async () => {
    try {
      const response = await api.get('/biometric/credentials')
      return response.data.credentials
    } catch (error) {
      console.error('Get credentials error:', error)
      return []
    }
  },

  // Remove biometric credential
  remove: async (credentialId) => {
    try {
      await api.delete(`/biometric/credentials/${credentialId}`)
      
      // Clear local storage if it matches
      if (localStorage.getItem('biometricCredentialId') === credentialId) {
        localStorage.removeItem('biometricCredentialId')
        localStorage.removeItem('biometricEmail')
      }
    } catch (error) {
      console.error('Remove credential error:', error)
      throw error
    }
  }
}
