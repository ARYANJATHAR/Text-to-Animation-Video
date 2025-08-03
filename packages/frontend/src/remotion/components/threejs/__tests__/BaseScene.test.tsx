import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BaseScene } from '../BaseScene';
import { ThreeJSScene } from 'shared-types';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({ set: vi.fn() })
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: ({ children, ...props }: any) => (
    <div data-testid="perspective-camera" {...props}>
      {children}
    </div>
  ),
  Environment: () => <div data-testid="environment" />
}));

// Mock child components
vi.mock('../SceneCamera', () => ({
  SceneCamera: ({ config }: any) => (
    <div data-testid="scene-camera" data-config={JSON.stringify(config)} />
  )
}));

vi.mock('../SceneLighting', () => ({
  SceneLighting: ({ config }: any) => (
    <div data-testid="scene-lighting" data-config={JSON.stringify(config)} />
  )
}));

vi.mock('../LoadingFallback', () => ({
  LoadingFallback: () => <div data-testid="loading-fallback" />
}));

describe('BaseScene', () => {
  const mockScene: ThreeJSScene = {
    id: 'test-scene',
    name: 'Test Scene',
    objects: [
      {
        id: 'object-1',
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

  it('should render base scene with default props', () => {
    const { getByTestId } = render(<BaseScene scene={mockScene} />);

    expect(getByTestId('canvas')).toBeInTheDocument();
    expect(getByTestId('scene-camera')).toBeInTheDocument();
    expect(getByTestId('scene-lighting')).toBeInTheDocument();
    expect(getByTestId('environment')).toBeInTheDocument();
  });

  it('should apply custom dimensions', () => {
    const { container } = render(
      <BaseScene scene={mockScene} width={800} height={600} />
    );

    const sceneContainer = container.querySelector('.threejs-scene-container');
    expect(sceneContainer).toHaveStyle({
      width: '100%',
      height: '100%',
      position: 'relative'
    });
  });

  it('should enable orbit controls when specified', () => {
    const { getByTestId } = render(
      <BaseScene scene={mockScene} enableControls={true} />
    );

    expect(getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('should not show orbit controls by default', () => {
    const { queryByTestId } = render(<BaseScene scene={mockScene} />);

    expect(queryByTestId('orbit-controls')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BaseScene scene={mockScene} className="custom-scene" />
    );

    const sceneContainer = container.querySelector('.threejs-scene-container');
    expect(sceneContainer).toHaveClass('custom-scene');
  });

  it('should pass camera configuration to SceneCamera', () => {
    const { getByTestId } = render(<BaseScene scene={mockScene} />);

    const sceneCamera = getByTestId('scene-camera');
    const configData = sceneCamera.getAttribute('data-config');
    const config = JSON.parse(configData!);

    expect(config.type).toBe('perspective');
    expect(config.position).toEqual({ x: 5, y: 5, z: 5 });
    expect(config.fov).toBe(75);
  });

  it('should pass lighting configuration to SceneLighting', () => {
    const { getByTestId } = render(<BaseScene scene={mockScene} />);

    const sceneLighting = getByTestId('scene-lighting');
    const configData = sceneLighting.getAttribute('data-config');
    const config = JSON.parse(configData!);

    expect(config.ambient.color).toBe('#404040');
    expect(config.directional).toHaveLength(1);
  });

  it('should handle empty scene objects', () => {
    const emptyScene: ThreeJSScene = {
      ...mockScene,
      objects: []
    };

    const { getByTestId } = render(<BaseScene scene={emptyScene} />);

    expect(getByTestId('canvas')).toBeInTheDocument();
    expect(getByTestId('scene-camera')).toBeInTheDocument();
    expect(getByTestId('scene-lighting')).toBeInTheDocument();
  });

  it('should render multiple scene objects', () => {
    const multiObjectScene: ThreeJSScene = {
      ...mockScene,
      objects: [
        ...mockScene.objects,
        {
          id: 'object-2',
          type: 'mesh',
          geometry: {
            type: 'sphere',
            parameters: { radius: 0.5 }
          },
          material: {
            type: 'basic',
            properties: { color: '#ff0000' }
          },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        }
      ]
    };

    const { getByTestId } = render(<BaseScene scene={multiObjectScene} />);

    expect(getByTestId('canvas')).toBeInTheDocument();
    // Objects are rendered within the Canvas, so we can't directly test them
    // but we can verify the scene structure is maintained
  });
});