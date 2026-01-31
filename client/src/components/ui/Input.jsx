const Input = ({ 
  label, 
  error, 
  icon: Icon,
  helperText,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 ${Icon ? 'pl-11' : ''} border-2 ${
            error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-gray-200 focus:border-primary focus:ring-primary/10'
          } rounded-lg focus:outline-none focus:ring-4 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input
