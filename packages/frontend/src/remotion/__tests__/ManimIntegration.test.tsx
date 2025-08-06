import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ManimVideoSegment } from '../components/ManimVideoSegment';
import { ManimIntegrationLayer } from '../components/ManimIntegrationLayer';
import { MultiManimComposition } from '../components/MultiManimComposition';
import { ManimIntegrationService } from '../services/ManimIntegrationService';
import type { 
  ManimSegment, 
  TimelineSegment, 
  SynchronizationPoint,
  LayerComposition,
  VideoSegment,
  ManimMetadata 
} from 'shared-types';

// Mock Remotion hooks
vi.mock('remotion', () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30, width: 1920, height: 1080 }),
  interpolate: (frame: number, input: number[], output: number[]) => {
    // Simple linear interpolation for testing
    const ratio = (frame - input[0]) / (input[1] - input[0]);
    return output[0] + ratio * (output[1] - output[0]);
  },
  Video: ({ src, style }: any) => <div data-testid="video" data-src={src} style={style} />,
  AbsoluteFill: ({ children, style }: any) => <div data-testid="absolute-fill" style={style}>{children}</div>
}));

describe('ManimIntegration', () => {
  let mockManimSegment: ManimSegment;
  let mockTimelineSegment: TimelineSegment;
  let mockSyncPoints: SynchronizationPoint[];
  let integrationService: ManimIntegrationService;

  beforeEach(() => {
    // Create mock data
    mockManimSegment = {
      id: 'test-segment-1',
      videoSegment: {
        id: 'video-1',
        filePath: '/test/video.mp4',
        duration: 10,
        resolution: { width: 1920, height: 1080 },
        format: 'mp4',
        startTime: 0,
        endTime: 10
      },
      metadata: {
        sceneCount: 1,
        objectCount: 5,
        animationCount: 3,
        complexity: 'moderate',
        renderTime: 15
      },
      integrationPoints: [
        {
          id: 'start-point',
          timestamp: 0,
          type: 'sync',
          properties: { event: 'segment_start' }
        },
        {
          id: 'end-point',
          timestamp: 10,
          type: 'sync',
          properties: { event: 'segment_end' }
        }
      ]
    };

    mockTimelineSegment = {
      id: 'test-segment-1',
      startTime: 2,
      duration: 8,
      technology: 'manim',
      content: {
        type: 'diagram',
        data: { diagramType: 'http_flow' }
      },
      animations: []
    };

    mockSyncPoints = [
      {
        id: 'sync-1',
        timestamp: 2,
        services: ['manim', 'remotion'],
        event: 'segment_start',
        properties: { segmentId: 'test-segment-1' }
      },
      {
        id: 'sync-2',
        timestamp: 10,
        services: ['manim', 'remotion'],
        event: 'segment_end',
        properties: { segmentId: 'test-segment-1' }
      }
    ];

    integrationService = new ManimIntegrationService();
  });

  describe('ManimVideoSegment', () => {
    it('should render video segment with correct props', () => {
      const { getByTestId } = render(
        <ManimVideoSegment
          segment={mockManimSegment}
          startFrame={60}
          endFrame={300}
          opacity={0.8}
          scale={1.2}
          position={{ x: 100, y: 50 }}
        />
      );

      const video = getByTestId('video');
      expect(video).toHaveAttribute('data-src', '/test/video.mp4');
    });

    it('should not render when outside frame range', () => {
      // Mock useCurrentFrame to return frame outside range
      vi.mocked(require('remotion').useCurrentFrame).mockReturnValue(30);

      const { queryByTestId } = render(
        <ManimVideoSegment
          segment={mockManimSegment}
          startFrame={60}
          endFrame={300}
        />
      );

      expect(queryByTestId('video')).toBeNull();
    });

    it('should apply fade effects correctly', () => {
      // Mock useCurrentFrame to return frame within fade range
      vi.mocked(require('remotion').useCurrentFrame).mockReturnValue(75);

      const { container } = render(
        <ManimVideoSegment
          segment={mockManimSegment}
          startFrame={60}
          endFrame={300}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.opacity).toBeTruthy();
    });
  });

  describe('ManimIntegrationLayer', () => {
    it('should render multiple segments correctly', () => {
      const segments = [mockManimSegment];
      const timeline = [mockTimelineSegment];

      const { getByTestId } = render(
        <ManimIntegrationLayer
          segments={segments}
          timeline={timeline}
          synchronizationPoints={mockSyncPoints}
        />
      );

      expect(getByTestId('absolute-fill')).toBeInTheDocument();
    });

    it('should filter segments by technology', () => {
      const mixedTimeline = [
        mockTimelineSegment,
        {
          ...mockTimelineSegment,
          id: 'remotion-segment',
          technology: 'remotion' as const
        }
      ];

      const { container } = render(
        <ManimIntegrationLayer
          segments={[mockManimSegment]}
          timeline={mixedTimeline}
          synchronizationPoints={mockSyncPoints}
        />
      );

      // Should only render Manim segments
      const videos = container.querySelectorAll('[data-testid="video"]');
      expect(videos).toHaveLength(1);
    });

    it('should apply synchronization adjustments', () => {
      const syncPoints = [
        {
          id: 'sync-adjust',
          timestamp: 3,
          services: ['manim'],
          event: 'adjustment',
          properties: {}
        }
      ];

      const { container } = render(
        <ManimIntegrationLayer
          segments={[mockManimSegment]}
          timeline={[mockTimelineSegment]}
          synchronizationPoints={syncPoints}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('MultiManimComposition', () => {
    it('should render composition with multiple layers', () => {
      const layerCompositions: LayerComposition[] = [
        {
          id: 'layer-1',
          layerIndex: 0,
          service: 'manim',
          blendMode: 'normal',
          opacity: 1.0,
          startTime: 2,
          duration: 8
        }
      ];

      const { getByTestId } = render(
        <MultiManimComposition
          segments={[mockManimSegment]}
          timeline={[mockTimelineSegment]}
          synchronizationPoints={mockSyncPoints}
          layerCompositions={layerCompositions}
        />
      );

      expect(getByTestId('absolute-fill')).toBeInTheDocument();
    });

    it('should handle empty segments gracefully', () => {
      const { getByTestId } = render(
        <MultiManimComposition
          segments={[]}
          timeline={[]}
          synchronizationPoints={[]}
          layerCompositions={[]}
        />
      );

      expect(getByTestId('absolute-fill')).toBeInTheDocument();
    });

    it('should apply background color correctly', () => {
      const { getByTestId } = render(
        <MultiManimComposition
          segments={[]}
          timeline={[]}
          synchronizationPoints={[]}
          layerCompositions={[]}
          backgroundColor="#ff0000"
        />
      );

      const fill = getByTestId('absolute-fill');
      expect(fill).toHaveStyle({ backgroundColor: '#ff0000' });
    });
  });

  describe('ManimIntegrationService', () => {
    describe('importManimSegments', () => {
      it('should import video segments successfully', async () => {
        const videoSegments: VideoSegment[] = [
          {
            id: 'video-1',
            filePath: '/test/video1.mp4',
            duration: 10,
            resolution: { width: 1920, height: 1080 },
            format: 'mp4',
            startTime: 0,
            endTime: 10
          }
        ];

        const metadata: ManimMetadata[] = [
          {
            sceneCount: 2,
            objectCount: 10,
            animationCount: 5,
            complexity: 'complex',
            renderTime: 30
          }
        ];

        const result = await integrationService.importManimSegments(videoSegments, metadata);

        expect(result).toHaveLength(1);
        expect(result[0].videoSegment.filePath).toBe('/test/video1.mp4');
        expect(result[0].metadata.complexity).toBe('complex');
        expect(result[0].integrationPoints).toHaveLength(3); // start, mid, end
      });

      it('should handle invalid video segments', async () => {
        const invalidSegments: VideoSegment[] = [
          {
            id: 'invalid',
            filePath: '/test/invalid.avi',
            duration: -1,
            resolution: { width: 0, height: 0 },
            format: 'avi',
            startTime: 0,
            endTime: -1
          }
        ];

        await expect(
          integrationService.importManimSegments(invalidSegments, [])
        ).rejects.toThrow();
      });
    });

    describe('synchronizeWithTimeline', () => {
      it('should synchronize segments with timeline', () => {
        const segments = [mockManimSegment];
        const timeline = [mockTimelineSegment];

        const result = integrationService.synchronizeWithTimeline(segments, timeline);

        expect(result.adjustedSegments).toHaveLength(1);
        expect(result.synchronizationPoints).toHaveLength(2);
        expect(result.conflicts).toHaveLength(0);
      });

      it('should detect timing conflicts', () => {
        const overlappingSegment: ManimSegment = {
          ...mockManimSegment,
          id: 'overlapping-segment',
          videoSegment: {
            ...mockManimSegment.videoSegment,
            id: 'video-2',
            startTime: 1,
            endTime: 11
          }
        };

        const overlappingTimeline: TimelineSegment = {
          ...mockTimelineSegment,
          id: 'overlapping-segment',
          startTime: 1,
          duration: 10
        };

        const segments = [mockManimSegment, overlappingSegment];
        const timeline = [mockTimelineSegment, overlappingTimeline];

        const result = integrationService.synchronizeWithTimeline(segments, timeline);

        expect(result.conflicts.length).toBeGreaterThan(0);
        expect(result.conflicts[0].type).toBe('overlap');
      });

      it('should detect duration mismatches', () => {
        const mismatchedTimeline: TimelineSegment = {
          ...mockTimelineSegment,
          duration: 15 // Different from segment duration of 10
        };

        const result = integrationService.synchronizeWithTimeline(
          [mockManimSegment], 
          [mismatchedTimeline]
        );

        expect(result.conflicts).toHaveLength(1);
        expect(result.conflicts[0].type).toBe('duration_mismatch');
      });
    });

    describe('createLayerCompositions', () => {
      it('should create layer compositions for segments', () => {
        const segments = [mockManimSegment];
        const timeline = [mockTimelineSegment];

        const result = integrationService.createLayerCompositions(segments, timeline);

        expect(result).toHaveLength(1);
        expect(result[0].service).toBe('manim');
        expect(result[0].layerIndex).toBe(0);
      });

      it('should handle multiple overlapping segments', () => {
        const segment2: ManimSegment = {
          ...mockManimSegment,
          id: 'segment-2',
          videoSegment: {
            ...mockManimSegment.videoSegment,
            id: 'video-2'
          }
        };

        const timeline2: TimelineSegment = {
          ...mockTimelineSegment,
          id: 'segment-2'
        };

        const segments = [mockManimSegment, segment2];
        const timeline = [mockTimelineSegment, timeline2];

        const result = integrationService.createLayerCompositions(segments, timeline);

        expect(result.length).toBeGreaterThan(0);
        // Should create layers for overlapping segments
        const layerIndices = result.map(r => r.layerIndex);
        expect(new Set(layerIndices).size).toBeGreaterThan(0);
      });

      it('should apply appropriate blend modes and opacity', () => {
        const complexSegment: ManimSegment = {
          ...mockManimSegment,
          metadata: {
            ...mockManimSegment.metadata,
            complexity: 'complex'
          }
        };

        const result = integrationService.createLayerCompositions(
          [complexSegment], 
          [mockTimelineSegment]
        );

        expect(result[0].blendMode).toBe('overlay');
        expect(result[0].opacity).toBe(1.0);
      });
    });
  });

  describe('Integration Error Handling', () => {
    it('should handle missing video files gracefully', async () => {
      const invalidSegment: VideoSegment = {
        id: 'missing',
        filePath: '',
        duration: 10,
        resolution: { width: 1920, height: 1080 },
        format: 'mp4',
        startTime: 0,
        endTime: 10
      };

      await expect(
        integrationService.importManimSegments([invalidSegment], [])
      ).rejects.toThrow('Invalid video resolution');
    });

    it('should handle unsupported video formats', async () => {
      const unsupportedSegment: VideoSegment = {
        id: 'unsupported',
        filePath: '/test/video.flv',
        duration: 10,
        resolution: { width: 1920, height: 1080 },
        format: 'flv' as any,
        startTime: 0,
        endTime: 10
      };

      await expect(
        integrationService.importManimSegments([unsupportedSegment], [])
      ).rejects.toThrow('Unsupported video format');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large numbers of segments efficiently', async () => {
      const startTime = Date.now();
      
      // Create 50 segments
      const segments: VideoSegment[] = Array.from({ length: 50 }, (_, i) => ({
        id: `segment-${i}`,
        filePath: `/test/video${i}.mp4`,
        duration: 5,
        resolution: { width: 1920, height: 1080 },
        format: 'mp4',
        startTime: i * 5,
        endTime: (i + 1) * 5
      }));

      const metadata: ManimMetadata[] = segments.map(() => ({
        sceneCount: 1,
        objectCount: 3,
        animationCount: 2,
        complexity: 'moderate',
        renderTime: 10
      }));

      const result = await integrationService.importManimSegments(segments, metadata);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(result).toHaveLength(50);
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should optimize layer compositions for performance', () => {
      // Create segments with different timing patterns
      const segments: ManimSegment[] = Array.from({ length: 10 }, (_, i) => ({
        ...mockManimSegment,
        id: `segment-${i}`,
        videoSegment: {
          ...mockManimSegment.videoSegment,
          id: `video-${i}`,
          startTime: i * 2,
          endTime: (i * 2) + 3
        }
      }));

      const timeline: TimelineSegment[] = segments.map(s => ({
        ...mockTimelineSegment,
        id: s.id,
        startTime: s.videoSegment.startTime,
        duration: s.videoSegment.duration
      }));

      const result = integrationService.createLayerCompositions(segments, timeline);

      // Should optimize by grouping overlapping segments
      expect(result.length).toBeLessThanOrEqual(segments.length);
      
      // Should not exceed max concurrent segments
      const maxConcurrent = Math.max(...result.map(r => r.layerIndex)) + 1;
      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });
});