import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, X, Check, Edit3, Volume2, Sparkles, AlertCircle, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../services/api'

// ── Animated Waveform ────────────────────────────────────────────────────────
const Waveform = ({ isActive }) => {
  const bars = [3, 5, 8, 12, 9, 14, 10, 7, 13, 6, 11, 8, 4, 10, 6]
  return (
    <div className="flex items-center justify-center gap-[3px] h-12">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${isActive ? 'bg-primary animate-pulse' : 'bg-gray-300 dark:bg-slate-600'}`}
          style={{
            width: 3,
            height: isActive ? `${h * 3}px` : '6px',
            animationDelay: `${i * 0.07}s`,
            animationDuration: `${0.6 + (i % 3) * 0.2}s`,
            transition: 'height 0.4s ease'
          }}
        />
      ))}
    </div>
  )
}

// ── Step Indicator ───────────────────────────────────────────────────────────
const StepBadge = ({ step, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${done ? 'bg-green-500 text-white' : active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}>
      {done ? <Check className="w-3.5 h-3.5" /> : step}
    </div>
    <span className={`text-xs font-semibold hidden sm:block transition-colors
      ${done ? 'text-green-600 dark:text-green-400' : active ? 'text-primary' : 'text-gray-400 dark:text-slate-500'}`}>
      {label}
    </span>
  </div>
)

const CATEGORIES = [
  { value: 'Food', emoji: '🍔', label: 'Food' },
  { value: 'Travel', emoji: '✈️', label: 'Travel' },
  { value: 'Transport', emoji: '🚗', label: 'Transport' },
  { value: 'Shopping', emoji: '🛍️', label: 'Shopping' },
  { value: 'Bills', emoji: '📄', label: 'Bills' },
  { value: 'Entertainment', emoji: '🎬', label: 'Entertainment' },
  { value: 'Healthcare', emoji: '🏥', label: 'Healthcare' },
  { value: 'Education', emoji: '📚', label: 'Education' },
  { value: 'Other', emoji: '📦', label: 'Other' },
]

const VoiceExpenseInput = ({ onExpenseCreated, onClose }) => {
  // State
  const [phase, setPhase] = useState('idle') // idle | recording | processing | review | success
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [editedData, setEditedData] = useState(null)
  const [browserSupport, setBrowserSupport] = useState(true)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)

  // Check browser support & init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setBrowserSupport(false); return }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN' // Better for rupee amounts

    recognition.onstart = () => { setIsListening(true); setPhase('recording') }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const text = event.results[current][0].transcript
      setTranscript(text)
      if (event.results[current].isFinal) parseTranscript(text)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setPhase('idle')
      clearInterval(timerRef.current)
      setRecordingDuration(0)
      if (event.error === 'no-speech') setError('No speech detected. Tap the mic and speak clearly.')
      else if (event.error === 'not-allowed') setError('Microphone access denied. Please allow microphone access in your browser.')
      else setError('Voice recognition error. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
      clearInterval(timerRef.current)
      setRecordingDuration(0)
    }

    recognitionRef.current = recognition
    return () => { if (recognitionRef.current) recognitionRef.current.stop() }
  }, [])

  const startListening = useCallback(() => {
    if (!browserSupport) { toast.error('Voice input not supported in this browser'); return }
    setError(null)
    setTranscript('')
    setParsedData(null)
    setPhase('recording')
    setRecordingDuration(0)
    timerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000)
    try { recognitionRef.current.start() } catch (e) { toast.error('Failed to start voice input') }
  }, [browserSupport])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    clearInterval(timerRef.current)
  }, [])

  const parseTranscript = async (text) => {
    setPhase('processing')
    setIsListening(false)
    try {
      const response = await api.post('/voice/parse', { transcript: text })
      const data = response.data.data
      setParsedData(data)
      setEditedData({ ...data })
      setPhase('review')
    } catch (err) {
      setError('Failed to parse voice command. Please try again.')
      setPhase('idle')
    }
  }

  const handleSubmit = async () => {
    if (!editedData?.amount || editedData.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/expenses', {
        amount: editedData.amount,
        category: editedData.category,
        description: editedData.description,
        date: new Date()
      })
      setPhase('success')
      toast.success('Expense added successfully!')
      setTimeout(() => { if (onExpenseCreated) onExpenseCreated() }, 1200)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setPhase('idle')
    setTranscript('')
    setParsedData(null)
    setEditedData(null)
    setError(null)
    setRecordingDuration(0)
  }

  const currentStep = { idle: 0, recording: 1, processing: 2, review: 3, success: 3 }[phase] || 0

  // ── Unsupported browser ──────────────────────────────────────────────────
  if (!browserSupport) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <MicOff className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Browser Not Supported</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs mx-auto">
            Voice recognition requires Chrome, Edge, or Safari. Please switch browsers to use this feature.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-7">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Voice Entry</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Speak to log your expense instantly</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-8">
        <StepBadge step={1} label="Record" active={phase === 'recording'} done={currentStep > 1} />
        <div className={`flex-1 h-0.5 rounded-full transition-colors ${currentStep > 1 ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
        <StepBadge step={2} label="Process" active={phase === 'processing'} done={currentStep > 2} />
        <div className={`flex-1 h-0.5 rounded-full transition-colors ${currentStep > 2 ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
        <StepBadge step={3} label="Confirm" active={phase === 'review' || phase === 'success'} done={phase === 'success'} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Phase: IDLE / RECORDING ────────────────────────────────────────── */}
      {(phase === 'idle' || phase === 'recording') && (
        <div className="text-center">
          {/* Mic Button */}
          <div className="relative inline-flex mb-6">
            {/* Pulse rings */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-0 scale-125 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
              </>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95
                ${isListening
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                  : 'bg-gradient-to-br from-primary to-secondary hover:shadow-primary/40 hover:scale-105'}`}
            >
              {isListening
                ? <MicOff className="w-11 h-11 text-white drop-shadow" />
                : <Mic className="w-11 h-11 text-white drop-shadow" />}
            </button>
          </div>

          {/* Status text */}
          <div className="mb-6">
            {isListening ? (
              <>
                <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-1 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                  Listening… {recordingDuration}s
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Tap mic again to stop</p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-700 dark:text-slate-300 mb-1">Tap to start recording</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Speak naturally in English or Hindi</p>
              </>
            )}
          </div>

          {/* Waveform */}
          <div className="mb-6">
            <Waveform isActive={isListening} />
          </div>

          {/* Transcript live preview */}
          {transcript && (
            <div className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-left">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Heard</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-slate-200 italic leading-relaxed">"{transcript}"</p>
            </div>
          )}

          {/* Try example prompts */}
          {!isListening && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 font-medium">Try saying:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['"Spent 200 on food"', '"Rickshaw 50 rupees"', '"Groceries ₹350"'].map(ex => (
                  <span key={ex} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full border border-gray-200 dark:border-slate-600">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Phase: PROCESSING ───────────────────────────────────────────────── */}
      {phase === 'processing' && (
        <div className="text-center py-8">
          {/* Transcript display */}
          {transcript && (
            <div className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-left max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">You said</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-slate-200 italic">"{transcript}"</p>
            </div>
          )}
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-slate-200 mb-1">Analyzing your voice…</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Extracting expense details with AI</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: REVIEW ───────────────────────────────────────────────────── */}
      {phase === 'review' && editedData && (
        <div className="space-y-5">
          {/* Transcript reference */}
          {transcript && (
            <div className="p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 dark:text-slate-300 italic leading-relaxed flex-1">"{transcript}"</p>
            </div>
          )}

          {/* Confidence bar */}
          {parsedData?.confidence !== undefined && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium w-20">Confidence</span>
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${parsedData.confidence * 100}%`,
                    background: parsedData.confidence > 0.7 ? '#10b981' : parsedData.confidence > 0.4 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 w-9 text-right">
                {Math.round(parsedData.confidence * 100)}%
              </span>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              Amount (₹) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400 dark:text-slate-500">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={editedData.amount || ''}
                onChange={e => setEditedData(d => ({ ...d, amount: parseFloat(e.target.value) }))}
                className="input pl-9 text-xl font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setEditedData(d => ({ ...d, category: cat.value }))}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all
                    ${editedData.category === cat.value
                      ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-primary/50'}`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
            <input
              type="text"
              value={editedData.description || ''}
              onChange={e => setEditedData(d => ({ ...d, description: e.target.value }))}
              className="input"
              placeholder="Optional note"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Re-record
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <><div className="spinner-small" /> Saving…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Add Expense</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Phase: SUCCESS ───────────────────────────────────────────────────── */}
      {phase === 'success' && (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Expense Added!</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            ₹{editedData?.amount?.toFixed(2)} · {editedData?.category}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="px-5 py-2.5 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 text-sm transition-all">
              Add Another
            </button>
            {onClose && (
              <button onClick={onClose} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md">
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tips footer */}
      {phase === 'idle' && (
        <div className="mt-8 pt-5 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center font-medium tracking-wide uppercase mb-3">Tips for best results</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['🔇', 'Speak in a quiet room'],
              ['🗣️', 'Mention amount clearly'],
              ['📝', 'Include merchant name'],
              ['🏷️', 'State the category']
            ].map(([icon, tip]) => (
              <div key={tip} className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                <span>{icon}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceExpenseInput
