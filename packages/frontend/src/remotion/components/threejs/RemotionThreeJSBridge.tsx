import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Canvas } from '@react-three/fiber';
import { ThreeJSScene, ThreeJSAnimation, Vector3 } from 'shared-types';
import { BaseScene } from './BaseScene';

interface RemotionThreeJSBridgeProps {
  scene: ThreeJSScene;
  animations?: ThreeJSAnimation[];
  startFrame?: number;
  durationInFrames?: number;
  enableTimelineSync?: boolean;
  className?: string;
}

/**
 * Bridge component that integrates Three.js scenes with Remotion timeline
 * Provides frame-accurate synchronization between 3D animations and video timeline
 */
export const RemotionThreeJSBridge: React.FC<RemotionThreeJSBridgeProps> = ({
  scene,
  animations = [],
  startFrame = 0,
  durationInFrames,
  enableTimelineSync = true,
  className = ''
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: totalDuration } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate current time in seconds for Three.js animations
  const currentTime = useMemo(() => {
    if (!enableTimelineSync) return 0;
    
    const relativeFrame = frame - startFrame;
    const effectiveDuration = durationInFrames || totalDuration;
    
    if (relativeFrame < 0 || relativeFrame > effectiveDuration) {
      return 0;
    }
    
    return relativeFrame / fps;
  }, [frame, startFrame, durationInFrames, totalDuration, fps, enableTimelineSync]);

  // Create animated scene with current timeline values
  const animatedScene = useMemo(() => {
    if (!enableTimelineSync || animations.length === 0) {
      return scene;
    }

    // Clone the scene to avoid mutating the original
    const clonedScene: ThreeJSScene = {
      ...scene,
      objects: scene.objects.map(obj => ({ ...obj }))
    };

    // Apply animations based on current time
    animations.forEach(animation => {
      const targetObject = clonedScene.objects.find(obj => obj.id === animation.targetId);
      if (!targetObject) return;

      const animatedValue = interpolateAnimation(animation, currentTime);
      if (animatedValue !== null) {
        applyAnimationValue(targetObject, animation.property, animatedValue);
      }
    });

    return clonedScene;
  }, [scene, animations, currentTime, enableTimelineSync]);

  // Handle canvas optimization for video rendering
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (context) {
        // Optimize for video rendering
        context.getExtension('EXT_color_buffer_float');
        context.getExtension('OES_texture_float');
      }
    }
  }, []);

  return (
    <div 
      className={`remotion-threejs-bridge ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Canvas
        ref={canvasRef}
        camera={false}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          // Optimize for video encoding
          premultipliedAlpha: false,
          stencil: false,
          depth: true
        }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl, scene: threeScene, camera }) => {
          // Configure for video rendering
          gl.setClearColor('#000000', 0);
          gl.setPixelRatio(1); // Fixed pixel ratio for consistent video output
          
          // Enable shadow mapping if needed
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
        }}
      >
        <BaseSceneContent scene={animatedScene} currentTime={currentTime} />
      </Canvas>
      
      {/* Debug overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        >
          Frame: {frame} | Time: {currentTime.toFixed(2)}s | Objects: {animatedScene.objects.length}
        </div>
      )}
    </div>
  );
};

/**
 * Internal component that renders the Three.js scene content
 */
const BaseSceneContent: React.FC<{ scene: ThreeJSScene; currentTime: number }> = ({ 
  scene, 
  currentTime 
}) => {
  return (
    <>
      {/* Camera */}
      <SceneCamera config={scene.camera} />
      
      {/* Lighting */}
      <SceneLighting config={scene.lighting} />
      
      {/* Scene objects */}
      {scene.objects.map((object) => (
        <AnimatedSceneObject 
          key={object.id} 
          object={object} 
          currentTime={currentTime}
        />
      ))}
    </>
  );
};

/**
 * Scene object with animation support
 */
const AnimatedSceneObject: React.FC<{ 
  object: any; 
  currentTime: number;
}> = ({ object, currentTime }) => {
  const meshRef = useRef<any>(null);

  // Apply real-time animations to the mesh
  useEffect(() => {
    if (meshRef.current && object.animations) {
      object.animations.forEach((animation: any) => {
        const value = interpolateAnimation(animation, currentTime);
        if (value !== null && meshRef.current) {
          applyAnimationValueToMesh(meshRef.current, animation.property, value);
        }
      });
    }
  }, [object, currentTime]);

  if (object.type === 'mesh') {
    return (
      <mesh
        ref={meshRef}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        castShadow
        receiveShadow
      >
        <GeometryComponent geometry={object.geometry} />
        <MaterialComponent material={object.material} />
      </mesh>
    );
  }

  return null;
};

/**
 * Camera component with Remotion integration
 */
const SceneCamera: React.FC<{ config: any }> = ({ config }) => {
  return (
    <perspectiveCamera
      position={[config.position.x, config.position.y, config.position.z]}
      fov={config.fov || 75}
      near={config.near || 0.1}
      far={config.far || 1000}
      lookAt={[config.target.x, config.target.y, config.target.z]}
    />
  );
};

/**
 * Lighting component
 */
const SceneLighting: React.FC<{ config: any }> = ({ config }) => {
  return (
    <>
      <ambientLight 
        color={config.ambient.color} 
        intensity={config.ambient.intensity} 
      />
      {config.directional.map((light: any, index: number) => (
        <directionalLight
          key={index}
          color={light.color}
          intensity={light.intensity}
          position={[light.position.x, light.position.y, light.position.z]}
          target-position={[light.target.x, light.target.y, light.target.z]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      ))}
    </>
  );
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
    default:
      return <meshStandardMaterial color={props.color || '#ffffff'} />;
  }
};

/**
 * Interpolates animation values based on current time
 */
function interpolateAnimation(animation: ThreeJSAnimation, currentTime: number): any {
  if (!animation.keyframes || animation.keyframes.length === 0) {
    return null;
  }

  // Find the appropriate keyframes for interpolation
  const keyframes = animation.keyframes.sort((a, b) => a.time - b.time);
  
  // Before first keyframe
  if (currentTime <= keyframes[0].time) {
    return keyframes[0].value;
  }
  
  // After last keyframe
  if (currentTime >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value;
  }
  
  // Find surrounding keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const current = keyframes[i];
    const next = keyframes[i + 1];
    
    if (currentTime >= current.time && currentTime <= next.time) {
      const progress = (currentTime - current.time) / (next.time - current.time);
      return interpolateValue(current.value, next.value, progress, animation.easing);
    }
  }
  
  return null;
}

/**
 * Interpolates between two values with easing
 */
function interpolateValue(from: any, to: any, progress: number, easing: string = 'linear'): any {
  // Apply easing function
  const easedProgress = applyEasing(progress, easing);
  
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * easedProgress;
  }
  
  if (typeof from === 'object' && typeof to === 'object') {
    const result: any = {};
    for (const key in from) {
      if (typeof from[key] === 'number' && typeof to[key] === 'number') {
        result[key] = from[key] + (to[key] - from[key]) * easedProgress;
      } else {
        result[key] = easedProgress < 0.5 ? from[key] : to[key];
      }
    }
    return result;
  }
  
  return easedProgress < 0.5 ? from : to;
}

/**
 * Applies easing function to progress value
 */
function applyEasing(progress: number, easing: string): number {
  switch (easing) {
    case 'easeIn':
      return progress * progress;
    case 'easeOut':
      return 1 - Math.pow(1 - progress, 2);
    case 'easeInOut':
      return progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case 'linear':
    default:
      return progress;
  }
}

/**
 * Applies animation value to object property
 */
function applyAnimationValue(object: any, property: string, value: any): void {
  const propertyPath = property.split('.');
  let target = object;
  
  for (let i = 0; i < propertyPath.length - 1; i++) {
    if (!target[propertyPath[i]]) {
      target[propertyPath[i]] = {};
    }
    target = target[propertyPath[i]];
  }
  
  const finalProperty = propertyPath[propertyPath.length - 1];
  target[finalProperty] = value;
}

/**
 * Applies animation value directly to Three.js mesh
 */
function applyAnimationValueToMesh(mesh: any, property: string, value: any): void {
  const propertyPath = property.split('.');
  
  if (propertyPath[0] === 'position' && typeof value === 'object') {
    mesh.position.set(value.x || 0, value.y || 0, value.z || 0);
  } else if (propertyPath[0] === 'rotation' && typeof value === 'object') {
    mesh.rotation.set(value.x || 0, value.y || 0, value.z || 0);
  } else if (propertyPath[0] === 'scale' && typeof value === 'object') {
    mesh.scale.set(value.x || 1, value.y || 1, value.z || 1);
  } else if (propertyPath[0] === 'material' && propertyPath[1] === 'opacity') {
    if (mesh.material) {
      mesh.material.opacity = value;
      mesh.material.transparent = value < 1;
    }
  }
}