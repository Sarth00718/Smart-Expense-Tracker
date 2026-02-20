import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const AnimatedLineChart = ({ data, height = 200, color = '#3b82f6' }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef(null);

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - value
  }));

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [data]);

  return (
    <svg viewBox="0 0 100 100" style={{ height, width: '100%' }}>
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <motion.path
        ref={pathRef}
        d={`${pathD} L 100 100 L 0 100 Z`}
        fill="url(#chartGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: (i / points.length) * 1.5, duration: 0.3 }}
        />
      ))}
    </svg>
  );
};

export const AnimatedBarChart = ({ data, height = 200, color = '#3b82f6' }) => {
  return (
    <div className="flex items-end justify-around h-full gap-2" style={{ height }}>
      {data.map((value, index) => (
        <motion.div
          key={index}
          className="flex-1 rounded-t-lg"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

export const AnimatedPieChart = ({ data, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
        const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
        const largeArc = angle > 180 ? 1 : 0;

        const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return (
          <motion.path
            key={index}
            d={pathD}
            fill={item.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.2,
              ease: 'backOut'
            }}
          />
        );
      })}
    </svg>
  );
};
