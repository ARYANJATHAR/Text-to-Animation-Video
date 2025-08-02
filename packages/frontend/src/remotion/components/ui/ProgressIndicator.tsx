import React from 'react';
import { 
  useCurrentFrame, 
  interpolate
} from 'remotion';
import { AspectRatio } from '../../config/videoConfig';

interface ProgressIndicatorProps {
  total: number;
  current: number;
  aspectRatio: AspectRatio;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  total,
  current,
  aspectRatio
}) => {
  const frame = useCurrentFrame();
  
  // Position based on aspect ratio
  const getPosition = () => {
    switch (aspectRatio) {
      case '9:16':
        return {
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case '1:1':
        return {
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      default:
        return {
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };
  
  const position = getPosition();
  
  return (
    <div
      style={{
        position: 'absolute',
        ...position,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
      }}
    >
      {/* Progress Dots */}
      {[...Array(total)].map((_, index) => {
        const isActive = index <= current;
        const isPast = index < current;
        
        return (
          <div
            key={index}
            style={{
              width: aspectRatio === '9:16' ? '8px' : '10px',
              height: aspectRatio === '9:16' ? '8px' : '10px',
              borderRadius: '50%',
              background: isPast 
                ? '#10b981' 
                : isActive 
                  ? '#3b82f6' 
                  : 'rgba(255, 255, 255, 0.3)',
              border: isActive ? '2px solid white' : 'none',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s ease',
              opacity: interpolate(
                frame % 120, 
                [0, 60, 120], 
                isActive ? [0.8, 1, 0.8] : [0.5, 0.5, 0.5]
              ),
            }}
          />
        );
      })}
      
      {/* Progress Text */}
      <div
        style={{
          marginLeft: '12px',
          color: 'white',
          fontSize: aspectRatio === '9:16' ? '12px' : '14px',
          fontWeight: '500',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '4px 8px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
        }}
      >
        {current + 1} / {total}
      </div>
    </div>
  );
};