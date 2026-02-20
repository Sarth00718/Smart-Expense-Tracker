import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MoneyRain = ({ active = false, duration = 3000, intensity = 20 }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (!active) {
      setCoins([]);
      return;
    }

    const coinArray = Array.from({ length: intensity }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
      symbol: ['💰', '💵', '💴', '💶', '💷', '🪙'][Math.floor(Math.random() * 6)]
    }));

    setCoins(coinArray);

    const timer = setTimeout(() => {
      setCoins([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute text-4xl"
            style={{ left: `${coin.x}%`, top: '-10%' }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ 
              y: '110vh', 
              opacity: [1, 1, 0],
              rotate: coin.rotation
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: coin.duration,
              delay: coin.delay,
              ease: 'linear'
            }}
          >
            {coin.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const CoinBurst = ({ x, y, count = 10 }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const coinArray = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        symbol: ['💰', '💵', '🪙'][Math.floor(Math.random() * 3)]
      };
    });

    setCoins(coinArray);

    const timer = setTimeout(() => {
      setCoins([]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute text-2xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x: coin.x, 
              y: coin.y, 
              opacity: 0,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {coin.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
