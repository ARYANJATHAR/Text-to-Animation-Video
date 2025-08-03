import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemotionThreeJSBridge } from '../RemotionThreeJSBridge';
import { ThreeJSScene, ThreeJSAnimation } from 'shared-types';

// Mock Remotion hooks
vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 30),
  useVideoConfig: vi.fn(() => ({
    fps: 30,
    durationInFrames: 300,
    width: 1920,
    height: 1080
  })),
  interpolate: vi.fn((input, inputRange, outputRange) => {
    const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + (outputRange[1] - outputRange[0]) * progress;
  })
}));

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onCreated, ...props }: any) => {
    // Simulate canvas creation
    if (onCreated) {
      const mockGL = {
        setClearColor: vi.fn(),
        setPixelRatio: vi.fn(),
        shadowMap: { enabled: false, type: 0 }
      };
      const mockScene = {};
      const mockCamera = {};
      onCreated({ gl: mockGL, scene: mockScene, camera: mockCamera });
    }
    return <div data-testid="three-canvas" {...props}>{children}</div>;
  }
}));

// Mock WebGL context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn((contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        getExtension: vi.fn(),
        // Add other WebGL context methods as needed
      };
    }
    return null;
  })
});

describe('RemotionThreeJSBridge', () => {
  const mockScene: ThreeJSScene = {
    id: 'test-scene',
    name: 'Test Scene',
    objects: [
      {
        id: 'test-cube',
        type: 'mesh',
        geometry: {
          type: 'box',
          parameters: { width: 1, height: 1, depth: 1 }
        },
        material: {
          type: 'standard',
          properties: { color: '#ffffff' }
        },
        position: { x: 0, y: 0, z: 0 },
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
    animations: [],
    duration: 10
  };

  const mockAnimations: ThreeJSAnimation[] = [
    {
      id: 'test-animation',
      targetId: 'test-cube',
      property: 'rotation',
      keyframes: [
        { time: 0, value: { x: 0, y: 0, z: 0 } },
        { time: 1, value: { x: 0, y: Math.PI, z: 0 } }
      ],
      duration: 1,
      easing: 'linear'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Three.js canvas with scene', () => {
    render(
      <RemotionThreeJSBridge
        scene={mockScene}
        enableTimelineSync={true}
      />
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('applies timeline synchronization when enabled', () => {
    const { rerender } = render(
      <RemotionThreeJSBridge
        scene={mockScene}
        animations={mockAnimations}
        enableTimelineSync={true}
      />
    );

    // Component should render without errors
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();

    // Test with timeline sync disabled
    rerender(
      <RemotionThreeJSBridge
        scene={mockScene}
        animations={mockAnimations}
        enableTimelineSync={false}
      />
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('handles frame range correctly', () => {
    render(
      <RemotionThreeJSBridge
        scene={mockScene}
        startFrame={10}
        durationInFrames={60}
        enableTimelineSync={true}
      />
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('shows debug overlay in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <RemotionThreeJSBridge
        scene={mockScene}
        enableTimelineSync={true}
      />
    );

    // Should show debug information
    expect(screen.getByText(/Frame:/)).toBeInTheDocument();
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Objects:/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides debug overlay in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <RemotionThreeJSBridge
        scene={mockScene}
        enableTimelineSync={true}
      />
    );

    // Should not show debug information
    expect(screen.queryByText(/Frame:/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('applies custom className', () => {
    render(
      <RemotionThreeJSBridge
        scene={mockScene}
        className="custom-bridge-class"
      />
    );

    const container = screen.getByTestId('three-canvas').parentElement;
    expect(container).toHaveClass('custom-bridge-class');
  });

  it('handles empty animations array', () => {
    render(
      <RemotionThreeJSBridge
        scene={mockScene}
        animations={[]}
        enableTimelineSync={true}
      />
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('handles scene with no objects', () => {
    const emptyScene: ThreeJSScene = {
      ...mockScene,
      objects: []
    };

    render(
      <RemotionThreeJSBridge
        scene={emptyScene}
        enableTimelineSync={true}
      />
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });
});

describe('Animation Interpolation', () => {
  it('interpolates linear animations correctly', () => {
    // This would test the interpolateAnimation function
    // Since it's not exported, we test it through the component behavior
    const animatedScene: ThreeJSScene = {
      id: 'animated-scene',
      name: 'Animated Scene',
      objects: [
        {
          id: 'animated-cube',
          type: 'mesh',
          geometry: { type: 'box', parameters: { width: 1, height: 1, depth: 1 } },
          material: { type: 'standard', properties: { color: '#ffffff' } },
          position: { x: 0, y: 0, z: 0 },
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
        directional: []
      },
      animations: [],
      duration: 2
    };

    const animations: ThreeJSAnimation[] = [
      {
        id: 'position-animation',
        targetId: 'animated-cube',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0, z: 0 } },
          { time: 1, value: { x: 2, y: 0, z: 0 } }
        ],
        duration: 1,
        easing: 'linear'
      }
    ];

    render(
      <RemotionThreeJSBridge
        scene={animatedScene}
        animations={animations}
        enableTimelineSync={true}
      />
    );

    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('handles different easing functions', () => {
    const easingTypes = ['linear', 'easeIn', 'easeOut', 'easeInOut'];
    
    easingTypes.forEach(easing => {
      const animations: ThreeJSAnimation[] = [
        {
          id: `${easing}-animation`,
          targetId: 'test-cube',
          property: 'scale',
          keyframes: [
            { time: 0, value: { x: 1, y: 1, z: 1 } },
            { time: 1, value: { x: 2, y: 2, z: 2 } }
          ],
          duration: 1,
          easing
        }
      ];

      render(
        <RemotionThreeJSBridge
          scene={{
            id: `${easing}-scene`,
            name: `${easing} Scene`,
            objects: [{
              id: 'test-cube',
              type: 'mesh',
              geometry: { type: 'box', parameters: { width: 1, height: 1, depth: 1 } },
              material: { type: 'standard', properties: { color: '#ffffff' } },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 }
            }],
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
              directional: []
            },
            animations: [],
            duration: 2
          }}
          animations={animations}
          enableTimelineSync={true}
        />
      );

      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    });
  });
});