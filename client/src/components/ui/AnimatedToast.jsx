import { motion, AnimatePresence } from 'framer-motion';
import { toastVariants } from '../../utils/animations';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const AnimatedToast = ({ 
  show, 
  message, 
  type = 'info', 
  onClose,
  duration = 3000,
  position = 'top-right'
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed ${positions[position]} z-50 max-w-sm w-full`}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className={`${colors[type]} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}>
            <Icon className={`w-5 h-5 ${iconColors[type]} flex-shrink-0 mt-0.5`} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Auto-dismiss progress bar */}
          {duration && (
            <motion.div
              className="h-1 bg-current opacity-30 rounded-b"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedToast;
