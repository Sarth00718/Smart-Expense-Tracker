import { useEffect, useRef, useState } from 'react';

const SnowEffect = ({ intensity = 30, speed = 'medium' }) => {
  const canvasRef = useRef(null);
  const snowflakes = useRef([]);
  const animationFrameId = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay snow effect to not block initial render
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Start after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Snowflake class
    class Snowflake {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.radius = Math.random() * 2.5 + 0.5; // Smaller snowflakes
        this.speedY = Math.random() * 0.8 + 0.3; // Slower
        this.speedX = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.5 + 0.3; // More transparent
      }

      update() {
        this.y += this.speedY * (speed === 'slow' ? 0.5 : speed === 'fast' ? 1.5 : 1);
        this.x += this.speedX;

        // Reset snowflake when it goes off screen
        if (this.y > canvas.height) {
          this.reset();
        }
        if (this.x > canvas.width || this.x < 0) {
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
        ctx.closePath();
      }
    }

    // Create snowflakes
    snowflakes.current = [];
    for (let i = 0; i < intensity; i++) {
      snowflakes.current.push(new Snowflake());
    }

    // Animation loop with throttling (30fps instead of 60fps)
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const animate = (currentTime) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const deltaTime = currentTime - lastTime;
      if (deltaTime < interval) return;

      lastTime = currentTime - (deltaTime % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      snowflakes.current.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
      });
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [intensity, speed, isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default SnowEffect;
