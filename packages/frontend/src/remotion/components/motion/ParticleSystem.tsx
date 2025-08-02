import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  random
} from 'remotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface ParticleSystemProps {
  particleCount?: number;
  width: number;
  height: number;
  colors?: string[];
  particleSize?: number;
  speed?: number;
  gravity?: number;
  className?: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 20,
  width,
  height,
  colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
  particleSize = 4,
  speed = 2,
  gravity = 0.1,
  className = ''
}) => {
  const frame = useCurrentFrame();
  
  // Generate particles with deterministic randomness
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: random(`particle-x-${i}`) * width,
      y: random(`particle-y-${i}`) * height,
      vx: (random(`particle-vx-${i}`) - 0.5) * speed,
      vy: (random(`particle-vy-${i}`) - 0.5) * speed,
      size: particleSize + random(`particle-size-${i}`) * 4,
      color: colors[Math.floor(random(`particle-color-${i}`) * colors.length)],
      life: random(`particle-life-${i}`) * 100 + 50,
    }));
  }, [particleCount, width, height, colors, particleSize, speed]);
  
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width, height }}
    >
      {particles.map((particle) => {
        // Calculate particle position based on frame
        const age = frame % particle.life;
        const progress = age / particle.life;
        
        const x = particle.x + particle.vx * age;
        const y = particle.y + particle.vy * age + gravity * age * age * 0.5;
        
        // Fade out particle as it ages
        const opacity = interpolate(progress, [0, 0.8, 1], [0, 1, 0]);
        const scale = interpolate(progress, [0, 0.5, 1], [0, 1, 0.5]);
        
        // Keep particles within bounds
        const boundedX = ((x % width) + width) % width;
        const boundedY = ((y % height) + height) % height;
        
        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: boundedX,
              top: boundedY,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
              opacity,
              transform: `scale(${scale})`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};