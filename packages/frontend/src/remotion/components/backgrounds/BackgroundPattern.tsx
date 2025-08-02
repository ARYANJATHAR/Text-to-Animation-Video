import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate
} from 'remotion';
import { AspectRatio } from '../../config/videoConfig';

interface BackgroundPatternProps {
  type: 'gradient' | 'geometric' | 'particles';
  aspectRatio: AspectRatio;
  animationType: 'remotion' | 'threejs' | 'manim' | 'hybrid';
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  type,
  aspectRatio,
  animationType
}) => {
  const frame = useCurrentFrame();
  
  const getGradientColors = () => {
    switch (animationType) {
      case 'threejs':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'manim':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'hybrid':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default:
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
    }
  };
  
  const renderGradientBackground = () => (
    <AbsoluteFill
      style={{
        background: getGradientColors(),
      }}
    >
      {/* Animated overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${interpolate(
            frame,
            [0, 300],
            [20, 80]
          )}% ${interpolate(
            frame,
            [0, 300],
            [30, 70]
          )}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />
    </AbsoluteFill>
  );
  
  const renderGeometricBackground = () => (
    <AbsoluteFill
      style={{
        background: getGradientColors(),
      }}
    >
      {/* Geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            borderRadius: '50%',
            background: `rgba(255, 255, 255, ${0.05 + i * 0.02})`,
            left: `${20 + i * 15}%`,
            top: `${10 + i * 12}%`,
            transform: `rotate(${interpolate(frame, [0, 300], [0, 360 * (i + 1)])}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
  
  const renderParticlesBackground = () => (
    <AbsoluteFill
      style={{
        background: getGradientColors(),
      }}
    >
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            borderRadius: '50%',
            background: `rgba(255, 255, 255, ${0.3 + (i % 4) * 0.1})`,
            left: `${(i * 7 + 10) % 90}%`,
            top: `${(i * 11 + 5) % 85}%`,
            transform: `translateY(${interpolate(
              frame,
              [0, 300],
              [0, -20 - (i % 5) * 10]
            )}px)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
  
  switch (type) {
    case 'geometric':
      return renderGeometricBackground();
    case 'particles':
      return renderParticlesBackground();
    default:
      return renderGradientBackground();
  }
};