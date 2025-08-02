import { describe, it, expect } from 'vitest';
import type {
  Topic,
  Concept,
  AnimationConfiguration,
  VideoOutput,
  VideoMetadata,
  RemotionService,
  ThreeJSService,
  ManimService,
  SystemError,
  ErrorClassification,
  RecoveryResult
} from './index';

describe('Core Data Models', () => {
  it('should create a valid Topic interface', () => {
    const topic: Topic = {
      id: 'test-topic-1',
      title: 'How HTTP Works',
      description: 'Understanding HTTP protocol basics',
      concepts: [],
      difficulty: 'beginner',
      estimatedDuration: 300
    };

    expect(topic.id).toBe('test-topic-1');
    expect(topic.difficulty).toBe('beginner');
  });

  it('should create a valid Concept interface', () => {
    const concept: Concept = {
      id: 'concept-1',
      name: 'HTTP Request',
      type: 'logical',
      visualizationType: 'manim',
      relationships: [],
      metadata: {
        complexity: 'simple',
        visualElements: ['diagram', 'flow'],
        keywords: ['http', 'request', 'protocol']
      }
    };

    expect(concept.type).toBe('logical');
    expect(concept.visualizationType).toBe('manim');
  });

  it('should create a valid AnimationConfiguration interface', () => {
    const config: AnimationConfiguration = {
      id: 'config-1',
      topicId: 'topic-1',
      technologies: [{
        type: 'remotion',
        version: '4.0.0',
        config: {}
      }],
      timeline: {
        totalDuration: 30,
        segments: [],
        transitions: []
      },
      styling: {
        theme: 'light',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745',
          background: '#ffffff',
          text: '#212529',
          error: '#dc3545',
          warning: '#ffc107',
          success: '#28a745'
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: {
            small: 12,
            medium: 16,
            large: 24,
            xlarge: 32
          },
          fontWeight: {
            normal: 400,
            bold: 700
          }
        },
        spacing: {
          small: 8,
          medium: 16,
          large: 24,
          xlarge: 32
        }
      },
      output: {
        format: 'mp4',
        resolution: { width: 1920, height: 1080 },
        aspectRatio: '16:9',
        quality: 'high',
        fps: 30
      }
    };

    expect(config.technologies[0].type).toBe('remotion');
    expect(config.output.aspectRatio).toBe('16:9');
  });

  it('should create a valid VideoOutput interface', () => {
    const videoOutput: VideoOutput = {
      id: 'video-1',
      sessionId: 'session-1',
      format: 'mp4',
      resolution: { width: 1920, height: 1080 },
      aspectRatio: '16:9',
      duration: 30,
      fileSize: 1024000,
      url: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      metadata: {
        generatedAt: new Date(),
        technologies: ['remotion', 'threejs'],
        topic: 'HTTP Basics',
        concepts: ['request', 'response'],
        renderTime: 45,
        quality: 'high'
      }
    };

    expect(videoOutput.format).toBe('mp4');
    expect(videoOutput.metadata.technologies).toContain('remotion');
  });

  it('should create a valid VideoMetadata interface', () => {
    const metadata: VideoMetadata = {
      generatedAt: new Date(),
      technologies: ['remotion'],
      topic: 'Test Topic',
      concepts: ['concept1'],
      renderTime: 30,
      quality: 'standard'
    };

    expect(metadata.quality).toBe('standard');
    expect(metadata.technologies).toContain('remotion');
  });
});

describe('Service Interfaces', () => {
  it('should define RemotionService interface correctly', () => {
    // This test validates that the interface structure is correct
    // by checking if we can assign function types to it
    const mockRemotionService: Partial<RemotionService> = {
      createComposition: async (_plan) => ({
        id: 'comp-1',
        name: 'test',
        durationInFrames: 900,
        fps: 30,
        width: 1920,
        height: 1080,
        components: [],
        props: {}
      })
    };

    expect(typeof mockRemotionService.createComposition).toBe('function');
  });

  it('should define ThreeJSService interface correctly', () => {
    const mockThreeJSService: Partial<ThreeJSService> = {
      validateWebGLSupport: () => true
    };

    expect(typeof mockThreeJSService.validateWebGLSupport).toBe('function');
  });

  it('should define ManimService interface correctly', () => {
    const mockManimService: Partial<ManimService> = {
      validatePythonEnvironment: async () => true
    };

    expect(typeof mockManimService.validatePythonEnvironment).toBe('function');
  });
});

describe('Error Handling Types', () => {
  it('should create a valid SystemError interface', () => {
    const error: SystemError = {
      id: 'error-1',
      type: 'rendering',
      severity: 'high',
      message: 'Rendering failed',
      details: { reason: 'Out of memory' },
      timestamp: new Date()
    };

    expect(error.type).toBe('rendering');
    expect(error.severity).toBe('high');
  });

  it('should create a valid ErrorClassification interface', () => {
    const classification: ErrorClassification = {
      severity: 'medium',
      category: 'processing',
      recoverable: true,
      suggestedActions: ['retry', 'reduce quality']
    };

    expect(classification.recoverable).toBe(true);
    expect(classification.suggestedActions).toContain('retry');
  });

  it('should create a valid RecoveryResult interface', () => {
    const result: RecoveryResult = {
      success: true,
      action: 'retry',
      fallbackUsed: false,
      message: 'Recovery successful'
    };

    expect(result.success).toBe(true);
    expect(result.fallbackUsed).toBe(false);
  });
});