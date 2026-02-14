import { motion } from 'framer-motion';
import { fadeInUp, hoverScale, counterVariants } from '../../utils/animations';
import AnimatedCounter from './AnimatedCounter';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  trendValue,
  color = 'blue',
  className = '',
  delay = 0,
  animateValue = false
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
    orange: 'from-orange-500 to-orange-700',
    indigo: 'from-indigo-500 to-indigo-700'
  }

  // Extract numeric value for animation
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]+/g, '')) 
    : value;
  const prefix = typeof value === 'string' ? value.match(/^[^\d.-]+/)?.[0] || '' : '';
  const suffix = typeof value === 'string' ? value.match(/[^\d.-]+$/)?.[0] || '' : '';

  return (
    <motion.div 
      className={`bg-gradient-to-br ${colors[color]} text-white rounded-lg sm:rounded-xl shadow-card p-4 sm:p-6 relative overflow-hidden font-sans ${className}`}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...fadeInUp.transition, delay }}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        transition: { duration: 0.2 }
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          {Icon && (
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
          )}
          {trend && (
            <motion.span 
              className={`text-xs font-medium tracking-tight px-2 py-1 rounded-full ${
                trend === 'up' ? 'bg-white/20' : 'bg-white/20'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.3, type: 'spring', stiffness: 200 }}
            >
              {trendValue}
            </motion.span>
          )}
        </div>
        <p className="text-white/80 text-xs sm:text-sm mb-1 tracking-tight">{title}</p>
        <motion.p 
          className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate tracking-tight tabular-nums"
          variants={counterVariants}
          initial="initial"
          animate="animate"
        >
          {animateValue && !isNaN(numericValue) ? (
            <AnimatedCounter 
              value={numericValue} 
              prefix={prefix}
              suffix={suffix}
              decimals={2}
            />
          ) : (
            value
          )}
        </motion.p>
      </div>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  )
}

export default StatCard
