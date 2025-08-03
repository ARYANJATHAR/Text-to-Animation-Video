import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { NetworkTopology, NetworkNode, NetworkConnection, Vector3 } from 'shared-types';
import * as THREE from 'three';
import { createInfrastructureComponent } from './WebInfrastructureComponents';
import { DataFlowVisualization } from './DataFlowVisualization';

interface EnhancedNetworkTopologyProps {
  topology: NetworkTopology;
  animated?: boolean;
  showLabels?: boolean;
  showDataFlow?: boolean;
  interactionMode?: 'static' | 'hover' | 'click';
  onNodeInteraction?: (nodeId: string, type: 'hover' | 'click') => void;
}

/**
 * Enhanced network topology with interactive components and advanced layouts
 */
export const EnhancedNetworkTopology: React.FC<EnhancedNetworkTopologyProps> = ({
  topology,
  animated = true,
  showLabels = true,
  showDataFlow = false,
  interactionMode = 'static',
  onNodeInteraction
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Calculate optimized node positions
  const nodePositions = useMemo(() => {
    return calculateOptimizedPositions(topology.nodes, topology.connections, topology.layout);
  }, [topology.nodes, topology.connections, topology.layout]);

  // Create position map for data flow
  const positionMap = useMemo(() => {
    const map = new Map<string, Vector3>();
    topology.nodes.forEach((node, index) => {
      map.set(node.id, nodePositions[index]);
    });
    return map;
  }, [topology.nodes, nodePositions]);

  // Animate the entire topology
  useFrame((state) => {
    if (!animated || !groupRef.current) return;
    
    // Gentle rotation for better viewing angles
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
  });

  const handleNodeInteraction = (nodeId: string, type: 'hover' | 'click') => {
    if (type === 'hover') {
      setHoveredNode(nodeId);
    } else if (type === 'click') {
      setSelectedNode(selectedNode === nodeId ? null : nodeId);
    }
    onNodeInteraction?.(nodeId, type);
  };

  return (
    <group ref={groupRef}>
      {/* Render enhanced network nodes */}
      {topology.nodes.map((node, index) => (
        <EnhancedNetworkNode
          key={node.id}
          node={node}
          position={nodePositions[index]}
          showLabel={showLabels}
          isHovered={hoveredNode === node.id}
          isSelected={selectedNode === node.id}
          interactionMode={interactionMode}
          onInteraction={handleNodeInteraction}
        />
      ))}

      {/* Render enhanced connections */}
      {topology.connections.map((connection) => (
        <EnhancedNetworkConnection
          key={connection.id}
          connection={connection}
          nodes={topology.nodes}
          nodePositions={nodePositions}
          animated={animated}
          highlighted={
            hoveredNode === connection.sourceId || 
            hoveredNode === connection.targetId ||
            selectedNode === connection.sourceId || 
            selectedNode === connection.targetId
          }
        />
      ))}

      {/* Data flow visualization */}
      {showDataFlow && (
        <DataFlowVisualization
          dataFlow={generateSampleDataFlow(topology)}
          nodePositions={positionMap}
          animated={animated}
          showLabels={showLabels}
        />
      )}

      {/* Network statistics overlay */}
      <NetworkStatsOverlay
        topology={topology}
        selectedNode={selectedNode}
        hoveredNode={hoveredNode}
      />
    </group>
  );
};

/**
 * Enhanced network node with infrastructure-specific visualization
 */
const EnhancedNetworkNode: React.FC<{
  node: NetworkNode;
  position: Vector3;
  showLabel: boolean;
  isHovered: boolean;
  isSelected: boolean;
  interactionMode: 'static' | 'hover' | 'click';
  onInteraction: (nodeId: string, type: 'hover' | 'click') => void;
}> = ({ node, position, showLabel, isHovered, isSelected, interactionMode, onInteraction }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Scale animation for interaction feedback
    const targetScale = isSelected ? 1.3 : (isHovered || hovered) ? 1.1 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const handlePointerOver = () => {
    if (interactionMode !== 'static') {
      setHovered(true);
      onInteraction(node.id, 'hover');
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const handleClick = () => {
    if (interactionMode === 'click') {
      onInteraction(node.id, 'click');
    }
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Infrastructure component */}
      {createInfrastructureComponent(node.type, {
        position: { x: 0, y: 0, z: 0 },
        animated: true,
        scale: 0.8,
        label: node.label,
        showLabel: showLabel
      })}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <torusGeometry args={[1.2, 0.05, 8, 32]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      )}
      
      {/* Hover indicator */}
      {(isHovered || hovered) && !isSelected && (
        <mesh>
          <torusGeometry args={[1.1, 0.03, 8, 32]} />
          <meshBasicMaterial color="#3498DB" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Node properties display */}
      {isSelected && Object.keys(node.properties).length > 0 && (
        <NodePropertiesDisplay
          properties={node.properties}
          position={{ x: 0, y: 2, z: 0 }}
        />
      )}
    </group>
  );
};

/**
 * Enhanced network connection with protocol-specific visualization
 */
const EnhancedNetworkConnection: React.FC<{
  connection: NetworkConnection;
  nodes: NetworkNode[];
  nodePositions: Vector3[];
  animated: boolean;
  highlighted: boolean;
}> = ({ connection, nodes, nodePositions, animated, highlighted }) => {
  const lineRef = useRef<any>(null);
  const particleRef = useRef<THREE.Mesh>(null);

  // Find source and target positions
  const sourceIndex = nodes.findIndex(n => n.id === connection.sourceId);
  const targetIndex = nodes.findIndex(n => n.id === connection.targetId);
  
  if (sourceIndex === -1 || targetIndex === -1) return null;

  const sourcePos = nodePositions[sourceIndex];
  const targetPos = nodePositions[targetIndex];

  // Create curved line for better visualization
  const points = useMemo(() => {
    const start = new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z);
    const end = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y += Math.random() * 0.5 + 0.2; // Add some curve
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(20);
  }, [sourcePos, targetPos]);

  // Get connection appearance
  const { color, opacity, width } = getEnhancedConnectionAppearance(connection.type, highlighted);

  useFrame((state) => {
    if (!animated || !particleRef.current) return;

    // Animate data flow particle
    const t = (state.clock.elapsedTime * 0.5) % 1;
    const position = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
      new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z),
      t
    );
    particleRef.current.position.copy(position);
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={color}
        lineWidth={width}
        transparent
        opacity={opacity}
      />
      
      {/* Protocol label */}
      <Text
        position={[
          (sourcePos.x + targetPos.x) / 2,
          (sourcePos.y + targetPos.y) / 2 + 0.3,
          (sourcePos.z + targetPos.z) / 2
        ]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        font="/fonts/inter-regular.woff"
      >
        {connection.type.toUpperCase()}
      </Text>
      
      {/* Data flow particle */}
      {animated && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
      
      {/* Bidirectional indicator */}
      {connection.bidirectional && (
        <Text
          position={[
            (sourcePos.x + targetPos.x) / 2,
            (sourcePos.y + targetPos.y) / 2 - 0.2,
            (sourcePos.z + targetPos.z) / 2
          ]}
          fontSize={0.08}
          color="#F39C12"
          anchorX="center"
          font="/fonts/inter-regular.woff"
        >
          ↔
        </Text>
      )}
    </group>
  );
};

/**
 * Node properties display component
 */
const NodePropertiesDisplay: React.FC<{
  properties: Record<string, any>;
  position: Vector3;
}> = ({ properties, position }) => {
  const entries = Object.entries(properties).slice(0, 3); // Limit to 3 properties

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Background panel */}
      <mesh>
        <planeGeometry args={[2, entries.length * 0.3 + 0.2]} />
        <meshBasicMaterial color="#2C3E50" transparent opacity={0.8} />
      </mesh>
      
      {/* Property entries */}
      {entries.map(([key, value], index) => (
        <Text
          key={key}
          position={[0, (entries.length - 1 - index) * 0.25 - 0.1, 0.01]}
          fontSize={0.12}
          color="#ECF0F1"
          anchorX="center"
          font="/fonts/inter-regular.woff"
        >
          {`${key}: ${String(value).slice(0, 20)}`}
        </Text>
      ))}
    </group>
  );
};

