import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  spring,
  useVideoConfig
} from 'remotion';
import { AspectRatio } from '../../config/videoConfig';

interface ConceptCardProps {
  concept: string;
  index: number;
  aspectRatio: AspectRatio;
  animationType: 'remotion' | 'threejs' | 'manim' | 'hybrid';
  isActive: boolean;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  index,
  aspectRatio,
  animationType,
  isActive
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Animation timing
  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });
  
  // Scale and opacity based on active state
  const targetScale = isActive ? 1.05 : 1;
  const targetOpacity = isActive ? 1 : 0.8;
  
  const scale = interpolate(entranceSpring, [0, 1], [0.8, targetScale]);
  const opacity = interpolate(entranceSpring, [0, 1], [0, targetOpacity]);
  
  // Get card styling based on animation type
  const getCardStyling = () => {
    const baseStyle = {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: isActive 
        ? '0 20px 40px rgba(0, 0, 0, 0.15)' 
        : '0 10px 20px rgba(0, 0, 0, 0.1)',
    };
    
    switch (animationType) {
      case 'threejs':
        return {
          ...baseStyle,
          borderLeft: '4px solid #667eea',
        };
      case 'manim':
        return {
          ...baseStyle,
          borderLeft: '4px solid #f093fb',
        };
      case 'hybrid':
        return {
          ...baseStyle,
          borderLeft: '4px solid #4facfe',
        };
      default:
        return {
          ...baseStyle,
          borderLeft: '4px solid #a8edea',
        };
    }
  };
  
  // Responsive sizing
  const getCardSize = () => {
    switch (aspectRatio) {
      case '9:16':
        return {
          padding: '20px',
          fontSize: '18px',
          minHeight: '80px',
        };
      case '1:1':
        return {
          padding: '16px',
          fontSize: '16px',
          minHeight: '70px',
        };
      default:
        return {
          padding: '24px',
          fontSize: '20px',
          minHeight: '100px',
        };
    }
  };
  
  const cardSize = getCardSize();
  
  return (
    <div
      style={{
        ...getCardStyling(),
        ...cardSize,
        transform: `scale(${scale})`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Concept Number */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isActive ? '#667eea' : '#e2e8f0',
          color: isActive ? 'white' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {index + 1}
      </div>
      
      {/* Concept Text */}
      <div
        style={{
          fontSize: cardSize.fontSize,
          fontWeight: '600',
          color: '#1e293b',
          textTransform: 'capitalize',
          lineHeight: '1.4',
        }}
      >
        {concept}
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            opacity: interpolate(frame % 60, [0, 30, 60], [0.5, 1, 0.5]),
          }}
        />
      )}
    </div>
  );
};