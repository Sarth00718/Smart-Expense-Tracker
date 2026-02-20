import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const NumberMorph = ({ 
  value, 
  duration = 2000, 
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(2)}
      {suffix}
    </span>
  );
};

export const OdometerNumber = ({ 
  value, 
  className = '',
  digitClassName = ''
}) => {
  const digits = String(Math.floor(value)).split('');

  return (
    <div className={`flex ${className}`}>
      {digits.map((digit, index) => (
        <div 
          key={index} 
          className="relative overflow-hidden inline-block"
          style={{ height: '1.2em' }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              className={`block ${digitClassName}`}
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export const FlipNumber = ({ value, className = '' }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      <motion.div
        animate={{ rotateX: isFlipping ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div style={{ backfaceVisibility: 'hidden' }}>
          {prevValue}
        </div>
        <div 
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)'
          }}
        >
          {value}
        </div>
      </motion.div>
    </div>
  );
};
