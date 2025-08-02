import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EducationalVideoComposition } from '../compositions/EducationalVideoComposition';
import { ASPECT_RATIOS, VIDEO_DURATIONS } from '../config/videoConfig';

// Mock Remotion hooks and components
vi.mock('remotion', () => ({
  useCurrentFrame: () => 0,
  useVideoConfig: () => ({
    fps: 30,
    durationInFrames: 900,
    width: 1920,
    height: 1080,
  }),
  spring: () => 1,
  interpolate: (input: number, inputRange: number[], outputRange: number[]) => outputRange[0],
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
  Sequence: ({ children }: any) => <div>{children}</div>,
  Composition: ({ children }: any) => <div>{children}</div>,
}));

describe('Remotion Compositions', () => {
  describe('EducationalVideoComposition', () => {
    const defaultProps = {
      aspectRatio: '16:9' as const,
      topic: 'How HTTP Works',
      concepts: ['client', 'server', 'request', 'response'],
      animationType: 'hybrid' as const,
    };

    it('renders without crashing', () => {
      const { container } = render(
        <EducationalVideoComposition {...defaultProps} />
      );
      expect(container).toBeTruthy();
    });

    it('renders with different aspect ratios', () => {
      Object.keys(ASPECT_RATIOS).forEach((aspectRatio) => {
        const { container } = render(
          <EducationalVideoComposition 
            {...defaultProps} 
            aspectRatio={aspectRatio as keyof typeof ASPECT_RATIOS}
          />
        );
        expect(container).toBeTruthy();
      });
    });

    it('renders with different animation types', () => {
      const animationTypes = ['remotion', 'threejs', 'manim', 'hybrid'] as const;
      
      animationTypes.forEach((animationType) => {
        const { container } = render(
          <EducationalVideoComposition 
            {...defaultProps} 
            animationType={animationType}
          />
        );
        expect(container).toBeTruthy();
      });
    });

    it('handles different numbers of concepts', () => {
      const testCases = [
        ['single'],
        ['first', 'second'],
        ['first', 'second', 'third', 'fourth', 'fifth'],
      ];

      testCases.forEach((concepts) => {
        const { container } = render(
          <EducationalVideoComposition 
            {...defaultProps} 
            concepts={concepts}
          />
        );
        expect(container).toBeTruthy();
      });
    });
  });

  describe('Video Configuration', () => {
    it('has correct aspect ratio dimensions', () => {
      expect(ASPECT_RATIOS['16:9']).toEqual({ width: 1920, height: 1080 });
      expect(ASPECT_RATIOS['9:16']).toEqual({ width: 1080, height: 1920 });
      expect(ASPECT_RATIOS['1:1']).toEqual({ width: 1080, height: 1080 });
    });

    it('has reasonable video durations', () => {
      expect(VIDEO_DURATIONS.SHORT).toBe(450); // 15 seconds at 30fps
      expect(VIDEO_DURATIONS.STANDARD).toBe(900); // 30 seconds at 30fps
      expect(VIDEO_DURATIONS.LONG).toBe(1800); // 60 seconds at 30fps
    });
  });
});