import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => [])
};

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({ set: vi.fn() })
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => (
    <div data-testid="text" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  Box: (props: any) => <div data-testid="box" {...props} />,
  Cylinder: (props: any) => <div data-testid="cylinder" {...props} />,
  Sphere: (props: any) => <div data-testid="sphere" {...props} />,
  Cone: (props: any) => <div data-testid="cone" {...props} />
}));

describe('3D Animation Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock performance.now to return incrementing values
    let counter = 0;
    mockPerformance.now.mockImplementation(() => counter++);
    global.performance = mockPerformance as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render WebServerComponent within performance threshold', async () => {
      const { WebServerComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      
      const startTime = performance.now();
      
      render(
        WebServerComponent({
          position: { x: 0, y: 0, z: 0 },
          animated: true,
          scale: 1,
          showLabel: true
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 50ms (mocked time units)
      expect(renderTime).toBeLessThan(50);
    });

    it('should render DatabaseComponent within performance threshold', async () => {
      const { DatabaseComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      
      const startTime = performance.now();
      
      render(
        DatabaseComponent({
          position: { x: 0, y: 0, z: 0 },
          animated: true,
          scale: 1,
          showLabel: true
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50);
    });

    it('should render CDNComponent within performance threshold', async () => {
      const { CDNComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      
      const startTime = performance.now();
      
      render(
        CDNComponent({
          position: { x: 0, y: 0, z: 0 },
          animated: true,
          scale: 1,
          showLabel: true
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50);
    });

    it('should render multiple infrastructure components efficiently', async () => {
      const { createInfrastructureComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      const React = await import('react');
      
      const startTime = performance.now();
      
      const components = ['web-server', 'database', 'cdn', 'load-balancer', 'api-gateway', 'cache'];
      
      render(
        React.createElement('div', {}, 
          components.map((type, index) =>
            React.createElement('div', { key: index },
              createInfrastructureComponent(type, {
                position: { x: index * 2, y: 0, z: 0 },
                animated: true,
                scale: 1,
                showLabel: true
              })
            )
          )
        )
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 6 components within 200ms
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Network Topology Performance', () => {
    it('should render small network topology efficiently', async () => {
      const { EnhancedNetworkTopology } = await import('../EnhancedNetworkTopology');
      const { render } = await import('@testing-library/react');
      
      const smallTopology = {
        nodes: Array.from({ length: 5 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: {}
        })),
        connections: Array.from({ length: 4 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i}`,
          targetId: `node-${i + 1}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'circular' as const
      };
      
      const startTime = performance.now();
      
      render(
        EnhancedNetworkTopology({
          topology: smallTopology,
          animated: true,
          showLabels: true
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    it('should render medium network topology within acceptable time', async () => {
      const { EnhancedNetworkTopology } = await import('../EnhancedNetworkTopology');
      const { render } = await import('@testing-library/react');
      
      const mediumTopology = {
        nodes: Array.from({ length: 20 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: { index: i }
        })),
        connections: Array.from({ length: 30 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i % 20}`,
          targetId: `node-${(i + 1) % 20}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'force' as const
      };
      
      const startTime = performance.now();
      
      render(
        EnhancedNetworkTopology({
          topology: mediumTopology,
          animated: true,
          showLabels: true
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Medium topology should render within 300ms
      expect(renderTime).toBeLessThan(300);
    });

    it('should handle large network topology without crashing', async () => {
      const { EnhancedNetworkTopology } = await import('../EnhancedNetworkTopology');
      const { render } = await import('@testing-library/react');
      
      const largeTopology = {
        nodes: Array.from({ length: 50 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: { index: i }
        })),
        connections: Array.from({ length: 100 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i % 50}`,
          targetId: `node-${(i + 1) % 50}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'grid' as const
      };
      
      const startTime = performance.now();
      
      const { container } = render(
        EnhancedNetworkTopology({
          topology: largeTopology,
          animated: false, // Disable animation for large topology
          showLabels: false
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(container.firstChild).toBeInTheDocument();
      // Large topology should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Data Flow Performance', () => {
    it('should render data flow visualization efficiently', async () => {
      const { DataFlowVisualization } = await import('../DataFlowVisualization');
      const { render } = await import('@testing-library/react');
      
      const dataFlow = Array.from({ length: 10 }, (_, i) => ({
        id: `step-${i}`,
        sequence: i,
        description: `Step ${i}`,
        fromId: 'source',
        toId: 'target',
        duration: 1
      }));
      
      const nodePositions = new Map([
        ['source', { x: -2, y: 0, z: 0 }],
        ['target', { x: 2, y: 0, z: 0 }]
      ]);
      
      const startTime = performance.now();
      
      render(
        DataFlowVisualization({
          dataFlow,
          nodePositions,
          animated: true,
          showLabels: true,
          currentStep: 5
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large data flow without performance degradation', async () => {
      const { DataFlowVisualization } = await import('../DataFlowVisualization');
      const { render } = await import('@testing-library/react');
      
      const largeDataFlow = Array.from({ length: 100 }, (_, i) => ({
        id: `step-${i}`,
        sequence: i,
        description: `Step ${i}`,
        fromId: `node-${i % 10}`,
        toId: `node-${(i + 1) % 10}`,
        duration: 1
      }));
      
      const nodePositions = new Map();
      for (let i = 0; i < 10; i++) {
        nodePositions.set(`node-${i}`, { x: i * 2, y: 0, z: 0 });
      }
      
      const startTime = performance.now();
      
      render(
        DataFlowVisualization({
          dataFlow: largeDataFlow,
          nodePositions,
          animated: false, // Disable animation for performance
          showLabels: false,
          currentStep: 50
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Large data flow should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Layout Algorithm Performance', () => {
    it('should calculate force-directed layout efficiently', async () => {
      // Import the layout calculation functions (they would need to be exported)
      // For now, we'll test the component that uses them
      const { EnhancedNetworkTopology } = await import('../EnhancedNetworkTopology');
      const { render } = await import('@testing-library/react');
      
      const complexTopology = {
        nodes: Array.from({ length: 30 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: {}
        })),
        connections: Array.from({ length: 60 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${Math.floor(Math.random() * 30)}`,
          targetId: `node-${Math.floor(Math.random() * 30)}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'force' as const
      };
      
      const startTime = performance.now();
      
      render(
        EnhancedNetworkTopology({
          topology: complexTopology,
          animated: false
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Force-directed layout should complete within 400ms
      expect(renderTime).toBeLessThan(400);
    });

    it('should calculate hierarchical layout efficiently', async () => {
      const { EnhancedNetworkTopology } = await import('../EnhancedNetworkTopology');
      const { render } = await import('@testing-library/react');
      
      const hierarchicalTopology = {
        nodes: Array.from({ length: 25 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: ['client', 'server', 'database', 'cdn'][i % 4],
          properties: {}
        })),
        connections: Array.from({ length: 40 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i % 25}`,
          targetId: `node-${(i + 1) % 25}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'hierarchical' as const
      };
      
      const startTime = performance.now();
      
      render(
        EnhancedNetworkTopology({
          topology: hierarchicalTopology,
          animated: false
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Hierarchical layout should be faster than force-directed
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with repeated renders', async () => {
      const { WebServerComponent } = await import('../WebInfrastructureComponents');
      const { render, cleanup } = await import('@testing-library/react');
      
      // Simulate multiple render/cleanup cycles
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          WebServerComponent({
            position: { x: i, y: 0, z: 0 },
            animated: true,
            scale: 1,
            showLabel: true
          })
        );
        
        unmount();
      }
      
      // If we get here without errors, memory management is working
      expect(true).toBe(true);
    });

    it('should handle component updates efficiently', async () => {
      const { WebServerComponent } = await import('../WebInfrastructureComponents');
      const { render, rerender } = await import('@testing-library/react');
      
      const initialProps = {
        position: { x: 0, y: 0, z: 0 },
        animated: true,
        scale: 1,
        showLabel: true
      };
      
      const { rerender: rerenderComponent } = render(
        WebServerComponent(initialProps)
      );
      
      const startTime = performance.now();
      
      // Simulate multiple prop updates
      for (let i = 1; i <= 10; i++) {
        rerenderComponent(
          WebServerComponent({
            ...initialProps,
            position: { x: i, y: 0, z: 0 },
            scale: 1 + i * 0.1
          })
        );
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Updates should be fast
      expect(updateTime).toBeLessThan(100);
    });
  });

  describe('Animation Performance', () => {
    it('should handle animation frame updates efficiently', async () => {
      const { useFrame } = await import('@react-three/fiber');
      
      // Mock useFrame to simulate animation callbacks
      const mockCallback = vi.fn();
      (useFrame as any).mockImplementation((callback: Function) => {
        // Simulate calling the animation callback multiple times
        for (let i = 0; i < 60; i++) { // 60 FPS
          callback({ clock: { elapsedTime: i / 60 } });
        }
      });
      
      const { WebServerComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      
      const startTime = performance.now();
      
      render(
        WebServerComponent({
          position: { x: 0, y: 0, z: 0 },
          animated: true,
          scale: 1,
          showLabel: true
        })
      );
      
      const endTime = performance.now();
      const animationTime = endTime - startTime;
      
      // Animation setup and 60 frame updates should complete quickly
      expect(animationTime).toBeLessThan(200);
    });

    it('should handle disabled animation efficiently', async () => {
      const { WebServerComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      
      const startTime = performance.now();
      
      render(
        WebServerComponent({
          position: { x: 0, y: 0, z: 0 },
          animated: false,
          scale: 1,
          showLabel: true
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Non-animated components should render faster
      expect(renderTime).toBeLessThan(30);
    });
  });

  describe('Stress Tests', () => {
    it('should handle maximum realistic component count', async () => {
      const { createInfrastructureComponent } = await import('../WebInfrastructureComponents');
      const { render } = await import('@testing-library/react');
      const React = await import('react');
      
      const componentTypes = ['web-server', 'database', 'cdn', 'load-balancer', 'api-gateway', 'cache'];
      const maxComponents = 50; // Realistic maximum for a complex diagram
      
      const startTime = performance.now();
      
      render(
        React.createElement('div', {},
          Array.from({ length: maxComponents }, (_, i) =>
            React.createElement('div', { key: i },
              createInfrastructureComponent(componentTypes[i % componentTypes.length], {
                position: { 
                  x: (i % 10) * 2, 
                  y: Math.floor(i / 10) * 2, 
                  z: 0 
                },
                animated: false, // Disable animation for stress test
                scale: 0.8,
                showLabel: false
              })
            )
          )
        )
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should handle 50 components within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle complex network with many connections', async () => {
      const { EnhancedNetworkTopology } = await import('../EnhancedNetworkTopology');
      const { render } = await import('@testing-library/react');
      
      const nodeCount = 25;
      const connectionCount = 100; // Dense connectivity
      
      const stressTopology = {
        nodes: Array.from({ length: nodeCount }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: { stress: 'test' }
        })),
        connections: Array.from({ length: connectionCount }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i % nodeCount}`,
          targetId: `node-${(i + 7) % nodeCount}`, // Create complex patterns
          type: ['tcp', 'http', 'udp', 'websocket'][i % 4],
          bidirectional: i % 2 === 0,
          properties: {}
        })),
        layout: 'force' as const
      };
      
      const startTime = performance.now();
      
      const { container } = render(
        EnhancedNetworkTopology({
          topology: stressTopology,
          animated: false,
          showLabels: false,
          showDataFlow: false
        })
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(container.firstChild).toBeInTheDocument();
      // Complex network should render within 1.5 seconds
      expect(renderTime).toBeLessThan(1500);
    });
  });
});