import { Composition } from 'remotion';
import { EducationalVideoComposition } from './compositions/EducationalVideoComposition';
import { ShowcaseComposition } from './compositions/ShowcaseComposition';
import { 
  EDUCATIONAL_VIDEO_CONFIG,
  ASPECT_RATIOS,
  VIDEO_DURATIONS 
} from './config/videoConfig';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Compositions for YouTube, desktop */}
      <Composition
        id="educational-video-16-9"
        component={EducationalVideoComposition}
        durationInFrames={VIDEO_DURATIONS.STANDARD}
        fps={EDUCATIONAL_VIDEO_CONFIG.fps}
        width={ASPECT_RATIOS['16:9'].width}
        height={ASPECT_RATIOS['16:9'].height}
        defaultProps={{
          aspectRatio: '16:9',
          topic: 'How HTTP Works',
          concepts: ['client', 'server', 'request', 'response'],
          animationType: 'hybrid'
        }}
      />
      
      {/* 9:16 Compositions for mobile, Instagram Stories, TikTok */}
      <Composition
        id="educational-video-9-16"
        component={EducationalVideoComposition}
        durationInFrames={VIDEO_DURATIONS.SHORT}
        fps={EDUCATIONAL_VIDEO_CONFIG.fps}
        width={ASPECT_RATIOS['9:16'].width}
        height={ASPECT_RATIOS['9:16'].height}
        defaultProps={{
          aspectRatio: '9:16',
          topic: 'Frontend vs Backend',
          concepts: ['frontend', 'backend', 'api', 'database'],
          animationType: 'remotion'
        }}
      />
      
      {/* 1:1 Compositions for Instagram posts, social media */}
      <Composition
        id="educational-video-1-1"
        component={EducationalVideoComposition}
        durationInFrames={VIDEO_DURATIONS.SHORT}
        fps={EDUCATIONAL_VIDEO_CONFIG.fps}
        width={ASPECT_RATIOS['1:1'].width}
        height={ASPECT_RATIOS['1:1'].height}
        defaultProps={{
          aspectRatio: '1:1',
          topic: 'What is DNS?',
          concepts: ['domain', 'dns', 'resolution', 'ip'],
          animationType: 'manim'
        }}
      />
      
      {/* Showcase Compositions */}
      <Composition
        id="showcase-default-16-9"
        component={ShowcaseComposition}
        durationInFrames={VIDEO_DURATIONS.STANDARD}
        fps={EDUCATIONAL_VIDEO_CONFIG.fps}
        width={ASPECT_RATIOS['16:9'].width}
        height={ASPECT_RATIOS['16:9'].height}
        defaultProps={{
          aspectRatio: '16:9',
          theme: 'default'
        }}
      />
      
      <Composition
        id="showcase-dark-9-16"
        component={ShowcaseComposition}
        durationInFrames={VIDEO_DURATIONS.STANDARD}
        fps={EDUCATIONAL_VIDEO_CONFIG.fps}
        width={ASPECT_RATIOS['9:16'].width}
        height={ASPECT_RATIOS['9:16'].height}
        defaultProps={{
          aspectRatio: '9:16',
          theme: 'dark'
        }}
      />
      
      <Composition
        id="showcase-educational-1-1"
        component={ShowcaseComposition}
        durationInFrames={VIDEO_DURATIONS.STANDARD}
        fps={EDUCATIONAL_VIDEO_CONFIG.fps}
        width={ASPECT_RATIOS['1:1'].width}
        height={ASPECT_RATIOS['1:1'].height}
        defaultProps={{
          aspectRatio: '1:1',
          theme: 'educational'
        }}
      />
    </>
  );
};