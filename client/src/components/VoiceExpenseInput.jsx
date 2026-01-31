import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader, Check, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Voice input is not supported in your browser.</p>
        <p className="text-sm text-red-600 mt-1">Please use Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Voice Expense Entry</h3>

      {/* Voice Input Section */}
      <div className="mb-6">
        <div className="flex flex-col items-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
          
          <p className="mt-3 text-sm text-gray-600">
            {isListening ? 'Listening... Speak now' : 'Click to start speaking'}
          </p>
          
          <p className="mt-2 text-xs text-gray-500 text-center">
            Example: "Add 50 rupees grocery expense"
          </p>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="text-gray-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center text-blue-600">
            <Loader className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      {/* Parsed Data Display/Edit */}
      {parsedData && !isProcessing && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-700">Parsed Details</h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>

          {/* Confidence Indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Confidence</span>
              <span>{Math.round(parsedData.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  parsedData.confidence > 0.7
                    ? 'bg-green-500'
                    : parsedData.confidence > 0.4
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${parsedData.confidence * 100}%` }}
              />
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  value={editedData.amount || ''}
                  onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={editedData.category || 'Other'}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editedData.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-800">
                  ₹{parsedData.amount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="font-semibold text-gray-800">{parsedData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="font-semibold text-gray-800">{parsedData.description}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreateExpense}
              disabled={isProcessing}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Check className="w-5 h-5 mr-2" />
              Create Expense
            </button>
            <button
              onClick={() => {
                setTranscript('');
                setParsedData(null);
                setEditedData(null);
                setIsEditing(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceExpenseInput;
