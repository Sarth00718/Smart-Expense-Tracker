import { motion } from 'framer-motion';
import { skeletonVariants } from '../../utils/animations';

export const SkeletonCard = () => (
  <motion.div
    className="bg-white rounded-xl p-6 space-y-4"
    variants={skeletonVariants}
    initial="initial"
    animate="animate"
  >
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </motion.div>
);

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        className="bg-white rounded-lg p-4 flex items-center gap-4"
        variants={skeletonVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: i * 0.1 }}
      >
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </motion.div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <motion.div
    className="bg-white rounded-xl p-6"
    variants={skeletonVariants}
    initial="initial"
    animate="animate"
  >
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </motion.div>
);

export default { SkeletonCard, SkeletonList, SkeletonChart };
