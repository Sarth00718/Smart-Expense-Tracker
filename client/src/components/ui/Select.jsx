const Select = ({ 
  label, 
  error, 
  options = [],
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
      <select
        className={`w-full px-4 py-2.5 border-2 ${
          error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-gray-200 focus:border-primary focus:ring-primary/10'
        } rounded-lg focus:outline-none focus:ring-4 transition-all bg-white ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Select
