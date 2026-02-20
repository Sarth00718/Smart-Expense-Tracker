import { useState } from 'react';
import { motion } from 'framer-motion';

export const Card3DFlip = ({ 
  front, 
  back, 
  className = '',
  flipOnHover = false,
  flipped = false,
  onFlip
}) => {
  const [isFlipped, setIsFlipped] = useState(flipped);

  const handleFlip = () => {
    if (!flipOnHover) {
      const newState = !isFlipped;
      setIsFlipped(newState);
      onFlip?.(newState);
    }
  };

  const handleHover = (hovering) => {
    if (flipOnHover) {
      setIsFlipped(hovering);
      onFlip?.(hovering);
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute w-full h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        
        <div
          className="absolute w-full h-full"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

export const Card3DTilt = ({ children, className = '' }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={className}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ 
          rotateX,
          rotateY
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
