import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  RemotionThreeJSBridge,
  MultiSceneComposition,
  TimelineSynchronizer,
  createSceneTransition
} from '../index';
import { ThreeJSScene, TimelineSegment, TransitionConfiguration, SynchronizationPoint } from 'shared-types';

// Mock Remotion
vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 90), // 3 seconds at 30fps
  useVideoConfig: vi.fn(() => ({
    fps: 30,
    durationInFrames: 300,
    width: 1920,
    height: 1080
  })),
  Sequence: ({ children, from, durationInFrames }: any) => (
    <div data-testid="sequence" data-from={from} data-duration={durationInFrames}>
      {children}
    </div>
  ),
  interpolate: vi.fn((input, inputRange, outputRange) => {
    const progress = Math.max(0, Math.min(1, (input - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + (outputRange[1] - outputRange[0]) * progress;
  })
}));

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onCreated, ...props }: any) => {
    if (onCreated) {
      const mockGL = {
        setClearColor: vi.fn(),
        setPixelRatio: vi.fn(),
        shadowMap: { enabled: false, type: 0 }
      };
      onCreated({ gl: mockGL, scene: {}, camera: {} });
    }
    return <div data-testid="three-canvas" {...props}>{children}</div>;
  }
}));

describe('Three.js Remotion Integration', () => {
  const networkScene: ThreeJSScene = {
    id: 'network-scene',
    name: 'Network Visualization',
    objects: [
      {
        id: 'client',
        type: 'mesh',
        geometry: { type: 'box', parameters: { width: 1, height: 0.6, depth: 0.8 } },
        material: { type: 'standard', properties: { color: '#4A90E2' } },
        position: { x: -2, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      },
      {
        id: 'server',
        type: 'mesh',
        geometry: { type: 'cylinder', parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5 } },
        material: { type: 'standard', properties: { color: '#E74C3C' } },
        position: { x: 2, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      }
    ],
    camera: {
      type: 'perspective',
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      near: 0.1,
      far: 1000
    },
    lighting: {
      ambient: { color: '#404040', intensity: 0.4 },
      directional: [
        {
          color: '#ffffff',
          intensity: 1.0,
          position: { x: 10, y: 10, z: 5 },
          target: { x: 0, y: 0, z: 0 }
        }
      ]
    },
    animations: [
      {
        id: 'server-pulse',
        targetId: 'server',
        property: 'scale',
        keyframes: [
          { time: 0, value: { x: 1, y: 1, z: 1 } },
          { time: 1, value: { x: 1.2, y: 1.2, z: 1.2 } },
          { time: 2, value: { x: 1, y: 1, z: 1 } }
        ],
        duration: 2,
        easing: 'easeInOut'
      }
    ],
    duration: 4
  };

  const infrastructureScene: ThreeJSScene = {
    id: 'infrastructure-scene',
    name: 'Infrastructure Overview',
    objects: [
      {
        id: 'load-balancer',
        type: 'mesh',
        geometry: { type: 'box', parameters: { width: 2, height: 0.5, depth: 1 } },
        material: { type: 'standard', properties: { color: '#9B59B6' } },
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      },
      {
        id: 'database',
        type: 'mesh',
        geometry: { type: 'cylinder', parameters: { radiusTop: 0.6, radiusBottom: 0.6, height: 0.8 } },
        material: { type: 'standard', properties: { color: '#27AE60' } },
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      }
    ],
    camera: {
      type: 'perspective',
      position: { x: 4, y: 4, z: 4 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      near: 0.1,
      far: 1000
    },
    lighting: {
      ambient: { color: '#404040', intensity: 0.4 },
      directional: [
        {
          color: '#ffffff',
          intensity: 1.0,
          position: { x: 10, y: 10, z: 5 },
          target: { x: 0, y: 0, z: 0 }
        }
      ]
    },
    animations: [
      {
        id: 'load-balancer-rotation',
        targetId: 'load-balancer',
        property: 'rotation',
        keyframes: [
          { time: 0, value: { x: 0, y: 0, z: 0 } },
          { time: 2, value: { x: 0, y: Math.PI * 2, z: 0 } }
        ],
        duration: 2,
        easing: 'linear'
      }
    ],
    duration: 5
  };

  const timeline: TimelineSegment[] = [
    {
      id: 'network-segment',
      startTime: 0,
      duration: 4,
      technology: 'threejs',
      content: { type: '3d_scene', data: { sceneId: 'network-scene' } },
      animations: []
    },
    {
      id: 'infrastructure-segment',
      startTime: 3,
      duration: 5,
      technology: 'threejs',
      content: { type: '3d_scene', data: { sceneId: 'infrastructure-scene' } },
      animations: []
    }
  ];

  const transitions: TransitionConfiguration[] = [
    createSceneTransition('network-segment', 'infrastructure-segment', 'fade', 1)
  ];

  const synchronizationPoints: SynchronizationPoint[] = [
    {
      id: 'network-intro',
      timestamp: 0.5,
      services: ['threejs', 'remotion'],
      event: 'scene_intro',
      properties: { segmentId: 'network-segment' }
    },
    {
      id: 'transition-point',
      timestamp: 3.0,
      services: ['threejs', 'remotion'],
      event: 'scene_transition',
      properties: { fromSegment: 'network-segment', toSegment: 'infrastructure-segment' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates single Three.js scene with Remotion timeline', async () => {
    render(
      <TimelineSynchronizer segments={[timeline[0]]} synchronizationPoints={synchronizationPoints}>
        <RemotionThreeJSBridge
          scene={networkScene}
          animations={networkScene.animations}
          enableTimelineSync={true}
        />
      </TimelineSynchronizer>
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    
    // Should render without errors
    await waitFor(() => {
      expect(screen.getByTestId('three-canvas')).toBeVisible();
    });
  });

  it('integrates multiple Three.js scenes with transitions', async () => {
    render(
      <TimelineSynchronizer segments={timeline} synchronizationPoints={synchronizationPoints}>
        <MultiSceneComposition
          scenes={[networkScene, infrastructureScene]}
          timeline={timeline}
          transitions={transitions}
        />
      </TimelineSynchronizer>
    );

    expect(screen.getByRole('generic')).toHaveClass('multi-scene-composition');
    
    // Should render sequences for active scenes
    await waitFor(() => {
      const sequences = screen.getAllByTestId('sequence');
      expect(sequences.length).toBeGreaterThan(0);
    });
  });

  it('synchronizes animations with Remotion timeline', async () => {
    const TestComponent = () => {
      return (
        <TimelineSynchronizer segments={timeline} synchronizationPoints={synchronizationPoints}>
          <div data-testid="sync-container">
            <RemotionThreeJSBridge
              scene={networkScene}
              animations={networkScene.animations}
              enableTimelineSync={true}
            />
          </div>
        </TimelineSynchronizer>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('sync-container')).toBeInTheDocument();
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('handles scene transitions smoothly', async () => {
    render(
      <TimelineSynchronizer segments={timeline} synchronizationPoints={synchronizationPoints}>
        <MultiSceneComposition
          scenes={[networkScene, infrastructureScene]}
          timeline={timeline}
          transitions={transitions}
        />
      </TimelineSynchronizer>
    );

    // At frame 90 (3 seconds), we should be in the transition period
    expect(screen.getByRole('generic')).toBeInTheDocument();
    
    await waitFor(() => {
      // Both scenes might be active during transition
      const sequences = screen.getAllByTestId('sequence');
      expect(sequences.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('maintains performance with complex scenes', async () => {
    const complexScene: ThreeJSScene = {
      ...networkScene,
      objects: [
        ...networkScene.objects,
        // Add more objects to test performance
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `object-${i}`,
          type: 'mesh' as const,
          geometry: { type: 'sphere' as const, parameters: { radius: 0.2 } },
          material: { type: 'standard' as const, properties: { color: '#ffffff' } },
          position: { x: i * 0.5, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        }))
      ]
    };

    const startTime = performance.now();

    render(
      <TimelineSynchronizer segments={[timeline[0]]}>
        <RemotionThreeJSBridge
          scene={complexScene}
          enableTimelineSync={true}
        />
      </TimelineSynchronizer>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1000); // Should render within 1 second
  });

  it('handles WebGL context errors gracefully', async () => {
    // Mock WebGL context failure
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TimelineSynchronizer segments={[timeline[0]]}>
        <RemotionThreeJSBridge
          scene={networkScene}
          enableTimelineSync={true}
        />
      </TimelineSynchronizer>
    );

    // Should still render the container even if WebGL fails
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();

    // Restore original methods
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    consoleSpy.mockRestore();
  });

  it('supports different aspect ratios and resolutions', async () => {
    const aspectRatios = [
      { width: 1920, height: 1080 }, // 16:9
      { width: 1080, height: 1920 }, // 9:16
      { width: 1080, height: 1080 }  // 1:1
    ];

    for (const { width, height } of aspectRatios) {
      // Mock different video config
      const mockUseVideoConfig = vi.fn(() => ({
        fps: 30,
        durationInFrames: 300,
        width,
        height
      }));

      vi.doMock('remotion', () => ({
        useCurrentFrame: vi.fn(() => 60),
        useVideoConfig: mockUseVideoConfig,
        Sequence: ({ children }: any) => <div data-testid="sequence">{children}</div>,
        interpolate: vi.fn((input, inputRange, outputRange) => {
          const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
          return outputRange[0] + (outputRange[1] - outputRange[0]) * progress;
        })
      }));

      render(
        <TimelineSynchronizer segments={[timeline[0]]}>
          <RemotionThreeJSBridge
            scene={networkScene}
            enableTimelineSync={true}
          />
        </TimelineSynchronizer>
      );

      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    }
  });

  it('handles empty or invalid scene data', async () => {
    const emptyScene: ThreeJSScene = {
      id: 'empty-scene',
      name: 'Empty Scene',
      objects: [],
      camera: {
        type: 'perspective',
        position: { x: 0, y: 0, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75,
        near: 0.1,
        far: 1000
      },
      lighting: {
        ambient: { color: '#404040', intensity: 0.4 },
        directional: []
      },
      animations: [],
      duration: 1
    };

    render(
      <TimelineSynchronizer segments={[]}>
        <RemotionThreeJSBridge
          scene={emptyScene}
          enableTimelineSync={true}
        />
      </TimelineSynchronizer>
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });
});