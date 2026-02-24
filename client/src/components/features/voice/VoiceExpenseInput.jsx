import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader, Check, X, Edit2, Volume2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import VoiceAnimation from '../../ui/VoiceAnimation';

const VoiceExpenseInput = ({ onExpenseCreated, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setBrowserSupport(false);
      toast.error('Voice input not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      // If final result, parse it
      if (event.results[current].isFinal) {
        parseVoiceCommand(transcriptText);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied');
      } else {
        toast.error('Voice recognition error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!browserSupport) {
      toast.error('Voice input not supported');
      return;
    }

    setTranscript('');
    setParsedData(null);
    setIsEditing(false);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Failed to start voice input');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const parseVoiceCommand = async (text) => {
    setIsProcessing(true);
    
    try {
      const response = await api.post('/voice/parse', { transcript: text });
      
      setParsedData(response.data.data);
      setEditedData(response.data.data);

      if (response.data.data.needsReview) {
        toast.success('Please review the parsed details');
        setIsEditing(true);
      } else {
        toast.success('Expense details parsed successfully!');
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateExpense = async () => {
    const dataToSubmit = isEditing ? editedData : parsedData;

    if (!dataToSubmit.amount || dataToSubmit.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.post('/expenses', {
        amount: dataToSubmit.amount,
        category: dataToSubmit.category,
        description: dataToSubmit.description,
        date: new Date()
      });

      toast.success('Expense created successfully!');
      
      if (onExpenseCreated) {
        onExpenseCreated(response.data);
      }
      
      // Reset
      setTranscript('');
      setParsedData(null);
      setEditedData(null);
      setIsEditing(false);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Create expense error:', error);
      toast.error(error.response?.data?.error || 'Failed to create expense');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!browserSupport) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6 text-center shadow-lg">
        <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-700 font-semibold text-lg mb-2">Voice input not supported</p>
        <p className="text-sm text-red-600">Please use Chrome, Edge, or Safari for voice features.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Voice Expense Entry
            </h3>
            <p className="text-sm text-gray-500">Speak naturally to add expenses</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Voice Input Section */}
      <div className="mb-8">
        <div className="flex flex-col items-center">
          {/* Microphone Button with Animation */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VoiceAnimation isActive={isListening} />
              </div>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-br from-red-500 to-pink-600 animate-pulse'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white drop-shadow-lg" />
              ) : (
                <Mic className="w-12 h-12 text-white drop-shadow-lg" />
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isListening ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Listening... Speak now
                </span>
              ) : (
                'Tap the microphone to start'
              )}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-gray-600">
                Try: "Add 50 rupees for groceries"
              </p>
            </div>
          </div>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">You said:</p>
            </div>
            <p className="text-gray-800 text-lg italic font-medium">"{transcript}"</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <Loader className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-base font-medium text-gray-700">Processing your request...</span>
          </div>
        )}
      </div>

      {/* Parsed Data Display/Edit */}
      {parsedData && !isProcessing && (
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Extracted Details
            </h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>

          {/* Confidence Indicator */}
          <div className="mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Confidence Level</span>
              <span className="text-lg font-bold">{Math.round(parsedData.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  parsedData.confidence > 0.7
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : parsedData.confidence > 0.4
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${parsedData.confidence * 100}%` }}
              />
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={editedData.amount || ''}
                  onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={editedData.category || 'Other'}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                >
                  <option value="Food">🍔 Food</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Bills">📄 Bills</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Healthcare">🏥 Healthcare</option>
                  <option value="Education">📚 Education</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editedData.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                  placeholder="Enter description"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border-2 border-blue-200">
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₹{parsedData.amount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-sm font-medium text-gray-600">Category:</span>
                <span className="text-lg font-semibold text-gray-800">{parsedData.category}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <span className="text-lg font-semibold text-gray-800">{parsedData.description}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCreateExpense}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transform hover:scale-105"
            >
              <Check className="w-6 h-6" />
              Create Expense
            </button>
            <button
              onClick={() => {
                setTranscript('');
                setParsedData(null);
                setEditedData(null);
                setIsEditing(false);
              }}
              className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceExpenseInput;
