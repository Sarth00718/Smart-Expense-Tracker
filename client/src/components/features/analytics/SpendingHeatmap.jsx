import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  TrendingUp, Filter, Download, Info, X, BarChart3
} from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'
import { useExpense } from '../../../context/ExpenseContext'

const SpendingHeatmap = () => {
  const { expenses } = useExpense()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [heatmapData, setHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [showDayModal, setShowDayModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadHeatmapData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedCategory])

  const loadHeatmapData = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const response = await analyticsService.getHeatmap(year, month)
      
      // Filter by category if needed
      let filteredHeatmapData = response.data
      if (selectedCategory !== 'all' && expenses) {
        // Recalculate heatmap based on filtered expenses
        const filteredExpenses = expenses.filter(exp => exp.category === selectedCategory)
        
        // Rebuild heatmap with filtered data
        const newHeatmap = response.data.heatmap.map(week => 
          week.map(dayData => {
            if (dayData.day === null) return dayData
            
            const targetDate = new Date(year, month - 1, dayData.day)
            const dayExpenses = filteredExpenses.filter(exp => {
              const expDate = new Date(exp.date)
              return isSameDay(expDate, targetDate)
            })
            
            const amount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
            return {
              ...dayData,
              amount,
              hasData: dayExpenses.length > 0
            }
          })
        )
        
        // Calculate new max amount
        const maxAmount = Math.max(...newHeatmap.flat()
          .filter(d => d.day !== null)
          .map(d => d.amount))
        
        filteredHeatmapData = {
          ...response.data,
          heatmap: newHeatmap,
          maxAmount: maxAmount > 0 ? maxAmount : 1
        }
      }
      
      setHeatmapData(filteredHeatmapData)
    } catch (error) {
      console.error('Error loading heatmap:', error)
      toast.error('Failed to load heatmap data')
    } finally {
      setLoading(false)
    }
  }

  // Get categories from expenses
  const categories = useMemo(() => {
    if (!expenses) return []
    const uniqueCategories = [...new Set(expenses.map(exp => exp.category))]
    return ['all', ...uniqueCategories]
  }, [expenses])

  // Get expenses for a specific day
  const getDayExpenses = (day) => {
    if (!expenses || !heatmapData) return []
    const year = heatmapData.year
    const month = heatmapData.month
    const targetDate = new Date(year, month - 1, day)
    
    return expenses.filter(exp => {
      const expDate = new Date(exp.date)
      return isSameDay(expDate, targetDate)
    })
  }

  // Calculate day of week patterns
  const dayOfWeekPattern = useMemo(() => {
    if (!heatmapData) return []
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayTotals = Array(7).fill(0)
    const dayCounts = Array(7).fill(0)
    
    heatmapData.heatmap.flat().forEach(dayData => {
      if (dayData.day !== null && dayData.hasData) {
        const date = new Date(heatmapData.year, heatmapData.month - 1, dayData.day)
        const dayOfWeek = getDay(date)
        dayTotals[dayOfWeek] += dayData.amount
        dayCounts[dayOfWeek]++
      }
    })
    
    return weekDays.map((day, index) => ({
      day,
      average: dayCounts[index] > 0 ? dayTotals[index] / dayCounts[index] : 0,
      total: dayTotals[index],
      count: dayCounts[index]
    }))
  }, [heatmapData])

  // Export heatmap data
  const exportData = () => {
    if (!heatmapData) return
    
    const csvData = heatmapData.heatmap.flat()
      .filter(d => d.day !== null)
      .map(d => ({
        Date: `${heatmapData.year}-${String(heatmapData.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
        Amount: d.amount.toFixed(2),
        HasExpenses: d.hasData ? 'Yes' : 'No'
      }))
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spending-heatmap-${heatmapData.year}-${heatmapData.month}.csv`
    a.click()
    toast.success('Heatmap data exported!')
  }

  const handleDayClick = (dayData) => {
    if (dayData.day === null) return
    setSelectedDay(dayData)
    setShowDayModal(true)
  }

  const getIntensityColor = (amount, maxAmount) => {
    if (!amount || amount === 0) return 'bg-gray-100 hover:bg-gray-200'
    
    const intensity = Math.min((amount / maxAmount) * 100, 100)
    
    // Standard intensity colors
    if (intensity >= 80) return 'bg-red-600 hover:bg-red-700 shadow-sm'
    if (intensity >= 60) return 'bg-red-500 hover:bg-red-600 shadow-sm'
    if (intensity >= 40) return 'bg-orange-500 hover:bg-orange-600 shadow-sm'
    if (intensity >= 20) return 'bg-yellow-500 hover:bg-yellow-600 shadow-sm'
    return 'bg-green-400 hover:bg-green-500 shadow-sm'
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!heatmapData || !heatmapData.heatmap) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">No heatmap data available</p>
      </div>
    )
  }

  // Calculate totals from heatmap data
  const totalAmount = heatmapData.heatmap.flat()
    .filter(day => day.day !== null)
    .reduce((sum, day) => sum + (day.amount || 0), 0)

  const totalCount = heatmapData.heatmap.flat()
    .filter(day => day.day !== null && day.hasData)
    .length

  const daysInMonth = heatmapData.heatmap.flat()
    .filter(day => day.day !== null).length

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      <div className="card">
        {/* Header with Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Title and Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 tracking-tight">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span>Spending Heatmap</span>
            </h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={previousMonth} 
                className="btn btn-secondary p-2 hover:bg-gray-100 transition-all hover:scale-105"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-lg min-w-[150px] text-center">
                {heatmapData?.monthName} {heatmapData?.year}
              </span>
              <button 
                onClick={nextMonth} 
                className="btn btn-secondary p-2 hover:bg-gray-100 transition-all hover:scale-105"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportData}
              className="ml-auto px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 overflow-x-auto">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-700 py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.substring(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          <div className="space-y-2">
            {heatmapData?.heatmap.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((dayData, dayIndex) => {
                  if (dayData.day === null) {
                    return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square" />
                  }

                  const intensityColor = getIntensityColor(dayData.amount, heatmapData.maxAmount)
                  const dateObj = new Date(heatmapData.year, heatmapData.month - 1, dayData.day)

                  return (
                    <div
                      key={`day-${dayData.day}`}
                      onClick={() => handleDayClick(dayData)}
                      className={`aspect-square rounded-lg ${intensityColor} flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 group relative min-h-[50px] sm:min-h-0 animate-fadeIn`}
                      style={{ animationDelay: `${(weekIndex * 7 + dayIndex) * 20}ms` }}
                      title={`${format(dateObj, 'MMM dd')}: ₹${dayData.amount.toFixed(2)}`}
                    >
                      <span className="text-sm font-bold text-gray-900">
                        {dayData.day}
                      </span>
                      {dayData.hasData && (
                        <span className="text-xs text-gray-800 font-semibold hidden sm:block">
                          ₹{dayData.amount.toFixed(0)}
                        </span>
                      )}
                      
                      {/* Enhanced Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                          <div className="font-semibold">{format(dateObj, 'EEEE, MMM dd')}</div>
                          <div className="text-green-300">₹{dayData.amount.toFixed(2)}</div>
                          {dayData.hasData && <div className="text-gray-300 text-[10px]">Click for details</div>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Less</span>
          <div className="flex gap-1.5">
            <div className="w-6 h-6 bg-gray-100 rounded border border-gray-300"></div>
            <div className="w-6 h-6 bg-green-400 rounded shadow-sm"></div>
            <div className="w-6 h-6 bg-yellow-500 rounded shadow-sm"></div>
            <div className="w-6 h-6 bg-orange-500 rounded shadow-sm"></div>
            <div className="w-6 h-6 bg-red-500 rounded shadow-sm"></div>
            <div className="w-6 h-6 bg-red-600 rounded shadow-sm"></div>
          </div>
          <span className="text-sm text-gray-600 font-medium">More</span>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-blue-700 font-semibold tracking-tight">Total This Month</p>
            <p className="text-3xl font-bold text-blue-900 tabular-nums tracking-tight mt-1">
              ₹{totalAmount.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <TrendingUp className="w-3 h-3" />
              <span>Across {totalCount} days</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-purple-700 font-semibold tracking-tight">Days with Expenses</p>
            <p className="text-3xl font-bold text-purple-900 tabular-nums tracking-tight mt-1">
              {totalCount}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
              <Info className="w-3 h-3" />
              <span>Out of {daysInMonth} days</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-green-700 font-semibold tracking-tight">Daily Average</p>
            <p className="text-3xl font-bold text-green-900 tabular-nums tracking-tight mt-1">
              ₹{totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : '0.00'}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <BarChart3 className="w-3 h-3" />
              <span>Per spending day</span>
            </div>
          </div>
        </div>

        {/* Day of Week Pattern */}
        <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Spending by Day of Week
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {dayOfWeekPattern.map((pattern, index) => {
              const maxAvg = Math.max(...dayOfWeekPattern.map(p => p.average))
              const heightPercent = maxAvg > 0 ? (pattern.average / maxAvg) * 100 : 0
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden h-20 flex items-end">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 cursor-pointer"
                      style={{ height: `${heightPercent}%`, minHeight: pattern.count > 0 ? '8px' : '0' }}
                      title={`${pattern.day}: ₹${pattern.average.toFixed(0)} avg (${pattern.count} days)`}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-900 mt-2">
                    {pattern.day.substring(0, 3)}
                  </span>
                  <span className="text-[10px] text-indigo-700">
                    ₹{pattern.average.toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-indigo-700 text-center">
            Average spending per day of the week
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {format(new Date(heatmapData.year, heatmapData.month - 1, selectedDay.day), 'EEEE')}
                  </h3>
                  <p className="text-white/90">
                    {format(new Date(heatmapData.year, heatmapData.month - 1, selectedDay.day), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-4 text-3xl font-bold">
                ₹{selectedDay.amount.toFixed(2)}
              </div>
            </div>

            <div className="p-6">
              {getDayExpenses(selectedDay.day).length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Expenses</h4>
                  {getDayExpenses(selectedDay.day).map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-600">{expense.category}</p>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        ₹{expense.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No expenses recorded for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpendingHeatmap
