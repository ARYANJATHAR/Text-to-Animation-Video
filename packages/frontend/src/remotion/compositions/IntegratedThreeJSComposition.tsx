import React from 'react';
import { Composition, Sequence } from 'remotion';
import { 
  ThreeJSScene, 
  TimelineSegment, 
  TransitionConfiguration,
  SynchronizationPoint,
  ThreeJSAnimation 
} from 'shared-types';
import { MultiSceneComposition, createSceneTransition } from '../components/threejs/MultiSceneComposition';
import { TimelineSynchronizer } from '../components/threejs/TimelineSynchronizer';
import { RemotionThreeJSBridge } from '../components/threejs/RemotionThreeJSBridge';

// Example scenes for demonstration
const networkScene: ThreeJSScene = {
  id: 'network-scene',
  name: 'Network Topology Visualization',
  objects: [
    {
      id: 'client-1',
      type: 'mesh',
      geometry: {
        type: 'box',
        parameters: { width: 1, height: 0.6, depth: 0.8 }
      },
      material: {
        type: 'standard',
        properties: { color: '#4A90E2', metalness: 0.1, roughness: 0.3 }
      },
      position: { x: -3, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    {
      id: 'server-1',
      type: 'mesh',
      geometry: {
        type: 'cylinder',
        parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5 }
      },
      material: {
        type: 'standard',
        properties: { color: '#E74C3C', metalness: 0.2, roughness: 0.4 }
      },
      position: { x: 3, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    {
      id: 'connection-line',
      type: 'mesh',
      geometry: {
        type: 'cylinder',
        parameters: { radiusTop: 0.05, radiusBottom: 0.05, height: 6 }
      },
      material: {
        type: 'standard',
        properties: { color: '#F39C12', metalness: 0.0, roughness: 0.8 }
      },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
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
      id: 'data-flow-animation',
      targetId: 'connection-line',
      property: 'material.opacity',
      keyframes: [
        { time: 0, value: 0.3 },
        { time: 1, value: 1.0 },
        { time: 2, value: 0.3 },
        { time: 3, value: 1.0 },
        { time: 4, value: 0.3 }
      ],
      duration: 4,
      easing: 'easeInOut'
    },
    {
      id: 'server-pulse',
      targetId: 'server-1',
      property: 'scale',
      keyframes: [
        { time: 0, value: { x: 1, y: 1, z: 1 } },
        { time: 0.5, value: { x: 1.1, y: 1.1, z: 1.1 } },
        { time: 1, value: { x: 1, y: 1, z: 1 } }
      ],
      duration: 1,
      easing: 'easeInOut'
    }
  ],
  duration: 5
};

const infrastructureScene: ThreeJSScene = {
  id: 'infrastructure-scene',
  name: 'Web Infrastructure Overview',
  objects: [
    {
      id: 'load-balancer',
      type: 'mesh',
      geometry: {
        type: 'box',
        parameters: { width: 2, height: 0.5, depth: 1 }
      },
      material: {
        type: 'standard',
        properties: { color: '#9B59B6', metalness: 0.3, roughness: 0.2 }
      },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    {
      id: 'web-server-1',
      type: 'mesh',
      geometry: {
        type: 'cylinder',
        parameters: { radiusTop: 0.4, radiusBottom: 0.4, height: 1.2 }
      },
      material: {
        type: 'standard',
        properties: { color: '#E74C3C', metalness: 0.2, roughness: 0.4 }
      },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    {
      id: 'web-server-2',
      type: 'mesh',
      geometry: {
        type: 'cylinder',
        parameters: { radiusTop: 0.4, radiusBottom: 0.4, height: 1.2 }
      },
      material: {
        type: 'standard',
        properties: { color: '#E74C3C', metalness: 0.2, roughness: 0.4 }
      },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
    {
      id: 'database',
      type: 'mesh',
      geometry: {
        type: 'cylinder',
        parameters: { radiusTop: 0.6, radiusBottom: 0.6, height: 0.8 }
      },
      material: {
        type: 'standard',
        properties: { color: '#27AE60', metalness: 0.3, roughness: 0.2 }
      },
      position: { x: 0, y: -2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }
  ],
  camera: {
    type: 'perspective',
    position: { x: 6, y: 4, z: 6 },
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
    },
    {
      id: 'servers-sync-pulse',
      targetId: 'web-server-1',
      property: 'material.opacity',
      keyframes: [
        { time: 0, value: 1.0 },
        { time: 0.5, value: 0.5 },
        { time: 1, value: 1.0 }
      ],
      duration: 1,
      easing: 'easeInOut'
    }
  ],
  duration: 6
};

// Timeline configuration
const timeline: TimelineSegment[] = [
  {
    id: 'network-segment',
    startTime: 0,
    duration: 5,
    technology: 'threejs',
    content: {
      type: '3d_scene',
      data: { sceneId: 'network-scene' }
    },
    animations: []
  },
  {
    id: 'infrastructure-segment',
    startTime: 4, // 1 second overlap for transition
    duration: 6,
    technology: 'threejs',
    content: {
      type: '3d_scene',
      data: { sceneId: 'infrastructure-scene' }
    },
    animations: []
  }
];

// Transition configuration
const transitions: TransitionConfiguration[] = [
  createSceneTransition(
    'network-segment',
    'infrastructure-segment',
    'fade',
    1.5,
    { easing: 'easeInOut' }
  )
];

// Synchronization points
const synchronizationPoints: SynchronizationPoint[] = [
  {
    id: 'network-intro',
    timestamp: 0.5,
    services: ['threejs', 'remotion'],
    event: 'scene_intro',
    properties: { segmentId: 'network-segment', description: 'Network scene introduction' }
  },
  {
    id: 'data-flow-start',
    timestamp: 1.0,
    services: ['threejs'],
    event: 'animation_start',
    properties: { segmentId: 'network-segment', animationId: 'data-flow-animation' }
  },
  {
    id: 'transition-start',
    timestamp: 4.0,
    services: ['threejs', 'remotion'],
    event: 'scene_transition',
    properties: { fromSegment: 'network-segment', toSegment: 'infrastructure-segment' }
  },
  {
    id: 'infrastructure-intro',
    timestamp: 5.0,
    services: ['threejs', 'remotion'],
    event: 'scene_intro',
    properties: { segmentId: 'infrastructure-segment', description: 'Infrastructure scene introduction' }
  }
];

/**
 * Single Scene Example - demonstrates basic Three.js integration
 */
const SingleSceneExample: React.FC = () => {
  return (
    <TimelineSynchronizer 
      segments={[timeline[0]]}
      synchronizationPoints={synchronizationPoints.slice(0, 2)}
    >
      <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
        <RemotionThreeJSBridge
          scene={networkScene}
          animations={networkScene.animations}
          enableTimelineSync={true}
        />
      </div>
    </TimelineSynchronizer>
  );
};

/**
 * Multi Scene Example - demonstrates scene transitions and synchronization
 */
const MultiSceneExample: React.FC = () => {
  return (
    <TimelineSynchronizer 
      segments={timeline}
      synchronizationPoints={synchronizationPoints}
    >
      <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
        <MultiSceneComposition
          scenes={[networkScene, infrastructureScene]}
          timeline={timeline}
          transitions={transitions}
        />
      </div>
    </TimelineSynchronizer>
  );
};

/**
 * Advanced Integration Example - demonstrates complex synchronization
 */
const AdvancedIntegrationExample: React.FC = () => {
  return (
    <TimelineSynchronizer 
      segments={timeline}
      synchronizationPoints={synchronizationPoints}
    >
      <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
        {/* Background layer */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1,
            zIndex: -1
          }}
        />
        
        {/* Main Three.js content */}
        <MultiSceneComposition
          scenes={[networkScene, infrastructureScene]}
          timeline={timeline}
          transitions={transitions}
        />
        
        {/* Overlay elements synchronized with 3D content */}
        <Sequence from={30} durationInFrames={60}>
          <div 
            style={{
              position: 'absolute',
              bottom: 50,
              left: 50,
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            Network Communication Flow
          </div>
        </Sequence>
        
        <Sequence from={150} durationInFrames={90}>
          <div 
            style={{
              position: 'absolute',
              bottom: 50,
              left: 50,
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            Web Infrastructure Architecture
          </div>
        </Sequence>
      </div>
    </TimelineSynchronizer>
  );
};

// Export compositions for Remotion
export const IntegratedThreeJSCompositions = [
  <Composition
    id="SingleSceneThreeJS"
    component={SingleSceneExample}
    durationInFrames={150} // 5 seconds at 30fps
    fps={30}
    width={1920}
    height={1080}
  />,
  <Composition
    id="MultiSceneThreeJS"
    component={MultiSceneExample}
    durationInFrames={300} // 10 seconds at 30fps
    fps={30}
    width={1920}
    height={1080}
  />,
  <Composition
    id="AdvancedIntegrationThreeJS"
    component={AdvancedIntegrationExample}
    durationInFrames={300} // 10 seconds at 30fps
    fps={30}
    width={1920}
    height={1080}
  />
];

export default IntegratedThreeJSCompositions;