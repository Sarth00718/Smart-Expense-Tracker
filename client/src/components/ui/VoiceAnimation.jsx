import { motion } from 'framer-motion';
import { micPulseVariants, waveformVariants } from '../../utils/animations';
import { Mic } from 'lucide-react';

export const MicrophonePulse = ({ isListening }) => (
  <motion.div
    className="relative w-20 h-20 flex items-center justify-center"
    variants={micPulseVariants}
    animate={isListening ? "listening" : ""}
  >
    <div className={`w-full h-full rounded-full flex items-center justify-center ${
      isListening ? 'bg-red-500' : 'bg-gray-300'
    }`}>
      <Mic className="w-10 h-10 text-white" />
    </div>
  </motion.div>
);

export const Waveform = ({ isActive, bars = 5 }) => (
  <div className="flex items-center justify-center gap-1 h-12">
    {[...Array(bars)].map((_, i) => (
      <motion.div
        key={i}
        className={`w-1 rounded-full ${isActive ? 'bg-red-500' : 'bg-gray-300'}`}
        custom={i}
        variants={waveformVariants}
        initial="initial"
        animate={isActive ? "animate" : "initial"}
        style={{ height: '100%', originY: 0.5 }}
      />
    ))}
  </div>
);

export const TypingIndicator = () => (
  <div className="flex items-center gap-1 p-3 bg-gray-100 rounded-lg w-fit">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-gray-400 rounded-full"
        custom={i}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

export default { MicrophonePulse, Waveform, TypingIndicator };
