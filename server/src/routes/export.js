import express from 'express';
const router = express.Router();
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import auth from '../middleware/auth.js';

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

    // Note: Chart generation removed to reduce dependencies
    // Charts can be generated on the frontend using recharts

    // Create PDF with better configuration
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true,
      info: {
        Title: 'Comprehensive Financial Report',
        Author: 'Smart Expense Tracker',
        Subject: 'Financial Analysis Report',
        Keywords: 'finance, expenses, income, budget'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    // Helper function to draw a colored box
    const drawBox = (x, y, width, height, fillColor, strokeColor = null) => {
      doc.rect(x, y, width, height).fill(fillColor);
      if (strokeColor) {
        doc.rect(x, y, width, height).stroke(strokeColor);
      }
    };

    // Helper function to add section header
    const addSectionHeader = (title, icon = '') => {
      if (doc.y > 700) doc.addPage();
      doc.moveDown(0.5);
      drawBox(50, doc.y, 495, 35, '#4361ee');
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff')
         .text(`${icon} ${title}`, 60, doc.y + 10);
      doc.moveDown(1.5);
      doc.fillColor('#000000');
    };

    // Cover Page with gradient effect
    doc.rect(0, 0, 612, 792).fill('#4361ee');
    
    // Title
    doc.fontSize(40).font('Helvetica-Bold').fillColor('#ffffff')
       .text('Financial Report', 50, 200, { align: 'center', width: 512 });
    
    doc.fontSize(18).font('Helvetica').fillColor('#e0e7ff')
       .text('Comprehensive Analysis', 50, 260, { align: 'center', width: 512 });
    
    // Date box
    drawBox(156, 320, 300, 80, '#ffffff');
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#4361ee')
       .text('Report Generated', 156, 335, { align: 'center', width: 300 });
    doc.fontSize(14).font('Helvetica').fillColor('#1e293b')
       .text(new Date().toLocaleDateString('en-US', { 
         year: 'numeric', month: 'long', day: 'numeric' 
       }), 156, 355, { align: 'center', width: 300 });
    doc.fontSize(11).fillColor('#64748b')
       .text(`Period: ${start.toLocaleDateString('en-US')} - ${end.toLocaleDateString('en-US')}`, 
             156, 375, { align: 'center', width: 300 });
    
    // Stats preview
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff')
       .text(`Rs ${netBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 50, 480, { align: 'center', width: 512 });
    doc.fontSize(12).font('Helvetica').fillColor('#e0e7ff')
       .text('Net Balance', 50, 515, { align: 'center', width: 512 });
    
    // Footer
    doc.fontSize(10).fillColor('#e0e7ff')
       .text('Smart Expense Tracker', 50, 720, { align: 'center', width: 512 });

    // Page 2: Executive Summary
    doc.addPage();
    addSectionHeader('Executive Summary', '📊');

    // Summary cards
    const cardWidth = 230;
    const cardHeight = 100;
    const cardSpacing = 35;
    let cardY = doc.y;

    // Income Card
    drawBox(50, cardY, cardWidth, cardHeight, '#f0fdf4');
    doc.rect(50, cardY, cardWidth, cardHeight).stroke('#10b981');
    doc.fontSize(12).font('Helvetica').fillColor('#059669')
       .text('Total Income', 60, cardY + 15);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#047857')
       .text(`Rs ${totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 60, cardY + 40);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
       .text(`${income.length} transactions`, 60, cardY + 75);

    // Expenses Card
    drawBox(315, cardY, cardWidth, cardHeight, '#fef2f2');
    doc.rect(315, cardY, cardWidth, cardHeight).stroke('#ef4444');
    doc.fontSize(12).font('Helvetica').fillColor('#dc2626')
       .text('Total Expenses', 325, cardY + 15);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#b91c1c')
       .text(`Rs ${totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 325, cardY + 40);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
       .text(`${expenses.length} transactions`, 325, cardY + 75);

    cardY += cardHeight + cardSpacing;

    // Net Balance Card
    const balanceColor = netBalance >= 0 ? '#10b981' : '#ef4444';
    const balanceBg = netBalance >= 0 ? '#f0fdf4' : '#fef2f2';
    drawBox(50, cardY, cardWidth, cardHeight, balanceBg);
    doc.rect(50, cardY, cardWidth, cardHeight).stroke(balanceColor);
    doc.fontSize(12).font('Helvetica').fillColor(balanceColor)
       .text('Net Balance', 60, cardY + 15);
    doc.fontSize(22).font('Helvetica-Bold').fillColor(balanceColor)
       .text(`Rs ${netBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 60, cardY + 40);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
       .text(netBalance >= 0 ? 'Surplus' : 'Deficit', 60, cardY + 75);

    // Savings Rate Card
    drawBox(315, cardY, cardWidth, cardHeight, '#eff6ff');
    doc.rect(315, cardY, cardWidth, cardHeight).stroke('#3b82f6');
    doc.fontSize(12).font('Helvetica').fillColor('#2563eb')
       .text('Savings Rate', 325, cardY + 15);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1d4ed8')
       .text(`${savingsRate}%`, 325, cardY + 40);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
       .text('of total income', 325, cardY + 75);

    doc.y = cardY + cardHeight + 40;

    // Key Insights
    addSectionHeader('Key Insights', '💡');
    
    const insights = [];
    
    // Top spending category
    if (categoryData.length > 0) {
      insights.push(`Your highest spending category is ${categoryData[0].category} with Rs ${categoryData[0].total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    }
    
    // Savings insight
    if (savingsRate > 20) {
      insights.push(`Excellent! You're saving ${savingsRate}% of your income`);
    } else if (savingsRate > 10) {
      insights.push(`Good job! You're saving ${savingsRate}% of your income`);
    } else if (savingsRate > 0) {
      insights.push(`You're saving ${savingsRate}% of your income. Consider increasing this to 20%+`);
    } else {
      insights.push(`Your expenses exceed your income. Review your spending to improve your financial health`);
    }
    
    // Transaction frequency
    const avgDailyExpenses = expenses.length / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    insights.push(`You average ${avgDailyExpenses.toFixed(1)} transactions per day`);
    
    // Budget adherence
    if (budgets.length > 0) {
      const budgetsOnTrack = budgets.filter(b => {
        const spent = categoryBreakdown[b.category] || 0;
        return spent <= b.monthlyBudget;
      }).length;
      insights.push(`${budgetsOnTrack} out of ${budgets.length} budgets are on track`);
    }

    insights.forEach((insight, index) => {
      if (doc.y > 700) doc.addPage();
      drawBox(50, doc.y, 495, 50, '#f8fafc');
      doc.rect(50, doc.y, 495, 50).stroke('#e2e8f0');
      doc.fontSize(11).font('Helvetica').fillColor('#1e293b')
         .text(`${index + 1}. ${insight}`, 65, doc.y + 18, { width: 465 });
      doc.moveDown(2.5);
    });

    // Detailed Breakdown
    doc.addPage();
    addSectionHeader('Category Breakdown', '📈');

    if (categoryData.length === 0) {
      doc.fontSize(12).font('Helvetica').fillColor('#6b7280')
         .text('No expense data available for this period', { align: 'center' });
    } else {
      // Table header
      drawBox(50, doc.y, 495, 30, '#f1f5f9');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b')
         .text('Category', 60, doc.y + 10)
         .text('Amount', 280, doc.y + 10)
         .text('% of Total', 400, doc.y + 10)
         .text('Transactions', 480, doc.y + 10);
      doc.moveDown(1.5);

      categoryData.forEach((cat, index) => {
        if (doc.y > 720) {
          doc.addPage();
          addSectionHeader('Category Breakdown (continued)', '📈');
        }
        
        const percentage = ((cat.total / totalExpenses) * 100).toFixed(1);
        const categoryExpenses = expenses.filter(exp => exp.category === cat.category);
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        drawBox(50, doc.y, 495, 35, bgColor);
        doc.rect(50, doc.y, 495, 35).stroke('#e5e7eb');
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b')
           .text(cat.category, 60, doc.y + 12, { width: 200 });
        doc.font('Helvetica').fillColor('#ef4444')
           .text(`Rs ${cat.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 280, doc.y + 12);
        doc.fillColor('#6b7280')
           .text(`${percentage}%`, 400, doc.y + 12);
        doc.fillColor('#6b7280')
           .text(categoryExpenses.length.toString(), 490, doc.y + 12);
        
        doc.moveDown(1.8);
      });
    }

    // Budget Status
    if (budgets.length > 0) {
      doc.addPage();
      addSectionHeader('Budget Analysis', '💰');

      budgets.forEach((budget, index) => {
        if (doc.y > 680) {
          doc.addPage();
          addSectionHeader('Budget Analysis (continued)', '💰');
        }
        
        const spent = categoryBreakdown[budget.category] || 0;
        const remaining = budget.monthlyBudget - spent;
        const percentUsed = ((spent / budget.monthlyBudget) * 100).toFixed(1);
        
        // Budget card
        const cardColor = percentUsed > 100 ? '#fef2f2' : percentUsed > 80 ? '#fffbeb' : '#f0fdf4';
        const borderColor = percentUsed > 100 ? '#ef4444' : percentUsed > 80 ? '#f59e0b' : '#10b981';
        const statusColor = percentUsed > 100 ? '#dc2626' : percentUsed > 80 ? '#d97706' : '#059669';
        
        drawBox(50, doc.y, 495, 90, cardColor);
        doc.rect(50, doc.y, 495, 90).stroke(borderColor);
        
        // Category name
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b')
           .text(budget.category, 65, doc.y + 15);
        
        // Budget bar visualization
        const barWidth = 400;
        const barHeight = 20;
        const barX = 65;
        const barY = doc.y + 40;
        
        // Background bar
        drawBox(barX, barY, barWidth, barHeight, '#e5e7eb');
        
        // Progress bar
        const progressWidth = Math.min((spent / budget.monthlyBudget) * barWidth, barWidth);
        drawBox(barX, barY, progressWidth, barHeight, statusColor);
        
        // Bar border
        doc.rect(barX, barY, barWidth, barHeight).stroke('#9ca3af');
        
        // Percentage text on bar
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff')
           .text(`${percentUsed}%`, barX + progressWidth - 35, barY + 5);
        
        // Budget details
        doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
           .text(`Budget: Rs ${budget.monthlyBudget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 65, doc.y + 70)
           .text(`Spent: Rs ${spent.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 220, doc.y + 70)
           .text(`Remaining: Rs ${remaining.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 370, doc.y + 70);
        
        doc.moveDown(5);
      });
    }

    // Savings Goals
    if (goals.length > 0) {
      doc.addPage();
      addSectionHeader('Savings Goals', '🎯');

      goals.forEach((goal, index) => {
        if (doc.y > 680) {
          doc.addPage();
          addSectionHeader('Savings Goals (continued)', '🎯');
        }
        
        const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
        const remaining = goal.targetAmount - goal.currentAmount;
        const isComplete = progress >= 100;
        
        // Goal card
        const cardColor = isComplete ? '#f0fdf4' : '#eff6ff';
        const borderColor = isComplete ? '#10b981' : '#3b82f6';
        
        drawBox(50, doc.y, 495, 110, cardColor);
        doc.rect(50, doc.y, 495, 110).stroke(borderColor);
        
        // Goal name and category
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b')
           .text(goal.name, 65, doc.y + 15);
        if (goal.category) {
          doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
             .text(goal.category, 65, doc.y + 35);
        }
        
        // Progress bar
        const barWidth = 400;
        const barHeight = 25;
        const barX = 65;
        const barY = doc.y + 50;
        
        // Background bar
        drawBox(barX, barY, barWidth, barHeight, '#e5e7eb');
        
        // Progress bar
        const progressWidth = Math.min((goal.currentAmount / goal.targetAmount) * barWidth, barWidth);
        const progressColor = isComplete ? '#10b981' : '#3b82f6';
        drawBox(barX, barY, progressWidth, barHeight, progressColor);
        
        // Bar border
        doc.rect(barX, barY, barWidth, barHeight).stroke('#9ca3af');
        
        // Percentage text on bar
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff')
           .text(`${progress}%`, barX + (progressWidth > 50 ? progressWidth - 45 : progressWidth + 5), barY + 7);
        
        // Goal details
        doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
           .text(`Target: Rs ${goal.targetAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 65, doc.y + 85)
           .text(`Current: Rs ${goal.currentAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 220, doc.y + 85)
           .text(`Remaining: Rs ${remaining.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 370, doc.y + 85);
        
        if (goal.deadline) {
          const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          doc.fontSize(9).fillColor('#6b7280')
             .text(`Deadline: ${new Date(goal.deadline).toLocaleDateString()} (${daysRemaining} days)`, 65, doc.y + 100);
        }
        
        doc.moveDown(6);
      });
    }

    // Recent Transactions
    doc.addPage();
    addSectionHeader('Recent Transactions', '📝');

    const recentTransactions = [...expenses, ...income]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);

    if (recentTransactions.length === 0) {
      doc.fontSize(12).font('Helvetica').fillColor('#6b7280')
         .text('No transactions found for this period', { align: 'center' });
    } else {
      // Table header
      drawBox(50, doc.y, 495, 30, '#f1f5f9');
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
         .text('Date', 60, doc.y + 10)
         .text('Category', 140, doc.y + 10)
         .text('Description', 260, doc.y + 10)
         .text('Amount', 420, doc.y + 10)
         .text('Type', 500, doc.y + 10);
      doc.moveDown(1.5);

      recentTransactions.forEach((trans, index) => {
        if (doc.y > 720) {
          doc.addPage();
          addSectionHeader('Recent Transactions (continued)', '📝');
          // Repeat header
          drawBox(50, doc.y, 495, 30, '#f1f5f9');
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
             .text('Date', 60, doc.y + 10)
             .text('Category', 140, doc.y + 10)
             .text('Description', 260, doc.y + 10)
             .text('Amount', 420, doc.y + 10)
             .text('Type', 500, doc.y + 10);
          doc.moveDown(1.5);
        }
        
        const isExpense = trans.category !== undefined;
        const amount = trans.amount;
        const type = isExpense ? 'Expense' : 'Income';
        const category = isExpense ? trans.category : trans.source;
        const description = trans.description || '-';
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        drawBox(50, doc.y, 495, 30, bgColor);
        doc.rect(50, doc.y, 495, 30).stroke('#e5e7eb');
        
        doc.fontSize(9).font('Helvetica').fillColor('#6b7280')
           .text(new Date(trans.date).toLocaleDateString('en-US', { 
             month: 'short', day: 'numeric', year: '2-digit' 
           }), 60, doc.y + 10);
        doc.fillColor('#1e293b')
           .text(category.substring(0, 15), 140, doc.y + 10);
        doc.fillColor('#6b7280')
           .text(description.substring(0, 20), 260, doc.y + 10);
        doc.fillColor(isExpense ? '#ef4444' : '#10b981')
           .text(`${isExpense ? '-' : '+'}Rs ${amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 420, doc.y + 10);
        doc.fontSize(8).fillColor('#6b7280')
           .text(type, 500, doc.y + 11);
        
        doc.moveDown(1.5);
      });
    }

    // Monthly Summary
    if (monthlyData.length > 0) {
      doc.addPage();
      addSectionHeader('Monthly Comparison', '📅');

      // Table header
      drawBox(50, doc.y, 495, 30, '#f1f5f9');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b')
         .text('Month', 60, doc.y + 10)
         .text('Income', 220, doc.y + 10)
         .text('Expenses', 340, doc.y + 10)
         .text('Net', 460, doc.y + 10);
      doc.moveDown(1.5);

      monthlyData.forEach((month, index) => {
        if (doc.y > 720) doc.addPage();
        
        const net = month.income - month.expense;
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        drawBox(50, doc.y, 495, 35, bgColor);
        doc.rect(50, doc.y, 495, 35).stroke('#e5e7eb');
        
        doc.fontSize(10).font('Helvetica').fillColor('#1e293b')
           .text(month.month, 60, doc.y + 12);
        doc.fillColor('#10b981')
           .text(`Rs ${month.income.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 220, doc.y + 12);
        doc.fillColor('#ef4444')
           .text(`Rs ${month.expense.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 340, doc.y + 12);
        doc.fillColor(net >= 0 ? '#10b981' : '#ef4444')
           .text(`Rs ${net.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 460, doc.y + 12);
        
        doc.moveDown(1.8);
      });
    }

    // Footer on all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Footer line
      doc.moveTo(50, doc.page.height - 60).lineTo(545, doc.page.height - 60).stroke('#e5e7eb');
      
      // Footer text
      doc.fontSize(9).font('Helvetica').fillColor('#9ca3af');
      doc.text(
        'Smart Expense Tracker',
        50,
        doc.page.height - 45,
        { width: 200, align: 'left' }
      );
      doc.text(
        `Page ${i + 1} of ${pages.count}`,
        345,
        doc.page.height - 45,
        { width: 200, align: 'right' }
      );
      
      // Timestamp
      doc.fontSize(8).fillColor('#cbd5e1');
      doc.text(
        `Generated: ${new Date().toLocaleString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        })}`,
        50,
        doc.page.height - 30,
        { width: 495, align: 'center' }
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

export default router;
