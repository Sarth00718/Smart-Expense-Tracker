import { useState, useEffect } from 'react'
import { Fingerprint, Shield, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { biometricService, isBiometricSupported } from '../../../services/biometricService'
import { Card, Button } from '../../ui'
import toast from 'react-hot-toast'

const BiometricSettings = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsSupported(isBiometricSupported())
    setIsRegistered(biometricService.isRegistered())
    loadCredentials()
  }, [])

  const loadCredentials = async () => {
    try {
      const creds = await biometricService.getCredentials()
      setCredentials(creds)
    } catch (error) {
      console.error('Load credentials error:', error)
    }
  }

  const handleRegister = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user'))
      
      await biometricService.register(user.email)
      
      setIsRegistered(true)
      await loadCredentials()
      
      toast.success('Biometric authentication registered successfully!')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to register biometric authentication')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (credentialId) => {
    if (!confirm('Are you sure you want to remove this biometric credential?')) {
      return
    }

    try {
      setLoading(true)
      await biometricService.remove(credentialId)
      
      setIsRegistered(false)
      await loadCredentials()
      
      toast.success('Biometric credential removed')
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove credential')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-7 h-7 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Biometric Authentication
                </h3>
                <p className="text-sm text-yellow-600">
                  Not supported on this device
                </p>
              </div>
            </div>
            <p className="text-gray-600 ml-18">
              Biometric authentication is not supported on this device or browser.
              Please use a device with fingerprint or face recognition capabilities.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isRegistered ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Fingerprint className={`w-7 h-7 ${
                  isRegistered ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Biometric Authentication
                </h3>
                <p className={`text-sm ${
                  isRegistered ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {isRegistered ? 'Enabled' : 'Not enabled'}
                </p>
              </div>
            </div>
            <p className="text-gray-600 ml-18">
              {isRegistered 
                ? 'Use fingerprint or face recognition to log in securely.'
                : 'Enable biometric authentication for faster and more secure login.'
              }
            </p>
          </div>
          {!isRegistered && (
            <Button
              variant="primary"
              size="md"
              onClick={handleRegister}
              disabled={loading}
              icon={Fingerprint}
              className="ml-4"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
          )}
        </div>

        {/* Status Banner */}
        {isRegistered && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Biometric Login Active</p>
              <p className="text-sm text-green-700 mt-1">
                You can now use fingerprint or face recognition to log in securely.
              </p>
            </div>
          </div>
        )}

        {/* Registered Credentials */}
        {credentials.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Registered Devices</h4>
            <div className="space-y-2">
              {credentials.map((cred, index) => (
                <div 
                  key={cred.credentialId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Device {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        Registered {new Date(cred.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(cred.credentialId)}
                    disabled={loading}
                    icon={Trash2}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            How It Works
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Your biometric data never leaves your device</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Uses your device's built-in security features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Works with fingerprint, face recognition, or PIN</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Can be disabled anytime from settings</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

export default BiometricSettings
