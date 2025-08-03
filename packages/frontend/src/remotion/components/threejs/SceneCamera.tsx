import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { CameraConfiguration } from 'shared-types';
import * as THREE from 'three';

interface SceneCameraProps {
  config: CameraConfiguration;
  animated?: boolean;
}

/**
 * Educational camera component with smooth movements and focus controls
 * Optimized for explaining technical concepts through strategic viewpoints
 */
export const SceneCamera: React.FC<SceneCameraProps> = ({ 
  config, 
  animated = true 
}) => {
  const cameraRef = useRef<THREE.Camera>(null);
  const { set } = useThree();

  // Smooth camera animation for educational flow
  useFrame((state, delta) => {
    if (!animated || !cameraRef.current) return;

    const camera = cameraRef.current;
    const targetPosition = new THREE.Vector3(
      config.position.x,
      config.position.y,
      config.position.z
    );

    // Smooth camera movement for educational pacing
    camera.position.lerp(targetPosition, delta * 0.5);
    
    // Look at target for educational focus
    const lookAtTarget = new THREE.Vector3(
      config.target.x,
      config.target.y,
      config.target.z
    );
    camera.lookAt(lookAtTarget);
  });

  if (config.type === 'perspective') {
    return (
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={config.fov || 75}
        near={config.near}
        far={config.far}
        position={[config.position.x, config.position.y, config.position.z]}
        onUpdate={(camera) => {
          camera.lookAt(config.target.x, config.target.y, config.target.z);
          set({ camera });
        }}
      />
    );
  } else {
    return (
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        near={config.near}
        far={config.far}
        position={[config.position.x, config.position.y, config.position.z]}
        zoom={100}
        onUpdate={(camera) => {
          camera.lookAt(config.target.x, config.target.y, config.target.z);
          set({ camera });
        }}
      />
    );
  }
};