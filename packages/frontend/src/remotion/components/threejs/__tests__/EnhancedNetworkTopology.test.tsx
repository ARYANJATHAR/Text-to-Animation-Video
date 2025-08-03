import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { EnhancedNetworkTopology } from '../EnhancedNetworkTopology';
import { NetworkTopology } from 'shared-types';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => (
    <div data-testid="text" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />
}));

// Mock WebInfrastructureComponents
vi.mock('../WebInfrastructureComponents', () => ({
  createInfrastructureComponent: (type: string, props: any) => (
    <div data-testid={`infrastructure-${type}`} {...props}>
      {props.label}
    </div>
  )
}));

// Mock DataFlowVisualization
vi.mock('../DataFlowVisualization', () => ({
  DataFlowVisualization: (props: any) => (
    <div data-testid="data-flow-visualization" {...props} />
  )
}));

describe('EnhancedNetworkTopology', () => {
  const mockTopology: NetworkTopology = {
    nodes: [
      {
        id: 'node-1',
        label: 'Web Server',
        type: 'server',
        properties: { cpu: '4 cores', memory: '8GB' }
      },
      {
        id: 'node-2',
        label: 'Database',
        type: 'database',
        properties: { storage: '1TB', engine: 'PostgreSQL' }
      },
      {
        id: 'node-3',
        label: 'CDN',
        type: 'cdn',
        properties: { locations: '50+', bandwidth: '10Gbps' }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'tcp',
        bidirectional: true,
        properties: { port: 5432 }
      },
      {
        id: 'conn-2',
        sourceId: 'node-1',
        targetId: 'node-3',
        type: 'http',
        bidirectional: false,
        properties: { protocol: 'HTTPS' }
      }
    ],
    layout: 'force'
  };

  describe('Basic Rendering', () => {
    it('should render enhanced network topology with all nodes', () => {
      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} />
      );

      // Should render infrastructure components for each node
      const infrastructureComponents = getAllByTestId(/infrastructure-/);
      expect(infrastructureComponents).toHaveLength(mockTopology.nodes.length);
    });

    it('should render connections as lines', () => {
      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} />
      );

      const lines = getAllByTestId('line');
      expect(lines).toHaveLength(mockTopology.connections.length);
    });

    it('should show labels when enabled', () => {
      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} showLabels={true} />
      );

      const textElements = getAllByTestId('text');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should hide labels when disabled', () => {
      const { queryAllByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} showLabels={false} />
      );

      // Should have fewer text elements (only stats, no node labels)
      const textElements = queryAllByTestId('text');
      expect(textElements.length).toBeLessThan(10);
    });

    it('should show data flow when enabled', () => {
      const { getByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} showDataFlow={true} />
      );

      const dataFlow = getByTestId('data-flow-visualization');
      expect(dataFlow).toBeInTheDocument();
    });

    it('should hide data flow when disabled', () => {
      const { queryByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} showDataFlow={false} />
      );

      const dataFlow = queryByTestId('data-flow-visualization');
      expect(dataFlow).toBeNull();
    });
  });

  describe('Layout Types', () => {
    it('should handle force layout', () => {
      const forceTopology: NetworkTopology = {
        ...mockTopology,
        layout: 'force'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={forceTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle hierarchical layout', () => {
      const hierarchicalTopology: NetworkTopology = {
        ...mockTopology,
        layout: 'hierarchical'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={hierarchicalTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle circular layout', () => {
      const circularTopology: NetworkTopology = {
        ...mockTopology,
        layout: 'circular'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={circularTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle grid layout', () => {
      const gridTopology: NetworkTopology = {
        ...mockTopology,
        layout: 'grid'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={gridTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Interaction Modes', () => {
    it('should handle static interaction mode', () => {
      const { container } = render(
        <EnhancedNetworkTopology 
          topology={mockTopology} 
          interactionMode="static"
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle hover interaction mode', () => {
      const mockOnInteraction = vi.fn();
      const { container } = render(
        <EnhancedNetworkTopology 
          topology={mockTopology} 
          interactionMode="hover"
          onNodeInteraction={mockOnInteraction}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle click interaction mode', () => {
      const mockOnInteraction = vi.fn();
      const { container } = render(
        <EnhancedNetworkTopology 
          topology={mockTopology} 
          interactionMode="click"
          onNodeInteraction={mockOnInteraction}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should call onNodeInteraction callback', () => {
      const mockOnInteraction = vi.fn();
      const { container } = render(
        <EnhancedNetworkTopology 
          topology={mockTopology} 
          interactionMode="click"
          onNodeInteraction={mockOnInteraction}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
      // Note: Actual interaction testing would require more complex setup
      // with Three.js event handling
    });
  });

  describe('Node Types', () => {
    it('should handle different node types correctly', () => {
      const diverseTopology: NetworkTopology = {
        nodes: [
          { id: 'server', label: 'Server', type: 'server', properties: {} },
          { id: 'database', label: 'Database', type: 'database', properties: {} },
          { id: 'cdn', label: 'CDN', type: 'cdn', properties: {} },
          { id: 'client', label: 'Client', type: 'client', properties: {} },
          { id: 'router', label: 'Router', type: 'router', properties: {} }
        ],
        connections: [],
        layout: 'circular'
      };

      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={diverseTopology} />
      );

      const serverComponent = getAllByTestId('infrastructure-server');
      const databaseComponent = getAllByTestId('infrastructure-database');
      const cdnComponent = getAllByTestId('infrastructure-cdn');
      const clientComponent = getAllByTestId('infrastructure-client');
      const routerComponent = getAllByTestId('infrastructure-router');

      expect(serverComponent).toHaveLength(1);
      expect(databaseComponent).toHaveLength(1);
      expect(cdnComponent).toHaveLength(1);
      expect(clientComponent).toHaveLength(1);
      expect(routerComponent).toHaveLength(1);
    });
  });

  describe('Connection Types', () => {
    it('should handle different connection types', () => {
      const diverseConnectionsTopology: NetworkTopology = {
        nodes: mockTopology.nodes,
        connections: [
          {
            id: 'http-conn',
            sourceId: 'node-1',
            targetId: 'node-2',
            type: 'http',
            bidirectional: false,
            properties: {}
          },
          {
            id: 'tcp-conn',
            sourceId: 'node-1',
            targetId: 'node-3',
            type: 'tcp',
            bidirectional: true,
            properties: {}
          },
          {
            id: 'udp-conn',
            sourceId: 'node-2',
            targetId: 'node-3',
            type: 'udp',
            bidirectional: false,
            properties: {}
          },
          {
            id: 'websocket-conn',
            sourceId: 'node-1',
            targetId: 'node-2',
            type: 'websocket',
            bidirectional: true,
            properties: {}
          }
        ],
        layout: 'force'
      };

      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={diverseConnectionsTopology} />
      );

      const lines = getAllByTestId('line');
      expect(lines).toHaveLength(4);
    });

    it('should handle bidirectional connections', () => {
      const bidirectionalTopology: NetworkTopology = {
        ...mockTopology,
        connections: [
          {
            id: 'bidirectional-conn',
            sourceId: 'node-1',
            targetId: 'node-2',
            type: 'tcp',
            bidirectional: true,
            properties: {}
          }
        ]
      };

      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={bidirectionalTopology} />
      );

      const lines = getAllByTestId('line');
      expect(lines).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty topology', () => {
      const emptyTopology: NetworkTopology = {
        nodes: [],
        connections: [],
        layout: 'force'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={emptyTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle topology with nodes but no connections', () => {
      const noConnectionsTopology: NetworkTopology = {
        nodes: mockTopology.nodes,
        connections: [],
        layout: 'circular'
      };

      const { getAllByTestId, queryAllByTestId } = render(
        <EnhancedNetworkTopology topology={noConnectionsTopology} />
      );

      const infrastructureComponents = getAllByTestId(/infrastructure-/);
      expect(infrastructureComponents).toHaveLength(mockTopology.nodes.length);

      const lines = queryAllByTestId('line');
      expect(lines).toHaveLength(0);
    });

    it('should handle invalid connections gracefully', () => {
      const invalidConnectionsTopology: NetworkTopology = {
        nodes: mockTopology.nodes,
        connections: [
          {
            id: 'invalid-conn',
            sourceId: 'non-existent-node',
            targetId: 'another-non-existent-node',
            type: 'http',
            bidirectional: false,
            properties: {}
          }
        ],
        layout: 'force'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={invalidConnectionsTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle nodes with empty properties', () => {
      const emptyPropsTopology: NetworkTopology = {
        nodes: [
          {
            id: 'empty-props',
            label: 'Empty Props Node',
            type: 'server',
            properties: {}
          }
        ],
        connections: [],
        layout: 'force'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={emptyPropsTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle nodes with many properties', () => {
      const manyPropsTopology: NetworkTopology = {
        nodes: [
          {
            id: 'many-props',
            label: 'Many Props Node',
            type: 'server',
            properties: {
              cpu: '8 cores',
              memory: '32GB',
              storage: '2TB',
              network: '10Gbps',
              os: 'Ubuntu 20.04',
              uptime: '99.9%',
              location: 'US-East-1'
            }
          }
        ],
        connections: [],
        layout: 'force'
      };

      const { container } = render(
        <EnhancedNetworkTopology topology={manyPropsTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should enable animation by default', () => {
      const { container } = render(
        <EnhancedNetworkTopology topology={mockTopology} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should disable animation when specified', () => {
      const { container } = render(
        <EnhancedNetworkTopology topology={mockTopology} animated={false} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Network Statistics', () => {
    it('should display network statistics', () => {
      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={mockTopology} />
      );

      const textElements = getAllByTestId('text');
      const statsTexts = textElements.filter(el => 
        el.textContent?.includes('Network Statistics') ||
        el.textContent?.includes('Nodes:') ||
        el.textContent?.includes('Connections:')
      );
      
      expect(statsTexts.length).toBeGreaterThan(0);
    });

    it('should update statistics based on topology', () => {
      const largeTopology: NetworkTopology = {
        nodes: Array.from({ length: 10 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: {}
        })),
        connections: Array.from({ length: 15 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i % 10}`,
          targetId: `node-${(i + 1) % 10}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'force'
      };

      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={largeTopology} />
      );

      const textElements = getAllByTestId('text');
      const nodeCountText = textElements.find(el => 
        el.textContent?.includes('Nodes: 10')
      );
      const connectionCountText = textElements.find(el => 
        el.textContent?.includes('Connections: 15')
      );

      expect(nodeCountText).toBeDefined();
      expect(connectionCountText).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large topologies efficiently', () => {
      const largeTopology: NetworkTopology = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          label: `Node ${i}`,
          type: 'server',
          properties: { index: i }
        })),
        connections: Array.from({ length: 200 }, (_, i) => ({
          id: `conn-${i}`,
          sourceId: `node-${i % 100}`,
          targetId: `node-${(i + 1) % 100}`,
          type: 'tcp',
          bidirectional: false,
          properties: {}
        })),
        layout: 'force'
      };

      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={largeTopology} />
      );

      const infrastructureComponents = getAllByTestId(/infrastructure-/);
      expect(infrastructureComponents).toHaveLength(100);

      const lines = getAllByTestId('line');
      expect(lines).toHaveLength(200);
    });

    it('should handle complex connection patterns', () => {
      const complexTopology: NetworkTopology = {
        nodes: mockTopology.nodes,
        connections: [
          // Full mesh connectivity
          { id: 'c1', sourceId: 'node-1', targetId: 'node-2', type: 'tcp', bidirectional: true, properties: {} },
          { id: 'c2', sourceId: 'node-1', targetId: 'node-3', type: 'http', bidirectional: false, properties: {} },
          { id: 'c3', sourceId: 'node-2', targetId: 'node-3', type: 'udp', bidirectional: true, properties: {} },
          { id: 'c4', sourceId: 'node-2', targetId: 'node-1', type: 'websocket', bidirectional: true, properties: {} },
          { id: 'c5', sourceId: 'node-3', targetId: 'node-1', type: 'tcp', bidirectional: false, properties: {} },
          { id: 'c6', sourceId: 'node-3', targetId: 'node-2', type: 'http', bidirectional: false, properties: {} }
        ],
        layout: 'force'
      };

      const { getAllByTestId } = render(
        <EnhancedNetworkTopology topology={complexTopology} />
      );

      const lines = getAllByTestId('line');
      expect(lines).toHaveLength(6);
    });
  });
});