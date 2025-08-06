import React, { useEffect, useState, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { ManimRemotionBridge, type ImportResult, type SynchronizationResult } from '../services/ManimRemotionBridge';
import { ManimVideoSegment } from './ManimVideoSegment';
import type { 
  ManimSegment, 
  TimelineSegment, 
  SynchronizationPoint,
  LayerComposition 
} from 'shared-types';

export interface ManimRemotionIntegratorProps {
  animationIds: string[];
  timeline: TimelineSegment[];
  backgroundColor?: string;
  enableTransitions?: boolean;
  onIntegrationComplete?: (result: IntegrationResult) => void;
  onError?: (error: string) => void;
}

export interface IntegrationResult {
  success: boolean;
  segments: ManimSegment[];
  synchronizationPoints: SynchronizationPoint[];
  layerCompositions: LayerComposition[];
  warnings: string[];
}

export const ManimRemotionIntegrator: React.FC<ManimRemotionIntegratorProps> = ({
  animationIds,
  timeline,
  backgroundColor = '#000000',
  enableTransitions = true,
  onIntegrationComplete,
  onError
}) => {
  const [integrationState, setIntegrationState] = useState<{
    status: 'loading' | 'ready' | 'error';
    segments: ManimSegment[];
    synchronizationPoints: SynchronizationPoint[];
    layerCompositions: LayerComposition[];
    errors: string[];
    warnings: string[];
  }>({
    status: 'loading',
    segments: [],
    synchronizationPoints: [],
    layerCompositions: [],
    errors: [],
    warnings: []
  });

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Initialize bridge service
  const bridge = useMemo(() => new ManimRemotionBridge({
    manimServiceUrl: process.env.REACT_APP_MANIM_SERVICE_URL || 'http://localhost:5001',
    enableCaching: true,
    maxRetries: 3,
    timeoutMs: 30000
  }), []);

  // Integration effect
  useEffect(() => {
    let isMounted = true;

    const performIntegration = async () => {
      try {
        setIntegrationState(prev => ({ ...prev, status: 'loading' }));

        // Step 1: Import Manim segments
        const importResult: ImportResult = await bridge.importManimSegments(animationIds);
        
        if (!isMounted) return;

        if (!importResult.success) {
          throw new Error(`Import failed: ${importResult.errors.join(', ')}`);
        }

        // Step 2: Synchronize with timeline
        const syncResult: SynchronizationResult = await bridge.synchronizeWithRemotionTimeline(
          importResult.segments,
          timeline
        );

        if (!isMounted) return;

        // Step 3: Create layer compositions
        const integrationResult = await bridge.integrateIntoComposition(
          syncResult.adjustedSegments,
          timeline,
          { width, height, fps, durationInFrames: 1800 }
        );

        if (!isMounted) return;

        const finalState = {
          status: 'ready' as const,
          segments: syncResult.adjustedSegments,
          synchronizationPoints: syncResult.syncPoints,
          layerCompositions: integrationResult.layerCompositions,
          errors: [],
          warnings: [...importResult.warnings, ...syncResult.conflicts.map(c => c.resolution)]
        };

        setIntegrationState(finalState);

        // Notify parent component
        if (onIntegrationComplete) {
          onIntegrationComplete({
            success: true,
            segments: finalState.segments,
            synchronizationPoints: finalState.synchronizationPoints,
            layerCompositions: finalState.layerCompositions,
            warnings: finalState.warnings
          });
        }

      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Unknown integration error';
        
        setIntegrationState(prev => ({
          ...prev,
          status: 'error',
          errors: [errorMessage]
        }));

        if (onError) {
          onError(errorMessage);
        }
      }
    };

    if (animationIds.length > 0) {
      performIntegration();
    }

    return () => {
      isMounted = false;
    };
  }, [animationIds, timeline, bridge, width, height, fps, onIntegrationComplete, onError]);

  // Render loading state
  if (integrationState.status === 'loading') {
    return (
      <AbsoluteFill style={{ backgroundColor }}>
        <LoadingIndicator />
      </AbsoluteFill>
    );
  }

  // Render error state
  if (integrationState.status === 'error') {
    return (
      <AbsoluteFill style={{ backgroundColor }}>
        <ErrorDisplay errors={integrationState.errors} />
      </AbsoluteFill>
    );
  }

  // Render integrated content
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <IntegratedManimContent
        segments={integrationState.segments}
        timeline={timeline}
        synchronizationPoints={integrationState.synchronizationPoints}
        layerCompositions={integrationState.layerCompositions}
        enableTransitions={enableTransitions}
        currentFrame={frame}
        fps={fps}
      />
      
      {/* Debug overlay in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugOverlay
          integrationState={integrationState}
          currentFrame={frame}
          fps={fps}
        />
      )}
    </AbsoluteFill>
  );
};

// Sub-components

const LoadingIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = (frame * 2) % 360;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          transform: `rotate(${rotation}deg)`,
          marginBottom: 20
        }}
      />
      <div style={{ fontSize: 18, fontWeight: 'bold' }}>
        Integrating Manim Content...
      </div>
      <div style={{ fontSize: 14, opacity: 0.7, marginTop: 10 }}>
        Importing segments and synchronizing timeline
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<{ errors: string[] }> = ({ errors }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#ff6b6b',
      fontFamily: 'Arial, sans-serif',
      padding: 40,
      textAlign: 'center'
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
      Integration Error
    </div>
    {errors.map((error, index) => (
      <div key={index} style={{ fontSize: 16, marginBottom: 10, opacity: 0.9 }}>
        {error}
      </div>
    ))}
  </div>
);

interface IntegratedManimContentProps {
  segments: ManimSegment[];
  timeline: TimelineSegment[];
  synchronizationPoints: SynchronizationPoint[];
  layerCompositions: LayerComposition[];
  enableTransitions: boolean;
  currentFrame: number;
  fps: number;
}

const IntegratedManimContent: React.FC<IntegratedManimContentProps> = ({
  segments,
  timeline,
  synchronizationPoints,
  layerCompositions,
  enableTransitions,
  currentFrame,
  fps
}) => {
  // Group segments by layer
  const layerGroups = useMemo(() => {
    const groups: Map<number, { segments: ManimSegment[]; timeline: TimelineSegment[] }> = new Map();

    layerCompositions.forEach(lc => {
      if (!groups.has(lc.layerIndex)) {
        groups.set(lc.layerIndex, { segments: [], timeline: [] });
      }
    });

    timeline.forEach(timelineSegment => {
      if (timelineSegment.technology === 'manim') {
        const layerConfig = layerCompositions.find(lc => 
          lc.service === 'manim' && 
          Math.abs(lc.startTime - timelineSegment.startTime) < 0.1
        );

        if (layerConfig) {
          const group = groups.get(layerConfig.layerIndex);
          if (group) {
            const manimSegment = segments.find(s => s.id === timelineSegment.id);
            if (manimSegment) {
              group.segments.push(manimSegment);
              group.timeline.push(timelineSegment);
            }
          }
        }
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.segments.length - b.segments.length);
  }, [segments, timeline, layerCompositions]);

  return (
    <>
      {layerGroups.map((layerGroup, layerIndex) => {
        const layerConfig = layerCompositions.find(lc => lc.layerIndex === layerIndex);
        
        return (
          <div
            key={`layer-${layerIndex}`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: layerConfig?.opacity || 1,
              mixBlendMode: layerConfig?.blendMode || 'normal',
            }}
          >
            {layerGroup.segments.map((segment, segmentIndex) => {
              const timelineSegment = layerGroup.timeline[segmentIndex];
              if (!timelineSegment) return null;

              const startFrame = Math.floor(timelineSegment.startTime * fps);
              const endFrame = Math.floor((timelineSegment.startTime + timelineSegment.duration) * fps);

              return (
                <Sequence
                  key={segment.id}
                  from={startFrame}
                  durationInFrames={endFrame - startFrame}
                >
                  <ManimVideoSegment
                    segment={segment}
                    startFrame={0}
                    endFrame={endFrame - startFrame}
                    opacity={1}
                    scale={1}
                    position={{ x: 0, y: 0 }}
                    blendMode="normal"
                  />
                </Sequence>
              );
            })}
          </div>
        );
      })}

      {/* Render transitions if enabled */}
      {enableTransitions && (
        <TransitionEffects
          synchronizationPoints={synchronizationPoints}
          currentFrame={currentFrame}
          fps={fps}
        />
      )}
    </>
  );
};

