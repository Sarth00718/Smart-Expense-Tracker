const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
    // Category specific
    food: 'bg-orange-100 text-orange-700',
    travel: 'bg-blue-100 text-blue-700',
    shopping: 'bg-pink-100 text-pink-700',
    bills: 'bg-purple-100 text-purple-700',
    entertainment: 'bg-indigo-100 text-indigo-700',
    healthcare: 'bg-red-100 text-red-700',
    education: 'bg-green-100 text-green-700',
    transport: 'bg-cyan-100 text-cyan-700',
    other: 'bg-gray-100 text-gray-700'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
