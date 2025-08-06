# Manim-Remotion Integration Guide

This guide explains how to integrate Manim-generated mathematical diagrams and animations with Remotion video compositions.

## Overview

The Manim-Remotion integration system allows you to:
- Import Manim-generated video segments into Remotion compositions
- Synchronize timing between Manim segments and Remotion timeline
- Combine multiple Manim diagrams in a single video
- Apply transitions and effects between segments
- Handle different aspect ratios and video formats

## Architecture

### Core Components

1. **ManimRemotionBridge** - Service for importing and synchronizing Manim content
2. **ManimRemotionIntegrator** - React component for seamless integration
3. **ManimVideoSegment** - Component for rendering individual Manim segments
4. **ManimIntegrationLayer** - Layer management for multiple segments

### Data Flow

```
Manim Service → ManimRemotionBridge → ManimRemotionIntegrator → Remotion Composition
```

## Quick Start

### 1. Basic Integration

```tsx
import { ManimRemotionIntegrator } from '../components/ManimRemotionIntegrator';

export const MyComposition = () => {
  const animationIds = ['http-flow-demo', 'dns-resolution-demo'];
  const timeline = [
    {
      id: 'http-flow-demo',
      startTime: 0,
      duration: 10,
      technology: 'manim',
      content: { type: 'diagram', data: {} },
      animations: []
    },
    {
      id: 'dns-resolution-demo',
      startTime: 12,
      duration: 8,
      technology: 'manim',
      content: { type: 'diagram', data: {} },
      animations: []
    }
  ];

  return (
    <ManimRemotionIntegrator
      animationIds={animationIds}
      timeline={timeline}
      enableTransitions={true}
      onIntegrationComplete={(result) => {
        console.log('Integration completed:', result);
      }}
    />
  );
};
```

### 2. Advanced Configuration

```tsx
import { ManimRemotionBridge } from '../services/ManimRemotionBridge';

const bridge = new ManimRemotionBridge({
  manimServiceUrl: 'http://localhost:5001',
  enableCaching: true,
  maxRetries: 3,
  timeoutMs: 30000
});

// Import segments
const importResult = await bridge.importManimSegments(['animation-1', 'animation-2']);

// Synchronize with timeline
const syncResult = await bridge.synchronizeWithRemotionTimeline(
  importResult.segments,
  timeline
);

// Create composition
const compositionResult = await bridge.integrateIntoComposition(
  syncResult.adjustedSegments,
  timeline,
  { width: 1920, height: 1080, fps: 30, durationInFrames: 900 }
);
```

## Configuration Options

### ManimRemotionBridge Config

```typescript
interface ManimRemotionBridgeConfig {
  manimServiceUrl: string;        // URL of the Manim service
  videoStoragePath: string;       // Path for video storage
  enableCaching: boolean;         // Enable segment caching
  maxRetries: number;             // Max retry attempts
  timeoutMs: number;              // Request timeout
}
```

### Timeline Segment

```typescript
interface TimelineSegment {
  id: string;                     // Unique identifier
  startTime: number;              // Start time in seconds
  duration: number;               // Duration in seconds
  technology: 'manim';            // Technology type
  content: SegmentContent;        // Content configuration
  animations: AnimationDefinition[]; // Animation definitions
}
```

## Best Practices

### 1. Timeline Management

- **Sequential Segments**: Leave gaps between segments for smooth transitions
- **Timing Precision**: Use precise timing values to avoid synchronization issues
- **Duration Matching**: Ensure timeline duration matches actual video duration

```tsx
const timeline = [
  { id: 'segment-1', startTime: 0, duration: 10, ... },
  { id: 'segment-2', startTime: 12, duration: 8, ... }, // 2-second gap
  { id: 'segment-3', startTime: 22, duration: 6, ... }  // 2-second gap
];
```

### 2. Performance Optimization

- **Caching**: Enable caching for frequently used segments
- **Batch Processing**: Import multiple segments in batches
- **Resolution Management**: Use appropriate resolutions for target platforms

```tsx
// Enable caching for better performance
const bridge = new ManimRemotionBridge({
  enableCaching: true,
  maxRetries: 3
});

// Batch import for efficiency
const segments = await bridge.importManimSegments([
  'segment-1', 'segment-2', 'segment-3'
]);
```

### 3. Error Handling

- **Graceful Degradation**: Handle missing segments gracefully
- **Retry Logic**: Implement retry logic for failed imports
- **User Feedback**: Provide clear error messages to users

```tsx
<ManimRemotionIntegrator
  animationIds={animationIds}
  timeline={timeline}
  onError={(error) => {
    console.error('Integration failed:', error);
    // Show user-friendly error message
  }}
/>
```

## Troubleshooting

### Common Issues

#### 1. Segment Not Found
```
Error: Failed to import segment animation-123: Animation not ready: processing
```

**Solution**: Ensure the Manim animation is completed before importing.

#### 2. Timing Conflicts
```
Warning: Segment overlap detected between segment-1 and segment-2
```

**Solution**: Adjust timeline timing to avoid overlaps or use layering.

#### 3. Format Compatibility
```
Warning: Unsupported format: avi
```

**Solution**: Ensure Manim outputs MP4, WebM, or MOV formats.

### Debug Mode

