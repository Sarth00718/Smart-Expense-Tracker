import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import toast from 'react-hot-toast'

const SpendingHeatmap = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [heatmapData, setHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHeatmapData()
  }, [currentDate])

  const loadHeatmapData = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const response = await analyticsService.getHeatmap(year, month)
      setHeatmapData(response.data)
    } catch (error) {
      console.error('Error loading heatmap:', error)
      toast.error('Failed to load heatmap data')
    } finally {
      setLoading(false)
    }
  }

  const getIntensityColor = (amount, maxAmount) => {
    if (!amount || amount === 0) return 'bg-gray-100'
    
    const intensity = Math.min((amount / maxAmount) * 100, 100)
    
    if (intensity >= 80) return 'bg-red-600'
    if (intensity >= 60) return 'bg-red-500'
    if (intensity >= 40) return 'bg-orange-500'
    if (intensity >= 20) return 'bg-yellow-500'
    return 'bg-green-400'
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
        {/* Header with Month Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 tracking-tight">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="hidden sm:inline">Spending Heatmap</span>
            <span className="sm:hidden">Heatmap</span>
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              onClick={previousMonth} 
              className="btn btn-secondary p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="font-semibold text-base sm:text-lg min-w-[120px] sm:min-w-[150px] text-center">
              {heatmapData.monthName} {heatmapData.year}
            </span>
            <button 
              onClick={nextMonth} 
              className="btn btn-secondary p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg p-2 sm:p-4 overflow-x-auto">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-1 sm:py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.substring(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          <div className="space-y-1 sm:space-y-2">
            {heatmapData.heatmap.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
                {week.map((dayData, dayIndex) => {
                  if (dayData.day === null) {
                    return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square" />
                  }

                  const intensityColor = getIntensityColor(dayData.amount, heatmapData.maxAmount)
                  const dateObj = new Date(heatmapData.year, heatmapData.month - 1, dayData.day)

                  return (
                    <div
                      key={`day-${dayData.day}`}
                      className={`aspect-square rounded sm:rounded-lg ${intensityColor} flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all group relative min-h-[40px] sm:min-h-0`}
                      title={`${format(dateObj, 'MMM dd')}: ₹${dayData.amount.toFixed(2)}`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {dayData.day}
                      </span>
                      {dayData.hasData && (
                        <span className="text-[10px] sm:text-xs text-gray-700 hidden sm:block">
                          ₹{dayData.amount.toFixed(0)}
                        </span>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                          {format(dateObj, 'MMM dd')}: ₹{dayData.amount.toFixed(2)}
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
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <span className="text-xs sm:text-sm text-gray-600">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-100 rounded"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-400 rounded"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-yellow-500 rounded"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-orange-500 rounded"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-600 rounded"></div>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">More</span>
        </div>

        {/* Stats */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-600 font-semibold tracking-tight">Total This Month</p>
            <p className="text-xl sm:text-2xl font-semibold text-blue-900 tabular-nums tracking-tight">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs sm:text-sm text-purple-600 font-semibold tracking-tight">Days with Expenses</p>
            <p className="text-xl sm:text-2xl font-semibold text-purple-900 tabular-nums tracking-tight">
              {totalCount}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs sm:text-sm text-green-600 font-semibold tracking-tight">Daily Average</p>
            <p className="text-xl sm:text-2xl font-semibold text-green-900 tabular-nums tracking-tight">
              ₹{totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : '0.00'}
            </p>
            <p className="text-[10px] sm:text-xs text-green-700 mt-1">
              (on {totalCount} days with expenses)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpendingHeatmap
