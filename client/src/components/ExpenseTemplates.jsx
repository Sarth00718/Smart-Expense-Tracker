import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ExpenseTemplates = ({ onTemplateUse }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    amount: '',
    description: '',
    paymentMode: 'Cash',
    templateCategory: 'Other',
    isRecurring: false
  });

  const templateCategories = ['All', 'Bills', 'Subscriptions', 'Travel', 'Shopping', 'Other'];
  const expenseCategories = ['Food', 'Travel', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
  const paymentModes = ['Cash', 'Card', 'UPI', 'Net Banking', 'Wallet', 'Other'];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/templates?sortBy=usage');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    if (selectedCategory === 'All') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.templateCategory === selectedCategory));
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const response = await api.post(`/templates/${template._id}/use`);
      toast.success(`Expense created from "${template.name}"`);
      
      if (onTemplateUse) {
        onTemplateUse(response.data.expense);
      }
      
      loadTemplates();
    } catch (error) {
      console.error('Use template error:', error);
      toast.error('Failed to create expense from template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Templates</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Template
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {templateCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="spinner border-4 w-12 h-12 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div key={template._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{template.name}</h3>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">₹{template.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span>{template.category}</span>
                </div>
              </div>
              <button
                onClick={() => handleUseTemplate(template)}
                className="w-full flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Copy className="w-4 h-4 mr-2" />
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseTemplates;
