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
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-card p-6 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6" />
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
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

export default StatCard
