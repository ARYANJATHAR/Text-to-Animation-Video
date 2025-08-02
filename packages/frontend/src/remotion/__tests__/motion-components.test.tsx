import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AnimatedIcon } from '../components/motion/AnimatedIcon';
import { CounterAnimation } from '../components/motion/CounterAnimation';
import { ProgressBar } from '../components/motion/ProgressBar';
import { ParticleSystem } from '../components/motion/ParticleSystem';

// Mock Remotion hooks and components
vi.mock('remotion', () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({
    fps: 30,
    durationInFrames: 900,
    width: 1920,
    height: 1080,
  }),
  spring: () => 1,
  interpolate: (input: number, inputRange: number[], outputRange: number[]) => {
    const progress = Math.max(0, Math.min(1, (input - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + progress * (outputRange[1] - outputRange[0]);
  },
  random: (seed: string) => {
    // Simple deterministic random for testing
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647;
  },
}));

describe('Motion Components', () => {
  describe('AnimatedIcon', () => {
    it('renders different icon types', () => {
      const iconTypes = ['arrow', 'check', 'cross', 'loading', 'play', 'pause'] as const;
      
      iconTypes.forEach((type) => {
        const { container } = render(
          <AnimatedIcon type={type} />
        );
        expect(container.querySelector('svg')).toBeTruthy();
      });
    });

    it('applies different animation types', () => {
      const animationTypes = ['bounce', 'rotate', 'pulse', 'draw'] as const;
      
      animationTypes.forEach((animationType) => {
        const { container } = render(
          <AnimatedIcon type="check" animationType={animationType} />
        );
        expect(container.firstChild).toBeTruthy();
      });
    });

    it('handles delay properly', () => {
      const { container } = render(
        <AnimatedIcon type="check" delay={60} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('applies custom size and color', () => {
      const { container } = render(
        <AnimatedIcon type="check" size={48} color="#ff0000" />
      );
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('48');
      expect(svg?.getAttribute('stroke')).toBe('#ff0000');
    });
  });

  describe('CounterAnimation', () => {
    it('renders counter with from and to values', () => {
      const { getByText } = render(
        <CounterAnimation from={0} to={100} />
      );
      // Should show some value between 0 and 100
      expect(getByText(/\d+/)).toBeTruthy();
    });

    it('handles prefix and suffix', () => {
      const { getByText } = render(
        <CounterAnimation from={0} to={100} prefix="$" suffix="%" />
      );
      expect(getByText(/\$\d+%/)).toBeTruthy();
    });

    it('handles decimals', () => {
      const { container } = render(
        <CounterAnimation from={0} to={100} decimals={2} />
      );
      expect(container.textContent).toMatch(/\d+\.\d{2}/);
    });

    it('handles delay properly', () => {
      const { container } = render(
        <CounterAnimation from={0} to={100} delay={60} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('ProgressBar', () => {
    it('renders progress bar with correct dimensions', () => {
      const { container } = render(
        <ProgressBar progress={0.5} width={200} height={10} />
      );
      const progressBar = container.firstChild as HTMLElement;
      expect(progressBar).toBeTruthy();
    });

    it('shows percentage when enabled', () => {
      const { getByText } = render(
        <ProgressBar progress={0.75} showPercentage={true} />
      );
      expect(getByText(/\d+%/)).toBeTruthy();
    });

    it('applies custom colors', () => {
      const { container } = render(
        <ProgressBar 
          progress={0.5} 
          backgroundColor="#cccccc" 
          fillColor="#ff0000" 
        />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('handles different animation types', () => {
      const animationTypes = ['linear', 'spring', 'bounce'] as const;
      
      animationTypes.forEach((animationType) => {
        const { container } = render(
          <ProgressBar progress={0.5} animationType={animationType} />
        );
        expect(container.firstChild).toBeTruthy();
      });
    });
  });

  describe('ParticleSystem', () => {
    it('renders particle system with specified count', () => {
      const { container } = render(
        <ParticleSystem 
          particleCount={10} 
          width={400} 
          height={300} 
        />
      );
      const particles = container.querySelectorAll('div[style*="position: absolute"]');
      expect(particles.length).toBeGreaterThan(0);
    });

    it('applies custom colors', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      const { container } = render(
        <ParticleSystem 
          particleCount={5} 
          width={400} 
          height={300} 
          colors={customColors}
        />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('handles different particle sizes', () => {
      const { container } = render(
        <ParticleSystem 
          particleCount={5} 
          width={400} 
          height={300} 
          particleSize={8}
        />
      );
      expect(container.firstChild).toBeTruthy();
    });
  });
});