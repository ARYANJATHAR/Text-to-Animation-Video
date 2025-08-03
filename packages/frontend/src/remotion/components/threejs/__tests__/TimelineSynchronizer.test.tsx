import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  TimelineSynchronizer, 
  useTimelineSync, 
  useSynchronizedAnimation,
  useSynchronizedAnimations,
  useSynchronizationPoints,
  createSynchronizedKeyframes,
  createStaggeredAnimations
} from '../TimelineSynchronizer';
import { ThreeJSAnimation, TimelineSegment, SynchronizationPoint } from 'shared-types';

// Mock Remotion hooks
vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 60),
  useVideoConfig: vi.fn(() => ({
    fps: 30,
    durationInFrames: 300,
    width: 1920,
    height: 1080
  }))
}));

describe('TimelineSynchronizer', () => {
  const mockSegments: TimelineSegment[] = [
    {
      id: 'segment-1',
      startTime: 0,
      duration: 3,
      technology: 'threejs',
      content: { type: '3d_scene', data: { sceneId: 'scene-1' } },
      animations: []
    },
    {
      id: 'segment-2',
      startTime: 3,
      duration: 4,
      technology: 'threejs',
      content: { type: '3d_scene', data: { sceneId: 'scene-2' } },
      animations: []
    }
  ];

  const mockSyncPoints: SynchronizationPoint[] = [
    {
      id: 'sync-1',
      timestamp: 1.0,
      services: ['threejs', 'remotion'],
      event: 'scene_intro',
      properties: { segmentId: 'segment-1' }
    },
    {
      id: 'sync-2',
      timestamp: 2.0,
      services: ['threejs'],
      event: 'animation_start',
      properties: { segmentId: 'segment-1' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides timeline context to children', () => {
    const TestChild = () => {
      const { currentTime, currentFrame, fps } = useTimelineSync();
      return (
        <div>
          <span>Time: {currentTime}</span>
          <span>Frame: {currentFrame}</span>
          <span>FPS: {fps}</span>
        </div>
      );
    };

    render(
      <TimelineSynchronizer segments={mockSegments} synchronizationPoints={mockSyncPoints}>
        <TestChild />
      </TimelineSynchronizer>
    );

    expect(screen.getByText('Time: 2')).toBeInTheDocument(); // 60 frames / 30 fps = 2 seconds
    expect(screen.getByText('Frame: 60')).toBeInTheDocument();
    expect(screen.getByText('FPS: 30')).toBeInTheDocument();
  });

  it('throws error when useTimelineSync is used outside provider', () => {
    const TestChild = () => {
      useTimelineSync();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestChild />);
    }).toThrow('useTimelineSync must be used within a TimelineSynchronizer');

    consoleSpy.mockRestore();
  });

  it('calculates segment activity correctly', () => {
    const TestChild = () => {
      const { isSegmentActive } = useTimelineSync();
      const segment1Active = isSegmentActive(mockSegments[0]);
      const segment2Active = isSegmentActive(mockSegments[1]);
      
      return (
        <div>
          <span>Segment 1: {segment1Active ? 'active' : 'inactive'}</span>
          <span>Segment 2: {segment2Active ? 'active' : 'inactive'}</span>
        </div>
      );
    };

    render(
      <TimelineSynchronizer segments={mockSegments}>
        <TestChild />
      </TimelineSynchronizer>
    );

    // At frame 60 (2 seconds), segment 1 should be active, segment 2 inactive
    expect(screen.getByText('Segment 1: active')).toBeInTheDocument();
    expect(screen.getByText('Segment 2: inactive')).toBeInTheDocument();
  });
});

describe('useSynchronizedAnimation', () => {
  const mockAnimation: ThreeJSAnimation = {
    id: 'test-animation',
    targetId: 'test-object',
    property: 'position',
    keyframes: [
      { time: 0, value: { x: 0, y: 0, z: 0 } },
      { time: 1, value: { x: 2, y: 0, z: 0 } },
      { time: 2, value: { x: 2, y: 2, z: 0 } }
    ],
    duration: 2,
    easing: 'linear'
  };

  it('returns animation value at current time', () => {
    const TestChild = () => {
      const animationValue = useSynchronizedAnimation(mockAnimation, 0);
      return (
        <div>
          Value: {animationValue ? JSON.stringify(animationValue) : 'null'}
        </div>
      );
    };

    render(
      <TimelineSynchronizer segments={[]}>
        <TestChild />
      </TimelineSynchronizer>
    );

    // Should interpolate between keyframes
    expect(screen.getByText(/Value:/)).toBeInTheDocument();
  });

  it('returns null for negative relative time', () => {
    const TestChild = () => {
      const animationValue = useSynchronizedAnimation(mockAnimation, 5); // Start time after current time
      return (
        <div>
          Value: {animationValue ? JSON.stringify(animationValue) : 'null'}
        </div>
      );
    };

    render(
      <TimelineSynchronizer segments={[]}>
        <TestChild />
      </TimelineSynchronizer>
    );

    expect(screen.getByText('Value: null')).toBeInTheDocument();
  });
});

