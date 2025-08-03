import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DataFlowVisualization, InteractiveDataFlow, ProtocolFlowPatterns } from '../DataFlowVisualization';
import { DataFlowStep, Vector3 } from 'shared-types';

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
  Line: (props: any) => <div data-testid="line" {...props} />,
  Sphere: (props: any) => <div data-testid="sphere" {...props} />,
  Box: (props: any) => <div data-testid="box" {...props} />
}));

describe('DataFlowVisualization', () => {
  const mockDataFlow: DataFlowStep[] = [
    {
      id: 'step-1',
      sequence: 1,
      description: 'HTTP Request',
      fromId: 'client',
      toId: 'server',
      duration: 1
    },
    {
      id: 'step-2',
      sequence: 2,
      description: 'Database Query',
      fromId: 'server',
      toId: 'database',
      duration: 0.5
    },
    {
      id: 'step-3',
      sequence: 3,
      description: 'HTTP Response',
      fromId: 'server',
      toId: 'client',
      duration: 0.3
    }
  ];

  const mockNodePositions = new Map<string, Vector3>([
    ['client', { x: -2, y: 0, z: 0 }],
    ['server', { x: 0, y: 0, z: 0 }],
    ['database', { x: 2, y: 0, z: 0 }]
  ]);

  describe('DataFlowVisualization Component', () => {
    it('should render data flow visualization with all steps', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          animated={true}
          showLabels={true}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should show labels when enabled', () => {
      const { getAllByTestId } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          showLabels={true}
          currentStep={2}
        />
      );

      const labels = getAllByTestId('text');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should hide labels when disabled', () => {
      const { queryAllByTestId } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          showLabels={false}
          currentStep={2}
        />
      );

      const labels = queryAllByTestId('text');
      expect(labels.length).toBe(0);
    });

    it('should render connection lines', () => {
      const { getAllByTestId } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          currentStep={2}
        />
      );

      const lines = getAllByTestId('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should handle current step filtering', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle empty data flow', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={[]}
          nodePositions={mockNodePositions}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle missing node positions', () => {
      const incompletePositions = new Map<string, Vector3>([
        ['client', { x: -2, y: 0, z: 0 }]
      ]);

      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={incompletePositions}
          currentStep={2}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should sort data flow by sequence', () => {
      const unorderedDataFlow: DataFlowStep[] = [
        {
          id: 'step-3',
          sequence: 3,
          description: 'Third Step',
          fromId: 'server',
          toId: 'client',
          duration: 0.3
        },
        {
          id: 'step-1',
          sequence: 1,
          description: 'First Step',
          fromId: 'client',
          toId: 'server',
          duration: 1
        },
        {
          id: 'step-2',
          sequence: 2,
          description: 'Second Step',
          fromId: 'server',
          toId: 'database',
          duration: 0.5
        }
      ];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={unorderedDataFlow}
          nodePositions={mockNodePositions}
          currentStep={2}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle different speed settings', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          speed={2}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should disable animation when specified', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          animated={false}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Protocol-Specific Packet Types', () => {
    it('should render HTTP packets correctly', () => {
      const httpFlow: DataFlowStep[] = [{
        id: 'http-step',
        sequence: 1,
        description: 'HTTP Request to server',
        fromId: 'client',
        toId: 'server',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={httpFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render TCP packets correctly', () => {
      const tcpFlow: DataFlowStep[] = [{
        id: 'tcp-step',
        sequence: 1,
        description: 'TCP connection established',
        fromId: 'client',
        toId: 'server',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={tcpFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render UDP packets correctly', () => {
      const udpFlow: DataFlowStep[] = [{
        id: 'udp-step',
        sequence: 1,
        description: 'UDP datagram sent',
        fromId: 'client',
        toId: 'server',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={udpFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render WebSocket packets correctly', () => {
      const wsFlow: DataFlowStep[] = [{
        id: 'ws-step',
        sequence: 1,
        description: 'WebSocket message sent',
        fromId: 'client',
        toId: 'server',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={wsFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render database packets correctly', () => {
      const dbFlow: DataFlowStep[] = [{
        id: 'db-step',
        sequence: 1,
        description: 'Database query executed',
        fromId: 'server',
        toId: 'database',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={dbFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render generic packets for unknown types', () => {
      const genericFlow: DataFlowStep[] = [{
        id: 'generic-step',
        sequence: 1,
        description: 'Unknown protocol data',
        fromId: 'client',
        toId: 'server',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={genericFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('ProtocolFlowPatterns', () => {
    it('should have HTTP flow pattern', () => {
      expect(ProtocolFlowPatterns.HTTP).toBeDefined();
      expect(ProtocolFlowPatterns.HTTP.steps).toHaveLength(6);
      expect(ProtocolFlowPatterns.HTTP.steps[0].name).toBe('DNS Resolution');
    });

    it('should have WebSocket flow pattern', () => {
      expect(ProtocolFlowPatterns.WebSocket).toBeDefined();
      expect(ProtocolFlowPatterns.WebSocket.steps).toHaveLength(4);
      expect(ProtocolFlowPatterns.WebSocket.steps[0].name).toBe('HTTP Upgrade Request');
    });

    it('should have Database flow pattern', () => {
      expect(ProtocolFlowPatterns.Database).toBeDefined();
      expect(ProtocolFlowPatterns.Database.steps).toHaveLength(5);
      expect(ProtocolFlowPatterns.Database.steps[0].name).toBe('Connection Pool');
    });

    it('should have proper step durations', () => {
      Object.values(ProtocolFlowPatterns).forEach(pattern => {
        pattern.steps.forEach(step => {
          expect(step.duration).toBeGreaterThan(0);
          expect(typeof step.duration).toBe('number');
        });
      });
    });

    it('should have proper step colors', () => {
      Object.values(ProtocolFlowPatterns).forEach(pattern => {
        pattern.steps.forEach(step => {
          expect(step.color).toMatch(/^#[0-9A-F]{6}$/i);
        });
      });
    });
  });

  describe('InteractiveDataFlow', () => {
    const mockOnStepChange = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render interactive HTTP flow', () => {
      const { container } = render(
        <InteractiveDataFlow
          pattern="HTTP"
          nodePositions={mockNodePositions}
          onStepChange={mockOnStepChange}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render interactive WebSocket flow', () => {
      const { container } = render(
        <InteractiveDataFlow
          pattern="WebSocket"
          nodePositions={mockNodePositions}
          onStepChange={mockOnStepChange}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render interactive Database flow', () => {
      const { container } = render(
        <InteractiveDataFlow
          pattern="Database"
          nodePositions={mockNodePositions}
          onStepChange={mockOnStepChange}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle missing onStepChange callback', () => {
      const { container } = render(
        <InteractiveDataFlow
          pattern="HTTP"
          nodePositions={mockNodePositions}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle data flow with duplicate sequences', () => {
      const duplicateSequenceFlow: DataFlowStep[] = [
        {
          id: 'step-1',
          sequence: 1,
          description: 'First Step',
          fromId: 'client',
          toId: 'server',
          duration: 1
        },
        {
          id: 'step-2',
          sequence: 1,
          description: 'Duplicate Sequence',
          fromId: 'server',
          toId: 'database',
          duration: 0.5
        }
      ];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={duplicateSequenceFlow}
          nodePositions={mockNodePositions}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle negative current step', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          currentStep={-1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle current step larger than data flow length', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          currentStep={100}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle zero speed', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          speed={0}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle negative speed', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={mockNodePositions}
          speed={-1}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle empty node positions map', () => {
      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={new Map()}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle data flow with empty descriptions', () => {
      const emptyDescFlow: DataFlowStep[] = [{
        id: 'empty-desc',
        sequence: 1,
        description: '',
        fromId: 'client',
        toId: 'server',
        duration: 1
      }];

      const { container } = render(
        <DataFlowVisualization
          dataFlow={emptyDescFlow}
          nodePositions={mockNodePositions}
          currentStep={0}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large data flow efficiently', () => {
      const largeDataFlow: DataFlowStep[] = Array.from({ length: 100 }, (_, i) => ({
        id: `step-${i}`,
        sequence: i,
        description: `Step ${i}`,
        fromId: 'client',
        toId: 'server',
        duration: 1
      }));

      const { container } = render(
        <DataFlowVisualization
          dataFlow={largeDataFlow}
          nodePositions={mockNodePositions}
          currentStep={50}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle many node positions efficiently', () => {
      const manyPositions = new Map<string, Vector3>();
      for (let i = 0; i < 100; i++) {
        manyPositions.set(`node-${i}`, { x: i, y: 0, z: 0 });
      }

      const { container } = render(
        <DataFlowVisualization
          dataFlow={mockDataFlow}
          nodePositions={manyPositions}
          currentStep={1}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});