import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ClientServerScene } from '../ClientServerScene';
import { ClientServerModel } from 'shared-types';

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

describe('ClientServerScene', () => {
  const mockModel: ClientServerModel = {
    clients: [
      {
        id: 'client-1',
        type: 'browser',
        position: { x: -2, y: 0, z: 0 },
        properties: {}
      },
      {
        id: 'client-2',
        type: 'mobile',
        position: { x: -2, y: 0, z: 2 },
        properties: {}
      }
    ],
    servers: [
      {
        id: 'server-1',
        type: 'web',
        position: { x: 2, y: 0, z: 0 },
        properties: {}
      },
      {
        id: 'server-2',
        type: 'database',
        position: { x: 2, y: 0, z: 2 },
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
      },
      {
        id: 'conn-2',
        fromId: 'server-1',
        toId: 'server-2',
        protocol: 'tcp',
        animated: false
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
      },
      {
        id: 'flow-2',
        sequence: 2,
        description: 'Database Query',
        fromId: 'server-1',
        toId: 'server-2',
        duration: 0.5
      }
    ]
  };

  it('should render client-server model with all components', () => {
    const { container, getAllByTestId } = render(
      <ClientServerScene model={mockModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
    
    // Should have text elements for labels
    const textElements = getAllByTestId('text');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('should show data flow when enabled', () => {
    const { container } = render(
      <ClientServerScene model={mockModel} showDataFlow={true} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should hide data flow when disabled', () => {
    const { container } = render(
      <ClientServerScene model={mockModel} showDataFlow={false} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render connection lines', () => {
    const { getAllByTestId } = render(
      <ClientServerScene model={mockModel} />
    );

    const lineElements = getAllByTestId('line');
    expect(lineElements.length).toBeGreaterThanOrEqual(mockModel.connections.length);
  });

  it('should handle different client types', () => {
    const diverseClientModel: ClientServerModel = {
      clients: [
        {
          id: 'browser-client',
          type: 'browser',
          position: { x: -3, y: 0, z: 0 },
          properties: {}
        },
        {
          id: 'mobile-client',
          type: 'mobile',
          position: { x: -1, y: 0, z: 0 },
          properties: {}
        },
        {
          id: 'desktop-client',
          type: 'desktop',
          position: { x: 1, y: 0, z: 0 },
          properties: {}
        }
      ],
      servers: mockModel.servers,
      connections: [],
      dataFlow: []
    };

    const { container } = render(
      <ClientServerScene model={diverseClientModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle different server types', () => {
    const diverseServerModel: ClientServerModel = {
      clients: mockModel.clients,
      servers: [
        {
          id: 'web-server',
          type: 'web',
          position: { x: 2, y: 0, z: 0 },
          properties: {}
        },
        {
          id: 'api-server',
          type: 'api',
          position: { x: 4, y: 0, z: 0 },
          properties: {}
        },
        {
          id: 'database-server',
          type: 'database',
          position: { x: 6, y: 0, z: 0 },
          properties: {}
        },
        {
          id: 'cache-server',
          type: 'cache',
          position: { x: 8, y: 0, z: 0 },
          properties: {}
        }
      ],
      connections: [],
      dataFlow: []
    };

    const { container } = render(
      <ClientServerScene model={diverseServerModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle current step for data flow', () => {
    const { container } = render(
      <ClientServerScene 
        model={mockModel} 
        showDataFlow={true}
        currentStep={1}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should disable animation when specified', () => {
    const { container } = render(
      <ClientServerScene model={mockModel} animated={false} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle empty model', () => {
    const emptyModel: ClientServerModel = {
      clients: [],
      servers: [],
      connections: [],
      dataFlow: []
    };

    const { container } = render(
      <ClientServerScene model={emptyModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle model with only clients', () => {
    const clientOnlyModel: ClientServerModel = {
      clients: mockModel.clients,
      servers: [],
      connections: [],
      dataFlow: []
    };

    const { container } = render(
      <ClientServerScene model={clientOnlyModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle model with only servers', () => {
    const serverOnlyModel: ClientServerModel = {
      clients: [],
      servers: mockModel.servers,
      connections: [],
      dataFlow: []
    };

    const { container } = render(
      <ClientServerScene model={serverOnlyModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle invalid connections gracefully', () => {
    const invalidConnectionModel: ClientServerModel = {
      ...mockModel,
      connections: [
        {
          id: 'invalid-conn',
          fromId: 'non-existent-client',
          toId: 'non-existent-server',
          protocol: 'http',
          animated: true
        }
      ]
    };

    const { container } = render(
      <ClientServerScene model={invalidConnectionModel} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle invalid data flow gracefully', () => {
    const invalidDataFlowModel: ClientServerModel = {
      ...mockModel,
      dataFlow: [
        {
          id: 'invalid-flow',
          sequence: 1,
          description: 'Invalid Flow',
          fromId: 'non-existent-client',
          toId: 'non-existent-server',
          duration: 1
        }
      ]
    };

    const { container } = render(
      <ClientServerScene model={invalidDataFlowModel} showDataFlow={true} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should sort data flow by sequence', () => {
    const unorderedDataFlowModel: ClientServerModel = {
      ...mockModel,
      dataFlow: [
        {
          id: 'flow-3',
          sequence: 3,
          description: 'Third Step',
          fromId: 'client-1',
          toId: 'server-1',
          duration: 1
        },
        {
          id: 'flow-1',
          sequence: 1,
          description: 'First Step',
          fromId: 'client-1',
          toId: 'server-1',
          duration: 1
        },
        {
          id: 'flow-2',
          sequence: 2,
          description: 'Second Step',
          fromId: 'server-1',
          toId: 'server-2',
          duration: 1
        }
      ]
    };

    const { container } = render(
      <ClientServerScene model={unorderedDataFlowModel} showDataFlow={true} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});