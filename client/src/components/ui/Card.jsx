const Card = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  action,
  className = '',
  padding = 'default',
  hover = false,
  id
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  const hoverClass = hover ? 'hover:shadow-card-lg transition-shadow' : ''
  
  return (
    <div 
      id={id} 
      className={`bg-white rounded-lg sm:rounded-xl shadow-card font-sans ${paddingClasses[padding]} ${hoverClass} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {Icon && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate leading-snug">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
