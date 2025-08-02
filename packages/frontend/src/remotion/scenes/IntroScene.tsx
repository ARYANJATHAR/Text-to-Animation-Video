import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate,
  spring,
  useVideoConfig
} from 'remotion';
import { AspectRatio } from '../config/videoConfig';
import { AnimatedText, BackgroundPattern, BrandedFrame, ThemeProvider, defaultTheme } from '../components';

interface IntroSceneProps {
  topic: string;
  aspectRatio: AspectRatio;
  animationType: 'remotion' | 'threejs' | 'manim' | 'hybrid';
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  topic,
  aspectRatio,
  animationType
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Animation timing
  const titleSpring = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });
  
  const subtitleDelay = 20; // Start subtitle after 20 frames
  const subtitleSpring = spring({
    frame: frame - subtitleDelay,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });
  
  // Scale and opacity animations
  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  
  const subtitleScale = interpolate(subtitleSpring, [0, 1], [0.8, 1]);
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);
  
  // Responsive sizing based on aspect ratio
  const getTitleSize = () => {
    switch (aspectRatio) {
      case '9:16': return 'text-4xl md:text-5xl';
      case '1:1': return 'text-3xl md:text-4xl';
      default: return 'text-5xl md:text-6xl';
    }
  };
  
  const getSubtitleSize = () => {
    switch (aspectRatio) {
      case '9:16': return 'text-lg md:text-xl';
      case '1:1': return 'text-base md:text-lg';
      default: return 'text-xl md:text-2xl';
    }
  };
  
  return (
    <ThemeProvider theme={defaultTheme}>
      <BrandedFrame 
        aspectRatio={aspectRatio}
        theme="gradient"
        showLogo={true}
        showWatermark={false}
      >
        {/* Background Pattern */}
        <BackgroundPattern 
          type="gradient" 
          aspectRatio={aspectRatio}
          animationType={animationType}
        />
        
        {/* Content Container */}
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: aspectRatio === '9:16' ? '40px 20px' : '60px 40px',
            textAlign: 'center',
          }}
        >
        {/* Main Title */}
        <div
          style={{
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            marginBottom: aspectRatio === '9:16' ? '20px' : '30px',
          }}
        >
          <AnimatedText
            text={topic}
            className={`font-bold text-gray-900 leading-tight ${getTitleSize()}`}
            animationType="typewriter"
            delay={0}
          />
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            transform: `scale(${subtitleScale})`,
            opacity: subtitleOpacity,
            maxWidth: aspectRatio === '9:16' ? '90%' : '80%',
          }}
        >
          <AnimatedText
            text="An Educational Animation"
            className={`text-gray-600 font-medium ${getSubtitleSize()}`}
            animationType="fadeIn"
            delay={subtitleDelay}
          />
        </div>
        
        {/* Animation Type Indicator */}
        {frame > 40 && (
          <div
            style={{
              position: 'absolute',
              bottom: aspectRatio === '9:16' ? '40px' : '60px',
              right: aspectRatio === '9:16' ? '20px' : '40px',
              opacity: interpolate(frame, [40, 60], [0, 0.7]),
            }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600">
              {animationType.toUpperCase()}
            </div>
          </div>
        )}
        </AbsoluteFill>
      </BrandedFrame>
    </ThemeProvider>
  );
};