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
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                  Biometric Authentication
                </h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Not supported on this device
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 sm:ml-16">
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
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isRegistered ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-slate-700'
              }`}>
                <Fingerprint className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  isRegistered ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                  Biometric Authentication
                </h3>
                <p className={`text-sm mt-1 ${
                  isRegistered ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'
                }`}>
                  {isRegistered ? 'Enabled' : 'Not enabled'}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 sm:ml-16">
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
              className="w-full sm:w-auto sm:ml-4 flex-shrink-0"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
          )}
        </div>

        {/* Status Banner */}
        {isRegistered && (
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-800 dark:text-green-300">Biometric Login Active</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                You can now use fingerprint or face recognition to log in securely.
              </p>
            </div>
          </div>
        )}

        {/* Registered Credentials */}
        {credentials.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 text-sm sm:text-base">Registered Devices</h4>
            <div className="space-y-2">
              {credentials.map((cred, index) => (
                <div 
                  key={cred.credentialId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Fingerprint className="w-5 h-5 text-primary dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 text-sm sm:text-base">Device {index + 1}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
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
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
          <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Shield className="w-4 h-4" />
            How It Works
          </h4>
          <ul className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary dark:text-primary-400 mt-0.5">•</span>
              <span>Your biometric data never leaves your device</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary dark:text-primary-400 mt-0.5">•</span>
              <span>Uses your device's built-in security features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary dark:text-primary-400 mt-0.5">•</span>
              <span>Works with fingerprint, face recognition, or PIN</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary dark:text-primary-400 mt-0.5">•</span>
              <span>Can be disabled anytime from settings</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

export default BiometricSettings