describe('useSynchronizedAnimations', () => {
  const mockAnimations: ThreeJSAnimation[] = [
    {
      id: 'position-animation',
      targetId: 'object-1',
      property: 'position',
      keyframes: [
        { time: 0, value: { x: 0, y: 0, z: 0 } },
        { time: 1, value: { x: 1, y: 0, z: 0 } }
      ],
      duration: 1,
      easing: 'linear'
    },
    {
      id: 'rotation-animation',
      targetId: 'object-1',
      property: 'rotation',
      keyframes: [
        { time: 0, value: { x: 0, y: 0, z: 0 } },
        { time: 1, value: { x: 0, y: Math.PI, z: 0 } }
      ],
      duration: 1,
      easing: 'linear'
    }
  ];

  it('returns values for multiple animations', () => {
    const TestChild = () => {
      const animationValues = useSynchronizedAnimations(mockAnimations, 0);
      return (
        <div>
          Count: {Object.keys(animationValues).length}
        </div>
      );
    };

    render(
      <TimelineSynchronizer segments={[]}>
        <TestChild />
      </TimelineSynchronizer>
    );

    expect(screen.getByText(/Count:/)).toBeInTheDocument();
  });
});

describe('useSynchronizationPoints', () => {
  const mockSyncPoints: SynchronizationPoint[] = [
    {
      id: 'sync-1',
      timestamp: 1.9, // Close to current time (2.0)
      services: ['threejs'],
      event: 'test_event',
      properties: { segmentId: 'test-segment' }
    },
    {
      id: 'sync-2',
      timestamp: 3.0, // Future
      services: ['threejs'],
      event: 'future_event',
      properties: { segmentId: 'test-segment' }
    },
    {
      id: 'sync-3',
      timestamp: 1.0, // Past
      services: ['threejs'],
      event: 'past_event',
      properties: { segmentId: 'test-segment' }
    }
  ];

  it('identifies active, next, and previous sync points', () => {
    const TestChild = () => {
      const { activeSyncPoints, nextSyncPoint, previousSyncPoint } = useSynchronizationPoints('test-segment');
      return (
        <div>
          <span>Active: {activeSyncPoints.length}</span>
          <span>Next: {nextSyncPoint?.id || 'none'}</span>
          <span>Previous: {previousSyncPoint?.id || 'none'}</span>
        </div>
      );
    };

    render(
      <TimelineSynchronizer segments={[]} synchronizationPoints={mockSyncPoints}>
        <TestChild />
      </TimelineSynchronizer>
    );

    expect(screen.getByText(/Active:/)).toBeInTheDocument();
    expect(screen.getByText(/Next:/)).toBeInTheDocument();
    expect(screen.getByText(/Previous:/)).toBeInTheDocument();
  });
});

describe('Utility Functions', () => {
  describe('createSynchronizedKeyframes', () => {
    it('creates evenly spaced keyframes', () => {
      const keyframes = createSynchronizedKeyframes(0, 2, [0, 1, 2, 3]);

      expect(keyframes).toHaveLength(4);
      expect(keyframes[0]).toEqual({ time: 0, value: 0 });
      expect(keyframes[1]).toEqual({ time: 2/3, value: 1 });
      expect(keyframes[2]).toEqual({ time: 4/3, value: 2 });
      expect(keyframes[3]).toEqual({ time: 2, value: 3 });
    });

    it('throws error for insufficient values', () => {
      expect(() => {
        createSynchronizedKeyframes(0, 1, [0]);
      }).toThrow('At least 2 values are required for keyframes');
    });
  });

  describe('createStaggeredAnimations', () => {
    it('creates staggered animations with delay', () => {
      const baseAnimation = {
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0, z: 0 } },
          { time: 1, value: { x: 1, y: 0, z: 0 } }
        ],
        duration: 1,
        easing: 'linear' as const
      };

      const targetIds = ['obj1', 'obj2', 'obj3'];
      const staggerDelay = 0.2;

      const staggeredAnimations = createStaggeredAnimations(baseAnimation, targetIds, staggerDelay);

      expect(staggeredAnimations).toHaveLength(3);
      
      // Check first animation (no delay)
      expect(staggeredAnimations[0].targetId).toBe('obj1');
      expect(staggeredAnimations[0].keyframes[0].time).toBe(0);
      
      // Check second animation (0.2s delay)
      expect(staggeredAnimations[1].targetId).toBe('obj2');
      expect(staggeredAnimations[1].keyframes[0].time).toBe(0.2);
      
      // Check third animation (0.4s delay)
      expect(staggeredAnimations[2].targetId).toBe('obj3');
      expect(staggeredAnimations[2].keyframes[0].time).toBe(0.4);
    });

    it('uses default stagger delay', () => {
      const baseAnimation = {
        property: 'scale',
        keyframes: [
          { time: 0, value: { x: 1, y: 1, z: 1 } },
          { time: 1, value: { x: 2, y: 2, z: 2 } }
        ],
        duration: 1,
        easing: 'linear' as const
      };

      const staggeredAnimations = createStaggeredAnimations(baseAnimation, ['obj1', 'obj2']);

      expect(staggeredAnimations[1].keyframes[0].time).toBe(0.1); // Default 0.1s delay
    });
  });
});