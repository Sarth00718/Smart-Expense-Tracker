import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSettings = () => {
  const { theme, colorScheme, isDark, updateTheme, updateColorScheme, colorSchemes } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Always use light mode' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark mode' },
    { value: 'auto', label: 'Auto', icon: Monitor, description: 'Match system & time' }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue', color: '#3B82F6' },
    { value: 'green', label: 'Green', color: '#10B981' },
    { value: 'purple', label: 'Purple', color: '#8B5CF6' },
    { value: 'orange', label: 'Orange', color: '#F59E0B' },
    { value: 'pink', label: 'Pink', color: '#EC4899' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Theme Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => updateTheme(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {option.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Color Scheme
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {colorOptions.map((option) => {
            const isSelected = colorScheme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => updateColorScheme(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-gray-800 dark:border-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full mb-2 flex items-center justify-center"
                    style={{ backgroundColor: option.color }}
                  >
                    {isSelected && <Check className="w-6 h-6 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Preview</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-16 h-8 rounded" style={{ backgroundColor: colorSchemes[colorScheme].primary }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-8 rounded" style={{ backgroundColor: colorSchemes[colorScheme].accent }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Accent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
