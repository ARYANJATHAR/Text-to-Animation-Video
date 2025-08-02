import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  spring,
  useVideoConfig
} from 'remotion';
import { useTheme } from '../branding/ThemeProvider';

interface AnimatedButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  animationType?: 'bounce' | 'slide' | 'fade' | 'glow';
  delay?: number;
  onClick?: () => void;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  animationType = 'bounce',
  delay = 0,
  onClick,
  className = ''
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  
  const adjustedFrame = Math.max(0, frame - delay);
  
  // Animation calculations
  const bounceSpring = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });
  
  const slideDistance = 30;
  const slideY = interpolate(adjustedFrame, [0, 30], [slideDistance, 0]);
  const fadeOpacity = interpolate(adjustedFrame, [0, 20], [0, 1]);
  
  const glowIntensity = interpolate(
    Math.sin(adjustedFrame * 0.1),
    [-1, 1],
    [0, 1]
  );
  
  const getAnimationStyle = () => {
    switch (animationType) {
      case 'bounce':
        return {
          transform: `scale(${bounceSpring})`,
          opacity: 1,
        };
      case 'slide':
        return {
          transform: `translateY(${slideY}px)`,
          opacity: fadeOpacity,
        };
      case 'fade':
        return {
          opacity: fadeOpacity,
        };
      case 'glow':
        return {
          boxShadow: `0 0 ${20 * glowIntensity}px ${theme.colors.primary}40`,
          opacity: 1,
        };
      default:
        return {};
    }
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          color: 'white',
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          border: `2px solid ${theme.colors.primary}`,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: 'white',
          border: 'none',
        };
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: '14px',
        };
      case 'lg':
        return {
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          fontSize: '18px',
        };
      default:
        return {
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: '16px',
        };
    }
  };
  
  if (frame < delay) {
    return null;
  }
  
  return (
    <button
      className={`font-semibold rounded-lg transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...getAnimationStyle(),
        borderRadius: theme.borderRadius.md,
        fontFamily: theme.fonts.primary,
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
};