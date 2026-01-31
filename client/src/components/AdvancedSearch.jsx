import { useState, useEffect } from 'react';
import { Search, Filter, X, Save, Calendar, DollarSign, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdvancedSearch = ({ onSearch, onClose }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    categories: [],
    tags: [],
    searchText: ''
  });

  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['Food', 'Travel', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

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
      tags: [],
      searchText: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Advanced Search</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(qf => (
            <button
              key={qf.value}
              onClick={() => handleQuickFilter(qf.value)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              {qf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Text */}
      <div className="mb-5">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Search className="w-4 h-4 mr-1.5" />
          Search Description
        </label>
        <input
          type="text"
          value={filters.searchText}
          onChange={(e) => handleFilterChange('searchText', e.target.value)}
          placeholder="Search in descriptions..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Date Range */}
      <div className="mb-5">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 mr-1.5" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Amount Range */}
      <div className="mb-5">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 mr-1.5" />
          Amount Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={filters.amountRange.min}
            onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
            placeholder="Min amount"
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <input
            type="number"
            value={filters.amountRange.max}
            onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
            placeholder="Max amount"
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
          <Tag className="w-4 h-4 mr-1.5" />
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleArrayToggle('categories', cat)}
              className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                filters.categories.includes(cat)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Save Filter"
        >
          <Save className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleClearFilters}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
        >
          Clear
        </button>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Filters</h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(sf => (
              <button
                key={sf._id}
                onClick={() => handleLoadFilter(sf)}
                className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium"
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
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveFilter}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
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
