import { X } from 'lucide-react'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { modalBackdrop, modalContent } from '../../utils/animations'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl md:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl',
    full: 'max-w-full sm:max-w-7xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Animated Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <motion.div 
              className={`relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto smooth-scroll`}
              onClick={(e) => e.stopPropagation()}
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  {title && (
                    <motion.h3 
                      className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {title}
                    </motion.h3>
                  )}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 tap-target"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  )}
                </div>
              )}
              
              {/* Content */}
              <motion.div 
                className="p-4 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
