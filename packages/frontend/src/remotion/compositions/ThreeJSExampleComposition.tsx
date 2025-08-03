import React from 'react';
import { Composition } from 'remotion';
import { BaseScene, NetworkTopologyScene, ClientServerScene } from '../components/threejs';
import { ThreeJSScene, NetworkTopology, ClientServerModel } from 'shared-types';

// Example Three.js scene data
const exampleScene: ThreeJSScene = {
  id: 'example-scene',
  name: 'Educational Three.js Scene',
  objects: [
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
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    },
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
      position: { x: -2, y: 0, z: 0 },
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

// Example network topology
const exampleTopology: NetworkTopology = {
  nodes: [
    {
      id: 'client-node',
      label: 'Web Browser',
      type: 'client',
      properties: {}
    },
    {
      id: 'server-node',
      label: 'Web Server',
      type: 'server',
      properties: {}
    },
    {
      id: 'db-node',
      label: 'Database',
      type: 'database',
      properties: {}
    }
  ],
  connections: [
    {
      id: 'client-server',
      sourceId: 'client-node',
      targetId: 'server-node',
      type: 'http',
      bidirectional: false,
      properties: {}
    },
    {
      id: 'server-db',
      sourceId: 'server-node',
      targetId: 'db-node',
      type: 'tcp',
      bidirectional: true,
      properties: {}
    }
  ],
  layout: 'hierarchical'
};

// Example client-server model
const exampleClientServer: ClientServerModel = {
  clients: [
    {
      id: 'browser-client',
      type: 'browser',
      position: { x: -3, y: 0, z: 0 },
      properties: {}
    }
  ],
  servers: [
    {
      id: 'web-server',
      type: 'web',
      position: { x: 3, y: 0, z: 0 },
      properties: {}
    }
  ],
  connections: [
    {
      id: 'http-connection',
      fromId: 'browser-client',
      toId: 'web-server',
      protocol: 'http',
      animated: true
    }
  ],
  dataFlow: [
    {
      id: 'request-flow',
      sequence: 1,
      description: 'HTTP Request',
      fromId: 'browser-client',
      toId: 'web-server',
      duration: 2
    }
  ]
};

/**
 * Base Three.js Scene Example
 */
const BaseSceneExample: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
      <BaseScene scene={exampleScene} enableControls={false} />
    </div>
  );
};

/**
 * Network Topology Scene Example
 */
const NetworkTopologyExample: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
      <BaseScene scene={exampleScene}>
        <NetworkTopologyScene 
          topology={exampleTopology} 
          animated={true}
          showLabels={true}
        />
      </BaseScene>
    </div>
  );
};

/**
 * Client-Server Scene Example
 */
const ClientServerExample: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}>
      <BaseScene scene={exampleScene}>
        <ClientServerScene 
          model={exampleClientServer}
          animated={true}
          showDataFlow={true}
          currentStep={0}
        />
      </BaseScene>
    </div>
  );
};

// Export compositions for Remotion
export const ThreeJSExampleCompositions = [
  <Composition
    id="BaseSceneExample"
    component={BaseSceneExample}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />,
  <Composition
    id="NetworkTopologyExample"
    component={NetworkTopologyExample}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />,
  <Composition
    id="ClientServerExample"
    component={ClientServerExample}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
];