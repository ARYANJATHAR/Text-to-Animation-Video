import React from 'react';

/**
 * Loading fallback component for Three.js scenes
 * Displays while 3D content is being initialized
 */
export const LoadingFallback: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color="#95A5A6" wireframe />
    </mesh>
  );
};