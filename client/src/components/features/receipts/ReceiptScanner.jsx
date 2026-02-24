import { useState } from 'react'
import { Camera, Upload, Scan, X, CheckCircle, Sparkles, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpense } from '../../../context/ExpenseContext'
import { receiptService } from '../../../services/receiptService'
import ScanAnimation from '../../ui/ScanAnimation'

const ReceiptScanner = ({ onSuccess }) => {
  const { addExpense } = useExpense()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    amount: '',
    description: ''
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first')
      return
    }

    try {
      setScanning(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('receipt', selectedFile)
      formDataToSend.append('categoryHint', formData.category)

      const response = await receiptService.scan(formDataToSend)

      const data = response.data
      setExtractedData(data)

      // Auto-fill form with extracted data
      if (data.parsedData) {
        setFormData({
          date: data.parsedData.date || formData.date,
          category: data.parsedData.category || formData.category,
          amount: data.parsedData.amount?.toString() || '',
          description: data.parsedData.description || data.parsedData.merchant || ''
        })
      }

      toast.success('Receipt scanned successfully!')
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to scan receipt. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await addExpense({
        date: formData.date,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description
      })

      toast.success('Expense added successfully!')
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form
      setSelectedFile(null)
      setPreview(null)
      setExtractedData(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        amount: '',
        description: ''
      })
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setExtractedData(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Other',
      amount: '',
      description: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Receipt Scanner
            </h2>
            <p className="text-sm text-gray-500">Scan and extract expense data automatically</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <div className="relative border-3 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-blue-50/30 to-purple-50/30 hover:from-blue-50 hover:to-purple-50">
              {preview ? (
                <div className="relative group">
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
                      <ScanAnimation />
                    </div>
                  )}
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-h-80 mx-auto rounded-xl shadow-2xl border-4 border-white"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute top-3 right-3 p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-110 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <ImageIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg mb-2">Upload Receipt Image</p>
                  <p className="text-sm text-gray-500 mb-6">
                    PNG, JPG up to 5MB
                  </p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold cursor-pointer transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Upload className="w-5 h-5" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {selectedFile && !extractedData && (
              <button
                onClick={handleScan}
                disabled={scanning}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
              >
                {scanning ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scanning Receipt...
                  </>
                ) : (
                  <>
                    <Scan className="w-6 h-6" />
                    Scan Receipt
                  </>
                )}
              </button>
            )}

            {extractedData && (
              <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-green-900 text-lg">Scan Complete!</span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  Data extracted successfully. Review and submit below.
                </p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div>
            <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Expense Details</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
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
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  Add Expense
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg">How to use Receipt Scanner</h4>
          </div>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside font-medium">
            <li>Take a clear photo of your receipt or upload an existing image</li>
            <li>Click "Scan Receipt" to extract data using AI-powered OCR</li>
            <li>Review and edit the extracted information if needed</li>
            <li>Click "Add Expense" to save to your expense tracker</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Pro Tip:</span> Ensure the receipt is well-lit and text is clearly visible for best results
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceiptScanner
