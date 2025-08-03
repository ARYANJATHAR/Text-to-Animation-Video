import React, { createContext, useContext, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeJSAnimation, TimelineSegment, SynchronizationPoint } from 'shared-types';

interface TimelineSyncContext {
  currentTime: number;
  currentFrame: number;
  fps: number;
  totalDuration: number;
  getAnimationValueAtTime: (animation: ThreeJSAnimation, time: number) => any;
  getSynchronizationPoints: (segmentId: string) => SynchronizationPoint[];
  isSegmentActive: (segment: TimelineSegment) => boolean;
}

const TimelineSyncContext = createContext<TimelineSyncContext | null>(null);

interface TimelineSynchronizerProps {
  children: React.ReactNode;
  segments: TimelineSegment[];
  synchronizationPoints?: SynchronizationPoint[];
  globalAnimations?: ThreeJSAnimation[];
}

/**
 * Timeline synchronizer that provides frame-accurate timing for Three.js animations
 * within Remotion compositions
 */
export const TimelineSynchronizer: React.FC<TimelineSynchronizerProps> = ({
  children,
  segments,
  synchronizationPoints = [],
  globalAnimations = []
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const currentTime = frame / fps;
  const totalDuration = durationInFrames / fps;

  const contextValue = useMemo<TimelineSyncContext>(() => ({
    currentTime,
    currentFrame: frame,
    fps,
    totalDuration,
    
    getAnimationValueAtTime: (animation: ThreeJSAnimation, time: number) => {
      return interpolateAnimationAtTime(animation, time);
    },
    
    getSynchronizationPoints: (segmentId: string) => {
      return synchronizationPoints.filter(point => 
        point.services.includes('threejs') && 
        point.properties.segmentId === segmentId
      );
    },
    
    isSegmentActive: (segment: TimelineSegment) => {
      const startTime = segment.startTime;
      const endTime = segment.startTime + segment.duration;
      return currentTime >= startTime && currentTime <= endTime;
    }
  }), [currentTime, frame, fps, totalDuration, synchronizationPoints]);

  return (
    <TimelineSyncContext.Provider value={contextValue}>
      {children}
    </TimelineSyncContext.Provider>
  );
};

/**
 * Hook to access timeline synchronization context
 */
export function useTimelineSync(): TimelineSyncContext {
  const context = useContext(TimelineSyncContext);
  if (!context) {
    throw new Error('useTimelineSync must be used within a TimelineSynchronizer');
  }
  return context;
}

/**
 * Hook for synchronized Three.js animations
 */
export function useSynchronizedAnimation(
  animation: ThreeJSAnimation,
  segmentStartTime: number = 0
): any {
  const { currentTime, getAnimationValueAtTime } = useTimelineSync();
  
  return useMemo(() => {
    const relativeTime = currentTime - segmentStartTime;
    if (relativeTime < 0) return null;
    
    return getAnimationValueAtTime(animation, relativeTime);
  }, [animation, currentTime, segmentStartTime, getAnimationValueAtTime]);
}

/**
 * Hook for managing multiple synchronized animations
 */
export function useSynchronizedAnimations(
  animations: ThreeJSAnimation[],
  segmentStartTime: number = 0
): Record<string, any> {
  const { currentTime, getAnimationValueAtTime } = useTimelineSync();
  
  return useMemo(() => {
    const relativeTime = currentTime - segmentStartTime;
    if (relativeTime < 0) return {};
    
    const values: Record<string, any> = {};
    
    animations.forEach(animation => {
      const value = getAnimationValueAtTime(animation, relativeTime);
      if (value !== null) {
        values[animation.id] = value;
      }
    });
    
    return values;
  }, [animations, currentTime, segmentStartTime, getAnimationValueAtTime]);
}

/**
 * Hook for synchronization points
 */
export function useSynchronizationPoints(segmentId: string): {
  activeSyncPoints: SynchronizationPoint[];
  nextSyncPoint: SynchronizationPoint | null;
  previousSyncPoint: SynchronizationPoint | null;
} {
  const { currentTime, getSynchronizationPoints } = useTimelineSync();
  
  return useMemo(() => {
    const syncPoints = getSynchronizationPoints(segmentId);
    
    const activeSyncPoints = syncPoints.filter(point => 
      Math.abs(currentTime - point.timestamp) < 0.1 // 100ms tolerance
    );
    
    const futureSyncPoints = syncPoints.filter(point => point.timestamp > currentTime);
    const pastSyncPoints = syncPoints.filter(point => point.timestamp <= currentTime);
    
    const nextSyncPoint = futureSyncPoints.length > 0 
      ? futureSyncPoints.reduce((closest, point) => 
          point.timestamp < closest.timestamp ? point : closest
        )
      : null;
    
    const previousSyncPoint = pastSyncPoints.length > 0
      ? pastSyncPoints.reduce((closest, point) => 
          point.timestamp > closest.timestamp ? point : closest
        )
      : null;
    
    return {
      activeSyncPoints,
      nextSyncPoint,
      previousSyncPoint
    };
  }, [segmentId, currentTime, getSynchronizationPoints]);
}

/**
 * Component that triggers events at synchronization points
 */
export const SynchronizationTrigger: React.FC<{
  segmentId: string;
  onSyncPoint?: (point: SynchronizationPoint) => void;
  children: React.ReactNode;
}> = ({ segmentId, onSyncPoint, children }) => {
  const { activeSyncPoints } = useSynchronizationPoints(segmentId);
  
  // Trigger callbacks for active sync points
  React.useEffect(() => {
    if (onSyncPoint && activeSyncPoints.length > 0) {
      activeSyncPoints.forEach(point => onSyncPoint(point));
    }
  }, [activeSyncPoints, onSyncPoint]);
  
  return <>{children}</>;
};

/**
 * Interpolates animation value at specific time
 */
function interpolateAnimationAtTime(animation: ThreeJSAnimation, time: number): any {
  if (!animation.keyframes || animation.keyframes.length === 0) {
    return null;
  }

  const keyframes = animation.keyframes.sort((a, b) => a.time - b.time);
  
  // Before first keyframe
  if (time <= keyframes[0].time) {
    return keyframes[0].value;
  }
  
  // After last keyframe
  if (time >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value;
  }
  
  // Find surrounding keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const current = keyframes[i];
    const next = keyframes[i + 1];
    
    if (time >= current.time && time <= next.time) {
      const progress = (time - current.time) / (next.time - current.time);
      return interpolateValue(current.value, next.value, progress, animation.easing);
    }
  }
  
  return null;
}

