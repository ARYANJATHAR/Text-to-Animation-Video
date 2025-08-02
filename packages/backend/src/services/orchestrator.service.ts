import type { 
  GenerationRequest, 
  VideoOutput, 
  AnimationPlan,
  TopicAnalysis 
} from 'shared-types'
import { RemotionServiceImpl } from './remotion.service'
import { ThreeJSServiceImpl } from './threejs.service'
import { ManimServiceImpl } from './manim.service'

export interface ServiceOutputs {
  remotionComposition?: any
  threeJSScenes?: any[]
  manimSegments?: any[]
  audioTrack?: any
}

export interface VideoOrchestrator {
  processGenerationRequest(request: GenerationRequest): Promise<VideoOutput>
  coordinateServices(plan: AnimationPlan): Promise<ServiceOutputs>
  composeVideo(outputs: ServiceOutputs): Promise<VideoOutput>
  handleHybridGeneration(plan: any): Promise<VideoOutput>
}

export class VideoOrchestratorImpl implements VideoOrchestrator {
  private remotionService = new RemotionServiceImpl()
  private threeJSService = new ThreeJSServiceImpl()
  private manimService = new ManimServiceImpl()

  async processGenerationRequest(request: GenerationRequest): Promise<VideoOutput> {
    try {
      // Step 1: Analyze the topic (placeholder)
      const analysis = await this.analyzeTopic(request.topicInput)
      
      // Step 2: Create animation plan
      const plan = await this.createAnimationPlan(analysis)
      
      // Step 3: Coordinate services
      const outputs = await this.coordinateServices(plan)
      
      // Step 4: Compose final video
      const video = await this.composeVideo(outputs)
      
      return video
    } catch (error) {
      console.error('Video generation failed:', error)
      throw new Error('Failed to generate video')
    }
  }

  async coordinateServices(plan: AnimationPlan): Promise<ServiceOutputs> {
    const outputs: ServiceOutputs = {}

    try {
      // Always create Remotion composition as the main container
      outputs.remotionComposition = await this.remotionService.createComposition(plan)

      // Add Three.js scenes if needed
      if (plan.primaryTechnology === 'threejs' || plan.secondaryTechnologies.includes('threejs')) {
        const scene = await this.threeJSService.generateScene([])
        outputs.threeJSScenes = [scene]
      }

      // Add Manim segments if needed
      if (plan.primaryTechnology === 'manim' || plan.secondaryTechnologies.includes('manim')) {
        const segment = await this.manimService.exportForRemotionIntegration()
        outputs.manimSegments = [segment]
      }

      return outputs
    } catch (error) {
      console.error('Service coordination failed:', error)
      throw new Error('Failed to coordinate animation services')
    }
  }

  async composeVideo(outputs: ServiceOutputs): Promise<VideoOutput> {
    try {
      // Use Remotion as the main composition engine
      if (!outputs.remotionComposition) {
        throw new Error('No Remotion composition available')
      }

      // Integrate Three.js scenes if available
      if (outputs.threeJSScenes?.length) {
        for (const scene of outputs.threeJSScenes) {
          await this.remotionService.integrateThreeJSScene(scene)
        }
      }

      // Integrate Manim segments if available
      if (outputs.manimSegments?.length) {
        for (const segment of outputs.manimSegments) {
          await this.remotionService.integrateManimSegment(segment)
        }
      }

      // Render final video
      const video = await this.remotionService.renderVideo(outputs.remotionComposition)
      
      return video
    } catch (error) {
      console.error('Video composition failed:', error)
      throw new Error('Failed to compose final video')
    }
  }

  async handleHybridGeneration(_plan: any): Promise<VideoOutput> {
    // Placeholder for hybrid generation logic
    return this.processGenerationRequest({
      topicInput: 'Hybrid content',
      configuration: {}
    })
  }

  private async analyzeTopic(_topicInput: string): Promise<TopicAnalysis> {
    // Placeholder topic analysis
    return {
      concepts: [],
      entities: [],
      relationships: [],
      complexity: 'moderate',
      visualElements: []
    }
  }

  private async createAnimationPlan(_analysis: TopicAnalysis): Promise<AnimationPlan> {
    // Placeholder animation plan creation
    return {
      primaryTechnology: 'remotion',
      secondaryTechnologies: [],
      timeline: [],
      compositionStrategy: {
        type: 'sequential',
        blendMode: 'normal',
        transitions: ['fade']
      }
    }
  }
}