export interface ManimAnimation {
  id: string
  name: string
  script: string
  duration: number
  resolution: [number, number]
  fps: number
}

export interface ManimSegment {
  id: string
  animationId: string
  startTime: number
  duration: number
  filePath: string
  metadata: {
    concepts: string[]
    diagramType: string
    complexity: 'simple' | 'moderate' | 'complex'
  }
}

export interface FlowData {
  id: string
  name: string
  steps: ProcessStep[]
  connections: FlowConnection[]
}

export interface ProcessStep {
  id: string
  name: string
  description: string
  type: 'start' | 'process' | 'decision' | 'end'
  position: [number, number]
}

export interface FlowConnection {
  id: string
  fromStepId: string
  toStepId: string
  label?: string
  type: 'normal' | 'conditional'
}

export interface ManimService {
  generateDiagram(flowData: FlowData): Promise<ManimAnimation>
  createProcessFlow(steps: ProcessStep[]): Promise<ManimAnimation>
  renderToVideo(animation: ManimAnimation): Promise<ManimSegment>
  exportForRemotionIntegration(): Promise<ManimSegment>
}

export class ManimServiceImpl implements ManimService {
  private readonly manimServiceUrl: string
  
  constructor() {
    this.manimServiceUrl = process.env.MANIM_SERVICE_URL || 'http://localhost:5001'
  }

