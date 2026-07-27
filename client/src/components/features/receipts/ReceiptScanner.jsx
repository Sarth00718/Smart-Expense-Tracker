import { useState, useRef, useCallback } from 'react'
import {
  Camera, Upload, Scan, X, CheckCircle2, Sparkles,
  Image as ImageIcon, AlertCircle, RefreshCw, FileImage,
  ZoomIn, Edit3, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpense } from '../../../context/ExpenseContext'
import { receiptService } from '../../../services/receiptService'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Progress, Input, Separator, CommonPageContainer } from '../../ui'

const ScanLine = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-20">
    {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
    ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']
    ].map(([pos, border], i) => (
      <div key={i} className={`absolute ${pos} w-6 h-6 ${border} border-primary rounded-sm`} />
    ))}
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

const Step = ({ n, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${done ? 'bg-success text-white' : active ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
    </div>
    <span className={`text-xs font-semibold hidden sm:block ${done ? 'text-success' : active ? 'text-primary' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </div>
)

const CATEGORIES = [
  { value: 'Food', emoji: '\uD83C\uDF54' }, { value: 'Travel', emoji: '\u2708\uFE0F' },
  { value: 'Transport', emoji: '\uD83D\uDE97' }, { value: 'Shopping', emoji: '\uD83D\uDECD\uFE0F' },
  { value: 'Bills', emoji: '\uD83D\uDCC4' }, { value: 'Entertainment', emoji: '\uD83C\uDFAC' },
  { value: 'Healthcare', emoji: '\uD83C\uDFE5' }, { value: 'Education', emoji: '\uD83D\uDCDA' },
  { value: 'Other', emoji: '\uD83D\uDCE6' },
]

const ReceiptScanner = ({ onSuccess }) => {
  const { addExpense } = useExpense()

  const [phase, setPhase] = useState('upload')
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

  const handleDrag = (e) => { e.preventDefault(); setIsDragging(e.type === 'dragover') }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    loadFile(e.dataTransfer.files[0])
  }

  const handleScan = async () => {
    if (!selectedFile) { toast.error('Please select an image first'); return }
    setPhase('scanning')
    setScanProgress(0)

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

  return (
    <CommonPageContainer>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
          <Camera className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Receipt Scanner</h2>
          <p className="text-xs text-muted-foreground">AI-powered OCR for instant expense logging</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Step n={1} label="Upload" active={phase === 'upload' || phase === 'scanning'} done={phase === 'review' || phase === 'success'} />
        <div className={`flex-1 h-0.5 rounded-full transition-colors ${phase === 'review' || phase === 'success' ? 'bg-success' : 'bg-muted'}`} />
        <Step n={2} label="Review" active={phase === 'review'} done={phase === 'success'} />
        <div className={`flex-1 h-0.5 rounded-full transition-colors ${phase === 'success' ? 'bg-success' : 'bg-muted'}`} />
        <Step n={3} label="Done" active={phase === 'success'} done={false} />
      </div>

      {(phase === 'upload' || phase === 'scanning') && (
        <div className="space-y-4">
          <Card
            className={`relative overflow-hidden transition-all duration-300 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border bg-muted/50'
            }`}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="p-0">
              {preview ? (
                <div className="relative">
                  {phase === 'scanning' && <ScanLine />}
                  <img
                    src={preview}
                    alt="Receipt"
                    className={`w-full max-h-60 object-contain mx-auto transition-all duration-300 block ${phase === 'scanning' ? 'brightness-75' : ''}`}
                  />
                  {phase !== 'scanning' && (
                    <button
                      onClick={reset}
                      className="absolute top-3 right-3 w-8 h-8 bg-destructive hover:bg-destructive/90 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 z-10"
                    >
                      <X className="w-4 h-4 text-destructive-foreground" />
                    </button>
                  )}
                  {phase === 'scanning' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-30">
                      <Sparkles className="w-8 h-8 text-primary mb-2 animate-pulse" />
                      <p className="text-primary-foreground text-sm font-semibold">Reading receipt&hellip;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">Drop your receipt here</p>
                  <p className="text-xs text-muted-foreground mb-5">PNG, JPG, HEIC up to 5MB</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-semibold text-sm cursor-pointer hover:opacity-90 transition-all shadow-md active:scale-95">
                      <Upload className="w-4 h-4" />
                      Choose File
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-border text-foreground rounded-xl font-semibold text-sm cursor-pointer hover:bg-accent transition-all active:scale-95">
                      <Camera className="w-4 h-4" />
                      Take Photo
                      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedFile && phase !== 'scanning' && (
            <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileImage className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[160px]">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button onClick={reset} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {phase === 'scanning' && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  OCR processing&hellip;
                </span>
                <span className="text-primary font-bold">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} indicatorClassName="bg-gradient-to-r from-primary to-secondary" />
              <div className="flex gap-3 text-xs text-muted-foreground">
                {['Detecting text', 'Extracting amounts', 'Identifying merchant', 'Categorizing'].map((step, i) => (
                  <span key={step} className={`flex items-center gap-1 transition-colors ${scanProgress > i * 25 ? 'text-primary font-medium' : ''}`}>
                    {scanProgress > i * 25 && <CheckCircle2 className="w-3 h-3" />}
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedFile && phase === 'upload' && (
            <Button
              onClick={handleScan}
              className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20 h-12 text-base font-bold"
              icon={Scan}
            >
              Scan Receipt with AI
            </Button>
          )}

          {!selectedFile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: '\uD83D\uDCF8', title: 'Clear photo', desc: 'Good lighting, no blur' },
                { icon: '\uD83D\uDCCB', title: 'Full receipt', desc: 'Include all edges' },
                { icon: '\uD83D\uDD0D', title: 'Readable text', desc: 'High-res image' },
                { icon: '\u26A1', title: 'Instant results', desc: 'AI OCR in seconds' }
              ].map(tip => (
                <div key={tip.title} className="p-3 bg-card border border-border rounded-xl text-center">
                  <span className="text-xl block mb-1">{tip.icon}</span>
                  <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'review' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success">Scan Complete</p>
              <p className="text-xs text-success/80">Review extracted data below and edit if needed</p>
            </div>
            <button onClick={() => setPreviewZoomed(true)} className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-5 gap-5">
            {preview && (
              <div className="sm:col-span-2">
                <button onClick={() => setPreviewZoomed(true)} className="relative w-full group">
                  <img src={preview} alt="Receipt" className="w-full rounded-xl border-2 border-border object-cover max-h-52 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="sm:col-span-3 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Amount (&#x20B9;) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">&#x20B9;</span>
                  <Input
                    type="number" step="0.01" min="0.01"
                    value={formData.amount}
                    onChange={e => setFormData(d => ({ ...d, amount: e.target.value }))}
                    className="pl-8 text-lg font-bold h-11"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Date</label>
                <Input type="date" value={formData.date} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat.value} type="button"
                      variant={formData.category === cat.value ? 'default' : 'outline'}
                      onClick={() => setFormData(d => ({ ...d, category: cat.value }))}
                      size="sm"
                      className={`text-xs font-semibold ${formData.category === cat.value ? '' : 'text-muted-foreground'}`}
                    >
                      <span>{cat.emoji}</span>
                      {cat.value}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Merchant name or note"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={reset} icon={RefreshCw}>
                  Rescan
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md font-bold"
                  icon={!isSubmitting ? CheckCircle2 : undefined}
                >
                  {isSubmitting ? 'Saving\u2026' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {phase === 'success' && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">Expense Added!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              &#x20B9;{parseFloat(formData.amount).toFixed(2)} &middot; {formData.category}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reset}>
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
    </CommonPageContainer>
  )
}

export default ReceiptScanner
