import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { ManimRemotionBridge } from '../services/ManimRemotionBridge';
import { ManimRemotionIntegrator } from '../components/ManimRemotionIntegrator';
import type { ManimSegment, TimelineSegment, VideoSegment, ManimMetadata } from 'shared-types';

// Mock fetch for testing
global.fetch = jest.fn();

// Mock Remotion hooks
jest.mock('remotion', () => ({
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30, width: 1920, height: 1080 }),
  Sequence: ({ children }: any) => <div>{children}</div>,
  Video: ({ src }: any) => <video src={src} />
}));

describe('ManimRemotionBridge', () => {
  let bridge: ManimRemotionBridge;

  beforeEach(() => {
    bridge = new ManimRemotionBridge({
      manimServiceUrl: 'http://localhost:5001',
      enableCaching: false,
      maxRetries: 1,
      timeoutMs: 5000
    });
    
    (fetch as jest.Mock).mockClear();
  });

  describe('importManimSegments', () => {
    it('should successfully import valid Manim segments', async () => {
      // Mock successful API responses
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-animation-1',
          status: 'completed',
          file_path: '/path/to/video1.mp4',
          duration: 10,
          resolution: [1920, 1080]
        })
      });

      const result = await bridge.importManimSegments(['test-animation-1']);

      expect(result.success).toBe(true);
      expect(result.segments).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.segments[0].id).toBe('test-animation-1');
      expect(result.segments[0].videoSegment.filePath).toBe('/path/to/video1.mp4');
    });

    it('should handle failed imports gracefully', async () => {
      // Mock failed API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      const result = await bridge.importManimSegments(['invalid-animation']);

      expect(result.success).toBe(false);
      expect(result.segments).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to import segment invalid-animation');
    });

    it('should apply compatibility fixes for invalid segments', async () => {
      // Mock API response with invalid data
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-animation-invalid',
          status: 'completed',
          file_path: '/path/to/video.mp4',
          duration: -1, // Invalid duration
          resolution: [0, 0] // Invalid resolution
        })
      });

      const result = await bridge.importManimSegments(['test-animation-invalid']);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.segments[0].videoSegment.duration).toBe(10); // Fixed duration
      expect(result.segments[0].videoSegment.resolution).toEqual({ width: 1920, height: 1080 }); // Fixed resolution
    });
  });

  describe('synchronizeWithRemotionTimeline', () => {
    it('should synchronize segments with timeline successfully', async () => {
      const mockSegments: ManimSegment[] = [
        {
          id: 'segment-1',
          videoSegment: {
            id: 'segment-1',
            filePath: '/path/to/video1.mp4',
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
            renderTime: 5
          },
          integrationPoints: []
        }
      ];

      const mockTimeline: TimelineSegment[] = [
        {
          id: 'segment-1',
          startTime: 2,
          duration: 8,
          technology: 'manim',
          content: { type: 'diagram', data: {} },
          animations: []
        }
      ];

      const result = await bridge.synchronizeWithRemotionTimeline(mockSegments, mockTimeline);

      expect(result.synchronized).toBe(true);
      expect(result.adjustedSegments).toHaveLength(1);
      expect(result.adjustedSegments[0].videoSegment.startTime).toBe(2);
      expect(result.adjustedSegments[0].videoSegment.duration).toBe(8);
      expect(result.syncPoints).toHaveLength(2); // Start and end sync points
    });

    it('should detect timing conflicts', async () => {
      const mockSegments: ManimSegment[] = [
        {
          id: 'segment-1',
          videoSegment: {
            id: 'segment-1',
            filePath: '/path/to/video1.mp4',
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
            renderTime: 5
          },
          integrationPoints: []
        }
      ];

      const mockTimeline: TimelineSegment[] = [
        {
          id: 'missing-segment',
          startTime: 0,
          duration: 5,
          technology: 'manim',
          content: { type: 'diagram', data: {} },
          animations: []
        }
      ];

      const result = await bridge.synchronizeWithRemotionTimeline(mockSegments, mockTimeline);

      expect(result.synchronized).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('gap');
      expect(result.conflicts[0].severity).toBe('high');
    });
  });

  describe('integrateIntoComposition', () => {
    it('should create a complete Remotion composition', async () => {
      const mockSegments: ManimSegment[] = [
        {
          id: 'segment-1',
          videoSegment: {
            id: 'segment-1',
            filePath: '/path/to/video1.mp4',
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
            renderTime: 5
          },
          integrationPoints: []
        }
      ];

      const mockTimeline: TimelineSegment[] = [
        {
          id: 'segment-1',
          startTime: 0,
          duration: 10,
          technology: 'manim',
          content: { type: 'diagram', data: {} },
          animations: []
        }
      ];

      const compositionConfig = {
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 300
      };

      const result = await bridge.integrateIntoComposition(
        mockSegments,
        mockTimeline,
        compositionConfig
      );

      expect(result.composition.id).toBeDefined();
      expect(result.composition.width).toBe(1920);
      expect(result.composition.height).toBe(1080);
      expect(result.composition.fps).toBe(30);
      expect(result.components).toHaveLength(1);
      expect(result.layerCompositions).toHaveLength(1);
      expect(result.metadata.totalSegments).toBe(1);
      expect(result.metadata.technologies).toContain('manim');
      expect(result.metadata.technologies).toContain('remotion');
    });

    it('should generate appropriate rendering hints', async () => {
      // Create many segments to trigger performance hints
      const mockSegments: ManimSegment[] = Array.from({ length: 10 }, (_, i) => ({
        id: `segment-${i}`,
        videoSegment: {
          id: `segment-${i}`,
          filePath: `/path/to/video${i}.mp4`,
          duration: 5,
          resolution: { width: 1920, height: 1080 },
          format: 'mp4',
          startTime: i * 5,
          endTime: (i + 1) * 5
        },
        metadata: {
          sceneCount: 1,
          objectCount: 10,
          animationCount: 5,
          complexity: 'complex',
          renderTime: 10
        },
        integrationPoints: []
      }));

      const mockTimeline: TimelineSegment[] = mockSegments.map((segment, i) => ({
        id: segment.id,
        startTime: i * 5,
        duration: 5,
        technology: 'manim',
        content: { type: 'diagram', data: {} },
        animations: []
      }));

      const result = await bridge.integrateIntoComposition(
        mockSegments,
        mockTimeline,
        { width: 1920, height: 1080, fps: 30, durationInFrames: 1500 }
      );

      expect(result.metadata.complexity).toBe('complex');
      expect(result.metadata.renderingHints).toHaveLength(2);
      expect(result.metadata.renderingHints[0].type).toBe('performance');
      expect(result.metadata.renderingHints[1].type).toBe('quality');
    });
  });
});