const TransitionEffects: React.FC<{
  synchronizationPoints: SynchronizationPoint[];
  currentFrame: number;
  fps: number;
}> = ({ synchronizationPoints, currentFrame, fps }) => {
  const activeTransitions = synchronizationPoints.filter(sp => {
    const transitionFrame = Math.floor(sp.timestamp * fps);
    const transitionWindow = 15; // frames
    
    return Math.abs(currentFrame - transitionFrame) <= transitionWindow;
  });

  if (activeTransitions.length === 0) return null;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />
  );
};

const DebugOverlay: React.FC<{
  integrationState: any;
  currentFrame: number;
  fps: number;
}> = ({ integrationState, currentFrame, fps }) => {
  const currentTime = currentFrame / fps;

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: 15,
        fontSize: 12,
        fontFamily: 'monospace',
        borderRadius: 8,
        maxWidth: 350,
        lineHeight: 1.4
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Manim Integration Debug</div>
      <div>Status: {integrationState.status}</div>
      <div>Segments: {integrationState.segments.length}</div>
      <div>Sync Points: {integrationState.synchronizationPoints.length}</div>
      <div>Layers: {integrationState.layerCompositions.length}</div>
      <div>Frame: {currentFrame} | Time: {currentTime.toFixed(2)}s</div>
      
      {integrationState.warnings.length > 0 && (
        <div style={{ marginTop: 10, color: '#ffa500' }}>
          <div style={{ fontWeight: 'bold' }}>Warnings:</div>
          {integrationState.warnings.slice(0, 3).map((warning: string, index: number) => (
            <div key={index} style={{ fontSize: 11 }}>• {warning}</div>
          ))}
        </div>
      )}
    </div>
  );
};