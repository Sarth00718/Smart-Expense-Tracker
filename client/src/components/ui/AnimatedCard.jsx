import { motion } from 'framer-motion';
import { fadeInUp, hoverScale, getAnimation } from '../../utils/animations';

const AnimatedCard = ({ 
  children, 
  delay = 0, 
  className = '',
  hover = true,
  ...props 
}) => {
  const animation = getAnimation(fadeInUp);
  
  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ ...animation.transition, delay }}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
