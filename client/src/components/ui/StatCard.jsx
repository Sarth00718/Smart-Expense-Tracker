const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  trendValue,
  color = 'blue',
  className = '' 
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
    orange: 'from-orange-500 to-orange-700',
    indigo: 'from-indigo-500 to-indigo-700'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-lg sm:rounded-xl shadow-card p-4 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        {Icon && (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-white/20' : 'bg-white/20'
          }`}>
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-white/80 text-xs sm:text-sm mb-1">{title}</p>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{value}</p>
    </div>
  )
}

export default StatCard
