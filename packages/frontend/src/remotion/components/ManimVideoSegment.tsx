import React from 'react';
import { Video, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { ManimSegment } from 'shared-types';

export interface ManimVideoSegmentProps {
  segment: ManimSegment;
  startFrame: number;
  endFrame: number;
  opacity?: number;
  scale?: number;
  position?: { x: number; y: number };
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'screen';
}

export const ManimVideoSegment: React.FC<ManimVideoSegmentProps> = ({
  segment,
  startFrame,
  endFrame,
  opacity = 1,
  scale = 1,
  position = { x: 0, y: 0 },
  blendMode = 'normal'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate if this segment should be visible
  const isVisible = frame >= startFrame && frame <= endFrame;
  
  if (!isVisible) {
    return null;
  }
  
  // Calculate the current time within the segment
  const segmentFrame = frame - startFrame;
  const segmentTime = segmentFrame / fps;
  
  // Apply fade in/out effects
  const fadeInDuration = 0.5; // seconds
  const fadeOutDuration = 0.5; // seconds
  const segmentDuration = (endFrame - startFrame) / fps;
  
  const fadeInFrames = fadeInDuration * fps;
  const fadeOutFrames = fadeOutDuration * fps;
  const totalFrames = endFrame - startFrame;
  
  const fadeOpacity = interpolate(
    segmentFrame,
    [0, fadeInFrames, totalFrames - fadeOutFrames, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const finalOpacity = opacity * fadeOpacity;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        opacity: finalOpacity,
        mixBlendMode: blendMode,
        width: '100%',
        height: '100%',
      }}
    >
      <Video
        src={segment.videoSegment.filePath}
        startFrom={Math.floor(segmentTime * fps)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};