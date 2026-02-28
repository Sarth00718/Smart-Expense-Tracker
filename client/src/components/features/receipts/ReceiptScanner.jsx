import { useState, useRef, useCallback } from 'react'
import {
  Camera, Upload, Scan, X, CheckCircle2, Sparkles,
  Image as ImageIcon, AlertCircle, RefreshCw, FileImage,
  ZoomIn, Edit3, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpense } from '../../../context/ExpenseContext'
import { receiptService } from '../../../services/receiptService'

// ── Scan Animation ─────────────────────────────────────────────────────────
const ScanLine = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-20">
    {/* Corner brackets */}
    {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
    ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']
    ].map(([pos, border], i) => (
      <div key={i} className={`absolute ${pos} w-6 h-6 ${border} border-primary rounded-sm`} />
    ))}
    {/* Moving scan line */}
    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_2px_#4361ee80] animate-[scanLine_2s_ease-in-out_infinite]" />
    <style>{`
      @keyframes scanLine {
        0%   { top: 8px; opacity: 0 }
        10%  { opacity: 1 }
        90%  { opacity: 1 }
        100% { top: calc(100% - 8px); opacity: 0 }
      }
    `}</style>
  </div>
)

// ── Step Badge ─────────────────────────────────────────────────────────────
const Step = ({ n, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${done ? 'bg-green-500 text-white' : active ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}>
      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
    </div>
    <span className={`text-xs font-semibold hidden sm:block ${done ? 'text-green-600 dark:text-green-400' : active ? 'text-primary' : 'text-gray-400 dark:text-slate-500'}`}>
      {label}
    </span>
  </div>
)

const CATEGORIES = [
  { value: 'Food', emoji: '🍔' }, { value: 'Travel', emoji: '✈️' },
  { value: 'Transport', emoji: '🚗' }, { value: 'Shopping', emoji: '🛍️' },
  { value: 'Bills', emoji: '📄' }, { value: 'Entertainment', emoji: '🎬' },
  { value: 'Healthcare', emoji: '🏥' }, { value: 'Education', emoji: '📚' },
  { value: 'Other', emoji: '📦' },
]

const ReceiptScanner = ({ onSuccess }) => {
  const { addExpense } = useExpense()

  const [phase, setPhase] = useState('upload') // upload | scanning | review | success
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [previewZoomed, setPreviewZoomed] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    amount: '',
    description: ''
  })

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // ── File handling ─────────────────────────────────────────────────────────
  const loadFile = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }, [])

  const handleFileSelect = (e) => loadFile(e.target.files[0])

  // Drag & Drop
  const handleDrag = (e) => { e.preventDefault(); setIsDragging(e.type === 'dragover') }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    loadFile(e.dataTransfer.files[0])
  }

  // ── Scan ──────────────────────────────────────────────────────────────────
  const handleScan = async () => {
    if (!selectedFile) { toast.error('Please select an image first'); return }
    setPhase('scanning')
    setScanProgress(0)

    // Animate fake progress
    const progressInterval = setInterval(() => {
      setScanProgress(p => { if (p >= 90) { clearInterval(progressInterval); return 90 } return p + 12 })
    }, 400)

    try {
      const fd = new FormData()
      fd.append('receipt', selectedFile)
      fd.append('categoryHint', formData.category)

      const response = await receiptService.scan(fd)
      clearInterval(progressInterval)
      setScanProgress(100)

      const data = response.data
      setExtractedData(data)
      if (data.parsedData) {
        setFormData({
          date: data.parsedData.date || formData.date,
          category: data.parsedData.category || formData.category,
          amount: data.parsedData.amount?.toString() || '',
          description: data.parsedData.description || data.parsedData.merchant || ''
        })
      }

      setTimeout(() => setPhase('review'), 400)
      toast.success('Receipt scanned successfully!')
    } catch (err) {
      clearInterval(progressInterval)
      setScanProgress(0)
      setPhase('upload')
      toast.error('Failed to scan receipt. Please try again.')
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setIsSubmitting(true)
    try {
      await addExpense({
        date: formData.date,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description
      })
      setPhase('success')
      toast.success('Expense added successfully!')
      setTimeout(() => { if (onSuccess) onSuccess() }, 1500)
    } catch {
      toast.error('Failed to add expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setPhase('upload')
    setSelectedFile(null)
    setPreview(null)
    setExtractedData(null)
    setScanProgress(0)
    setFormData({ date: new Date().toISOString().split('T')[0], category: 'Other', amount: '', description: '' })
  }

  const currentStep = { upload: 1, scanning: 1, review: 2, success: 3 }[phase]

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Receipt Scanner</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">AI-powered OCR for instant expense logging</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        <Step n={1} label="Upload" active={phase === 'upload' || phase === 'scanning'} done={phase === 'review' || phase === 'success'} />
        <div className={`flex-1 h-0.5 rounded-full transition-colors ${phase === 'review' || phase === 'success' ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
        <Step n={2} label="Review" active={phase === 'review'} done={phase === 'success'} />
        <div className={`flex-1 h-0.5 rounded-full transition-colors ${phase === 'success' ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
        <Step n={3} label="Done" active={phase === 'success'} done={false} />
      </div>

      {/* ── UPLOAD PHASE ─────────────────────────────────────────────────── */}
      {(phase === 'upload' || phase === 'scanning') && (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
              ${isDragging
                ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]'
                : 'border-gray-300 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-800/50'}`}
          >
            {preview ? (
              // Image preview with scan overlay
              <div className="relative">
                {phase === 'scanning' && <ScanLine />}
                <img
                  src={preview}
                  alt="Receipt"
                  className={`w-full max-h-60 object-contain mx-auto transition-all duration-300 ${phase === 'scanning' ? 'brightness-75' : ''}`}
                  style={{ display: 'block' }}
                />
                {phase !== 'scanning' && (
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 z-10"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
                {phase === 'scanning' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-30">
                    <Sparkles className="w-8 h-8 text-primary mb-2 animate-pulse" />
                    <p className="text-white text-sm font-semibold">Reading receipt…</p>
                  </div>
                )}
              </div>
            ) : (
              // Empty upload area
              <div className="py-10 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-slate-300 mb-1">Drop your receipt here</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">PNG, JPG, HEIC up to 5MB</p>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-md">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    Take Photo
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* File info strip */}
          {selectedFile && phase !== 'scanning' && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <FileImage className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate max-w-[160px]">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Scan progress bar */}
          {phase === 'scanning' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  OCR processing…
                </span>
                <span className="text-primary font-bold">{scanProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="flex gap-3 text-xs text-gray-500 dark:text-slate-500">
                {['Detecting text', 'Extracting amounts', 'Identifying merchant', 'Categorizing'].map((step, i) => (
                  <span key={step} className={`flex items-center gap-1 transition-colors ${scanProgress > i * 25 ? 'text-primary font-medium' : ''}`}>
                    {scanProgress > i * 25 && <CheckCircle2 className="w-3 h-3" />}
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scan button */}
          {selectedFile && phase === 'upload' && (
            <button
              onClick={handleScan}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <Scan className="w-5 h-5" />
              Scan Receipt with AI
            </button>
          )}

          {/* Instructions */}
          {!selectedFile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: '📸', title: 'Clear photo', desc: 'Good lighting, no blur' },
                { icon: '📋', title: 'Full receipt', desc: 'Include all edges' },
                { icon: '🔍', title: 'Readable text', desc: 'High-res image' },
                { icon: '⚡', title: 'Instant results', desc: 'AI OCR in seconds' }
              ].map(tip => (
                <div key={tip.title} className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-center">
                  <span className="text-xl block mb-1">{tip.icon}</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{tip.title}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{tip.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REVIEW PHASE ─────────────────────────────────────────────────── */}
      {phase === 'review' && (
        <div className="space-y-5">
          {/* Scan success banner */}
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Scan Complete</p>
              <p className="text-xs text-green-600 dark:text-green-500">Review extracted data below and edit if needed</p>
            </div>
            <button onClick={() => setPreviewZoomed(true)} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Two-column layout on larger screens */}
          <div className="grid sm:grid-cols-5 gap-5">
            {/* Thumbnail */}
            {preview && (
              <div className="sm:col-span-2">
                <button onClick={() => setPreviewZoomed(true)} className="relative w-full group">
                  <img src={preview} alt="Receipt" className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 object-cover max-h-52 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="sm:col-span-3 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Amount (₹) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400 dark:text-slate-500">₹</span>
                  <input
                    type="number" step="0.01" min="0.01"
                    value={formData.amount}
                    onChange={e => setFormData(d => ({ ...d, amount: e.target.value }))}
                    className="input pl-8 text-lg font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="input" required />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value} type="button"
                      onClick={() => setFormData(d => ({ ...d, category: cat.value }))}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border-2 text-xs font-semibold transition-all
                        ${formData.category === cat.value
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-primary/40'}`}
                    >
                      <span>{cat.emoji}</span>
                      {cat.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  className="input"
                  placeholder="Merchant name or note"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button" onClick={reset}
                  className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Rescan
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting
                    ? <><div className="spinner-small" />Saving…</>
                    : <><CheckCircle2 className="w-4 h-4" />Add Expense</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUCCESS PHASE ─────────────────────────────────────────────────── */}
      {phase === 'success' && (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Expense Added!</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            ₹{parseFloat(formData.amount).toFixed(2)} · {formData.category}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="px-5 py-2.5 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* ── Image Zoom Modal ──────────────────────────────────────────────── */}
      {previewZoomed && preview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomed(false)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewZoomed(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <img src={preview} alt="Receipt full view" className="w-full rounded-2xl shadow-2xl border-2 border-white/20" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReceiptScanner
