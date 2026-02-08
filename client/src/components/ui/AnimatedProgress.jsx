import { motion } from 'framer-motion';
import { progressVariants, shakeVariants } from '../../utils/animations';

const AnimatedProgress = ({ 
  value, 
  max = 100, 
  color = 'blue', 
  showLabel = true,
  warning = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isOverBudget = percentage > 100;
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {value.toFixed(0)} / {max.toFixed(0)}
          </span>
          <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <motion.div 
        className={`h-3 ${bgColorClasses[color]} rounded-full overflow-hidden relative`}
        animate={isOverBudget && warning ? "shake" : ""}
        variants={shakeVariants}
      >
        <motion.div
          className={`h-full ${colorClasses[color]} rounded-full relative overflow-hidden`}
          custom={percentage}
          variants={progressVariants}
          initial="initial"
          animate="animate"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedProgress;
