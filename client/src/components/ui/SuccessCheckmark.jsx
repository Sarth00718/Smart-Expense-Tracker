import { motion } from 'framer-motion';
import { checkmarkVariants } from '../../utils/animations';

const SuccessCheckmark = ({ show, size = 'md' }) => {
  if (!show) return null;

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <div className={`${sizes[size]} relative`}>
        {/* Circle background */}
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Checkmark */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 52 52"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27l7 7 16-16"
            variants={checkmarkVariants}
            initial="initial"
            animate="animate"
          />
        </svg>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-full"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

export default SuccessCheckmark;
