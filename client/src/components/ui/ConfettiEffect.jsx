import { motion } from 'framer-motion';
import { confettiVariants } from '../../utils/animations';

const ConfettiEffect = ({ show, count = 50 }) => {
  if (!show) return null;

  const colors = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#f8961e', '#38b000'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-1/2"
          custom={i}
          variants={confettiVariants}
          initial="initial"
          animate="animate"
          style={{
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
