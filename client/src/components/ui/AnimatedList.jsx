import { motion, AnimatePresence } from 'framer-motion';
import { listItemVariants, staggerContainer, getAnimation } from '../../utils/animations';

const AnimatedList = ({ children, className = '' }) => {
  const containerAnimation = getAnimation(staggerContainer);
  
  return (
    <motion.div
      className={className}
      variants={containerAnimation}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.div>
  );
};

export const AnimatedListItem = ({ children, id, className = '', onDelete }) => {
  const itemAnimation = getAnimation(listItemVariants);
  
  return (
    <motion.div
      layout
      key={id}
      className={className}
      variants={itemAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={onDelete ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 100 && onDelete) {
          onDelete();
        }
      }}
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedList;
