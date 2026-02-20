import { motion } from 'framer-motion';

export const LiquidProgress = ({ 
  value = 0, 
  max = 100, 
  color = '#3b82f6',
  height = 200,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}
      style={{ height }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ backgroundColor: color }}
        initial={{ height: '0%' }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        <svg
          className="absolute top-0 left-0 w-full"
          style={{ height: '20px', transform: 'translateY(-50%)' }}
          viewBox="0 0 1000 20"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,10 Q250,0 500,10 T1000,10 L1000,20 L0,20 Z"
            fill={color}
            animate={{
              d: [
                'M0,10 Q250,0 500,10 T1000,10 L1000,20 L0,20 Z',
                'M0,10 Q250,20 500,10 T1000,10 L1000,20 L0,20 Z',
                'M0,10 Q250,0 500,10 T1000,10 L1000,20 L0,20 Z'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </svg>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span 
            className="text-2xl font-bold"
            style={{ 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 2px rgba(0,0,0,0.5)',
              WebkitTextStroke: '1px rgba(0,0,0,0.1)'
            }}
          >
            {Math.round(percentage)}%
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export const WaveProgress = ({ 
  value = 0, 
  max = 100, 
  size = 150,
  color = '#3b82f6'
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div 
      className="relative rounded-full overflow-hidden bg-gray-100"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ backgroundColor: color }}
        initial={{ height: '0%' }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        <svg
          className="absolute top-0 left-0 w-full"
          style={{ height: '30px', transform: 'translateY(-50%)' }}
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,15 Q25,5 50,15 T100,15 L100,30 L0,30 Z"
            fill={color}
            animate={{
              d: [
                'M0,15 Q25,5 50,15 T100,15 L100,30 L0,30 Z',
                'M0,15 Q25,25 50,15 T100,15 L100,30 L0,30 Z',
                'M0,15 Q25,5 50,15 T100,15 L100,30 L0,30 Z'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </svg>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span 
            className="text-xl font-bold"
            style={{ 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 2px rgba(0,0,0,0.5)',
              WebkitTextStroke: '0.5px rgba(0,0,0,0.1)'
            }}
          >
            {Math.round(percentage)}%
          </span>
        </motion.div>
      </div>
    </div>
  );
};
