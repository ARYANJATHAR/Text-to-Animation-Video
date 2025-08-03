import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThreeJSService } from '../ThreeJSService';
import { Concept, NetworkTopology, ClientServerModel } from 'shared-types';

// Mock WebGL context
const mockWebGLContext = {
  getExtension: vi.fn(),
  getParameter: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn()
};

// Mock canvas and WebGL
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn((contextType) => {
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return mockWebGLContext;
    }
    return null;
  })
});

describe('ThreeJSService', () => {
  let service: ThreeJSService;

  beforeEach(() => {
    service = new ThreeJSService();
    // Force WebGL support for tests
    service['webGLSupported'] = true;
    vi.clearAllMocks();
  });

  describe('WebGL Support Validation', () => {
    it('should validate WebGL support successfully', () => {
      const isSupported = service.validateWebGLSupport();
      expect(isSupported).toBe(true);
    });

    it('should cache WebGL support result', () => {
      // Create a new service to test caching from scratch
      const newService = new ThreeJSService();
      const firstCheck = newService.validateWebGLSupport();
      const secondCheck = newService.validateWebGLSupport();
      
      expect(firstCheck).toBe(secondCheck);
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(1);
    });

    it('should handle WebGL not supported', () => {
      // Mock WebGL not supported
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      
      const newService = new ThreeJSService();
      const isSupported = newService.validateWebGLSupport();
      
      expect(isSupported).toBe(false);
    });
  });

  describe('Scene Generation', () => {
    const mockConcepts: Concept[] = [
      {
        id: 'concept-1',
        name: 'Client-Server Architecture',
        type: 'spatial',
        visualizationType: 'threejs',
        relationships: [],
        metadata: {
          complexity: 'moderate',
          visualElements: ['client', 'server', 'network'],
          keywords: ['http', 'request', 'response']
        }
      },
      {
        id: 'concept-2',
        name: 'Database Connection',
        type: 'spatial',
        visualizationType: 'threejs',
        relationships: [],
        metadata: {
          complexity: 'simple',
          visualElements: ['database', 'connection'],
          keywords: ['sql', 'query']
        }
      }
    ];

    it('should generate scene from spatial concepts', async () => {
      const scene = await service.generateScene(mockConcepts);

      expect(scene).toBeDefined();
      expect(scene.id).toMatch(/^scene-\d+$/);
      expect(scene.name).toContain('Client-Server Architecture');
      expect(scene.objects).toHaveLength(5); // 3 + 2 visual elements
      expect(scene.camera).toBeDefined();
      expect(scene.lighting).toBeDefined();
      expect(scene.duration).toBe(10);
    });

    it('should throw error when no spatial concepts provided', async () => {
      const nonSpatialConcepts: Concept[] = [
        {
          id: 'concept-1',
          name: 'Algorithm',
          type: 'logical',
          visualizationType: 'manim',
          relationships: [],
          metadata: {
            complexity: 'simple',
            visualElements: [],
            keywords: []
          }
        }
      ];

      await expect(service.generateScene(nonSpatialConcepts))
        .rejects.toThrow('No spatial concepts found for Three.js visualization');
    });

    it('should throw error when WebGL not supported', async () => {
      // Mock WebGL not supported
      const serviceWithoutWebGL = new ThreeJSService();
      serviceWithoutWebGL['webGLSupported'] = false;

      await expect(serviceWithoutWebGL.generateScene(mockConcepts))
        .rejects.toThrow('WebGL is not supported in this environment');
    });
  });

  describe('Network Topology Animation', () => {
    const mockTopology: NetworkTopology = {
      nodes: [
        {
          id: 'node-1',
          label: 'Client',
          type: 'client',
          properties: {}
        },
        {
          id: 'node-2',
          label: 'Server',
          type: 'server',
          properties: {}
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceId: 'node-1',
          targetId: 'node-2',
          type: 'http',
          bidirectional: false,
          properties: {}
        }
      ],
      layout: 'hierarchical'
    };

    it('should create network topology animation', async () => {
      const animation = await service.animateNetworkTopology(mockTopology);

      expect(animation).toBeDefined();
      expect(animation.id).toMatch(/^network-animation-\d+$/);
      expect(animation.name).toBe('Network Topology Animation');
      expect(animation.duration).toBe(2.5); // 1 connection * 0.5 + 2
      expect(animation.keyframes).toHaveLength(1);
      expect(animation.targets).toEqual(['conn-1']);
    });

    it('should handle multiple connections with staggered timing', async () => {
      const multiConnectionTopology: NetworkTopology = {
        ...mockTopology,
        connections: [
          ...mockTopology.connections,
          {
            id: 'conn-2',
            sourceId: 'node-2',
            targetId: 'node-1',
            type: 'tcp',
            bidirectional: true,
            properties: {}
          }
        ]
      };

      const animation = await service.animateNetworkTopology(multiConnectionTopology);

      expect(animation.duration).toBe(3); // 2 connections * 0.5 + 2
      expect(animation.keyframes).toHaveLength(2);
      expect(animation.targets).toEqual(['conn-1', 'conn-2']);
    });
  });

  describe('Client-Server Visualization', () => {
    const mockClientServerModel: ClientServerModel = {
      clients: [
        {
          id: 'client-1',
          type: 'browser',
          position: { x: -2, y: 0, z: 0 },
          properties: {}
        }
      ],
      servers: [
        {
          id: 'server-1',
          type: 'web',
          position: { x: 2, y: 0, z: 0 },
          properties: {}
        }
      ],
      connections: [
        {
          id: 'conn-1',
          fromId: 'client-1',
          toId: 'server-1',
          protocol: 'http',
          animated: true
        }
      ],
      dataFlow: [
        {
          id: 'flow-1',
          sequence: 1,
          description: 'HTTP Request',
          fromId: 'client-1',
          toId: 'server-1',
          duration: 1
        }
      ]
    };

    it('should create client-server visualization scene', async () => {
      const scene = await service.createClientServerVisualization(mockClientServerModel);

      expect(scene).toBeDefined();
      expect(scene.id).toMatch(/^client-server-\d+$/);
      expect(scene.name).toBe('Client-Server Visualization');
      expect(scene.objects).toHaveLength(2); // 1 client + 1 server
      expect(scene.animations).toHaveLength(1); // 1 animated connection
      expect(scene.duration).toBe(6); // max(6, 1 * 2)
    });

    it('should create objects with correct geometries and materials', async () => {
      const scene = await service.createClientServerVisualization(mockClientServerModel);

      const clientObject = scene.objects.find(obj => obj.id === 'client-1');
      const serverObject = scene.objects.find(obj => obj.id === 'server-1');

      expect(clientObject).toBeDefined();
      expect(clientObject?.geometry.type).toBe('box');
      expect(clientObject?.material.properties.color).toBe('#4A90E2');

      expect(serverObject).toBeDefined();
      expect(serverObject?.geometry.type).toBe('cylinder');
      expect(serverObject?.material.properties.color).toBe('#E74C3C');
    });

    it('should create animations for animated connections', async () => {
      const scene = await service.createClientServerVisualization(mockClientServerModel);

      expect(scene.animations).toHaveLength(1);
      const animation = scene.animations[0];
      expect(animation.id).toBe('connection-conn-1');
      expect(animation.property).toBe('material.opacity');
      expect(animation.keyframes).toHaveLength(3);
      expect(animation.duration).toBe(2);
    });
  });

  describe('Remotion Component Export', () => {
    it('should export as Remotion component', async () => {
      const component = await service.exportToRemotionComponent();

      expect(component).toBeDefined();
      expect(component.id).toMatch(/^threejs-component-\d+$/);
      expect(component.type).toBe('threejs');
      expect(component.from).toBe(0);
      expect(component.durationInFrames).toBe(300);
      expect(component.props.sceneType).toBe('educational');
      expect(component.props.webGLRequired).toBe(true);
      expect(component.style?.width).toBe('100%');
      expect(component.style?.height).toBe('100%');
    });
  });

  describe('Private Helper Methods', () => {
    it('should create default camera configuration', () => {
      const camera = service['createDefaultCamera']();

      expect(camera.type).toBe('perspective');
      expect(camera.position).toEqual({ x: 5, y: 5, z: 5 });
      expect(camera.target).toEqual({ x: 0, y: 0, z: 0 });
      expect(camera.fov).toBe(75);
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(1000);
    });

    it('should create default lighting configuration', () => {
      const lighting = service['createDefaultLighting']();

      expect(lighting.ambient.color).toBe('#404040');
      expect(lighting.ambient.intensity).toBe(0.4);
      expect(lighting.directional).toHaveLength(2);
      expect(lighting.directional[0].color).toBe('#ffffff');
      expect(lighting.directional[0].intensity).toBe(1.0);
    });

    it('should generate appropriate geometry for different elements', () => {
      const serverGeometry = service['getGeometryForElement']('server');
      const clientGeometry = service['getGeometryForElement']('client');
      const networkGeometry = service['getGeometryForElement']('network');

      expect(serverGeometry.type).toBe('cylinder');
      expect(clientGeometry.type).toBe('box');
      expect(networkGeometry.type).toBe('sphere');
    });

    it('should generate appropriate materials for different elements', () => {
      const serverMaterial = service['getMaterialForElement']('server');
      const clientMaterial = service['getMaterialForElement']('client');
      const databaseMaterial = service['getMaterialForElement']('database');

      expect(serverMaterial.properties.color).toBe('#E74C3C');
      expect(clientMaterial.properties.color).toBe('#4A90E2');
      expect(databaseMaterial.properties.color).toBe('#27AE60');
    });
  });
});