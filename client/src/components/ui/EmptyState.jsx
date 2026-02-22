const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 font-sans ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-tight">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
