const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');
const {
  generateCategoryPieChart,
  generateSpendingTrendChart,
  generateIncomeVsExpenseChart,
  generateMonthlyComparisonChart
} = require('../utils/chartGenerator');

// @route   GET /api/export/expenses
// @desc    Export expenses to CSV/JSON
// @access  Private
router.get('/expenses', auth, async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    let query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();

    if (expenses.length === 0) {
      return res.status(404).json({ error: 'No expenses found' });
    }

    // Format data
    const formattedData = expenses.map(exp => ({
      Date: new Date(exp.date).toLocaleDateString(),
      Category: exp.category,
      Amount: exp.amount,
      Description: exp.description || '',
      PaymentMethod: exp.paymentMethod || '',
      Tags: exp.tags ? exp.tags.join(', ') : '',
      IsRecurring: exp.isRecurring ? 'Yes' : 'No'
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.json');
      return res.json(formattedData);
    }

    // CSV format
    const parser = new Parser();
    const csv = parser.parse(formattedData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);

  } catch (error) {
    console.error('Export expenses error:', error);
    res.status(500).json({ error: 'Failed to export expenses' });
  }
});

// @route   GET /api/export/income
// @desc    Export income to CSV/JSON
// @access  Private
router.get('/income', auth, async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    let query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const incomes = await Income.find(query).sort({ date: -1 }).lean();

    if (incomes.length === 0) {
      return res.status(404).json({ error: 'No income records found' });
    }

    const formattedData = incomes.map(inc => ({
      Date: new Date(inc.date).toLocaleDateString(),
      Source: inc.source,
      Amount: inc.amount,
      Description: inc.description || '',
      IsRecurring: inc.isRecurring ? 'Yes' : 'No'
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=income.json');
      return res.json(formattedData);
    }

    const parser = new Parser();
    const csv = parser.parse(formattedData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=income.csv');
    res.send(csv);

  } catch (error) {
    console.error('Export income error:', error);
    res.status(500).json({ error: 'Failed to export income' });
  }
});

// @route   GET /api/export/all
// @desc    Export all financial data
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    const [expenses, incomes, budgets, goals] = await Promise.all([
      Expense.find({ userId: req.userId, ...dateQuery }).sort({ date: -1 }).lean(),
      Income.find({ userId: req.userId, ...dateQuery }).sort({ date: -1 }).lean(),
      Budget.find({ userId: req.userId }).lean(),
      Goal.find({ userId: req.userId }).lean()
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalIncome: incomes.reduce((sum, i) => sum + i.amount, 0),
        expenseCount: expenses.length,
        incomeCount: incomes.length,
        budgetCount: budgets.length,
        goalCount: goals.length
      },
      expenses: expenses.map(e => ({
        date: e.date,
        category: e.category,
        amount: e.amount,
        description: e.description,
        paymentMethod: e.paymentMethod,
        tags: e.tags,
        isRecurring: e.isRecurring
      })),
      income: incomes.map(i => ({
        date: i.date,
        source: i.source,
        amount: i.amount,
        description: i.description,
        isRecurring: i.isRecurring
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        monthlyBudget: b.monthlyBudget,
        alertThreshold: b.alertThreshold
      })),
      goals: goals.map(g => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        category: g.category
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-data.json');
    res.json(exportData);

  } catch (error) {
    console.error('Export all data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// @route   GET /api/export/all-csv
// @desc    Export all financial data to CSV
// @access  Private
router.get('/all-csv', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId: req.userId, ...dateQuery }).sort({ date: -1 }).lean(),
      Income.find({ userId: req.userId, ...dateQuery }).sort({ date: -1 }).lean()
    ]);

    // Combine all data
    const combinedData = [
      ...expenses.map(e => ({
        Type: 'Expense',
        Date: new Date(e.date).toLocaleDateString(),
        Category: e.category,
        Amount: -e.amount,
        Description: e.description || '',
        PaymentMethod: e.paymentMethod || '',
        Tags: e.tags ? e.tags.join(', ') : ''
      })),
      ...incomes.map(i => ({
        Type: 'Income',
        Date: new Date(i.date).toLocaleDateString(),
        Category: i.source,
        Amount: i.amount,
        Description: i.description || '',
        PaymentMethod: '',
        Tags: ''
      }))
    ];

    // Sort by date
    combinedData.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    const parser = new Parser();
    const csv = parser.parse(combinedData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-data.csv');
    res.send(csv);

  } catch (error) {
    console.error('Export all CSV error:', error);
    res.status(500).json({ error: 'Failed to export data to CSV' });
  }
});

