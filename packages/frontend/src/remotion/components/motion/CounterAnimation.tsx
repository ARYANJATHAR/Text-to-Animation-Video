import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  useVideoConfig
} from 'remotion';

interface CounterAnimationProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  from,
  to,
  duration = 60, // 2 seconds at 30fps
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const adjustedFrame = Math.max(0, frame - delay);
  const progress = Math.min(1, adjustedFrame / duration);
  
  // Easing function for smooth animation
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easedProgress = easeOutCubic(progress);
  
  const currentValue = interpolate(easedProgress, [0, 1], [from, to]);
  const displayValue = decimals > 0 
    ? currentValue.toFixed(decimals)
    : Math.round(currentValue).toString();
  
  if (frame < delay) {
    return null;
  }
  
  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};