// Three.js Components for Educational Visualizations
export { BaseScene } from './BaseScene';
export { SceneCamera } from './SceneCamera';
export { SceneLighting } from './SceneLighting';
export { LoadingFallback } from './LoadingFallback';
export { NetworkTopologyScene } from './NetworkTopologyScene';
export { ClientServerScene } from './ClientServerScene';

// Enhanced 3D visualization components
export {
  WebServerComponent,
  DatabaseComponent,
  CDNComponent,
  LoadBalancerComponent,
  APIGatewayComponent,
  CacheComponent,
  createInfrastructureComponent
} from './WebInfrastructureComponents';

export {
  DataFlowVisualization,
  InteractiveDataFlow,
  ProtocolFlowPatterns
} from './DataFlowVisualization';

export { EnhancedNetworkTopology } from './EnhancedNetworkTopology';

// Remotion Integration Components
export { RemotionThreeJSBridge } from './RemotionThreeJSBridge';
export { MultiSceneComposition, createSceneTransition, useSceneTransitions } from './MultiSceneComposition';
export { 
  TimelineSynchronizer, 
  useTimelineSync, 
  useSynchronizedAnimation, 
  useSynchronizedAnimations,
  useSynchronizationPoints,
  SynchronizationTrigger,
  createSynchronizedKeyframes,
  createStaggeredAnimations
} from './TimelineSynchronizer';

// Re-export service
export { ThreeJSService, threeJSService } from '../../services/ThreeJSService';