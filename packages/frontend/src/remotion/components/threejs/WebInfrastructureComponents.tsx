import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Cylinder, Sphere, Cone } from '@react-three/drei';
import { Vector3 } from 'shared-types';
import * as THREE from 'three';

export interface InfrastructureComponentProps {
  position: Vector3;
  animated?: boolean;
  scale?: number;
  label?: string;
  showLabel?: boolean;
}

/**
 * Web Server 3D Component
 * Represents a web server with rack-style visualization
 */
export const WebServerComponent: React.FC<InfrastructureComponentProps> = ({
  position,
  animated = true,
  scale = 1,
  label = 'Web Server',
  showLabel = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    
    // Subtle server activity animation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
    
    // Blinking server lights
    if (lightsRef.current) {
      lightsRef.current.children.forEach((light, index) => {
        const mesh = light as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        const intensity = Math.sin(state.clock.elapsedTime * 3 + index) * 0.5 + 0.5;
        material.opacity = 0.5 + intensity * 0.5;
      });
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={scale}>
      {/* Main server chassis */}
      <Box args={[1.2, 2, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2C3E50" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Server rack slots */}
      {Array.from({ length: 4 }, (_, i) => (
        <Box key={i} args={[1.1, 0.3, 0.7]} position={[0, 0.6 - i * 0.4, 0.05]}>
          <meshStandardMaterial color="#34495E" metalness={0.6} roughness={0.3} />
        </Box>
      ))}
      
      {/* Status lights */}
      <group ref={lightsRef}>
        {Array.from({ length: 4 }, (_, i) => (
          <Sphere key={i} args={[0.03]} position={[0.5, 0.6 - i * 0.4, 0.4]}>
            <meshBasicMaterial 
              color={i === 0 ? "#27AE60" : "#F39C12"} 
              transparent 
              opacity={0.8}
            />
          </Sphere>
        ))}
      </group>
      
      {/* Cooling vents */}
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} args={[0.05, 1.8, 0.02]} position={[-0.4 + i * 0.1, 0, 0.41]}>
          <meshStandardMaterial color="#1A252F" />
        </Box>
      ))}
      
      {/* Label */}
      {showLabel && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-medium.woff"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * Database Server 3D Component
 * Represents a database with cylindrical storage visualization
 */
export const DatabaseComponent: React.FC<InfrastructureComponentProps> = ({
  position,
  animated = true,
  scale = 1,
  label = 'Database',
  showLabel = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const dataRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    
    // Gentle rotation for database activity
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    
    // Data flow animation
    if (dataRef.current) {
      const flow = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      dataRef.current.position.y = flow;
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={scale}>
      {/* Database base */}
      <Cylinder args={[0.6, 0.6, 0.3]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#27AE60" metalness={0.3} roughness={0.7} />
      </Cylinder>
      
      {/* Database storage layers */}
      {Array.from({ length: 3 }, (_, i) => (
        <group key={i}>
          <Cylinder args={[0.5, 0.5, 0.4]} position={[0, -0.4 + i * 0.5, 0]}>
            <meshStandardMaterial color="#2ECC71" metalness={0.2} roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.52, 0.52, 0.05]} position={[0, -0.2 + i * 0.5, 0]}>
            <meshStandardMaterial color="#229954" metalness={0.4} roughness={0.6} />
          </Cylinder>
        </group>
      ))}
      
      {/* Data visualization */}
      <group ref={dataRef}>
        {Array.from({ length: 6 }, (_, i) => (
          <Sphere key={i} args={[0.02]} position={[
            Math.cos(i * Math.PI / 3) * 0.3,
            0.2,
            Math.sin(i * Math.PI / 3) * 0.3
          ]}>
            <meshBasicMaterial color="#F1C40F" />
          </Sphere>
        ))}
      </group>
      
      {/* Connection ports */}
      <Box args={[0.1, 0.1, 0.2]} position={[0.6, 0, 0]}>
        <meshStandardMaterial color="#34495E" />
      </Box>
      
      {/* Label */}
      {showLabel && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-medium.woff"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * CDN Node 3D Component
 * Represents a CDN with global distribution visualization
 */
export const CDNComponent: React.FC<InfrastructureComponentProps> = ({
  position,
  animated = true,
  scale = 1,
  label = 'CDN',
  showLabel = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbitsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    
    // Orbital animation for global distribution
    if (orbitsRef.current) {
      orbitsRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      orbitsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={scale}>
      {/* Central CDN core */}
      <Sphere args={[0.4]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#9B59B6" metalness={0.6} roughness={0.3} />
      </Sphere>
      
      {/* Inner glow */}
      <Sphere args={[0.42]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#9B59B6" transparent opacity={0.3} />
      </Sphere>
      
      {/* Orbital rings representing global distribution */}
      <group ref={orbitsRef}>
        {Array.from({ length: 3 }, (_, ringIndex) => (
          <group key={ringIndex}>
            {/* Ring */}
            <mesh rotation={[Math.PI / 2, 0, ringIndex * Math.PI / 3]}>
              <torusGeometry args={[0.8 + ringIndex * 0.3, 0.02, 8, 32]} />
              <meshBasicMaterial color="#8E44AD" transparent opacity={0.4} />
            </mesh>
            
            {/* Satellites on ring */}
            {Array.from({ length: 4 }, (_, satIndex) => {
              const angle = (satIndex / 4) * Math.PI * 2;
              const radius = 0.8 + ringIndex * 0.3;
              return (
                <Sphere 
                  key={satIndex} 
                  args={[0.05]} 
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(angle * 0.5) * 0.2,
                    Math.sin(angle) * radius
                  ]}
                >
                  <meshBasicMaterial color="#E74C3C" />
                </Sphere>
              );
            })}
          </group>
        ))}
      </group>
      
      {/* Data streams */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <Box 
            key={i}
            args={[0.02, 0.8, 0.02]} 
            position={[
              Math.cos(angle) * 0.6,
              0,
              Math.sin(angle) * 0.6
            ]}
            rotation={[0, angle, 0]}
          >
            <meshBasicMaterial color="#F39C12" transparent opacity={0.6} />
          </Box>
        );
      })}
      
      {/* Label */}
      {showLabel && (
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-medium.woff"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * Load Balancer 3D Component
 * Represents a load balancer with traffic distribution visualization
 */
export const LoadBalancerComponent: React.FC<InfrastructureComponentProps> = ({
  position,
  animated = true,
  scale = 1,
  label = 'Load Balancer',
  showLabel = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const trafficRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    
    // Traffic flow animation
    if (trafficRef.current) {
      trafficRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const offset = (state.clock.elapsedTime + index * 0.5) % (Math.PI * 2);
        mesh.position.x = Math.cos(offset) * 0.8;
        mesh.position.z = Math.sin(offset) * 0.8;
      });
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={scale}>
      {/* Main load balancer body */}
      <Box args={[1, 0.6, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#E67E22" metalness={0.7} roughness={0.3} />
      </Box>
      
      {/* Input port */}
      <Cylinder args={[0.1, 0.1, 0.3]} position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#D35400" />
      </Cylinder>
      
      {/* Output ports */}
      {Array.from({ length: 3 }, (_, i) => (
        <Cylinder 
          key={i}
          args={[0.08, 0.08, 0.3]} 
          position={[0.7, 0.2 - i * 0.2, 0]} 
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial color="#D35400" />
        </Cylinder>
      ))}
      
      {/* Traffic visualization */}
      <group ref={trafficRef}>
        {Array.from({ length: 4 }, (_, i) => (
          <Sphere key={i} args={[0.03]}>
            <meshBasicMaterial color="#F39C12" />
          </Sphere>
        ))}
      </group>
      
      {/* Status indicators */}
      {Array.from({ length: 3 }, (_, i) => (
        <Sphere 
          key={i}
          args={[0.03]} 
          position={[0.3, 0.2 - i * 0.2, 0.4]}
        >
          <meshBasicMaterial color="#27AE60" />
        </Sphere>
      ))}
      
      {/* Label */}
      {showLabel && (
        <Text
          position={[0, -1, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-medium.woff"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * API Gateway 3D Component
 * Represents an API gateway with request routing visualization
 */
export const APIGatewayComponent: React.FC<InfrastructureComponentProps> = ({
  position,
  animated = true,
  scale = 1,
  label = 'API Gateway',
  showLabel = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const requestsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    
    // Request routing animation
    if (requestsRef.current) {
      requestsRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={scale}>
      {/* Main gateway structure */}
      <Cone args={[0.6, 1.2, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3498DB" metalness={0.5} roughness={0.4} />
      </Cone>
      
      {/* API endpoints */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <Box 
            key={i}
            args={[0.15, 0.1, 0.3]} 
            position={[
              Math.cos(angle) * 0.7,
              0,
              Math.sin(angle) * 0.7
            ]}
            rotation={[0, angle, 0]}
          >
            <meshStandardMaterial color="#2980B9" />
          </Box>
        );
      })}
      
      {/* Request flow visualization */}
      <group ref={requestsRef}>
        {Array.from({ length: 3 }, (_, i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <Sphere 
              key={i}
              args={[0.04]} 
              position={[
                Math.cos(angle) * 0.4,
                0.3,
                Math.sin(angle) * 0.4
              ]}
            >
              <meshBasicMaterial color="#F1C40F" />
            </Sphere>
          );
        })}
      </group>
      
      {/* Central processing core */}
      <Sphere args={[0.2]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#E74C3C" />
      </Sphere>
      
      {/* Label */}
      {showLabel && (
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-medium.woff"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * Cache Server 3D Component
 * Represents a cache with fast access visualization
 */
export const CacheComponent: React.FC<InfrastructureComponentProps> = ({
  position,
  animated = true,
  scale = 1,
  label = 'Cache',
  showLabel = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animated) return;
    
    // Fast cache access animation
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const speed = 3;
        const offset = (state.clock.elapsedTime * speed + index * 0.3) % (Math.PI * 2);
        const radius = 0.3 + Math.sin(offset) * 0.1;
        mesh.position.x = Math.cos(offset) * radius;
        mesh.position.z = Math.sin(offset) * radius;
        mesh.position.y = Math.sin(offset * 2) * 0.1;
      });
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={scale}>
      {/* Main cache body */}
      <Box args={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#F39C12" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Cache memory modules */}
      {Array.from({ length: 4 }, (_, i) => (
        <Box 
          key={i}
          args={[0.15, 0.6, 0.1]} 
          position={[
            -0.3 + i * 0.2,
            0,
            0.45
          ]}
        >
          <meshStandardMaterial color="#E67E22" />
        </Box>
      ))}
      
      {/* Fast access particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 8 }, (_, i) => (
          <Sphere key={i} args={[0.02]}>
            <meshBasicMaterial color="#ECF0F1" />
          </Sphere>
        ))}
      </group>
      
      {/* Access indicators */}
      {Array.from({ length: 4 }, (_, i) => (
        <Sphere 
          key={i}
          args={[0.02]} 
          position={[-0.3 + i * 0.2, 0.3, 0.5]}
        >
          <meshBasicMaterial color="#27AE60" />
        </Sphere>
      ))}
      
      {/* Label */}
      {showLabel && (
        <Text
          position={[0, -1, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/inter-medium.woff"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

/**
 * Factory function to create infrastructure components based on type
 */
export const createInfrastructureComponent = (
  type: string,
  props: InfrastructureComponentProps
) => {
  switch (type) {
    case 'web-server':
      return <WebServerComponent {...props} />;
    case 'database':
      return <DatabaseComponent {...props} />;
    case 'cdn':
      return <CDNComponent {...props} />;
    case 'load-balancer':
      return <LoadBalancerComponent {...props} />;
    case 'api-gateway':
      return <APIGatewayComponent {...props} />;
    case 'cache':
      return <CacheComponent {...props} />;
    default:
      return <WebServerComponent {...props} label={type} />;
  }
};