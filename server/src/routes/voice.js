import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { parseVoiceCommand, validateExpenseData } from '../utils/voiceParser.js';
import Expense from '../models/Expense.js';

/**
 * POST /api/voice/parse
 * Parse voice transcript to expense data
 */
router.post('/parse', auth, async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Parse the voice command
    const parsedData = parseVoiceCommand(transcript);

    res.json({
      success: true,
      data: parsedData,
      message: parsedData.needsReview 
        ? 'Please review and confirm the details' 
        : 'Expense parsed successfully'
    });

  } catch (error) {
    console.error('Voice parse error:', error);
    res.status(500).json({ 
      error: 'Failed to parse voice command',
      details: error.message 
    });
  }
});

/**
 * POST /api/voice/expense
 * Create expense from voice command (direct)
 */
router.post('/expense', auth, async (req, res) => {
  try {
    const { transcript, date } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Parse voice command
    const parsedData = parseVoiceCommand(transcript);

    // Validate parsed data
    const validation = validateExpenseData(parsedData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid expense data',
        details: validation.errors,
        parsedData // Return parsed data for manual correction
      });
    }

    // Create expense
    const expense = new Expense({
      userId: req.userId,
      amount: parsedData.amount,
      category: parsedData.category,
      description: parsedData.description,
      date: date || new Date(),
      isRecurring: false
    });

    await expense.save();

    res.status(201).json({
      success: true,
      expense,
      confidence: parsedData.confidence,
      message: 'Expense created from voice command'
    });

  } catch (error) {
    console.error('Voice expense creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create expense from voice',
      details: error.message 
    });
  }
});

export default router;
