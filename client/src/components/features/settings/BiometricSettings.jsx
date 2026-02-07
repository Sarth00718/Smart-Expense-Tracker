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
      <Card title="Biometric Authentication" icon={Fingerprint}>
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Not Supported</p>
            <p className="text-sm text-yellow-700 mt-1">
              Biometric authentication is not supported on this device or browser.
              Please use a device with fingerprint or face recognition capabilities.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Biometric Authentication" icon={Fingerprint}>
      <div className="space-y-6">
        {/* Status */}
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${
          isRegistered 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          {isRegistered ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Biometric Login Enabled</p>
                <p className="text-sm text-green-700 mt-1">
                  You can now use fingerprint or face recognition to log in securely.
                </p>
              </div>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Enhance Your Security</p>
                <p className="text-sm text-blue-700 mt-1">
                  Enable biometric authentication for faster and more secure login.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Register Button */}
        {!isRegistered && (
          <Button
            variant="primary"
            onClick={handleRegister}
            disabled={loading}
            icon={Fingerprint}
            className="w-full"
          >
            {loading ? 'Registering...' : 'Enable Biometric Login'}
          </Button>
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