// @route   GET /api/export/comprehensive-pdf
// @desc    Generate comprehensive PDF report with charts
// @access  Private
router.get('/comprehensive-pdf', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch all data
    const [expenses, income, budgets, goals] = await Promise.all([
      Expense.find({
        userId: req.userId,
        date: { $gte: start, $lte: end }
      }).sort({ date: -1 }),
      Income.find({
        userId: req.userId,
        date: { $gte: start, $lte: end }
      }).sort({ date: -1 }),
      Budget.find({ userId: req.userId }),
      Goal.find({ userId: req.userId })
    ]);

    // Calculate statistics
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    const categoryData = Object.entries(categoryBreakdown)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // Spending trend data (daily)
    const trendMap = {};
    expenses.forEach(exp => {
      const dateKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[dateKey] = (trendMap[dateKey] || 0) + exp.amount;
    });
    const trendData = Object.entries(trendMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(0, 30);

    // Monthly comparison data
    const monthlyMap = {};
    expenses.forEach(exp => {
      const monthKey = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };
      monthlyMap[monthKey].expense += exp.amount;
    });
    income.forEach(inc => {
      const monthKey = new Date(inc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };
      monthlyMap[monthKey].income += inc.amount;
    });
    const monthlyData = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .slice(0, 6);

    // Generate charts
    const [categoryChart, trendChart, incomeVsExpenseChart, monthlyChart] = await Promise.all([
      categoryData.length > 0 ? generateCategoryPieChart(categoryData) : null,
      trendData.length > 0 ? generateSpendingTrendChart(trendData) : null,
      generateIncomeVsExpenseChart(totalIncome, totalExpenses),
      monthlyData.length > 0 ? generateMonthlyComparisonChart(monthlyData) : null
    ]);

    // Create PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=comprehensive-report-${Date.now()}.pdf`);
    doc.pipe(res);

    // Cover Page
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#4361ee')
       .text('Comprehensive Financial Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').fillColor('#666')
       .text(`Generated on ${new Date().toLocaleDateString('en-US', { 
         year: 'numeric', month: 'long', day: 'numeric' 
       })}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(
      `Report Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      { align: 'center' }
    );
    doc.moveDown(3);

    // Executive Summary Box
    doc.roundedRect(50, doc.y, 495, 200, 10).fillAndStroke('#f0f4ff', '#4361ee');
    doc.fillColor('#000');
    doc.fontSize(18).font('Helvetica-Bold').text('Executive Summary', 70, doc.y + 20);
    
    const summaryY = doc.y + 50;
    doc.fontSize(12).font('Helvetica');
    doc.fillColor('#10b981').text(`Total Income:`, 70, summaryY);
    doc.fillColor('#000').text(`₹${totalIncome.toFixed(2)}`, 250, summaryY);
    
    doc.fillColor('#ef4444').text(`Total Expenses:`, 70, summaryY + 25);
    doc.fillColor('#000').text(`₹${totalExpenses.toFixed(2)}`, 250, summaryY + 25);
    
    doc.fillColor(netBalance >= 0 ? '#10b981' : '#ef4444')
       .text(`Net Balance:`, 70, summaryY + 50);
    doc.fillColor(netBalance >= 0 ? '#10b981' : '#ef4444')
       .text(`₹${netBalance.toFixed(2)}`, 250, summaryY + 50);
    
    doc.fillColor('#4361ee').text(`Savings Rate:`, 70, summaryY + 75);
    doc.fillColor('#000').text(`${savingsRate}%`, 250, summaryY + 75);

    doc.fillColor('#666').text(`Transactions:`, 70, summaryY + 100);
    doc.fillColor('#000').text(`${expenses.length + income.length}`, 250, summaryY + 100);

    // New page for charts
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#4361ee')
       .text('Financial Analytics & Visualizations', { align: 'center' });
    doc.moveDown(2);

    // Income vs Expense Chart
    if (incomeVsExpenseChart) {
      doc.image(incomeVsExpenseChart, 50, doc.y, { width: 495, height: 250 });
      doc.moveDown(13);
    }

    // Category Pie Chart
    if (categoryChart) {
      if (doc.y > 500) doc.addPage();
      doc.image(categoryChart, 50, doc.y, { width: 495, height: 250 });
      doc.moveDown(13);
    }

    // Spending Trend Chart
    if (trendChart) {
      doc.addPage();
      doc.image(trendChart, 50, 50, { width: 495, height: 250 });
      doc.moveDown(13);
    }

    // Monthly Comparison Chart
    if (monthlyChart) {
      if (doc.y > 500) doc.addPage();
      doc.image(monthlyChart, 50, doc.y, { width: 495, height: 250 });
    }

    // Detailed Breakdown
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#4361ee')
       .text('Detailed Category Breakdown', { align: 'left' });
    doc.moveDown(1);

    categoryData.forEach((cat, index) => {
      if (doc.y > 700) doc.addPage();
      
      const percentage = ((cat.total / totalExpenses) * 100).toFixed(1);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
         .text(`${index + 1}. ${cat.category}`);
      doc.fontSize(11).font('Helvetica').fillColor('#666')
         .text(`Amount: ₹${cat.total.toFixed(2)} (${percentage}% of total expenses)`);
      
      const categoryExpenses = expenses.filter(exp => exp.category === cat.category);
      doc.fontSize(10).fillColor('#888')
         .text(`Transactions: ${categoryExpenses.length}`);
      
      doc.moveDown(0.8);
    });

    // Budget Status
    if (budgets.length > 0) {
      doc.addPage();
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4361ee')
         .text('Budget Status', { align: 'left' });
      doc.moveDown(1);

      budgets.forEach(budget => {
        if (doc.y > 700) doc.addPage();
        
        const spent = categoryBreakdown[budget.category] || 0;
        const remaining = budget.monthlyBudget - spent;
        const percentUsed = ((spent / budget.monthlyBudget) * 100).toFixed(1);
        
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
           .text(budget.category);
        doc.fontSize(11).font('Helvetica').fillColor('#666')
           .text(`Budget: ₹${budget.monthlyBudget.toFixed(2)} | Spent: ₹${spent.toFixed(2)} | Remaining: ₹${remaining.toFixed(2)}`);
        doc.fontSize(10).fillColor(percentUsed > 100 ? '#ef4444' : percentUsed > 80 ? '#f59e0b' : '#10b981')
           .text(`${percentUsed}% utilized`);
        
        doc.moveDown(0.8);
      });
    }

    // Savings Goals
    if (goals.length > 0) {
      doc.addPage();
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4361ee')
         .text('Savings Goals Progress', { align: 'left' });
      doc.moveDown(1);

      goals.forEach(goal => {
        if (doc.y > 700) doc.addPage();
        
        const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
        const remaining = goal.targetAmount - goal.currentAmount;
        
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
           .text(goal.name);
        doc.fontSize(11).font('Helvetica').fillColor('#666')
           .text(`Target: ₹${goal.targetAmount.toFixed(2)} | Current: ₹${goal.currentAmount.toFixed(2)} | Remaining: ₹${remaining.toFixed(2)}`);
        doc.fontSize(10).fillColor('#4361ee')
           .text(`${progress}% complete`);
        if (goal.deadline) {
          doc.fontSize(9).fillColor('#888')
             .text(`Deadline: ${new Date(goal.deadline).toLocaleDateString()}`);
        }
        
        doc.moveDown(0.8);
      });
    }

    // Recent Transactions
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#4361ee')
       .text('Recent Transactions', { align: 'left' });
    doc.moveDown(1);

    const recentTransactions = [...expenses, ...income]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    recentTransactions.forEach(trans => {
      if (doc.y > 720) doc.addPage();
      
      const isExpense = trans.category !== undefined;
      const amount = isExpense ? -trans.amount : trans.amount;
      const type = isExpense ? 'Expense' : 'Income';
      const category = isExpense ? trans.category : trans.source;
      
      doc.fontSize(10).font('Helvetica').fillColor('#666')
         .text(new Date(trans.date).toLocaleDateString(), 50, doc.y);
      doc.fillColor('#000')
         .text(category, 150, doc.y);
      doc.fillColor(isExpense ? '#ef4444' : '#10b981')
         .text(`₹${Math.abs(amount).toFixed(2)}`, 350, doc.y);
      doc.fillColor('#888')
         .text(type, 470, doc.y);
      
      doc.moveDown(0.5);
    });

    // Footer on all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).font('Helvetica').fillColor('#999');
      doc.text(
        `Smart Expense Tracker | Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: 495 }
      );
    }

    doc.end();

  } catch (error) {
    console.error('Comprehensive PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate comprehensive PDF report' });
    }
  }
});

module.exports = router;
