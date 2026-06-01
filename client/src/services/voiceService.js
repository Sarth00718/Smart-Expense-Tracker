import api from './api'
import { VOICE } from '../config/apiEndpoints'

export const voiceService = {
  parseTranscript: async (transcript) => {
    const response = await api.post(VOICE.PARSE, { transcript })
    return response.data
  },

  createExpenseFromVoice: async (transcript, date = null) => {
    const response = await api.post(VOICE.EXPENSE, {
      transcript,
      date: date || new Date()
    })
    return response.data
  },

  checkBrowserSupport: () => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }
}
