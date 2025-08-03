// Text and Animation Components
export { AnimatedText } from './text/AnimatedText';

// Transition Components
export { SceneTransition } from './transitions/SceneTransition';

// Motion Graphics Components
export { AnimatedIcon } from './motion/AnimatedIcon';
export { CounterAnimation } from './motion/CounterAnimation';
export { ProgressBar } from './motion/ProgressBar';
export { ParticleSystem } from './motion/ParticleSystem';

// Content Components
export { ConceptCard } from './content/ConceptCard';

// UI Components
export { ProgressIndicator } from './ui/ProgressIndicator';
export { AnimatedButton } from './ui/AnimatedButton';
export { LoadingSpinner } from './ui/LoadingSpinner';

// Background Components
export { BackgroundPattern } from './backgrounds/BackgroundPattern';

// Branding Components
export { BrandedFrame } from './branding/BrandedFrame';
export { ThemeProvider, useTheme, defaultTheme, darkTheme, educationalTheme } from './branding/ThemeProvider';
export type { Theme } from './branding/ThemeProvider';

// Three.js Components
export { 
  BaseScene, 
  SceneCamera, 
  SceneLighting, 
  LoadingFallback, 
  NetworkTopologyScene, 
  ClientServerScene,
  ThreeJSService,
  threeJSService 
} from './threejs';