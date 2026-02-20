import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ParticleBurst = ({ 
  x, 
  y, 
  count = 20, 
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
  active = false,
  onComplete
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    const particleArray = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const velocity = 100 + Math.random() * 100;
      const size = 4 + Math.random() * 8;
      
      return {
        id: i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
        rotation: Math.random() * 360,
        duration: 0.8 + Math.random() * 0.4
      };
    });

    setParticles(particleArray);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [active, count, colors, onComplete]);

  if (!active && particles.length === 0) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1, 
              scale: 1,
              rotate: 0
            }}
            animate={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 0,
              scale: 0,
              rotate: particle.rotation
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: particle.duration, 
              ease: 'easeOut' 
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const SparkleEffect = ({ x, y, active = false }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!active) return;

    const sparkleArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * Math.PI * 2,
      delay: i * 0.05
    }));

    setSparkles(sparkleArray);

    const timer = setTimeout(() => {
      setSparkles([]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [active]);

  if (!active && sparkles.length === 0) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            initial={{ 
              opacity: 0,
              scale: 0,
              rotate: sparkle.angle * (180 / Math.PI)
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.cos(sparkle.angle) * 30,
              y: Math.sin(sparkle.angle) * 30
            }}
            transition={{ 
              duration: 0.6,
              delay: sparkle.delay,
              ease: 'easeOut'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
                fill="#fbbf24"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const RippleEffect = ({ x, y, active = false, color = '#3b82f6' }) => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (!active) return;

    const rippleArray = [0, 1, 2].map(i => ({
      id: i,
      delay: i * 0.2
    }));

    setRipples(rippleArray);

    const timer = setTimeout(() => {
      setRipples([]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [active]);

  if (!active && ripples.length === 0) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2"
            style={{ 
              borderColor: color,
              width: 0,
              height: 0,
              left: '-50%',
              top: '-50%'
            }}
            initial={{ 
              width: 0,
              height: 0,
              opacity: 1
            }}
            animate={{ 
              width: 200,
              height: 200,
              opacity: 0
            }}
            transition={{ 
              duration: 1,
              delay: ripple.delay,
              ease: 'easeOut'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
