import React, { useState } from 'react';
import { Shield, Mail, Smartphone, Copy, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const TwoFactorSetup = ({ onClose, onSuccess }) => {
  const [method, setMethod] = useState(null); // 'email' or 'totp'
  const [step, setStep] = useState('choose'); // 'choose', 'setup', 'verify'
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleMethodSelect = async (selectedMethod) => {
    setMethod(selectedMethod);
    setStep('setup');
    setIsLoading(true);

    try {
      if (selectedMethod === 'email') {
        const response = await api.post('/2fa/setup/email');
        toast.success(response.data.message);
        
        // Show dev OTP in development
        if (response.data.devOTP) {
          toast.success(`Dev OTP: ${response.data.devOTP}`, { duration: 10000 });
        }
        
        setStep('verify');
      } else if (selectedMethod === 'totp') {
        const response = await api.post('/2fa/setup/totp');
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setStep('verify');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.error || 'Failed to setup 2FA');
      setStep('choose');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = method === 'email' ? '/2fa/verify/email' : '/2fa/verify/totp';
      const payload = method === 'email' 
        ? { otp: verificationCode }
        : { token: verificationCode };

      const response = await api.post(endpoint, payload);
      
      setBackupCodes(response.data.backupCodes);
      setStep('backup-codes');
      toast.success('2FA enabled successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleComplete = () => {
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Enable Two-Factor Authentication</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Choose Method */}
          {step === 'choose' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Choose your preferred 2FA method to add an extra layer of security to your account.
              </p>

              <button
                onClick={() => handleMethodSelect('email')}
                disabled={isLoading}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email OTP</h3>
                    <p className="text-sm text-gray-600">
                      Receive a one-time code via email each time you log in.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('totp')}
                disabled={isLoading}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-start">
                  <Smartphone className="w-6 h-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Authenticator App</h3>
                    <p className="text-sm text-gray-600">
                      Use Google Authenticator or similar app to generate codes.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <div className="space-y-4">
              {method === 'totp' && qrCode && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Scan this QR code with your authenticator app:
                  </p>
                  <img src={qrCode} alt="QR Code" className="mx-auto mb-4 border rounded-lg p-2" />
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Or enter this code manually:</p>
                    <code className="text-sm font-mono text-gray-800 break-all">{secret}</code>
                  </div>
                </div>
              )}

              {method === 'email' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      A verification code has been sent to your email. Please check your inbox.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {step === 'backup-codes' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">
                      Save these backup codes!
                    </p>
                    <p className="text-sm text-yellow-700">
                      Store them in a safe place. You can use them to access your account if you lose your 2FA device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border border-gray-200">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCopyBackupCodes}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copiedCodes ? (
                  <>
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy All Codes
                  </>
                )}
              </button>

              <button
                onClick={handleComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                I've Saved My Backup Codes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
