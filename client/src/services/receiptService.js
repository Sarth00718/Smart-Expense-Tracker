import api from './api'

export const receiptService = {
  scan: (formData) => api.post('/receipts/scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  scanBase64: (imageBase64, categoryHint) => api.post('/receipts/scan-base64', {
    imageBase64,
    categoryHint
  })
}
