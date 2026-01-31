import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Save, Calendar, DollarSign, Tag, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

const AdvancedSearch = ({ onSearch, onClose }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    categories: [],
    paymentModes: [],
    tags: [],
    searchText: ''
  });

  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['Food', 'Travel', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
  const paymentModes = ['Cash', 'Card', 'UPI', 'Net Banking', 'Wallet', 'Other'];

  const quickFilters = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' }
  ];

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      const response = await api.get('/filters');
      setSavedFilters(response.data);
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      const response = await api.post('/filters/search', filters);
      
      if (onSearch) {
        onSearch(response.data);
      }
      
      toast.success(`Found ${response.data.expenses.length} expenses`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickFilter = async (preset) => {
    setIsSearching(true);
    
    try {
      const response = await api.get(`/filters/quick/${preset}`);
      
      if (onSearch) {
        onSearch(response.data);
      }
      
      toast.success(`Applied ${preset} filter`);
    } catch (error) {
      console.error('Quick filter error:', error);
      toast.error('Failed to apply filter');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name');
      return;
    }

    try {
      await api.post('/filters', {
        name: filterName,
        filters
      });

      toast.success('Filter saved successfully');
      setShowSaveDialog(false);
      setFilterName('');
      loadSavedFilters();
    } catch (error) {
      console.error('Save filter error:', error);
      toast.error(error.response?.data?.error || 'Failed to save filter');
    }
  };

  const handleLoadFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    toast.success(`Loaded filter: ${savedFilter.name}`);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      categories: [],
      paymentModes: [],
      tags: [],
      searchText: ''
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Advanced Search</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(qf => (
            <button
              key={qf.value}
              onClick={() => handleQuickFilter(qf.value)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {qf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Search className="w-4 h-4 inline mr-1" />
          Search Description
        </label>
        <input
          type="text"
          value={filters.searchText}
          onChange={(e) => handleFilterChange('searchText', e.target.value)}
          placeholder="Search in descriptions..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Amount Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Amount Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={filters.amountRange.min}
            onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
            placeholder="Min amount"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            value={filters.amountRange.max}
            onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
            placeholder="Max amount"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleArrayToggle('categories', cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filters.categories.includes(cat)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Modes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CreditCard className="w-4 h-4 inline mr-1" />
          Payment Modes
        </label>
        <div className="flex flex-wrap gap-2">
          {paymentModes.map(mode => (
            <button
              key={mode}
              onClick={() => handleArrayToggle('paymentModes', mode)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filters.paymentModes.includes(mode)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Save className="w-5 h-5" />
        </button>
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Filters</h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(sf => (
              <button
                key={sf._id}
                onClick={() => handleLoadFilter(sf)}
                className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
              >
                {sf.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveFilter}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
