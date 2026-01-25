import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns'

const SpendingHeatmap = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [heatmapData, setHeatmapData] = useState({})
  const [loading, setLoading] = useState(true)
  const [maxAmount, setMaxAmount] = useState(0)

  useEffect(() => {
    loadHeatmapData()
  }, [currentDate])

  const loadHeatmapData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const response = await axios.get(
        `http://localhost:5000/api/analytics/heatmap?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = response.data
      setHeatmapData(data)

      // Calculate max amount for color intensity
      const amounts = Object.values(data).map(d => d.total || 0)
      setMaxAmount(Math.max(...amounts, 1))
    } catch (error) {
      console.error('Error loading heatmap:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIntensityColor = (amount) => {
    if (!amount || amount === 0) return 'bg-gray-100'
    
    const intensity = Math.min((amount / maxAmount) * 100, 100)
    
    if (intensity >= 80) return 'bg-red-600'
    if (intensity >= 60) return 'bg-red-500'
    if (intensity >= 40) return 'bg-orange-500'
    if (intensity >= 20) return 'bg-yellow-500'
    return 'bg-green-400'
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  const getStartingDayOfWeek = () => {
    return getDay(startOfMonth(currentDate))
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = getDaysInMonth()
  const startingDay = getStartingDayOfWeek()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Spending Heatmap
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={previousMonth} className="btn btn-secondary p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-lg min-w-[150px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="btn btn-secondary p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayData = heatmapData[dateKey] || { total: 0, count: 0 }
              const intensityColor = getIntensityColor(dayData.total)

              return (
                <div
                  key={dateKey}
                  className={`aspect-square rounded-lg ${intensityColor} flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all group relative`}
                  title={`${format(day, 'MMM dd')}: ₹${dayData.total.toFixed(2)} (${dayData.count} expenses)`}
                >
                  <span className="text-sm font-semibold text-gray-800">
                    {format(day, 'd')}
                  </span>
                  {dayData.count > 0 && (
                    <span className="text-xs text-gray-700">
                      ₹{dayData.total.toFixed(0)}
                    </span>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {format(day, 'MMM dd')}: ₹{dayData.total.toFixed(2)}
                      <br />
                      {dayData.count} expense{dayData.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="text-sm text-gray-600">Less</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
            <div className="w-6 h-6 bg-green-400 rounded"></div>
            <div className="w-6 h-6 bg-yellow-500 rounded"></div>
            <div className="w-6 h-6 bg-orange-500 rounded"></div>
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <div className="w-6 h-6 bg-red-600 rounded"></div>
          </div>
          <span className="text-sm text-gray-600">More</span>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">Total This Month</p>
            <p className="text-2xl font-bold text-blue-900">
              ₹{Object.values(heatmapData).reduce((sum, d) => sum + (d.total || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-semibold">Total Expenses</p>
            <p className="text-2xl font-bold text-purple-900">
              {Object.values(heatmapData).reduce((sum, d) => sum + (d.count || 0), 0)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Daily Average</p>
            <p className="text-2xl font-bold text-green-900">
              ₹{(Object.values(heatmapData).reduce((sum, d) => sum + (d.total || 0), 0) / days.length).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpendingHeatmap
