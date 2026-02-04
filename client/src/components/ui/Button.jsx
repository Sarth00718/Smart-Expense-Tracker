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
    primary: 'bg-primary text-white hover:bg-[#3a0ca3] focus:ring-primary/20 shadow-sm hover:shadow-md active:scale-95',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary/20 active:scale-95',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success/20 shadow-sm hover:shadow-md active:scale-95',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger/20 shadow-sm hover:shadow-md active:scale-95',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200 active:scale-95',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-200 active:scale-95'
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
