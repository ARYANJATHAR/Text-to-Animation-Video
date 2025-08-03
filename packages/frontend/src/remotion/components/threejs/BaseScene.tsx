import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { ThreeJSScene, CameraConfiguration, LightingConfiguration } from 'shared-types';
import { SceneLighting } from './SceneLighting';
import { SceneCamera } from './SceneCamera';
import { LoadingFallback } from './LoadingFallback';

interface BaseSceneProps {
  scene: ThreeJSScene;
  width?: number;
  height?: number;
  enableControls?: boolean;
  className?: string;
}

/**
 * Base Three.js scene component for educational visualizations
 * Provides foundation for network and infrastructure 3D content
 */
export const BaseScene: React.FC<BaseSceneProps> = ({
  scene,
  width = 1920,
  height = 1080,
  enableControls = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div 
      className={`threejs-scene-container ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Canvas
        ref={canvasRef}
        camera={false} // We'll use our custom camera
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance'
        }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          // Optimize for video rendering
          gl.setClearColor('#000000', 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Custom camera based on scene configuration */}
          <SceneCamera config={scene.camera} />
          
          {/* Lighting setup */}
          <SceneLighting config={scene.lighting} />
          
          {/* Environment for better reflections */}
          <Environment preset="studio" />
          
          {/* Render scene objects */}
          {scene.objects.map((object) => (
            <SceneObject key={object.id} object={object} />
          ))}
          
          {/* Optional orbit controls for development */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              dampingFactor={0.05}
              screenSpacePanning={false}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

/**
 * Individual scene object renderer
 */
const SceneObject: React.FC<{ object: any }> = ({ object }) => {
  const meshRef = useRef<any>(null);

  // This will be expanded to handle different object types
  if (object.type === 'mesh') {
    return (
      <mesh
        ref={meshRef}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
      >
        <GeometryComponent geometry={object.geometry} />
        <MaterialComponent material={object.material} />
      </mesh>
    );
  }

  return null;
};

/**
 * Dynamic geometry component
 */
const GeometryComponent: React.FC<{ geometry: any }> = ({ geometry }) => {
  switch (geometry.type) {
    case 'box':
      return (
        <boxGeometry
          args={[
            geometry.parameters.width || 1,
            geometry.parameters.height || 1,
            geometry.parameters.depth || 1
          ]}
        />
      );
    case 'sphere':
      return (
        <sphereGeometry
          args={[
            geometry.parameters.radius || 0.5,
            geometry.parameters.widthSegments || 32,
            geometry.parameters.heightSegments || 32
          ]}
        />
      );
    case 'cylinder':
      return (
        <cylinderGeometry
          args={[
            geometry.parameters.radiusTop || 0.5,
            geometry.parameters.radiusBottom || 0.5,
            geometry.parameters.height || 1,
            geometry.parameters.radialSegments || 32
          ]}
        />
      );
    case 'plane':
      return (
        <planeGeometry
          args={[
            geometry.parameters.width || 1,
            geometry.parameters.height || 1
          ]}
        />
      );
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
};

/**
 * Dynamic material component
 */
const MaterialComponent: React.FC<{ material: any }> = ({ material }) => {
  const props = material.properties || {};

  switch (material.type) {
    case 'basic':
      return <meshBasicMaterial {...props} />;
    case 'standard':
      return (
        <meshStandardMaterial
          color={props.color || '#ffffff'}
          metalness={props.metalness || 0}
          roughness={props.roughness || 1}
          transparent={props.transparent || false}
          opacity={props.opacity || 1}
          {...props}
        />
      );
    case 'physical':
      return (
        <meshPhysicalMaterial
          color={props.color || '#ffffff'}
          metalness={props.metalness || 0}
          roughness={props.roughness || 1}
          clearcoat={props.clearcoat || 0}
          clearcoatRoughness={props.clearcoatRoughness || 0}
          {...props}
        />
      );
    default:
      return <meshStandardMaterial color={props.color || '#ffffff'} />;
  }
};