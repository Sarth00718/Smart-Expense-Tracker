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
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''
  
  return (
    <div id={id} className={`bg-white rounded-xl shadow-card ${paddingClasses[padding]} ${hoverClass} ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
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
