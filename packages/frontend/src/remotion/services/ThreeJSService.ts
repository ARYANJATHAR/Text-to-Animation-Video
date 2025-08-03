import { 
  ThreeJSService as IThreeJSService, 
  ThreeJSScene, 
  Concept, 
  NetworkTopology, 
  ClientServerModel, 
  Scene, 
  Animation, 
  RemotionComponent,
  Vector3,
  CameraConfiguration,
  LightingConfiguration,
  ThreeJSObject
} from 'shared-types';

/**
 * Three.js Service for generating 3D visualizations within Remotion compositions
 * Handles network topologies, client-server models, and infrastructure visualizations
 */
export class ThreeJSService implements IThreeJSService {
  private webGLSupported: boolean | null = null;

  /**
   * Validates WebGL support in the current environment
   */
  validateWebGLSupport(): boolean {
    if (this.webGLSupported !== null) {
      return this.webGLSupported;
    }

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      this.webGLSupported = !!gl;
      return this.webGLSupported;
    } catch (error) {
      console.warn('WebGL support check failed:', error);
      this.webGLSupported = false;
      return false;
    }
  }

  /**
   * Generates a Three.js scene based on educational concepts
   */
  async generateScene(concepts: Concept[]): Promise<ThreeJSScene> {
    if (!this.validateWebGLSupport()) {
      throw new Error('WebGL is not supported in this environment');
    }

    // Filter concepts that are suitable for 3D visualization
    const spatialConcepts = concepts.filter(concept => 
      concept.type === 'spatial' && concept.visualizationType === 'threejs'
    );

    if (spatialConcepts.length === 0) {
      throw new Error('No spatial concepts found for Three.js visualization');
    }

    const sceneId = `scene-${Date.now()}`;
    const scene: ThreeJSScene = {
      id: sceneId,
      name: `Educational Scene: ${spatialConcepts.map(c => c.name).join(', ')}`,
      objects: [],
      camera: this.createDefaultCamera(),
      lighting: this.createDefaultLighting(),
      animations: [],
      duration: 10 // Default 10 seconds
    };

    // Generate objects based on concepts
    for (const concept of spatialConcepts) {
      const objects = await this.generateObjectsForConcept(concept);
      scene.objects.push(...objects);
    }

    return scene;
  }

  /**
   * Creates animated network topology visualization
   */
  async animateNetworkTopology(topology: NetworkTopology): Promise<Animation> {
    const animationId = `network-animation-${Date.now()}`;
    
    // Create keyframes for network data flow
    const keyframes = topology.connections.map((connection, index) => ({
      time: index * 0.5, // Stagger animations
      value: {
        opacity: 1,
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 0, z: 0 }
      }
    }));

    return {
      id: animationId,
      name: 'Network Topology Animation',
      duration: topology.connections.length * 0.5 + 2,
      keyframes,
      targets: topology.connections.map(c => c.id)
    };
  }

  /**
   * Creates client-server model visualization
   */
  async createClientServerVisualization(model: ClientServerModel): Promise<Scene> {
    const sceneId = `client-server-${Date.now()}`;
    const objects: ThreeJSObject[] = [];
    const animations: ThreeJSAnimation[] = [];

    // Create client objects
    model.clients.forEach((client, index) => {
      objects.push({
        id: client.id,
        type: 'mesh',
        geometry: {
          type: 'box',
          parameters: { width: 1, height: 0.5, depth: 0.8 }
        },
        material: {
          type: 'standard',
          properties: { color: '#4A90E2', metalness: 0.1, roughness: 0.3 }
        },
        position: client.position,
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      });
    });

    // Create server objects
    model.servers.forEach((server, index) => {
      objects.push({
        id: server.id,
        type: 'mesh',
        geometry: {
          type: 'cylinder',
          parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 2 }
        },
        material: {
          type: 'standard',
          properties: { color: '#E74C3C', metalness: 0.2, roughness: 0.4 }
        },
        position: server.position,
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      });
    });

    // Create connection animations
    model.connections.forEach((connection, index) => {
      if (connection.animated) {
        animations.push({
          id: `connection-${connection.id}`,
          targetId: connection.id,
          property: 'material.opacity',
          keyframes: [
            { time: 0, value: 0.3 },
            { time: 0.5, value: 1.0 },
            { time: 1.0, value: 0.3 }
          ],
          duration: 2,
          easing: 'easeInOut'
        });
      }
    });

    return {
      id: sceneId,
      name: 'Client-Server Visualization',
      duration: Math.max(6, animations.length * 2),
      objects,
      animations
    };
  }

  /**
   * Exports Three.js scene as Remotion component
   */
  async exportToRemotionComponent(): Promise<RemotionComponent> {
    // This will be implemented in the integration phase
    // For now, return a placeholder component structure
    return {
      id: `threejs-component-${Date.now()}`,
      type: 'threejs',
      from: 0,
      durationInFrames: 300, // 10 seconds at 30fps
      props: {
        sceneType: 'educational',
        webGLRequired: true
      },
      style: {
        width: '100%',
        height: '100%'
      }
    };
  }

  /**
   * Creates default camera configuration for educational content
   */
  private createDefaultCamera(): CameraConfiguration {
    return {
      type: 'perspective',
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      near: 0.1,
      far: 1000
    };
  }

  /**
   * Creates default lighting setup for educational visualizations
   */
  private createDefaultLighting(): LightingConfiguration {
    return {
      ambient: {
        color: '#404040',
        intensity: 0.4
      },
      directional: [
        {
          color: '#ffffff',
          intensity: 1.0,
          position: { x: 10, y: 10, z: 5 },
          target: { x: 0, y: 0, z: 0 }
        },
        {
          color: '#4A90E2',
          intensity: 0.3,
          position: { x: -5, y: 5, z: -5 },
          target: { x: 0, y: 0, z: 0 }
        }
      ]
    };
  }

  /**
   * Generates 3D objects based on educational concept
   */
  private async generateObjectsForConcept(concept: Concept): Promise<ThreeJSObject[]> {
    const objects: ThreeJSObject[] = [];
    
    // Generate objects based on concept metadata
    const visualElements = concept.metadata.visualElements || [];
    
    visualElements.forEach((element, index) => {
      const position: Vector3 = {
        x: (index % 3) * 2 - 2, // Arrange in grid
        y: 0,
        z: Math.floor(index / 3) * 2 - 2
      };

      objects.push({
        id: `${concept.id}-object-${index}`,
        type: 'mesh',
        geometry: this.getGeometryForElement(element),
        material: this.getMaterialForElement(element),
        position,
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      });
    });

    return objects;
  }

  /**
   * Determines appropriate geometry for visual element
   */
  private getGeometryForElement(element: string) {
    const elementLower = element.toLowerCase();
    
    if (elementLower.includes('server') || elementLower.includes('database')) {
      return {
        type: 'cylinder' as const,
        parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5 }
      };
    } else if (elementLower.includes('client') || elementLower.includes('browser')) {
      return {
        type: 'box' as const,
        parameters: { width: 1, height: 0.6, depth: 0.8 }
      };
    } else if (elementLower.includes('network') || elementLower.includes('connection')) {
      return {
        type: 'sphere' as const,
        parameters: { radius: 0.3 }
      };
    } else {
      return {
        type: 'box' as const,
        parameters: { width: 1, height: 1, depth: 1 }
      };
    }
  }

  /**
   * Determines appropriate material for visual element
   */
  private getMaterialForElement(element: string) {
    const elementLower = element.toLowerCase();
    
    if (elementLower.includes('server')) {
      return {
        type: 'standard' as const,
        properties: { color: '#E74C3C', metalness: 0.2, roughness: 0.4 }
      };
    } else if (elementLower.includes('client')) {
      return {
        type: 'standard' as const,
        properties: { color: '#4A90E2', metalness: 0.1, roughness: 0.3 }
      };
    } else if (elementLower.includes('database')) {
      return {
        type: 'standard' as const,
        properties: { color: '#27AE60', metalness: 0.3, roughness: 0.2 }
      };
    } else if (elementLower.includes('network')) {
      return {
        type: 'standard' as const,
        properties: { color: '#F39C12', metalness: 0.0, roughness: 0.8 }
      };
    } else {
      return {
        type: 'standard' as const,
        properties: { color: '#95A5A6', metalness: 0.1, roughness: 0.5 }
      };
    }
  }
}

// Export singleton instance
export const threeJSService = new ThreeJSService();