// Animation Utilities and Configurations for Framer Motion
// Optimized for performance and accessibility

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Base animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const scaleInBounce = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  },
  exit: { opacity: 0, scale: 0.3 }
};

// Stagger children animation
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

// Modal variants
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Dropdown variants
export const dropdownVariants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' }
  }
};

// Sidebar variants
export const sidebarVariants = {
  open: {
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  closed: {
    x: '-100%',
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

// Toast notification variants
export const toastVariants = {
  initial: { opacity: 0, x: 100, scale: 0.8 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 100, 
    scale: 0.8,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// List item variants (for expense/income lists)
export const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Swipe to delete variants
export const swipeVariants = {
  initial: { x: 0 },
  swipeLeft: { 
    x: -100,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  swipeRight: { 
    x: 100,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// Progress bar variants
export const progressVariants = {
  initial: { width: 0 },
  animate: (custom) => ({
    width: `${custom}%`,
    transition: { duration: 1, ease: 'easeOut' }
  })
};

// Counter animation
export const counterVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

// Shake animation (for errors)
export const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 }
  }
};

// Pulse animation (for notifications)
export const pulseVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: { 
      duration: 1, 
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Glow effect variants
export const glowVariants = {
  initial: { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
  hover: { 
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transition: { duration: 0.3 }
  }
};

// Chart animation variants
export const chartVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

// Badge unlock animation
export const badgeUnlockVariants = {
  initial: { opacity: 0, scale: 0, rotate: -180 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: 'spring',
      stiffness: 200,
      damping: 15,
      duration: 0.8
    }
  }
};

// Confetti animation
export const confettiVariants = {
  initial: { opacity: 0, y: -50, scale: 0 },
  animate: (i) => ({
    opacity: [0, 1, 1, 0],
    y: [0, 100, 200],
    x: [0, Math.random() * 100 - 50],
    scale: [0, 1, 0.5, 0],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 2,
      delay: i * 0.05,
      ease: 'easeOut'
    }
  })
};

// Skeleton loading variants
export const skeletonVariants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Microphone pulse animation
export const micPulseVariants = {
  listening: {
    scale: [1, 1.2, 1],
    boxShadow: [
      '0 0 0 0 rgba(239, 68, 68, 0.7)',
      '0 0 0 10px rgba(239, 68, 68, 0)',
      '0 0 0 0 rgba(239, 68, 68, 0)'
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Typing indicator variants
export const typingDotVariants = {
  initial: { y: 0 },
  animate: (i) => ({
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.1,
      ease: 'easeInOut'
    }
  })
};

// Hover scale effect
export const hoverScale = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Button press effect
export const buttonPress = {
  rest: { scale: 1 },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Success checkmark animation
export const checkmarkVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: 'easeOut',
      delay: 0.2
    }
  }
};

// Circular progress variants
export const circularProgressVariants = {
  initial: { pathLength: 0 },
  animate: (custom) => ({
    pathLength: custom / 100,
    transition: { 
      duration: 1.5, 
      ease: 'easeInOut'
    }
  })
};

// Waveform animation
export const waveformVariants = {
  initial: { scaleY: 0.3 },
  animate: (i) => ({
    scaleY: [0.3, 1, 0.3],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      delay: i * 0.1,
      ease: 'easeInOut'
    }
  })
};

// Scan line animation
export const scanLineVariants = {
  initial: { y: 0 },
  animate: {
    y: ['0%', '100%', '0%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Spring animation config
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

export const softSpringConfig = {
  type: 'spring',
  stiffness: 200,
  damping: 25
};

// Helper function to get animation with reduced motion support
export const getAnimation = (animation) => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    };
  }
  return animation;
};

// Helper function for stagger delay
export const getStaggerDelay = (index, baseDelay = 0.1) => {
  return prefersReducedMotion() ? 0 : index * baseDelay;
};
