import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { ClientServerModel, ClientNode, ServerNode, DataFlowStep } from 'shared-types';
import * as THREE from 'three';

interface ClientServerSceneProps {
  model: ClientServerModel;
  animated?: boolean;
  showDataFlow?: boolean;
  currentStep?: number;
}

/**
 * Client-Server model visualization for educational web development concepts
 * Shows the relationship between clients, servers, and data flow
 */
export const ClientServerScene: React.FC<ClientServerSceneProps> = ({
  model,
  animated = true,
  showDataFlow = true,
  currentStep = 0
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Sort data flow steps by sequence
  const sortedDataFlow = useMemo(() => {
    return [...model.dataFlow].sort((a, b) => a.sequence - b.sequence);
  }, [model.dataFlow]);

  // Gentle scene rotation for better viewing
  useFrame((state) => {
    if (!animated || !groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Client nodes */}
      {model.clients.map((client) => (
        <ClientNodeComponent
          key={client.id}
          client={client}
          animated={animated}
        />
      ))}

      {/* Server nodes */}
      {model.servers.map((server) => (
        <ServerNodeComponent
          key={server.id}
          server={server}
          animated={animated}
        />
      ))}

      {/* Static connections */}
      {model.connections.map((connection) => (
        <ConnectionLine
          key={connection.id}
          connection={connection}
          clients={model.clients}
          servers={model.servers}
        />
      ))}

      {/* Animated data flow */}
      {showDataFlow && (
        <DataFlowVisualization
          dataFlow={sortedDataFlow}
          clients={model.clients}
          servers={model.servers}
          currentStep={currentStep}
          animated={animated}
        />
      )}

      {/* Educational labels */}
      <Text
        position={[-4, 3, 0]}
        fontSize={0.4}
        color="#4A90E2"
        anchorX="center"
        font="/fonts/inter-bold.woff"
      >
        Clients
      </Text>
      
      <Text
        position={[4, 3, 0]}
        fontSize={0.4}
        color="#E74C3C"
        anchorX="center"
        font="/fonts/inter-bold.woff"
      >
        Servers
      </Text>
    </group>
  );
};

/**
 * Individual client node component
 */
const ClientNodeComponent: React.FC<{
  client: ClientNode;
  animated: boolean;
}> = ({ client, animated }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!animated || !meshRef.current) return;
    
    // Subtle breathing animation
    const scale = 1 + Math.sin(state.clock.elapsedTime + client.id.length) * 0.02;
    meshRef.current.scale.setScalar(scale);
  });

  const { geometry, material, color } = getClientAppearance(client.type);

  return (
    <group position={[client.position.x, client.position.y, client.position.z]}>
      <mesh ref={meshRef}>
        {geometry}
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Client type icon/indicator */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        font="/fonts/inter-medium.woff"
      >
        {client.type.toUpperCase()}
      </Text>
    </group>
  );
};

/**
 * Individual server node component
 */
const ServerNodeComponent: React.FC<{
  server: ServerNode;
  animated: boolean;
}> = ({ server, animated }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!animated || !meshRef.current) return;
    
    // Server activity indicator
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + server.id.length) * 0.03;
    meshRef.current.scale.setScalar(pulse);
  });

  const { geometry, material, color } = getServerAppearance(server.type);

  return (
    <group position={[server.position.x, server.position.y, server.position.z]}>
      <mesh ref={meshRef}>
        {geometry}
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Server status light */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#27AE60" />
      </mesh>
      
      {/* Server type label */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        font="/fonts/inter-medium.woff"
      >
        {server.type.toUpperCase()}
      </Text>
    </group>
  );
};

/**
 * Connection line between nodes
 */
