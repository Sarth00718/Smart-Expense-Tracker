import React, { useState } from 'react';
import { Shield, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const TwoFactorVerify = ({ tempToken, method, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (useBackupCode) {
      if (!backupCode || backupCode.length < 8) {
        toast.error('Please enter a valid backup code');
        return;
      }
    } else {
      if (!code || code.length !== 6) {
        toast.error('Please enter a valid 6-digit code');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-2fa', {
        tempToken,
        ...(useBackupCode ? { backupCode } : { code })
      });

      // Store token and user
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success('Login successful!');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600">
            {method === 'email' 
              ? 'Enter the code sent to your email'
              : 'Enter the code from your authenticator app'}
          </p>
        </div>

        {!useBackupCode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>

            <button
              onClick={() => setUseBackupCode(true)}
              className="w-full text-sm text-blue-600 hover:text-blue-700 py-2"
            >
              Use backup code instead
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Backup codes are one-time use only. This code will be invalidated after use.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Code
              </label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-wider font-mono"
                autoFocus
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading || backupCode.length < 8}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Backup Code'
              )}
            </button>

            <button
              onClick={() => setUseBackupCode(false)}
              className="w-full text-sm text-blue-600 hover:text-blue-700 py-2"
            >
              Use verification code instead
            </button>
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 py-2"
          >
            Cancel and return to login
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorVerify;