/**
 * Network statistics overlay
 */
const NetworkStatsOverlay: React.FC<{
  topology: NetworkTopology;
  selectedNode: string | null;
  hoveredNode: string | null;
}> = ({ topology, selectedNode, hoveredNode }) => {
  const stats = useMemo(() => {
    const nodeCount = topology.nodes.length;
    const connectionCount = topology.connections.length;
    const nodeTypes = [...new Set(topology.nodes.map(n => n.type))];
    const connectionTypes = [...new Set(topology.connections.map(c => c.type))];
    
    return {
      nodes: nodeCount,
      connections: connectionCount,
      nodeTypes: nodeTypes.length,
      connectionTypes: connectionTypes.length
    };
  }, [topology]);

  return (
    <group position={[-4, 3, 0]}>
      {/* Stats panel background */}
      <mesh>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial color="#34495E" transparent opacity={0.7} />
      </mesh>
      
      {/* Stats text */}
      <Text
        position={[0, 0.7, 0.01]}
        fontSize={0.15}
        color="#ECF0F1"
        anchorX="center"
        font="/fonts/inter-bold.woff"
      >
        Network Statistics
      </Text>
      
      <Text
        position={[0, 0.3, 0.01]}
        fontSize={0.12}
        color="#BDC3C7"
        anchorX="center"
        font="/fonts/inter-regular.woff"
      >
        {`Nodes: ${stats.nodes} | Connections: ${stats.connections}`}
      </Text>
      
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.12}
        color="#BDC3C7"
        anchorX="center"
        font="/fonts/inter-regular.woff"
      >
        {`Node Types: ${stats.nodeTypes} | Protocols: ${stats.connectionTypes}`}
      </Text>
      
      {(selectedNode || hoveredNode) && (
        <Text
          position={[0, -0.4, 0.01]}
          fontSize={0.1}
          color="#F39C12"
          anchorX="center"
          font="/fonts/inter-regular.woff"
        >
          {selectedNode ? `Selected: ${selectedNode}` : `Hovered: ${hoveredNode}`}
        </Text>
      )}
    </group>
  );
};

/**
 * Calculate optimized node positions based on layout and connections
 */
function calculateOptimizedPositions(
  nodes: NetworkNode[],
  connections: NetworkConnection[],
  layout: string
): Vector3[] {
  const positions: Vector3[] = [];

  switch (layout) {
    case 'force':
      return calculateForceDirectedLayout(nodes, connections);
    case 'hierarchical':
      return calculateHierarchicalLayout(nodes, connections);
    case 'circular':
      return calculateCircularLayout(nodes);
    case 'grid':
      return calculateGridLayout(nodes);
    default:
      return calculateForceDirectedLayout(nodes, connections);
  }
}

/**
 * Force-directed layout algorithm
 */
function calculateForceDirectedLayout(
  nodes: NetworkNode[],
  connections: NetworkConnection[]
): Vector3[] {
  const positions: Vector3[] = [];
  const iterations = 100;
  const k = Math.sqrt(25 / nodes.length); // Optimal distance
  
  // Initialize random positions
  nodes.forEach(() => {
    positions.push({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 10
    });
  });

  // Force-directed iterations
  for (let iter = 0; iter < iterations; iter++) {
    const forces: Vector3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

    // Repulsive forces between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dz = positions[i].z - positions[j].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        
        const force = k * k / distance;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force * 0.1; // Reduce Y force
        const fz = (dz / distance) * force;
        
        forces[i].x += fx;
        forces[i].y += fy;
        forces[i].z += fz;
        forces[j].x -= fx;
        forces[j].y -= fy;
        forces[j].z -= fz;
      }
    }

    // Attractive forces for connected nodes
    connections.forEach(conn => {
      const sourceIdx = nodes.findIndex(n => n.id === conn.sourceId);
      const targetIdx = nodes.findIndex(n => n.id === conn.targetId);
      
      if (sourceIdx !== -1 && targetIdx !== -1) {
        const dx = positions[targetIdx].x - positions[sourceIdx].x;
        const dy = positions[targetIdx].y - positions[sourceIdx].y;
        const dz = positions[targetIdx].z - positions[sourceIdx].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        
        const force = distance * distance / k;
        const fx = (dx / distance) * force * 0.1;
        const fy = (dy / distance) * force * 0.05;
        const fz = (dz / distance) * force * 0.1;
        
        forces[sourceIdx].x += fx;
        forces[sourceIdx].y += fy;
        forces[sourceIdx].z += fz;
        forces[targetIdx].x -= fx;
        forces[targetIdx].y -= fy;
        forces[targetIdx].z -= fz;
      }
    });

    // Apply forces with cooling
    const cooling = 1 - iter / iterations;
    positions.forEach((pos, i) => {
      const force = Math.sqrt(forces[i].x ** 2 + forces[i].y ** 2 + forces[i].z ** 2);
      if (force > 0) {
        const displacement = Math.min(force, cooling) * 0.1;
        pos.x += (forces[i].x / force) * displacement;
        pos.y += (forces[i].y / force) * displacement;
        pos.z += (forces[i].z / force) * displacement;
      }
    });
  }

  return positions;
}

/**
 * Hierarchical layout algorithm
 */
function calculateHierarchicalLayout(
  nodes: NetworkNode[],
  connections: NetworkConnection[]
): Vector3[] {
  // Simple hierarchical layout based on node types
  const typeOrder = ['client', 'router', 'server', 'database', 'cdn'];
  const positions: Vector3[] = [];
  
  const nodesByType = new Map<string, NetworkNode[]>();
  nodes.forEach(node => {
    if (!nodesByType.has(node.type)) {
      nodesByType.set(node.type, []);
    }
    nodesByType.get(node.type)!.push(node);
  });

  let currentY = 2;
  typeOrder.forEach(type => {
    const nodesOfType = nodesByType.get(type) || [];
    const width = Math.max(nodesOfType.length * 2, 4);
    
    nodesOfType.forEach((node, index) => {
      const nodeIndex = nodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        positions[nodeIndex] = {
          x: (index - nodesOfType.length / 2) * 2,
          y: currentY,
          z: 0
        };
      }
    });
    
    currentY -= 2;
  });

  return positions;
}

/**
 * Circular layout algorithm
 */
function calculateCircularLayout(nodes: NetworkNode[]): Vector3[] {
  const positions: Vector3[] = [];
  const radius = Math.max(nodes.length * 0.5, 3);
  
  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2;
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle * 0.2) * 0.5, // Slight Y variation
      z: Math.sin(angle) * radius
    });
  });

  return positions;
}

/**
 * Grid layout algorithm
 */
function calculateGridLayout(nodes: NetworkNode[]): Vector3[] {
  const positions: Vector3[] = [];
  const gridSize = Math.ceil(Math.sqrt(nodes.length));
  
  nodes.forEach((node, index) => {
    const x = index % gridSize;
    const z = Math.floor(index / gridSize);
    positions.push({
      x: (x - gridSize / 2) * 2,
      y: 0,
      z: (z - gridSize / 2) * 2
    });
  });

  return positions;
}

/**
 * Enhanced connection appearance based on type and state
 */
function getEnhancedConnectionAppearance(
  connectionType: string,
  highlighted: boolean
): { color: string; opacity: number; width: number } {
  const base = {
    http: { color: '#4A90E2', opacity: 0.8, width: 2 },
    tcp: { color: '#E74C3C', opacity: 0.7, width: 3 },
    udp: { color: '#F39C12', opacity: 0.6, width: 1 },
    websocket: { color: '#27AE60', opacity: 0.9, width: 2 }
  }[connectionType] || { color: '#95A5A6', opacity: 0.5, width: 1 };

  return {
    ...base,
    opacity: highlighted ? Math.min(base.opacity + 0.3, 1) : base.opacity,
    width: highlighted ? base.width + 1 : base.width
  };
}

/**
 * Generate sample data flow for demonstration
 */
function generateSampleDataFlow(topology: NetworkTopology) {
  const dataFlow = [];
  let sequence = 1;

  // Create sample data flow between connected nodes
  topology.connections.forEach(conn => {
    dataFlow.push({
      id: `flow-${conn.id}`,
      sequence: sequence++,
      description: `${conn.type.toUpperCase()} Data`,
      fromId: conn.sourceId,
      toId: conn.targetId,
      duration: 1
    });
  });

  return dataFlow;
}