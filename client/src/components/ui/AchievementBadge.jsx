import { motion } from 'framer-motion';
import { badgeUnlockVariants } from '../../utils/animations';
import { Trophy, Star, Award, Target } from 'lucide-react';

const AchievementBadge = ({ 
  icon: Icon = Trophy, 
  title, 
  description, 
  unlocked = false,
  progress = 0,
  onClick 
}) => {
  const IconComponent = Icon || Trophy;

  return (
    <motion.div
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
        unlocked 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg' 
          : 'bg-gray-50 border-gray-200'
      }`}
      variants={badgeUnlockVariants}
      initial="initial"
      animate={unlocked ? "animate" : "initial"}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Glow effect for unlocked badges */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${
            unlocked 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
              : 'bg-gray-300'
          }`}
          whileHover={unlocked ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <IconComponent className={`w-8 h-8 ${unlocked ? 'text-white' : 'text-gray-500'}`} />
        </motion.div>

        {/* Title */}
        <h3 className={`text-lg font-bold text-center mb-2 ${
          unlocked ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`text-sm text-center mb-4 ${
          unlocked ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {description}
        </p>

        {/* Progress bar for locked achievements */}
        {!unlocked && progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Unlocked badge */}
        {unlocked && (
          <motion.div
            className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Star className="w-5 h-5 text-white fill-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementBadge;
