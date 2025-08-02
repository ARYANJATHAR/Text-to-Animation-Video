import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AnimatedText } from '../components/text/AnimatedText';
import { SceneTransition } from '../components/transitions/SceneTransition';
import { ConceptCard } from '../components/content/ConceptCard';
import { ProgressIndicator } from '../components/ui/ProgressIndicator';

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
    // Simple linear interpolation for testing
    const progress = Math.max(0, Math.min(1, (input - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + progress * (outputRange[1] - outputRange[0]);
  },
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
  Sequence: ({ children }: any) => <div>{children}</div>,
}));

describe('Remotion Components', () => {
  describe('AnimatedText', () => {
    it('renders text with fadeIn animation', () => {
      const { getByText } = render(
        <AnimatedText 
          text="Test Text" 
          animationType="fadeIn"
        />
      );
      expect(getByText('Test Text')).toBeTruthy();
    });

    it('renders text with typewriter animation', () => {
      const { container } = render(
        <AnimatedText 
          text="Test Text" 
          animationType="typewriter"
        />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(
        <AnimatedText 
          text="Test Text" 
          animationType="fadeIn"
          className="custom-class"
        />
      );
      const element = getByText('Test Text');
      expect(element.className).toContain('custom-class');
    });

    it('handles delay properly', () => {
      const { container } = render(
        <AnimatedText 
          text="Test Text" 
          animationType="fadeIn"
          delay={60} // Should not render at frame 30
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SceneTransition', () => {
    it('renders fade transition', () => {
      const { container } = render(
        <SceneTransition type="fade" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('renders slide transition with direction', () => {
      const { container } = render(
        <SceneTransition type="slide" direction="up" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('renders fadeSlide transition', () => {
      const { container } = render(
        <SceneTransition type="fadeSlide" direction="down" />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('applies custom color', () => {
      const { container } = render(
        <SceneTransition type="fade" color="#ff0000" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('ConceptCard', () => {
    const defaultProps = {
      concept: 'Test Concept',
      index: 0,
      aspectRatio: '16:9' as const,
      animationType: 'remotion' as const,
      isActive: true,
    };

    it('renders concept card', () => {
      const { getByText } = render(
        <ConceptCard {...defaultProps} />
      );
      expect(getByText('Test Concept')).toBeTruthy();
    });

    it('shows concept number', () => {
      const { getByText } = render(
        <ConceptCard {...defaultProps} index={2} />
      );
      expect(getByText('3')).toBeTruthy(); // index + 1
    });

    it('handles different aspect ratios', () => {
      const aspectRatios = ['16:9', '9:16', '1:1'] as const;
      
      aspectRatios.forEach((aspectRatio) => {
        const { container } = render(
          <ConceptCard {...defaultProps} aspectRatio={aspectRatio} />
        );
        expect(container).toBeTruthy();
      });
    });

    it('handles different animation types', () => {
      const animationTypes = ['remotion', 'threejs', 'manim', 'hybrid'] as const;
      
      animationTypes.forEach((animationType) => {
        const { container } = render(
          <ConceptCard {...defaultProps} animationType={animationType} />
        );
        expect(container).toBeTruthy();
      });
    });
  });

  describe('ProgressIndicator', () => {
    const defaultProps = {
      total: 4,
      current: 1,
      aspectRatio: '16:9' as const,
    };

    it('renders progress indicator', () => {
      const { getByText } = render(
        <ProgressIndicator {...defaultProps} />
      );
      expect(getByText('2 / 4')).toBeTruthy(); // current + 1
    });

    it('renders correct number of dots', () => {
      const { container } = render(
        <ProgressIndicator {...defaultProps} total={5} />
      );
      // Count the number of progress dots (divs with border-radius: 50%)
      const dots = container.querySelectorAll('div[style*="border-radius: 50%"]');
      expect(dots.length).toBe(5);
    });

    it('handles different aspect ratios', () => {
      const aspectRatios = ['16:9', '9:16', '1:1'] as const;
      
      aspectRatios.forEach((aspectRatio) => {
        const { container } = render(
          <ProgressIndicator {...defaultProps} aspectRatio={aspectRatio} />
        );
        expect(container).toBeTruthy();
      });
    });
  });
});