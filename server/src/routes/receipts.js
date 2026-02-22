import express from 'express';
const router = express.Router();
import multer from 'multer';
import Tesseract from 'tesseract.js';
import auth from '../middleware/auth.js';
import { parseReceiptText } from '../utils/ocr.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   POST /api/receipts/scan
// @desc    Scan receipt and extract data
// @access  Private
router.post('/scan', auth, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { categoryHint } = req.body;

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(
      req.file.buffer,
      'eng'
    );

    // Parse extracted text
    const extractedData = parseReceiptText(text, categoryHint);

    res.json({
      success: true,
      extractedText: text,
      parsedData: extractedData
    });

  } catch (error) {
    console.error('Receipt scan error:', error);
    res.status(500).json({
      error: 'Failed to scan receipt',
      message: error.message
    });
  }
});

// @route   POST /api/receipts/scan-base64
// @desc    Scan receipt from base64 image
// @access  Private
router.post('/scan-base64', auth, async (req, res) => {
  try {
    const { imageBase64, categoryHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      'eng'
    );

    // Parse extracted text
    const extractedData = parseReceiptText(text, categoryHint);

    res.json({
      success: true,
      extractedText: text,
      parsedData: extractedData
    });

  } catch (error) {
    console.error('Receipt scan error:', error);
    res.status(500).json({
      error: 'Failed to scan receipt',
      message: error.message
    });
  }
});

// Handle multer errors (file too large, wrong type, etc.)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
