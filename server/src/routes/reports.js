import express from 'express';
const router = express.Router();
import PDFDocument from 'pdfkit';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import auth from '../middleware/auth.js';
import { Parser } from 'json2csv';

// @route   GET /api/reports/pdf
// @desc    Generate PDF financial report
// @access  Private
router.get('/pdf', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch data
    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    const income = await Income.find({
      userId: req.userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    // Calculate totals
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    // Source breakdown
    const sourceBreakdown = {};
    income.forEach(inc => {
      sourceBreakdown[inc.source] = (sourceBreakdown[inc.source] || 0) + inc.amount;
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(
      `Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(16).font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, { continued: false });
    doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`);
    doc.fontSize(14).font('Helvetica-Bold');
    doc.fillColor(netBalance >= 0 ? 'green' : 'red')
       .text(`Net Balance: ₹${netBalance.toFixed(2)}`);
    doc.fillColor('black');
    doc.moveDown(2);

    // Income Summary
    doc.fontSize(16).font('Helvetica-Bold').text('Income Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    
    if (income.length === 0) {
      doc.text('No income recorded for this period.');
    } else {
      doc.text(`Total Transactions: ${income.length}`);
      doc.moveDown(0.5);
      
      Object.entries(sourceBreakdown)
        .sort((a, b) => b[1] - a[1])
        .forEach(([source, amount]) => {
          const percentage = ((amount / totalIncome) * 100).toFixed(1);
          doc.text(`  • ${source}: ₹${amount.toFixed(2)} (${percentage}%)`);
        });
    }
    doc.moveDown(2);

    // Expense Summary
    doc.fontSize(16).font('Helvetica-Bold').text('Expense Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    
    if (expenses.length === 0) {
      doc.text('No expenses recorded for this period.');
    } else {
      doc.text(`Total Transactions: ${expenses.length}`);
      doc.moveDown(0.5);
      
      Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          const percentage = ((amount / totalExpenses) * 100).toFixed(1);
          doc.text(`  • ${category}: ₹${amount.toFixed(2)} (${percentage}%)`);
        });
    }
    doc.moveDown(2);

    // Category Breakdown (detailed)
    if (Object.keys(categoryBreakdown).length > 0) {
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('Detailed Category Breakdown');
      doc.moveDown(1);

      Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, total]) => {
          doc.fontSize(14).font('Helvetica-Bold').text(category);
          doc.fontSize(11).font('Helvetica');
          
          const categoryExpenses = expenses.filter(exp => exp.category === category);
          categoryExpenses.slice(0, 10).forEach(exp => {
            doc.text(
              `  ${new Date(exp.date).toLocaleDateString()}: ₹${exp.amount.toFixed(2)} - ${exp.description || 'No description'}`,
              { width: 500 }
            );
          });
          
          if (categoryExpenses.length > 10) {
            doc.text(`  ... and ${categoryExpenses.length - 10} more transactions`);
          }
          
          doc.moveDown(1);
        });
    }

    // Footer
    doc.fontSize(10).font('Helvetica').fillColor('gray');
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }
});

export default router;
