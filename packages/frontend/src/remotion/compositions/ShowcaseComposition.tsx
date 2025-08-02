import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  Sequence
} from 'remotion';
import { AspectRatio } from '../config/videoConfig';
import {
  AnimatedText,
  AnimatedIcon,
  CounterAnimation,
  ProgressBar,
  ParticleSystem,
  AnimatedButton,
  LoadingSpinner,
  BrandedFrame,
  ThemeProvider,
  defaultTheme,
  darkTheme,
  educationalTheme
} from '../components';

export interface ShowcaseCompositionProps {
  aspectRatio: AspectRatio;
  theme?: 'default' | 'dark' | 'educational';
}

export const ShowcaseComposition: React.FC<ShowcaseCompositionProps> = ({
  aspectRatio,
  theme = 'default'
}) => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  
  const getTheme = () => {
    switch (theme) {
      case 'dark': return darkTheme;
      case 'educational': return educationalTheme;
      default: return defaultTheme;
    }
  };
  
  const selectedTheme = getTheme();
  
  // Scene durations
  const scene1Duration = Math.floor(durationInFrames * 0.25); // 25%
  const scene2Duration = Math.floor(durationInFrames * 0.25); // 25%
  const scene3Duration = Math.floor(durationInFrames * 0.25); // 25%
  const scene4Duration = durationInFrames - scene1Duration - scene2Duration - scene3Duration; // Remaining
  
  return (
    <ThemeProvider theme={selectedTheme}>
      <BrandedFrame 
        aspectRatio={aspectRatio}
        theme={theme === 'dark' ? 'dark' : theme === 'educational' ? 'light' : 'gradient'}
        brandColor={selectedTheme.colors.primary}
        showLogo={true}
        showWatermark={true}
      >
        {/* Particle System Background */}
        <ParticleSystem
          particleCount={15}
          width={aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920}
          height={aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080}
          colors={[selectedTheme.colors.primary, selectedTheme.colors.secondary, selectedTheme.colors.accent]}
          particleSize={3}
          speed={1.5}
        />
        
        {/* Scene 1: Text Animations */}
        <Sequence from={0} durationInFrames={scene1Duration}>
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <AnimatedText
              text="Text Animation Showcase"
              className="text-4xl font-bold"
              animationType="typewriter"
              delay={0}
              style={{ color: selectedTheme.colors.text }}
            />
            
            <AnimatedText
              text="Fade In Effect"
              className="text-2xl"
              animationType="fadeIn"
              delay={60}
              style={{ color: selectedTheme.colors.textSecondary }}
            />
            
            <AnimatedText
              text="Slide Up Animation"
              className="text-2xl"
              animationType="slideUp"
              delay={90}
              style={{ color: selectedTheme.colors.textSecondary }}
            />
            
            <AnimatedText
              text="Scale Effect"
              className="text-2xl"
              animationType="scale"
              delay={120}
              style={{ color: selectedTheme.colors.textSecondary }}
            />
          </AbsoluteFill>
        </Sequence>
        
        {/* Scene 2: Icons and Counters */}
        <Sequence from={scene1Duration} durationInFrames={scene2Duration}>
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '30px',
            }}
          >
            <AnimatedText
              text="Icons & Counters"
              className="text-3xl font-bold mb-8"
              animationType="fadeIn"
              delay={0}
              style={{ color: selectedTheme.colors.text }}
            />
            
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <AnimatedIcon
                type="check"
                size={48}
                color={selectedTheme.colors.primary}
                animationType="bounce"
                delay={20}
              />
              
              <AnimatedIcon
                type="loading"
                size={48}
                color={selectedTheme.colors.secondary}
                animationType="rotate"
                delay={40}
              />
              
              <AnimatedIcon
                type="play"
                size={48}
                color={selectedTheme.colors.accent}
                animationType="pulse"
                delay={60}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <CounterAnimation
                  from={0}
                  to={100}
                  suffix="%"
                  className="text-4xl font-bold"
                  delay={80}
                  style={{ color: selectedTheme.colors.primary }}
                />
                <div style={{ color: selectedTheme.colors.textSecondary, marginTop: '8px' }}>
                  Progress
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <CounterAnimation
                  from={0}
                  to={1250}
                  prefix="$"
                  className="text-4xl font-bold"
                  delay={100}
                  style={{ color: selectedTheme.colors.secondary }}
                />
                <div style={{ color: selectedTheme.colors.textSecondary, marginTop: '8px' }}>
                  Revenue
                </div>
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>
        
        {/* Scene 3: Progress Bars and Buttons */}
        <Sequence from={scene1Duration + scene2Duration} durationInFrames={scene3Duration}>
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            <AnimatedText
              text="Interactive Elements"
              className="text-3xl font-bold"
              animationType="fadeIn"
              delay={0}
              style={{ color: selectedTheme.colors.text }}
            />
            
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ProgressBar
                progress={0.75}
                width={300}
                height={12}
                fillColor={selectedTheme.colors.primary}
                animationType="spring"
                delay={20}
                showPercentage={true}
              />
              
              <ProgressBar
                progress={0.45}
                width={300}
                height={12}
                fillColor={selectedTheme.colors.secondary}
                animationType="bounce"
                delay={40}
                showPercentage={true}
              />
              
              <ProgressBar
                progress={0.90}
                width={300}
                height={12}
                fillColor={selectedTheme.colors.accent}
                animationType="linear"
                delay={60}
                showPercentage={true}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <AnimatedButton
                text="Primary"
                variant="primary"
                animationType="bounce"
                delay={80}
              />
              
              <AnimatedButton
                text="Secondary"
                variant="secondary"
                animationType="slide"
                delay={100}
              />
              
              <AnimatedButton
                text="Outline"
                variant="outline"
                animationType="glow"
                delay={120}
              />
            </div>
          </AbsoluteFill>
        </Sequence>
        
        {/* Scene 4: Loading States */}
        <Sequence from={scene1Duration + scene2Duration + scene3Duration} durationInFrames={scene4Duration}>
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            <AnimatedText
              text="Loading States"
              className="text-3xl font-bold"
              animationType="fadeIn"
              delay={0}
              style={{ color: selectedTheme.colors.text }}
            />
            
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <LoadingSpinner
                size={40}
                color={selectedTheme.colors.primary}
                speed={1}
              />
              
              <LoadingSpinner
                size={60}
                color={selectedTheme.colors.secondary}
                thickness={6}
                speed={0.5}
              />
              
              <LoadingSpinner
                size={80}
                color={selectedTheme.colors.accent}
                thickness={8}
                speed={2}
              />
            </div>
            
            <AnimatedText
              text="Animation Components Ready!"
              className="text-2xl font-semibold"
              animationType="scale"
              delay={60}
              style={{ color: selectedTheme.colors.primary }}
            />
          </AbsoluteFill>
        </Sequence>
      </BrandedFrame>
    </ThemeProvider>
  );
};