const ConnectionLine: React.FC<{
  connection: any;
  clients: ClientNode[];
  servers: ServerNode[];
}> = ({ connection, clients, servers }) => {
  // Find source and target positions
  const allNodes = [...clients, ...servers];
  const source = allNodes.find(n => n.id === connection.fromId);
  const target = allNodes.find(n => n.id === connection.toId);

  if (!source || !target) return null;

  const points = [
    new THREE.Vector3(source.position.x, source.position.y, source.position.z),
    new THREE.Vector3(target.position.x, target.position.y, target.position.z)
  ];

  return (
    <Line
      points={points}
      color="#95A5A6"
      lineWidth={1}
      transparent
      opacity={0.3}
      dashed
      dashSize={0.1}
      gapSize={0.05}
    />
  );
};

/**
 * Data flow visualization component
 */
const DataFlowVisualization: React.FC<{
  dataFlow: DataFlowStep[];
  clients: ClientNode[];
  servers: ServerNode[];
  currentStep: number;
  animated: boolean;
}> = ({ dataFlow, clients, servers, currentStep, animated }) => {
  return (
    <>
      {dataFlow.map((step, index) => (
        <DataFlowStep
          key={step.id}
          step={step}
          clients={clients}
          servers={servers}
          active={index <= currentStep}
          animated={animated}
        />
      ))}
    </>
  );
};

/**
 * Individual data flow step
 */
const DataFlowStep: React.FC<{
  step: DataFlowStep;
  clients: ClientNode[];
  servers: ServerNode[];
  active: boolean;
  animated: boolean;
}> = ({ step, clients, servers, active, animated }) => {
  const particleRef = useRef<THREE.Mesh>(null);

  // Find source and target nodes
  const allNodes = [...clients, ...servers];
  const source = allNodes.find(n => n.id === step.fromId);
  const target = allNodes.find(n => n.id === step.toId);

  if (!source || !target) return null;

  const startPos = new THREE.Vector3(source.position.x, source.position.y, source.position.z);
  const endPos = new THREE.Vector3(target.position.x, target.position.y, target.position.z);

  useFrame((state) => {
    if (!animated || !active || !particleRef.current) return;

    const t = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
    const position = new THREE.Vector3().lerpVectors(startPos, endPos, t);
    particleRef.current.position.copy(position);
  });

  if (!active) return null;

  return (
    <group>
      {/* Data packet */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#F39C12" />
      </mesh>
      
      {/* Step description */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        font="/fonts/inter-regular.woff"
      >
        {step.description}
      </Text>
    </group>
  );
};

/**
 * Get client appearance based on type
 */
function getClientAppearance(clientType: string) {
  switch (clientType) {
    case 'browser':
      return {
        geometry: <boxGeometry args={[0.8, 0.5, 0.1]} />,
        material: null,
        color: '#4A90E2'
      };
    case 'mobile':
      return {
        geometry: <boxGeometry args={[0.3, 0.6, 0.05]} />,
        material: null,
        color: '#3498DB'
      };
    case 'desktop':
      return {
        geometry: <boxGeometry args={[0.6, 0.4, 0.4]} />,
        material: null,
        color: '#2980B9'
      };
    default:
      return {
        geometry: <boxGeometry args={[0.5, 0.5, 0.5]} />,
        material: null,
        color: '#4A90E2'
      };
  }
}

/**
 * Get server appearance based on type
 */
function getServerAppearance(serverType: string) {
  switch (serverType) {
    case 'web':
      return {
        geometry: <cylinderGeometry args={[0.3, 0.3, 1.2]} />,
        material: null,
        color: '#E74C3C'
      };
    case 'api':
      return {
        geometry: <cylinderGeometry args={[0.25, 0.25, 1]} />,
        material: null,
        color: '#C0392B'
      };
    case 'database':
      return {
        geometry: <cylinderGeometry args={[0.4, 0.4, 0.8]} />,
        material: null,
        color: '#27AE60'
      };
    case 'cache':
      return {
        geometry: <boxGeometry args={[0.6, 0.3, 0.6]} />,
        material: null,
        color: '#F39C12'
      };
    default:
      return {
        geometry: <cylinderGeometry args={[0.3, 0.3, 1]} />,
        material: null,
        color: '#E74C3C'
      };
  }
}