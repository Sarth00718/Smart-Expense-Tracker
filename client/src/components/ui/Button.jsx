const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 no-select tap-target'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500/20 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500/20',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500/20 shadow-md hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500/20 shadow-md hover:shadow-lg',
    warning: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500/20 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-200'
  }
  
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs sm:text-sm',
    md: 'px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base',
    lg: 'px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </>
      )}
    </button>
  )
}

export default Button
