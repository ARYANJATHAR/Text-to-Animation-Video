import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { NetworkTopologyScene } from '../NetworkTopologyScene';
import { NetworkTopology } from 'shared-types';

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
  Line: (props: any) => <div data-testid="line" {...props} />
}));

describe('NetworkTopologyScene', () => {
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
      },
      {
        id: 'node-3',
        label: 'Database',
        type: 'database',
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
      },
      {
        id: 'conn-2',
        sourceId: 'node-2',
        targetId: 'node-3',
        type: 'tcp',
        bidirectional: true,
        properties: {}
      }
    ],
    layout: 'circular'
  };

  it('should render network topology with nodes and connections', () => {
    const { container } = render(
      <NetworkTopologyScene topology={mockTopology} />
    );

    // Should render the group container
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should show labels when enabled', () => {
    const { getAllByTestId } = render(
      <NetworkTopologyScene topology={mockTopology} showLabels={true} />
    );

    const textElements = getAllByTestId('text');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('should hide labels when disabled', () => {
    const { queryAllByTestId } = render(
      <NetworkTopologyScene topology={mockTopology} showLabels={false} />
    );

    const textElements = queryAllByTestId('text');
    // Should have fewer text elements (no node labels)
    expect(textElements.length).toBeLessThan(3);
  });

  it('should render connections as lines', () => {
    const { getAllByTestId } = render(
      <NetworkTopologyScene topology={mockTopology} />
    );

    const lineElements = getAllByTestId('line');
    expect(lineElements).toHaveLength(mockTopology.connections.length);
  });

  it('should handle different layout types', () => {
    const hierarchicalTopology: NetworkTopology = {
      ...mockTopology,
      layout: 'hierarchical'
    };

    const { container } = render(
      <NetworkTopologyScene topology={hierarchicalTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle grid layout', () => {
    const gridTopology: NetworkTopology = {
      ...mockTopology,
      layout: 'grid'
    };

    const { container } = render(
      <NetworkTopologyScene topology={gridTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle force layout as default', () => {
    const forceTopology: NetworkTopology = {
      ...mockTopology,
      layout: 'force'
    };

    const { container } = render(
      <NetworkTopologyScene topology={forceTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle empty topology', () => {
    const emptyTopology: NetworkTopology = {
      nodes: [],
      connections: [],
      layout: 'circular'
    };

    const { container } = render(
      <NetworkTopologyScene topology={emptyTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle topology with nodes but no connections', () => {
    const noConnectionsTopology: NetworkTopology = {
      nodes: mockTopology.nodes,
      connections: [],
      layout: 'circular'
    };

    const { container } = render(
      <NetworkTopologyScene topology={noConnectionsTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
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
      layout: 'circular'
    };

    const { container } = render(
      <NetworkTopologyScene topology={invalidConnectionsTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should disable animation when specified', () => {
    const { container } = render(
      <NetworkTopologyScene topology={mockTopology} animated={false} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle different node types', () => {
    const diverseTopology: NetworkTopology = {
      nodes: [
        { id: 'client', label: 'Client', type: 'client', properties: {} },
        { id: 'server', label: 'Server', type: 'server', properties: {} },
        { id: 'database', label: 'Database', type: 'database', properties: {} },
        { id: 'router', label: 'Router', type: 'router', properties: {} },
        { id: 'cdn', label: 'CDN', type: 'cdn', properties: {} }
      ],
      connections: [],
      layout: 'circular'
    };

    const { container } = render(
      <NetworkTopologyScene topology={diverseTopology} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

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
      layout: 'circular'
    };

    const { getAllByTestId } = render(
      <NetworkTopologyScene topology={diverseConnectionsTopology} />
    );

    const lineElements = getAllByTestId('line');
    expect(lineElements).toHaveLength(4);
  });
});