/**
 * Interpolates between two values with easing
 */
function interpolateValue(from: any, to: any, progress: number, easing: string = 'linear'): any {
  const easedProgress = applyEasing(progress, easing);
  
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * easedProgress;
  }
  
  if (typeof from === 'object' && typeof to === 'object' && from !== null && to !== null) {
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
    case 'bounce':
      return bounce(progress);
    case 'elastic':
      return elastic(progress);
    case 'linear':
    default:
      return progress;
  }
}

/**
 * Bounce easing function
 */
function bounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
}

/**
 * Elastic easing function
 */
function elastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  
  const p = 0.3;
  const s = p / 4;
  
  return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
}

/**
 * Utility to create synchronized animation keyframes
 */
export function createSynchronizedKeyframes(
  startTime: number,
  duration: number,
  values: any[],
  easing: string = 'linear'
): Array<{ time: number; value: any }> {
  if (values.length < 2) {
    throw new Error('At least 2 values are required for keyframes');
  }
  
  const keyframes = [];
  const timeStep = duration / (values.length - 1);
  
  for (let i = 0; i < values.length; i++) {
    keyframes.push({
      time: startTime + (i * timeStep),
      value: values[i]
    });
  }
  
  return keyframes;
}

/**
 * Utility to create staggered animations
 */
export function createStaggeredAnimations(
  baseAnimation: Omit<ThreeJSAnimation, 'id' | 'targetId'>,
  targetIds: string[],
  staggerDelay: number = 0.1
): ThreeJSAnimation[] {
  return targetIds.map((targetId, index) => ({
    ...baseAnimation,
    id: `${baseAnimation.property}-${targetId}`,
    targetId,
    keyframes: baseAnimation.keyframes.map(keyframe => ({
      ...keyframe,
      time: keyframe.time + (index * staggerDelay)
    }))
  }));
}