describe('ManimRemotionIntegrator Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    render(
      <ManimRemotionIntegrator
        animationIds={['test-animation']}
        timeline={[]}
      />
    );

    expect(screen.getByText('Integrating Manim Content...')).toBeInTheDocument();
  });

  it('should handle successful integration', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'test-animation',
        status: 'completed',
        file_path: '/path/to/video.mp4',
        duration: 10,
        resolution: [1920, 1080]
      })
    });

    const onIntegrationComplete = jest.fn();

    render(
      <ManimRemotionIntegrator
        animationIds={['test-animation']}
        timeline={[
          {
            id: 'test-animation',
            startTime: 0,
            duration: 10,
            technology: 'manim',
            content: { type: 'diagram', data: {} },
            animations: []
          }
        ]}
        onIntegrationComplete={onIntegrationComplete}
      />
    );

    await waitFor(() => {
      expect(onIntegrationComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          segments: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-animation'
            })
          ])
        })
      );
    });
  });

  it('should handle integration errors', async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const onError = jest.fn();

    render(
      <ManimRemotionIntegrator
        animationIds={['invalid-animation']}
        timeline={[]}
        onError={onError}
      />
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('Network error'));
    });

    expect(screen.getByText('Integration Error')).toBeInTheDocument();
  });

  it('should render debug overlay in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'test-animation',
        status: 'completed',
        file_path: '/path/to/video.mp4',
        duration: 10,
        resolution: [1920, 1080]
      })
    });

    render(
      <ManimRemotionIntegrator
        animationIds={['test-animation']}
        timeline={[
          {
            id: 'test-animation',
            startTime: 0,
            duration: 10,
            technology: 'manim',
            content: { type: 'diagram', data: {} },
            animations: []
          }
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Manim Integration Debug')).toBeInTheDocument();
    });

    process.env.NODE_ENV = originalEnv;
  });
});

describe('Integration Performance Tests', () => {
  let bridge: ManimRemotionBridge;

  beforeEach(() => {
    bridge = new ManimRemotionBridge({
      enableCaching: true,
      maxRetries: 1,
      timeoutMs: 5000
    });
    
    (fetch as jest.Mock).mockClear();
  });

  it('should handle large numbers of segments efficiently', async () => {
    const animationIds = Array.from({ length: 50 }, (_, i) => `animation-${i}`);
    
    // Mock API responses
    (fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: 'test-animation',
          status: 'completed',
          file_path: '/path/to/video.mp4',
          duration: 5,
          resolution: [1920, 1080]
        })
      })
    );

    const startTime = Date.now();
    const result = await bridge.importManimSegments(animationIds);
    const endTime = Date.now();

    expect(result.success).toBe(true);
    expect(result.segments).toHaveLength(50);
    expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it('should cache segments to improve performance', async () => {
    const animationId = 'cached-animation';
    
    // Mock API response
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: animationId,
        status: 'completed',
        file_path: '/path/to/video.mp4',
        duration: 10,
        resolution: [1920, 1080]
      })
    });

    // First import
    await bridge.importManimSegments([animationId]);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second import should use cache
    await bridge.importManimSegments([animationId]);
    expect(fetch).toHaveBeenCalledTimes(1); // No additional fetch calls
  });
});