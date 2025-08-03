import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Sphere, Box } from '@react-three/drei';
import { Vector3, DataFlowStep } from 'shared-types';
import * as THREE from 'three';

export interface DataFlowVisualizationProps {
  dataFlow: DataFlowStep[];
  nodePositions: Map<string, Vector3>;
  animated?: boolean;
  showLabels?: boolean;
  currentStep?: number;
  speed?: number;
}

/**
 * Advanced data flow visualization with animated packets and protocols
 */
export const DataFlowVisualization: React.FC<DataFlowVisualizationProps> = ({
  dataFlow,
  nodePositions,
  animated = true,
  showLabels = true,
  currentStep = -1,
  speed = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Sort data flow by sequence
  const sortedDataFlow = useMemo(() => {
    return [...dataFlow].sort((a, b) => a.sequence - b.sequence);
  }, [dataFlow]);

  return (
    <group ref={groupRef}>
      {sortedDataFlow.map((step, index) => (
        <DataFlowStep
          key={step.id}
          step={step}
          nodePositions={nodePositions}
          active={index <= currentStep}
          animated={animated}
          showLabel={showLabels}
          speed={speed}
        />
      ))}
    </group>
  );
};

/**
 * Individual data flow step with protocol-specific visualization
 */
const DataFlowStep: React.FC<{
  step: DataFlowStep;
  nodePositions: Map<string, Vector3>;
  active: boolean;
  animated: boolean;
  showLabel: boolean;
  speed: number;
}> = ({ step, nodePositions, active, animated, showLabel, speed }) => {
  const packetRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);

  const sourcePos = nodePositions.get(step.fromId);
  const targetPos = nodePositions.get(step.toId);

  // Create trail points for packet history
  const trailPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      points.push(new THREE.Vector3(0, 0, 0));
    }
    return points;
  }, []);

  useFrame((state) => {
    if (!animated || !active || !sourcePos || !targetPos || !packetRef.current) return;

    const time = state.clock.elapsedTime * speed;
    const t = (Math.sin(time) + 1) / 2;
    
    // Interpolate packet position
    const currentPos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
      new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z),
      t
    );
    
    packetRef.current.position.copy(currentPos);
    
    // Update trail
    if (trailRef.current) {
      trailPoints.unshift(currentPos.clone());
      trailPoints.pop();
      
      const geometry = trailRef.current.geometry as THREE.BufferGeometry;
      const positions = new Float32Array(trailPoints.length * 3);
      
      trailPoints.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      });
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active || !sourcePos || !targetPos) return null;

  const packetType = getPacketType(step.description);

  return (
    <group>
      {/* Connection line */}
      <Line
        points={[
          new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
          new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
        ]}
        color="#95A5A6"
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      
      {/* Packet trail */}
      <points ref={trailRef}>
        <bufferGeometry />
        <pointsMaterial
          color={packetType.color}
          size={0.02}
          transparent
          opacity={0.6}
        />
      </points>
      
      {/* Data packet */}
      <group ref={packetRef}>
        <DataPacket type={packetType.type} color={packetType.color} />
      </group>
      
      {/* Step label */}
      {showLabel && (
        <Text
          position={[
            (sourcePos.x + targetPos.x) / 2,
            (sourcePos.y + targetPos.y) / 2 + 0.5,
            (sourcePos.z + targetPos.z) / 2
          ]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-regular.woff"
        >
          {step.description}
        </Text>
      )}
    </group>
  );
};

/**
 * Data packet component with protocol-specific appearance
 */
