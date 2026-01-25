import { useState } from 'react'
import { Camera, Upload, Scan, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpense } from '../context/ExpenseContext'
import { receiptService } from '../services/receiptService'

const ReceiptScanner = () => {
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
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" />
          Receipt Scanner
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload receipt image</p>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG up to 5MB
                  </p>
                  <label className="btn btn-primary cursor-pointer">
                    <Upload className="w-4 h-4" />
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
                className="btn btn-primary w-full mt-4"
              >
                {scanning ? (
                  <>
                    <div className="spinner-small"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5" />
                    Scan Receipt
                  </>
                )}
              </button>
            )}

            {extractedData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Scan Complete!</span>
                </div>
                <p className="text-sm text-green-700">
                  Data extracted and filled in the form. Review and submit.
                </p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="input w-full"
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
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows="3"
                  className="input w-full"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📸 How to use:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Take a clear photo of your receipt or upload an existing image</li>
            <li>Click "Scan Receipt" to extract data using OCR</li>
            <li>Review and edit the extracted information</li>
            <li>Click "Add Expense" to save</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2">
            💡 Tip: Ensure the receipt is well-lit and text is clearly visible for best results
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReceiptScanner
