import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { NetworkTopology, NetworkNode, NetworkConnection } from 'shared-types';
import * as THREE from 'three';

interface NetworkTopologySceneProps {
  topology: NetworkTopology;
  animated?: boolean;
  showLabels?: boolean;
}

/**
 * Network topology visualization component
 * Renders nodes and connections for educational network concepts
 */
export const NetworkTopologyScene: React.FC<NetworkTopologySceneProps> = ({
  topology,
  animated = true,
  showLabels = true
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate node positions based on layout
  const nodePositions = useMemo(() => {
    return calculateNodePositions(topology.nodes, topology.layout);
  }, [topology.nodes, topology.layout]);

  // Animate the entire topology
  useFrame((state) => {
    if (!animated || !groupRef.current) return;
    
    // Gentle rotation for better viewing angles
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Render network nodes */}
      {topology.nodes.map((node, index) => (
        <NetworkNodeComponent
          key={node.id}
          node={node}
          position={nodePositions[index]}
          showLabel={showLabels}
        />
      ))}

      {/* Render network connections */}
      {topology.connections.map((connection) => (
        <NetworkConnectionComponent
          key={connection.id}
          connection={connection}
          nodes={topology.nodes}
          nodePositions={nodePositions}
          animated={animated}
        />
      ))}
    </group>
  );
};

/**
 * Individual network node component
 */
const NetworkNodeComponent: React.FC<{
  node: NetworkNode;
  position: THREE.Vector3;
  showLabel: boolean;
}> = ({ node, position, showLabel }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Get node appearance based on type
  const { geometry, material, scale } = getNodeAppearance(node.type);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Subtle pulsing animation for active nodes
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    meshRef.current.scale.setScalar(scale * pulse);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {geometry}
        {material}
      </mesh>
      
      {showLabel && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-medium.woff"
        >
          {node.label}
        </Text>
      )}
    </group>
  );
};

/**
 * Network connection component with animated data flow
 */
const NetworkConnectionComponent: React.FC<{
  connection: NetworkConnection;
  nodes: NetworkNode[];
  nodePositions: THREE.Vector3[];
  animated: boolean;
}> = ({ connection, nodes, nodePositions, animated }) => {
  const lineRef = useRef<any>(null);

  // Find source and target positions
  const sourceIndex = nodes.findIndex(n => n.id === connection.sourceId);
  const targetIndex = nodes.findIndex(n => n.id === connection.targetId);
  
  if (sourceIndex === -1 || targetIndex === -1) return null;

  const sourcePos = nodePositions[sourceIndex];
  const targetPos = nodePositions[targetIndex];

  // Create line points
  const points = [sourcePos, targetPos];

  // Get connection appearance
  const { color, opacity } = getConnectionAppearance(connection.type);

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={color}
        lineWidth={2}
        transparent
        opacity={opacity}
      />
      
      {animated && (
        <DataFlowParticle
          start={sourcePos}
          end={targetPos}
          bidirectional={connection.bidirectional}
        />
      )}
    </group>
  );
};

/**
 * Animated data flow particle
 */
const DataFlowParticle: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  bidirectional: boolean;
}> = ({ start, end, bidirectional }) => {
  const particleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!particleRef.current) return;

    const t = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
    const position = new THREE.Vector3().lerpVectors(start, end, t);
    particleRef.current.position.copy(position);
  });

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#F39C12" />
    </mesh>
  );
};

/**
 * Calculate node positions based on layout type
 */
function calculateNodePositions(nodes: NetworkNode[], layout: string): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];

  switch (layout) {
    case 'circular':
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        const radius = 3;
        positions.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ));
      });
      break;

    case 'hierarchical':
      const levels = Math.ceil(Math.sqrt(nodes.length));
      nodes.forEach((node, index) => {
        const level = Math.floor(index / levels);
        const posInLevel = index % levels;
        positions.push(new THREE.Vector3(
          (posInLevel - levels / 2) * 2,
          level * 2,
          0
        ));
      });
      break;

    case 'grid':
      const gridSize = Math.ceil(Math.sqrt(nodes.length));
      nodes.forEach((node, index) => {
        const x = index % gridSize;
        const z = Math.floor(index / gridSize);
        positions.push(new THREE.Vector3(
          (x - gridSize / 2) * 2,
          0,
          (z - gridSize / 2) * 2
        ));
      });
      break;

    default: // force
      // Simple force-directed layout approximation
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        const radius = 2 + Math.random() * 2;
        positions.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * radius
        ));
      });
  }

  return positions;
}

/**
 * Get visual appearance for different node types
 */
function getNodeAppearance(nodeType: string) {
  switch (nodeType) {
    case 'server':
      return {
        geometry: <cylinderGeometry args={[0.3, 0.3, 1]} />,
        material: <meshStandardMaterial color="#E74C3C" />,
        scale: 1
      };
    case 'client':
      return {
        geometry: <boxGeometry args={[0.6, 0.4, 0.5]} />,
        material: <meshStandardMaterial color="#4A90E2" />,
        scale: 1
      };
    case 'database':
      return {
        geometry: <cylinderGeometry args={[0.4, 0.4, 0.6]} />,
        material: <meshStandardMaterial color="#27AE60" />,
        scale: 1
      };
    case 'router':
      return {
        geometry: <boxGeometry args={[0.5, 0.2, 0.5]} />,
        material: <meshStandardMaterial color="#F39C12" />,
        scale: 1
      };
    case 'cdn':
      return {
        geometry: <sphereGeometry args={[0.3, 16, 16]} />,
        material: <meshStandardMaterial color="#9B59B6" />,
        scale: 1
      };
    default:
      return {
        geometry: <sphereGeometry args={[0.25, 16, 16]} />,
        material: <meshStandardMaterial color="#95A5A6" />,
        scale: 1
      };
  }
}

/**
 * Get visual appearance for different connection types
 */
function getConnectionAppearance(connectionType: string) {
  switch (connectionType) {
    case 'http':
      return { color: '#4A90E2', opacity: 0.8 };
    case 'tcp':
      return { color: '#E74C3C', opacity: 0.7 };
    case 'udp':
      return { color: '#F39C12', opacity: 0.6 };
    case 'websocket':
      return { color: '#27AE60', opacity: 0.9 };
    default:
      return { color: '#95A5A6', opacity: 0.5 };
  }
}