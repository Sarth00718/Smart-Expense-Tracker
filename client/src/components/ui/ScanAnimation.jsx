import { motion } from 'framer-motion';
import { scanLineVariants } from '../../utils/animations';

export const ScanOverlay = ({ isScanning }) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/50"
        variants={scanLineVariants}
        initial="initial"
        animate="animate"
      />
      
      {/* Corner brackets */}
      <div className="absolute inset-4 border-2 border-blue-500/50 rounded-lg">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
      </div>

      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 bg-blue-500/10 rounded-lg"
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export const ProcessingLoader = ({ text = 'Processing...' }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-8">
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
    <motion.p
      className="text-gray-600 font-medium"
      animate={{
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {text}
    </motion.p>
  </div>
);

export default { ScanOverlay, ProcessingLoader };
