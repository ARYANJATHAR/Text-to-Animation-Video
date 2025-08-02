export const EDUCATIONAL_VIDEO_CONFIG = {
  fps: 30,
  defaultDuration: 30, // seconds
  maxDuration: 60, // seconds
  minDuration: 15, // seconds
} as const;

export const ASPECT_RATIOS = {
  '16:9': { width: 1920, height: 1080 }, // YouTube, desktop
  '9:16': { width: 1080, height: 1920 }, // Instagram Stories, TikTok, mobile
  '1:1': { width: 1080, height: 1080 },  // Instagram posts, square format
} as const;

export const VIDEO_DURATIONS = {
  SHORT: EDUCATIONAL_VIDEO_CONFIG.fps * 15,  // 15 seconds
  STANDARD: EDUCATIONAL_VIDEO_CONFIG.fps * 30, // 30 seconds
  LONG: EDUCATIONAL_VIDEO_CONFIG.fps * 60,   // 60 seconds
} as const;

export const PLATFORM_CONFIGS = {
  youtube: {
    aspectRatio: '16:9' as const,
    duration: VIDEO_DURATIONS.LONG,
    quality: 'high' as const,
  },
  instagram: {
    aspectRatio: '1:1' as const,
    duration: VIDEO_DURATIONS.SHORT,
    quality: 'standard' as const,
  },
  tiktok: {
    aspectRatio: '9:16' as const,
    duration: VIDEO_DURATIONS.SHORT,
    quality: 'standard' as const,
  },
  custom: {
    aspectRatio: '16:9' as const,
    duration: VIDEO_DURATIONS.STANDARD,
    quality: 'standard' as const,
  },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;
export type Platform = keyof typeof PLATFORM_CONFIGS;
export type VideoQuality = 'draft' | 'standard' | 'high';