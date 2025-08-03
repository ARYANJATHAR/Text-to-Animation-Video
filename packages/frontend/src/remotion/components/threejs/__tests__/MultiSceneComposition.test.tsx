import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiSceneComposition, createSceneTransition } from '../MultiSceneComposition';
import { ThreeJSScene, TimelineSegment, TransitionConfiguration } from 'shared-types';

// Mock Remotion hooks
vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 60),
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
    const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + (outputRange[1] - outputRange[0]) * progress;
  })
}));

// Mock RemotionThreeJSBridge
vi.mock('../RemotionThreeJSBridge', () => ({
  RemotionThreeJSBridge: ({ scene, className }: any) => (
    <div data-testid="threejs-bridge" data-scene-id={scene.id} className={className}>
      Three.js Bridge: {scene.name}
    </div>
  )
}));

describe('MultiSceneComposition', () => {
  const mockScene1: ThreeJSScene = {
    id: 'scene-1',
    name: 'First Scene',
    objects: [
      {
        id: 'cube-1',
        type: 'mesh',
        geometry: { type: 'box', parameters: { width: 1, height: 1, depth: 1 } },
        material: { type: 'standard', properties: { color: '#ff0000' } },
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
    duration: 3
  };

  const mockScene2: ThreeJSScene = {
    id: 'scene-2',
    name: 'Second Scene',
    objects: [
      {
        id: 'sphere-1',
        type: 'mesh',
        geometry: { type: 'sphere', parameters: { radius: 0.5 } },
        material: { type: 'standard', properties: { color: '#00ff00' } },
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
      directional: []
    },
    animations: [],
    duration: 4
  };

  const mockTimeline: TimelineSegment[] = [
    {
      id: 'segment-1',
      startTime: 0,
      duration: 3,
      technology: 'threejs',
      content: {
        type: '3d_scene',
        data: { sceneId: 'scene-1' }
      },
      animations: []
    },
    {
      id: 'segment-2',
      startTime: 2.5, // Overlap for transition
      duration: 4,
      technology: 'threejs',
      content: {
        type: '3d_scene',
        data: { sceneId: 'scene-2' }
      },
      animations: []
    }
  ];

  const mockTransitions: TransitionConfiguration[] = [
    {
      id: 'transition-1-2',
      fromSegmentId: 'segment-1',
      toSegmentId: 'segment-2',
      type: 'fade',
      duration: 1,
      properties: { easing: 'easeInOut' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders multi-scene composition container', () => {
    render(
      <MultiSceneComposition
        scenes={[mockScene1, mockScene2]}
        timeline={mockTimeline}
        transitions={mockTransitions}
      />
    );

    expect(screen.getByRole('generic')).toHaveClass('multi-scene-composition');
  });

  it('renders active scenes based on timeline', () => {
    render(
      <MultiSceneComposition
        scenes={[mockScene1, mockScene2]}
        timeline={mockTimeline}
        transitions={mockTransitions}
      />
    );

    // Should render sequences for active scenes
    const sequences = screen.getAllByTestId('sequence');
    expect(sequences.length).toBeGreaterThan(0);
  });

  it('applies transitions between scenes', () => {
    render(
      <MultiSceneComposition
        scenes={[mockScene1, mockScene2]}
        timeline={mockTimeline}
        transitions={mockTransitions}
      />
    );

    // Component should render without errors when transitions are applied
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('shows debug information in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <MultiSceneComposition
        scenes={[mockScene1, mockScene2]}
        timeline={mockTimeline}
        transitions={mockTransitions}
      />
    );

    // Should show debug information
    expect(screen.getByText(/Frame:/)).toBeInTheDocument();
    expect(screen.getByText(/Active Scenes:/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('handles empty scenes array', () => {
    render(
      <MultiSceneComposition
        scenes={[]}
        timeline={[]}
        transitions={[]}
      />
    );

    expect(screen.getByRole('generic')).toHaveClass('multi-scene-composition');
  });

  it('handles timeline segments without matching scenes', () => {
    const timelineWithMissingScene: TimelineSegment[] = [
      {
        id: 'segment-missing',
        startTime: 0,
        duration: 2,
        technology: 'threejs',
        content: {
          type: '3d_scene',
          data: { sceneId: 'non-existent-scene' }
        },
        animations: []
      }
    ];

    render(
      <MultiSceneComposition
        scenes={[mockScene1]}
        timeline={timelineWithMissingScene}
        transitions={[]}
      />
    );

    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MultiSceneComposition
        scenes={[mockScene1]}
        timeline={mockTimeline}
        transitions={[]}
        className="custom-multi-scene"
      />
    );

    expect(screen.getByRole('generic')).toHaveClass('custom-multi-scene');
  });
});

describe('createSceneTransition', () => {
  it('creates fade transition with default properties', () => {
    const transition = createSceneTransition('scene-1', 'scene-2');

    expect(transition).toEqual({
      id: 'transition-scene-1-scene-2',
      fromSegmentId: 'scene-1',
      toSegmentId: 'scene-2',
      type: 'fade',
      duration: 1,
      properties: {
        easing: 'easeInOut'
      }
    });
  });

  it('creates slide transition with custom properties', () => {
    const transition = createSceneTransition(
      'scene-1',
      'scene-2',
      'slide',
      2,
      { direction: 'left', easing: 'easeIn' }
    );

    expect(transition).toEqual({
      id: 'transition-scene-1-scene-2',
      fromSegmentId: 'scene-1',
      toSegmentId: 'scene-2',
      type: 'slide',
      duration: 2,
      properties: {
        direction: 'left',
        easing: 'easeIn'
      }
    });
  });

  it('creates zoom transition', () => {
    const transition = createSceneTransition('scene-1', 'scene-2', 'zoom', 1.5);

    expect(transition.type).toBe('zoom');
    expect(transition.duration).toBe(1.5);
  });
});

describe('Scene Transition Effects', () => {
  it('handles slide transitions in different directions', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      const transition = createSceneTransition(
        'scene-1',
        'scene-2',
        'slide',
        1,
        { direction }
      );

      render(
        <MultiSceneComposition
          scenes={[mockScene1, mockScene2]}
          timeline={mockTimeline}
          transitions={[transition]}
        />
      );

      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  it('handles zoom transitions', () => {
    const zoomTransition = createSceneTransition('scene-1', 'scene-2', 'zoom', 1);

    render(
      <MultiSceneComposition
        scenes={[mockScene1, mockScene2]}
        timeline={mockTimeline}
        transitions={[zoomTransition]}
      />
    );

    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('handles multiple simultaneous transitions', () => {
    const multipleTransitions = [
      createSceneTransition('scene-1', 'scene-2', 'fade', 1),
      createSceneTransition('scene-2', 'scene-1', 'slide', 1.5, { direction: 'right' })
    ];

    render(
      <MultiSceneComposition
        scenes={[mockScene1, mockScene2]}
        timeline={mockTimeline}
        transitions={multipleTransitions}
      />
    );

    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});