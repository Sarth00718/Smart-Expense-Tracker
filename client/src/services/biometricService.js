/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and fingerprint authentication
 */

class BiometricService {
  constructor() {
    this.isSupported = this.checkSupport()
  }

  /**
   * Check if biometric authentication is supported
   */
  checkSupport() {
    // Check for Web Authentication API (WebAuthn)
    if (window.PublicKeyCredential) {
      return true
    }
    return false
  }

  /**
   * Check if biometric is available on the device
   */
  async isAvailable() {
    if (!this.isSupported) return false

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch (error) {
      console.error('Error checking biometric availability:', error)
      return false
    }
  }

  /**
   * Register biometric credentials for a user
   */
  async register(userId, email) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication is not supported on this device')
    }

    try {
      // Generate challenge from server (in production, get this from your backend)
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Expense Tracker',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })

      // Store credential ID for this user
      const credentialData = {
        id: credential.id,
        rawId: this.arrayBufferToBase64(credential.rawId),
        type: credential.type,
      }

      localStorage.setItem(`biometric_${userId}`, JSON.stringify(credentialData))
      localStorage.setItem('biometric_enabled', 'true')
      localStorage.setItem('biometric_user_id', userId)

      return credentialData
    } catch (error) {
      console.error('Biometric registration failed:', error)
      throw new Error('Failed to register biometric authentication')
    }
  }

  /**
   * Authenticate using biometric
   */
  async authenticate(userId) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication is not supported on this device')
    }

    try {
      // Get stored credential
      const storedCredential = localStorage.getItem(`biometric_${userId}`)
      if (!storedCredential) {
        throw new Error('No biometric credentials found. Please set up biometric authentication first.')
      }

      const credentialData = JSON.parse(storedCredential)

      // Generate challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: this.base64ToArrayBuffer(credentialData.rawId),
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        timeout: 60000,
        userVerification: 'required',
      }

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })

      return assertion !== null
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      throw new Error('Biometric authentication failed')
    }
  }

  /**
   * Check if biometric is enabled for current user
   */
  isBiometricEnabled(userId) {
    const enabled = localStorage.getItem('biometric_enabled') === 'true'
    const storedUserId = localStorage.getItem('biometric_user_id')
    const hasCredential = localStorage.getItem(`biometric_${userId}`) !== null
    
    return enabled && storedUserId === userId && hasCredential
  }

  /**
   * Disable biometric authentication
   */
  disableBiometric(userId) {
    localStorage.removeItem(`biometric_${userId}`)
    localStorage.removeItem('biometric_enabled')
    localStorage.removeItem('biometric_user_id')
  }

  /**
   * Get biometric type name for display
   */
  async getBiometricType() {
    // This is a best guess based on platform
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Face ID or Touch ID'
    } else if (userAgent.includes('android')) {
      return 'Fingerprint or Face Unlock'
    } else if (userAgent.includes('mac')) {
      return 'Touch ID'
    } else if (userAgent.includes('windows')) {
      return 'Windows Hello'
    }
    
    return 'Biometric Authentication'
  }

  // Helper methods
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

export const biometricService = new BiometricService()
