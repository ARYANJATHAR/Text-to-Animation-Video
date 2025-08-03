import React from 'react';
import { LightingConfiguration } from 'shared-types';

interface SceneLightingProps {
  config: LightingConfiguration;
}

/**
 * Educational lighting setup optimized for technical visualizations
 * Provides clear visibility of 3D models and infrastructure components
 */
export const SceneLighting: React.FC<SceneLightingProps> = ({ config }) => {
  return (
    <>
      {/* Ambient lighting for overall scene illumination */}
      <ambientLight
        color={config.ambient.color}
        intensity={config.ambient.intensity}
      />

      {/* Directional lights for definition and depth */}
      {config.directional.map((light, index) => (
        <directionalLight
          key={`directional-${index}`}
          color={light.color}
          intensity={light.intensity}
          position={[light.position.x, light.position.y, light.position.z]}
          target-position={[light.target.x, light.target.y, light.target.z]}
          castShadow={true}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
      ))}

      {/* Additional fill light for educational clarity */}
      <pointLight
        position={[0, 10, 0]}
        intensity={0.2}
        color="#ffffff"
        distance={50}
        decay={2}
      />

      {/* Rim light for object separation */}
      <spotLight
        position={[-10, 10, -10]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.3}
        color="#4A90E2"
        castShadow={false}
      />
    </>
  );
};