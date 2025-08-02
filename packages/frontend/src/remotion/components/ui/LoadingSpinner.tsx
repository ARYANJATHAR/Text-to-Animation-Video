import React from 'react';
import { 
  useCurrentFrame, 
  interpolate
} from 'remotion';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  speed?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#3b82f6',
  thickness = 4,
  speed = 1,
  className = ''
}) => {
  const frame = useCurrentFrame();
  
  const rotation = interpolate(frame, [0, 60 / speed], [0, 360]);
  const dashOffset = interpolate(frame, [0, 120 / speed], [0, -283]);
  
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={dashOffset}
          style={{
            transformOrigin: 'center',
          }}
        />
      </svg>
    </div>
  );
};