  async generateDiagram(flowData: FlowData): Promise<ManimAnimation> {
    try {
      // Determine diagram type based on flow data
      const diagramType = this.determineDiagramType(flowData)
      
      let response: Response
      
      switch (diagramType) {
        case 'http-flow':
          response = await this.generateHttpFlowDiagram(flowData)
          break
        case 'dns-resolution':
          response = await this.generateDnsResolutionDiagram(flowData)
          break
        case 'process-flow':
        default:
          response = await this.generateProcessFlowDiagram(flowData)
          break
      }
      
      if (!response.ok) {
        throw new Error(`Manim service error: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      return {
        id: result.id,
        name: flowData.name,
        script: '', // Script is generated on Python service side
        duration: result.duration,
        resolution: result.resolution,
        fps: result.fps
      }
    } catch (error) {
      console.error('Error generating Manim diagram:', error)
      throw new Error(`Failed to generate Manim diagram: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createProcessFlow(steps: ProcessStep[]): Promise<ManimAnimation> {
    const flowData: FlowData = {
      id: `flow_${Date.now()}`,
      name: 'Process Flow',
      steps,
      connections: this.generateConnections(steps)
    }
    
    return this.generateDiagram(flowData)
  }

  async renderToVideo(animation: ManimAnimation): Promise<ManimSegment> {
    try {
      // Check status of animation
      const statusResponse = await fetch(`${this.manimServiceUrl}/status/${animation.id}`)
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check animation status: ${statusResponse.statusText}`)
      }
      
      const status = await statusResponse.json()
      
      if (status.status !== 'completed') {
        throw new Error(`Animation not ready: ${status.status}`)
      }
      
      return {
        id: `segment_${Date.now()}`,
        animationId: animation.id,
        startTime: 0,
        duration: animation.duration,
        filePath: status.file_path,
        metadata: {
          concepts: this.extractConcepts(animation.name),
          diagramType: this.getDiagramType(animation.name),
          complexity: this.assessComplexity(animation.name)
        }
      }
    } catch (error) {
      console.error('Error rendering Manim video:', error)
      throw new Error(`Failed to render Manim video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async exportForRemotionIntegration(animationId: string): Promise<ManimSegment> {
    return this.exportAnimationForRemotionIntegration(animationId)
  }

  /**
   * Export multiple animations for batch Remotion integration
   */
  async exportMultipleForRemotionIntegration(animationIds: string[]): Promise<ManimSegment[]> {
    const segments: ManimSegment[] = []
    const errors: string[] = []

    for (const animationId of animationIds) {
      try {
        const segment = await this.exportAnimationForRemotionIntegration(animationId)
        segments.push(segment)
      } catch (error) {
        console.error(`Failed to export animation ${animationId}:`, error)
        errors.push(`${animationId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (errors.length > 0) {
      console.warn(`Some animations failed to export: ${errors.join(', ')}`)
    }

    return segments
  }

  /**
   * Get integration metadata for multiple animations
   */
  async getIntegrationMetadata(animationIds: string[]): Promise<{
    animations: Array<{
      id: string
      status: string
      duration: number
      complexity: 'simple' | 'moderate' | 'complex'
      ready: boolean
    }>
    totalDuration: number
    overallComplexity: 'simple' | 'moderate' | 'complex'
  }> {
    const animations = []
    let totalDuration = 0

    for (const animationId of animationIds) {
      try {
        const statusResponse = await fetch(`${this.manimServiceUrl}/status/${animationId}`)
        
        if (statusResponse.ok) {
          const status = await statusResponse.json()
          const duration = status.duration || 10
          const complexity = this.assessComplexity(animationId)
          
          animations.push({
            id: animationId,
            status: status.status,
            duration,
            complexity,
            ready: status.status === 'completed'
          })
          
          if (status.status === 'completed') {
            totalDuration += duration
          }
        } else {
          animations.push({
            id: animationId,
            status: 'error',
            duration: 0,
            complexity: 'simple' as const,
            ready: false
          })
        }
      } catch (error) {
        animations.push({
          id: animationId,
          status: 'error',
          duration: 0,
          complexity: 'simple' as const,
          ready: false
        })
      }
    }

    // Calculate overall complexity
    const complexityScores = animations.map(a => {
      switch (a.complexity) {
        case 'simple': return 1
        case 'moderate': return 2
        case 'complex': return 3
        default: return 2
      }
    })
    
    const avgComplexity = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length
    const overallComplexity = avgComplexity <= 1.5 ? 'simple' : avgComplexity <= 2.5 ? 'moderate' : 'complex'

    return {
      animations,
      totalDuration,
      overallComplexity
    }
  }

  async exportAnimationForRemotionIntegration(animationId: string): Promise<ManimSegment> {
    try {
      // Get video file from Manim service
      const videoResponse = await fetch(`${this.manimServiceUrl}/video/${animationId}`)
      
      if (!videoResponse.ok) {
        throw new Error(`Failed to get video: ${videoResponse.statusText}`)
      }
      
      // Get status for metadata
      const statusResponse = await fetch(`${this.manimServiceUrl}/status/${animationId}`)
      const status = await statusResponse.json()
      
      return {
        id: `export_${Date.now()}`,
        animationId,
        startTime: 0,
        duration: status.duration || 10,
        filePath: status.file_path,
        metadata: {
          concepts: ['manim_export'],
          diagramType: 'exported',
          complexity: 'moderate'
        }
      }
    } catch (error) {
      console.error('Error exporting for Remotion integration:', error)
      throw new Error(`Failed to export for Remotion: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async generateHttpFlowDiagram(flowData: FlowData): Promise<Response> {
    const requestData = {
      title: flowData.name,
      steps: flowData.steps.map(step => ({
        description: step.description,
        direction: step.type === 'start' ? 'request' : 'response'
      }))
    }
    
    return fetch(`${this.manimServiceUrl}/generate/http-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
  }

  private async generateDnsResolutionDiagram(flowData: FlowData): Promise<Response> {
    const requestData = {
      domain: this.extractDomainFromFlow(flowData)
    }
    
    return fetch(`${this.manimServiceUrl}/generate/dns-resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
  }

  private async generateProcessFlowDiagram(flowData: FlowData): Promise<Response> {
    const requestData = {
      title: flowData.name,
      steps: flowData.steps.map(step => ({
        name: step.name,
        type: step.type,
        description: step.description
      }))
    }
    
    return fetch(`${this.manimServiceUrl}/generate/process-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
  }

  private determineDiagramType(flowData: FlowData): string {
    const name = flowData.name.toLowerCase()
    
    if (name.includes('http') || name.includes('request') || name.includes('api')) {
      return 'http-flow'
    }
    
    if (name.includes('dns') || name.includes('domain') || name.includes('resolution')) {
      return 'dns-resolution'
    }
    
    return 'process-flow'
  }

  private generateConnections(steps: ProcessStep[]): FlowConnection[] {
    const connections: FlowConnection[] = []
    
    for (let i = 0; i < steps.length - 1; i++) {
      connections.push({
        id: `conn_${i}`,
        fromStepId: steps[i].id,
        toStepId: steps[i + 1].id,
        type: steps[i].type === 'decision' ? 'conditional' : 'normal'
      })
    }
    
    return connections
  }

  private extractDomainFromFlow(flowData: FlowData): string {
    // Try to extract domain from flow data
    const domainStep = flowData.steps.find(step => 
      step.description.includes('.com') || 
      step.description.includes('.org') || 
      step.description.includes('.net')
    )
    
    if (domainStep) {
      const match = domainStep.description.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/)
      if (match) {
        return match[1]
      }
    }
    
    return 'example.com'
  }

  private extractConcepts(animationName: string): string[] {
    const concepts: string[] = []
    const name = animationName.toLowerCase()
    
    if (name.includes('http')) concepts.push('http', 'web_protocol')
    if (name.includes('dns')) concepts.push('dns', 'domain_resolution')
    if (name.includes('process')) concepts.push('process_flow', 'workflow')
    if (name.includes('data')) concepts.push('data_structure', 'algorithm')
    
    return concepts.length > 0 ? concepts : ['general_diagram']
  }

  private getDiagramType(animationName: string): string {
    const name = animationName.toLowerCase()
    
    if (name.includes('http')) return 'http_flow'
    if (name.includes('dns')) return 'dns_resolution'
    if (name.includes('data')) return 'data_structure'
    
    return 'process_flow'
  }

  private assessComplexity(animationName: string): 'simple' | 'moderate' | 'complex' {
    const name = animationName.toLowerCase()
    
    if (name.includes('complex') || name.includes('advanced')) return 'complex'
    if (name.includes('simple') || name.includes('basic')) return 'simple'
    
    return 'moderate'
  }
}