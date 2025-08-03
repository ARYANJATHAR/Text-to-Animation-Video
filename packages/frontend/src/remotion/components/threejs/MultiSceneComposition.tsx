import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, Sequence, interpolate } from 'remotion';
import { ThreeJSScene, TimelineSegment, TransitionConfiguration } from 'shared-types';
import { RemotionThreeJSBridge } from './RemotionThreeJSBridge';

interface MultiSceneCompositionProps {
  scenes: ThreeJSScene[];
  timeline: TimelineSegment[];
  transitions?: TransitionConfiguration[];
  className?: string;
}

interface SceneTransition {
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

/**
 * Multi-scene composition that orchestrates multiple Three.js scenes
 * with smooth transitions and timeline synchronization
 */
export const MultiSceneComposition: React.FC<MultiSceneCompositionProps> = ({
  scenes,
  timeline,
  transitions = [],
  className = ''
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate scene timing and transitions
  const sceneTimeline = useMemo(() => {
    return timeline
      .filter(segment => segment.technology === 'threejs')
      .map(segment => {
        const scene = scenes.find(s => s.id === segment.content.data.sceneId);
        const transition = transitions.find(t => 
          t.fromSegmentId === segment.id || t.toSegmentId === segment.id
        );
        
        return {
          ...segment,
          scene,
          transition,
          startFrame: Math.round(segment.startTime * fps),
          durationInFrames: Math.round(segment.duration * fps),
          endFrame: Math.round((segment.startTime + segment.duration) * fps)
        };
      })
      .sort((a, b) => a.startFrame - b.startFrame);
  }, [scenes, timeline, transitions, fps]);

  // Get current active scenes and their opacity/transform values
  const activeScenes = useMemo(() => {
    return sceneTimeline
      .map(sceneData => {
        const { startFrame, endFrame, durationInFrames, transition } = sceneData;
        
        // Check if scene is active
        if (frame < startFrame || frame > endFrame) {
          return null;
        }

        // Calculate scene progress
        const sceneProgress = (frame - startFrame) / durationInFrames;
        
        // Calculate transition effects
        let opacity = 1;
        let transform = { x: 0, y: 0, scale: 1, rotation: 0 };
        
        if (transition) {
          const transitionFrames = Math.round(transition.duration * fps);
          
          // Fade in transition
          if (frame - startFrame < transitionFrames) {
            const fadeProgress = (frame - startFrame) / transitionFrames;
            opacity = interpolate(fadeProgress, [0, 1], [0, 1]);
            transform = calculateTransitionTransform(transition, fadeProgress, 'in');
          }
          
          // Fade out transition
          if (endFrame - frame < transitionFrames) {
            const fadeProgress = (endFrame - frame) / transitionFrames;
            opacity = interpolate(fadeProgress, [0, 1], [0, 1]);
            transform = calculateTransitionTransform(transition, 1 - fadeProgress, 'out');
          }
        }

        return {
          ...sceneData,
          opacity,
          transform,
          sceneProgress,
          relativeFrame: frame - startFrame
        };
      })
      .filter(Boolean);
  }, [sceneTimeline, frame, fps]);

  return (
    <div 
      data-testid="multi-scene-container"
      className={`multi-scene-composition ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Render active scenes with transitions */}
      {activeScenes.map((sceneData, index) => {
        if (!sceneData?.scene) return null;

        return (
          <Sequence
            key={`${sceneData.id}-${sceneData.startFrame}`}
            from={sceneData.startFrame}
            durationInFrames={sceneData.durationInFrames}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: sceneData.opacity,
                transform: `
                  translateX(${sceneData.transform.x}px) 
                  translateY(${sceneData.transform.y}px) 
                  scale(${sceneData.transform.scale}) 
                  rotate(${sceneData.transform.rotation}deg)
                `,
                transformOrigin: 'center center',
                zIndex: index
              }}
            >
              <RemotionThreeJSBridge
                scene={sceneData.scene}
                animations={sceneData.scene.animations}
                startFrame={0} // Relative to sequence
                durationInFrames={sceneData.durationInFrames}
                enableTimelineSync={true}
                className="scene-layer"
              />
            </div>
          </Sequence>
        );
      })}

      {/* Scene transition overlays */}
      {activeScenes.length > 1 && (
        <SceneTransitionOverlay 
          scenes={activeScenes}
          currentFrame={frame}
        />
      )}

      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '300px'
          }}
        >
          <div>Frame: {frame}</div>
          <div>Active Scenes: {activeScenes.length}</div>
          {activeScenes.map((scene, i) => (
            <div key={i} style={{ marginTop: '5px' }}>
              Scene {i + 1}: {scene?.scene?.name} (α: {scene?.opacity.toFixed(2)})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Scene transition overlay for complex transition effects
 */
const SceneTransitionOverlay: React.FC<{
  scenes: any[];
  currentFrame: number;
}> = ({ scenes, currentFrame }) => {
  // This could be expanded for more complex transition effects
  // like particle systems, morphing, or custom shaders
  return null;
};

/**
 * Calculate transform values for different transition types
 */
function calculateTransitionTransform(
  transition: TransitionConfiguration, 
  progress: number, 
  direction: 'in' | 'out'
): { x: number; y: number; scale: number; rotation: number } {
  const easing = applyEasing(progress, transition.properties?.easing || 'easeInOut');
  
  switch (transition.type) {
    case 'slide':
      const slideDirection = transition.properties?.direction || 'left';
      const slideDistance = 1920; // Full width slide
      
      let slideX = 0;
      let slideY = 0;
      
      if (slideDirection === 'left') {
        slideX = direction === 'in' 
          ? interpolate(easing, [0, 1], [-slideDistance, 0])
          : interpolate(easing, [0, 1], [0, slideDistance]);
      } else if (slideDirection === 'right') {
        slideX = direction === 'in' 
          ? interpolate(easing, [0, 1], [slideDistance, 0])
          : interpolate(easing, [0, 1], [0, -slideDistance]);
      } else if (slideDirection === 'up') {
        slideY = direction === 'in' 
          ? interpolate(easing, [0, 1], [-1080, 0])
          : interpolate(easing, [0, 1], [0, 1080]);
      } else if (slideDirection === 'down') {
        slideY = direction === 'in' 
          ? interpolate(easing, [0, 1], [1080, 0])
          : interpolate(easing, [0, 1], [0, -1080]);
      }
      
      return { x: slideX, y: slideY, scale: 1, rotation: 0 };

    case 'zoom':
      const scale = direction === 'in' 
        ? interpolate(easing, [0, 1], [0.1, 1])
        : interpolate(easing, [0, 1], [1, 2]);
      
      return { x: 0, y: 0, scale, rotation: 0 };

    case 'fade':
    default:
      return { x: 0, y: 0, scale: 1, rotation: 0 };
  }
}

/**
 * Apply easing function to progress value
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
 * Hook for managing scene transitions
 */
export function useSceneTransitions(
  scenes: ThreeJSScene[],
  timeline: TimelineSegment[],
  transitions: TransitionConfiguration[]
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return useMemo(() => {
    // Calculate which scenes should be visible and their transition states
    const activeTransitions = transitions.filter(transition => {
      const fromSegment = timeline.find(s => s.id === transition.fromSegmentId);
      const toSegment = timeline.find(s => s.id === transition.toSegmentId);
      
      if (!fromSegment || !toSegment) return false;
      
      const transitionStart = Math.round(fromSegment.startTime * fps);
      const transitionEnd = Math.round((fromSegment.startTime + fromSegment.duration) * fps);
      
      return frame >= transitionStart && frame <= transitionEnd;
    });

    return {
      activeTransitions,
      hasActiveTransitions: activeTransitions.length > 0
    };
  }, [scenes, timeline, transitions, frame, fps]);
}

/**
 * Utility function to create smooth scene transitions
 */
export function createSceneTransition(
  fromSceneId: string,
  toSceneId: string,
  type: 'fade' | 'slide' | 'zoom' = 'fade',
  duration: number = 1,
  properties: Record<string, any> = {}
): TransitionConfiguration {
  return {
    id: `transition-${fromSceneId}-${toSceneId}`,
    fromSegmentId: fromSceneId,
    toSegmentId: toSceneId,
    type,
    duration,
    properties: {
      easing: 'easeInOut',
      ...properties
    }
  };
}