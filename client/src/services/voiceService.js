import api from './api';

export const voiceService = {
  /**
   * Parse voice transcript to expense data
   */
  parseTranscript: async (transcript) => {
    const response = await api.post('/voice/parse', { transcript });
    return response.data;
  },

  /**
   * Create expense directly from voice command
   */
  createExpenseFromVoice: async (transcript, date = null) => {
    const response = await api.post('/voice/expense', { 
      transcript,
      date: date || new Date()
    });
    return response.data;
  },

  /**
   * Check browser support for voice input
   */
  checkBrowserSupport: () => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
};