const DataPacket: React.FC<{
  type: 'http' | 'tcp' | 'udp' | 'websocket' | 'database' | 'generic';
  color: string;
}> = ({ type, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Packet rotation for visual interest
    meshRef.current.rotation.x = state.clock.elapsedTime * 2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
  });

  switch (type) {
    case 'http':
      return (
        <Box ref={meshRef} args={[0.08, 0.08, 0.08]}>
          <meshBasicMaterial color={color} />
        </Box>
      );
    case 'tcp':
      return (
        <Sphere ref={meshRef} args={[0.06, 8, 8]}>
          <meshBasicMaterial color={color} />
        </Sphere>
      );
    case 'udp':
      return (
        <mesh ref={meshRef}>
          <tetrahedronGeometry args={[0.06]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    case 'websocket':
      return (
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.06]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    case 'database':
      return (
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.04, 0.04, 0.08]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    default:
      return (
        <Sphere ref={meshRef} args={[0.05, 8, 8]}>
          <meshBasicMaterial color={color} />
        </Sphere>
      );
  }
};

/**
 * Determine packet type and color based on description
 */
function getPacketType(description: string): { type: 'http' | 'tcp' | 'udp' | 'websocket' | 'database' | 'generic'; color: string } {
  const desc = description.toLowerCase();
  
  if (desc.includes('http') || desc.includes('request') || desc.includes('response')) {
    return { type: 'http', color: '#4A90E2' };
  }
  if (desc.includes('tcp') || desc.includes('connection')) {
    return { type: 'tcp', color: '#E74C3C' };
  }
  if (desc.includes('udp') || desc.includes('datagram')) {
    return { type: 'udp', color: '#F39C12' };
  }
  if (desc.includes('websocket') || desc.includes('socket')) {
    return { type: 'websocket', color: '#27AE60' };
  }
  if (desc.includes('database') || desc.includes('query') || desc.includes('sql')) {
    return { type: 'database', color: '#9B59B6' };
  }
  
  return { type: 'generic', color: '#95A5A6' };
}

/**
 * Protocol-specific data flow patterns
 */
export const ProtocolFlowPatterns = {
  HTTP: {
    steps: [
      { name: 'DNS Resolution', duration: 0.5, color: '#3498DB' },
      { name: 'TCP Handshake', duration: 0.3, color: '#E74C3C' },
      { name: 'HTTP Request', duration: 0.2, color: '#4A90E2' },
      { name: 'Server Processing', duration: 1.0, color: '#F39C12' },
      { name: 'HTTP Response', duration: 0.3, color: '#27AE60' },
      { name: 'Connection Close', duration: 0.2, color: '#95A5A6' }
    ]
  },
  WebSocket: {
    steps: [
      { name: 'HTTP Upgrade Request', duration: 0.3, color: '#4A90E2' },
      { name: 'WebSocket Handshake', duration: 0.2, color: '#27AE60' },
      { name: 'Bidirectional Data', duration: 2.0, color: '#9B59B6' },
      { name: 'Keep-Alive Ping', duration: 0.1, color: '#F1C40F' }
    ]
  },
  Database: {
    steps: [
      { name: 'Connection Pool', duration: 0.2, color: '#E67E22' },
      { name: 'Query Parsing', duration: 0.3, color: '#3498DB' },
      { name: 'Index Lookup', duration: 0.5, color: '#9B59B6' },
      { name: 'Data Retrieval', duration: 0.8, color: '#27AE60' },
      { name: 'Result Formatting', duration: 0.2, color: '#F39C12' }
    ]
  }
};

/**
 * Interactive data flow controller
 */
export const InteractiveDataFlow: React.FC<{
  pattern: keyof typeof ProtocolFlowPatterns;
  nodePositions: Map<string, Vector3>;
  onStepChange?: (step: number) => void;
}> = ({ pattern, nodePositions, onStepChange }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const patternSteps = ProtocolFlowPatterns[pattern].steps;

  React.useEffect(() => {
    const advanceStep = () => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % patternSteps.length;
        onStepChange?.(next);
        return next;
      });
    };

    timeoutRef.current = setTimeout(advanceStep, patternSteps[currentStep].duration * 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStep, patternSteps, onStepChange]);

  // Convert pattern steps to DataFlowStep format
  const dataFlowSteps: DataFlowStep[] = patternSteps.map((step, index) => ({
    id: `step-${index}`,
    sequence: index,
    description: step.name,
    fromId: 'source',
    toId: 'target',
    duration: step.duration
  }));

  return (
    <DataFlowVisualization
      dataFlow={dataFlowSteps}
      nodePositions={nodePositions}
      currentStep={currentStep}
      animated={true}
      showLabels={true}
    />
  );
};