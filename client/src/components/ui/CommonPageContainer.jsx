import { motion } from 'framer-motion'

export const CommonPageContainer = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
