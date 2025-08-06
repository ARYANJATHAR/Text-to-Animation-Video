import type { VideoSegment, Resolution } from 'shared-types';

export interface VideoConversionOptions {
  targetFormat: 'mp4' | 'webm' | 'mov';
  targetResolution?: Resolution;
  quality: 'low' | 'medium' | 'high';
  fps?: number;
}

export interface VideoValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}

export interface VideoMetrics {
  duration: number;
  resolution: Resolution;
  fileSize: number;
  bitrate: number;
  fps: number;
  codec: string;
}

/**
 * Utility class for video file operations and format handling
 */
export class VideoUtils {
  private static readonly SUPPORTED_FORMATS = ['mp4', 'webm', 'mov'];
  private static readonly REMOTION_PREFERRED_CODECS = ['h264', 'vp9', 'prores'];

  /**
   * Validate video segment for Remotion compatibility
   */
  static validateVideoSegment(segment: VideoSegment): VideoValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check format
    if (!this.SUPPORTED_FORMATS.includes(segment.format)) {
      issues.push(`Unsupported format: ${segment.format}`);
      recommendations.push('Convert to MP4 or WebM format');
    }

    // Check resolution
    if (segment.resolution.width <= 0 || segment.resolution.height <= 0) {
      issues.push('Invalid resolution dimensions');
      recommendations.push('Ensure resolution has positive width and height values');
    }

    // Check aspect ratio compatibility
    const aspectRatio = segment.resolution.width / segment.resolution.height;
    if (aspectRatio < 0.5 || aspectRatio > 3.0) {
      recommendations.push('Unusual aspect ratio detected - consider standard ratios (16:9, 9:16, 1:1)');
    }

    // Check duration
    if (segment.duration <= 0) {
      issues.push('Invalid duration');
      recommendations.push('Duration must be greater than 0');
    }

    // Check file path
    if (!segment.filePath || segment.filePath.trim() === '') {
      issues.push('Missing file path');
      recommendations.push('Provide valid file path');
    }

    // Performance recommendations
    if (segment.resolution.width > 3840 || segment.resolution.height > 2160) {
      recommendations.push('Very high resolution detected - consider downscaling for better performance');
    }

    if (segment.duration > 300) { // 5 minutes
      recommendations.push('Long duration detected - consider splitting into smaller segments');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Get optimal video settings for Remotion rendering
   */
  static getOptimalSettings(
    segments: VideoSegment[],
    targetAspectRatio: '16:9' | '9:16' | '1:1' | '4:3'
  ): {
    resolution: Resolution;
    fps: number;
    codec: string;
    bitrate: number;
  } {
    // Analyze input segments
    const resolutions = segments.map(s => s.resolution);
    const maxWidth = Math.max(...resolutions.map(r => r.width));
    const maxHeight = Math.max(...resolutions.map(r => r.height));

    // Determine optimal resolution based on target aspect ratio
    let optimalResolution: Resolution;
    
    switch (targetAspectRatio) {
      case '16:9':
        optimalResolution = this.getClosestStandardResolution(maxWidth, maxHeight, 16/9);
        break;
      case '9:16':
        optimalResolution = this.getClosestStandardResolution(maxWidth, maxHeight, 9/16);
        break;
      case '1:1':
        optimalResolution = this.getClosestStandardResolution(maxWidth, maxHeight, 1);
        break;
      case '4:3':
        optimalResolution = this.getClosestStandardResolution(maxWidth, maxHeight, 4/3);
        break;
      default:
        optimalResolution = { width: maxWidth, height: maxHeight };
    }

    // Determine optimal FPS (common values: 24, 30, 60)
    const optimalFps = maxWidth >= 1920 ? 30 : 24;

    // Determine optimal codec
    const optimalCodec = 'h264'; // Most compatible

    // Calculate optimal bitrate based on resolution and fps
    const pixelCount = optimalResolution.width * optimalResolution.height;
    const baseBitrate = pixelCount * optimalFps * 0.1; // Base calculation
    const optimalBitrate = Math.min(Math.max(baseBitrate, 1000000), 50000000); // 1-50 Mbps range

    return {
      resolution: optimalResolution,
      fps: optimalFps,
      codec: optimalCodec,
      bitrate: optimalBitrate
    };
  }

  /**
   * Calculate video metrics from segment data
   */
  static calculateVideoMetrics(segments: VideoSegment[]): VideoMetrics {
    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
    
    // Find the most common resolution
    const resolutionCounts = new Map<string, { resolution: Resolution; count: number }>();
    segments.forEach(segment => {
      const key = `${segment.resolution.width}x${segment.resolution.height}`;
      const existing = resolutionCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        resolutionCounts.set(key, { resolution: segment.resolution, count: 1 });
      }
    });

    const mostCommonResolution = Array.from(resolutionCounts.values())
      .sort((a, b) => b.count - a.count)[0]?.resolution || { width: 1920, height: 1080 };

    // Estimate file size and bitrate (simplified calculation)
    const pixelCount = mostCommonResolution.width * mostCommonResolution.height;
    const estimatedBitrate = pixelCount * 30 * 0.1; // Rough estimate
    const estimatedFileSize = (estimatedBitrate * totalDuration) / 8; // Convert to bytes

    return {
      duration: totalDuration,
      resolution: mostCommonResolution,
      fileSize: estimatedFileSize,
      bitrate: estimatedBitrate,
      fps: 30, // Default assumption
      codec: 'h264' // Default assumption
    };
  }

  /**
   * Generate video processing recommendations
   */
  static generateProcessingRecommendations(segments: VideoSegment[]): {
    performance: string[];
    quality: string[];
    compatibility: string[];
  } {
    const performance: string[] = [];
    const quality: string[] = [];
    const compatibility: string[] = [];

    const metrics = this.calculateVideoMetrics(segments);
    const validation = segments.map(s => this.validateVideoSegment(s));

    // Performance recommendations
    if (segments.length > 10) {
      performance.push('Consider batching segments to reduce memory usage');
    }

    if (metrics.resolution.width > 2560 || metrics.resolution.height > 1440) {
      performance.push('High resolution detected - enable hardware acceleration if available');
    }

    if (metrics.duration > 600) { // 10 minutes
      performance.push('Long total duration - consider progressive rendering');
    }

    // Quality recommendations
    const hasLowQualitySegments = validation.some(v => 
      v.recommendations.some(r => r.includes('resolution'))
    );
    
    if (hasLowQualitySegments) {
      quality.push('Some segments have quality issues - consider upscaling or regeneration');
    }

    if (segments.some(s => s.duration < 1)) {
      quality.push('Very short segments detected - ensure smooth transitions');
    }

    // Compatibility recommendations
    const hasUnsupportedFormats = validation.some(v => 
      v.issues.some(i => i.includes('Unsupported format'))
    );

    if (hasUnsupportedFormats) {
      compatibility.push('Convert unsupported formats to MP4 or WebM');
    }

    const hasVariableResolutions = new Set(
      segments.map(s => `${s.resolution.width}x${s.resolution.height}`)
    ).size > 1;

    if (hasVariableResolutions) {
      compatibility.push('Multiple resolutions detected - normalize to single resolution');
    }

    return { performance, quality, compatibility };
  }

  /**
   * Create video segment from Manim output data
   */
  static createVideoSegmentFromManimOutput(
    animationId: string,
    manimOutput: {
      file_path: string;
      duration: number;
      resolution: [number, number];
      fps: number;
    }
  ): VideoSegment {
    return {
      id: animationId,
      filePath: manimOutput.file_path,
      duration: manimOutput.duration,
      resolution: {
        width: manimOutput.resolution[0],
        height: manimOutput.resolution[1]
      },
      format: this.getFormatFromFilePath(manimOutput.file_path),
      startTime: 0,
      endTime: manimOutput.duration
    };
  }

  /**
   * Estimate rendering time based on video complexity
   */
  static estimateRenderingTime(segments: VideoSegment[]): {
    estimatedSeconds: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let baseTime = 0;

    segments.forEach(segment => {
      // Base time calculation (simplified)
      const pixelCount = segment.resolution.width * segment.resolution.height;
      const complexityFactor = pixelCount / (1920 * 1080); // Relative to 1080p
      const segmentTime = segment.duration * complexityFactor * 2; // 2x realtime base
      
      baseTime += segmentTime;

      // Add complexity factors
      if (segment.resolution.width >= 3840) {
        factors.push('4K resolution increases render time');
      }
      
      if (segment.duration > 60) {
        factors.push('Long segments require more processing time');
      }
    });

    // Apply additional factors
    if (segments.length > 5) {
      baseTime *= 1.2; // 20% overhead for multiple segments
      factors.push('Multiple segments add coordination overhead');
    }

    return {
      estimatedSeconds: Math.ceil(baseTime),
      factors
    };
  }

  // Private helper methods

  private static getClosestStandardResolution(
    maxWidth: number,
    maxHeight: number,
    targetAspectRatio: number
  ): Resolution {
    const standardResolutions: Resolution[] = [
      { width: 1920, height: 1080 }, // 1080p
      { width: 1280, height: 720 },  // 720p
      { width: 3840, height: 2160 }, // 4K
      { width: 1080, height: 1920 }, // Vertical 1080p
      { width: 720, height: 1280 },  // Vertical 720p
      { width: 1080, height: 1080 }, // Square 1080p
      { width: 1024, height: 768 },  // 4:3 aspect ratio
    ];

    // Filter by aspect ratio tolerance
    const aspectRatioTolerance = 0.1;
    const compatibleResolutions = standardResolutions.filter(res => {
      const aspectRatio = res.width / res.height;
      return Math.abs(aspectRatio - targetAspectRatio) <= aspectRatioTolerance;
    });

    if (compatibleResolutions.length === 0) {
      // Fallback: create custom resolution with target aspect ratio
      const width = Math.min(maxWidth, 1920);
      const height = Math.round(width / targetAspectRatio);
      return { width, height };
    }

    // Find the resolution closest to the maximum dimensions
    return compatibleResolutions.reduce((best, current) => {
      const bestDistance = Math.abs(best.width - maxWidth) + Math.abs(best.height - maxHeight);
      const currentDistance = Math.abs(current.width - maxWidth) + Math.abs(current.height - maxHeight);
      
      return currentDistance < bestDistance ? current : best;
    });
  }

  private static getFormatFromFilePath(filePath: string): 'mp4' | 'webm' | 'mov' {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'mp4':
        return 'mp4';
      case 'webm':
        return 'webm';
      case 'mov':
        return 'mov';
      default:
        return 'mp4'; // Default fallback
    }
  }
}