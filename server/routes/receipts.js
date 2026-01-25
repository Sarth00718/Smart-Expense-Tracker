const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const auth = require('../middleware/auth');
const { parseReceiptText } = require('../utils/ocr');

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
      'eng',
      {
        logger: info => console.log(info)
      }
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

module.exports = router;
