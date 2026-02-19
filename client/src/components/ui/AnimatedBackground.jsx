import { useEffect, useState } from 'react'

const AnimatedBackground = ({ theme = 'snow' }) => {
  const [snowflakes, setSnowflakes] = useState([])
  const [stars, setStars] = useState([])

  useEffect(() => {
    // Generate snowflakes (falling particles)
    const newSnowflakes = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 100, // Start above viewport
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10, // 10-25s fall time
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 30 // Horizontal drift
    }))
    setSnowflakes(newSnowflakes)

    // Generate static stars (small dots)
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      twinkle: Math.random() * 3 + 2
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-indigo-500/10"></div>

      {/* Static stars (small dots) */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-purple-200"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${star.twinkle}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

      {/* Falling snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={`flake-${flake.id}`}
          className="absolute rounded-full bg-purple-100"
          style={{
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animation: `snowfall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            '--drift': `${flake.drift}px`
          }}
        />
      ))}

      {/* Animated circles (outline only) */}
      <div 
        className="absolute border border-purple-300/20 rounded-full"
        style={{
          top: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          animation: 'spin-slow 40s linear infinite'
        }}
      ></div>
      
      <div 
        className="absolute border border-indigo-300/15 rounded-full"
        style={{
          bottom: '5%',
          left: '5%',
          width: '500px',
          height: '500px',
          animation: 'spin-slower 50s linear infinite reverse'
        }}
      ></div>

      <div 
        className="absolute border border-violet-300/25 rounded-full"
        style={{
          top: '40%',
          left: '15%',
          width: '250px',
          height: '250px',
          animation: 'pulse-slow 4s ease-in-out infinite'
        }}
      ></div>

      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift));
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}

export default AnimatedBackground
