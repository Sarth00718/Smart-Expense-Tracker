import api from './api'
import { RECEIPTS } from '../config/apiEndpoints'

export const receiptService = {
  scan: (formData) => api.post(RECEIPTS.SCAN, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  scanBase64: (imageBase64, categoryHint) => api.post(RECEIPTS.SCAN_BASE64, {
    imageBase64,
    categoryHint
  }),
}