Enable debug mode in development:

```tsx
// Debug overlay will show in development
process.env.NODE_ENV = 'development';

<ManimRemotionIntegrator
  animationIds={animationIds}
  timeline={timeline}
  // Debug overlay automatically appears
/>
```

## API Reference

### ManimRemotionBridge Methods

#### `importManimSegments(animationIds: string[]): Promise<ImportResult>`
Imports Manim video segments and prepares them for Remotion integration.

#### `synchronizeWithRemotionTimeline(segments, timeline): Promise<SynchronizationResult>`
Synchronizes Manim segments with Remotion timeline.

#### `integrateIntoComposition(segments, timeline, config): Promise<CompositionIntegrationResult>`
Integrates multiple Manim segments into a single Remotion composition.

#### `createSeamlessTransitions(segments, timeline): Promise<RemotionComponent[]>`
Creates smooth transitions between Manim segments.

### ManimRemotionIntegrator Props

```typescript
interface ManimRemotionIntegratorProps {
  animationIds: string[];                    // Array of Manim animation IDs
  timeline: TimelineSegment[];               // Timeline configuration
  backgroundColor?: string;                  // Background color
  enableTransitions?: boolean;               // Enable transitions
  onIntegrationComplete?: (result) => void;  // Success callback
  onError?: (error: string) => void;         // Error callback
}
```

## Examples

### Example 1: HTTP Flow Visualization

```tsx
export const HTTPFlowComposition = () => {
  return (
    <ManimRemotionIntegrator
      animationIds={['http-request-flow']}
      timeline={[
        {
          id: 'http-request-flow',
          startTime: 0,
          duration: 15,
          technology: 'manim',
          content: {
            type: 'diagram',
            data: { diagramType: 'http_flow' }
          },
          animations: []
        }
      ]}
      backgroundColor="#1a1a2e"
      enableTransitions={true}
    />
  );
};
```

### Example 2: Multi-Segment Educational Video

```tsx
export const WebDevelopmentBasics = () => {
  const segments = [
    'frontend-backend-overview',
    'http-protocol-basics',
    'dns-resolution-process',
    'database-interactions'
  ];

  const timeline = segments.map((id, index) => ({
    id,
    startTime: index * 12,
    duration: 10,
    technology: 'manim' as const,
    content: { type: 'diagram', data: {} },
    animations: []
  }));

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <TitleSequence title="Web Development Basics" />
      </Sequence>
      
      <Sequence from={90} durationInFrames={1440}>
        <ManimRemotionIntegrator
          animationIds={segments}
          timeline={timeline}
          enableTransitions={true}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

### Example 3: Responsive Design

```tsx
export const ResponsiveManimComposition = ({ aspectRatio }: { aspectRatio: AspectRatio }) => {
  const animationIds = aspectRatio === '9:16' 
    ? ['mobile-optimized-diagram']
    : ['desktop-optimized-diagram'];

  return (
    <ManimRemotionIntegrator
      animationIds={animationIds}
      timeline={[
        {
          id: animationIds[0],
          startTime: 0,
          duration: 20,
          technology: 'manim',
          content: { type: 'diagram', data: { aspectRatio } },
          animations: []
        }
      ]}
    />
  );
};
```

## Testing

### Unit Tests

```typescript
import { ManimRemotionBridge } from '../services/ManimRemotionBridge';

describe('ManimRemotionBridge', () => {
  it('should import segments successfully', async () => {
    const bridge = new ManimRemotionBridge();
    const result = await bridge.importManimSegments(['test-animation']);
    
    expect(result.success).toBe(true);
    expect(result.segments).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
import { render, waitFor } from '@testing-library/react';
import { ManimRemotionIntegrator } from '../components/ManimRemotionIntegrator';

it('should integrate Manim content successfully', async () => {
  const onComplete = jest.fn();
  
  render(
    <ManimRemotionIntegrator
      animationIds={['test-animation']}
      timeline={[/* timeline config */]}
      onIntegrationComplete={onComplete}
    />
  );

  await waitFor(() => {
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

## Performance Considerations

### Memory Management
- Large video segments can consume significant memory
- Use appropriate video resolutions for target platforms
- Enable caching judiciously to balance performance and memory usage

### Rendering Performance
- Complex Manim diagrams may slow down rendering
- Consider using lower quality settings for preview
- Use progressive rendering for long compositions

### Network Optimization
- Implement proper retry logic for network failures
- Use compression for video segments when possible
- Consider CDN deployment for production use

## Deployment

### Production Configuration

```typescript
const productionConfig = {
  manimServiceUrl: process.env.REACT_APP_MANIM_SERVICE_URL,
  enableCaching: true,
  maxRetries: 5,
  timeoutMs: 60000
};
```

### Environment Variables

```bash
REACT_APP_MANIM_SERVICE_URL=https://manim-service.example.com
REACT_APP_VIDEO_STORAGE_PATH=/var/videos
REACT_APP_ENABLE_DEBUG=false
```

## Contributing

When contributing to the Manim-Remotion integration:

1. Follow TypeScript best practices
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Consider performance implications
5. Test with various video formats and resolutions

## Support

For issues and questions:
- Check the troubleshooting section
- Review the test files for usage examples
- Consult the API reference for detailed method documentation