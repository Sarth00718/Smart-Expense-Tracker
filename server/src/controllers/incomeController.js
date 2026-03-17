import Income from '../models/Income.js';
import { getSummaryStats, validateAmount, buildDateFilter, buildPagination, formatPaginationResponse } from '../utils/helpers.js';

export const getAllIncome = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const query = { userId: req.userId, ...buildDateFilter(req.query) };
    if (req.query.source) query.source = req.query.source;

    const total = await Income.countDocuments(query);
    const income = await Income.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit);
    res.json({ data: income, pagination: formatPaginationResponse(total, page, limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income' });
  }
};

export const createIncome = async (req, res) => {
  try {
    const { date, source, amount, description, isRecurring } = req.body;
    if (!date || !source || !amount) return res.status(400).json({ error: 'Date, source, and amount are required' });

    const v = validateAmount(amount);
    if (!v.valid) return res.status(400).json({ error: v.error });

    const income = await Income.create({
      userId: req.userId,
      date: new Date(date),
      source,
      amount: v.value,
      description: description || '',
      isRecurring: isRecurring || false,
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add income' });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const { date, source, amount, description, isRecurring } = req.body;
    const income = await Income.findOne({ _id: req.params.id, userId: req.userId });
    if (!income) return res.status(404).json({ error: 'Income not found' });

    if (date) income.date = new Date(date);
    if (source) income.source = source;
    if (amount !== undefined) {
      const v = validateAmount(amount);
      if (!v.valid) return res.status(400).json({ error: v.error });
      income.amount = v.value;
    }
    if (description !== undefined) income.description = description;
    if (isRecurring !== undefined) income.isRecurring = isRecurring;

    await income.save();
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update income' });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!income) return res.status(404).json({ error: 'Income not found' });
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
};

export const getSources = async (req, res) => {
  try {
    const sources = await Income.distinct('source', { userId: req.userId });
    res.json({ sources: sources.sort() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const summary = await getSummaryStats(Income, req.userId, 'source');
    res.json({
      total_income: summary.total,
      this_month: summary.thisMonth,
      sources: summary.groups.map((g) => ({ source: g.source, total: g.total, count: g.count })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income summary' });
  }
};
