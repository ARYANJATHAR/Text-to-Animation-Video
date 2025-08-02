import { 
  TopicAnalysis, 
  Concept, 
  Entity, 
  AnimationType,
  AnimationPlan,
  HybridAnimationPlan,
  IntegrationStrategy,
  SynchronizationPoint,
  LayerComposition
} from 'shared-types';

export interface ClassificationRule {
  id: string;
  name: string;
  priority: number;
  conditions: ClassificationCondition[];
  result: AnimationType;
  confidence: number;
}

export interface ClassificationCondition {
  field: 'concept_type' | 'concept_name' | 'entity_type' | 'complexity' | 'concept_count';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_array';
  value: any;
  weight: number;
}

export interface ClassificationResult {
  primaryType: AnimationType;
  secondaryTypes: AnimationType[];
  confidence: number;
  reasoning: string[];
  isHybrid: boolean;
  rules: ClassificationRule[];
}

export class AnimationClassifierService {
  private classificationRules: ClassificationRule[];

  constructor() {
    this.classificationRules = this.initializeClassificationRules();
  }

  /**
   * Classify animation types needed based on topic analysis
   */
  classifyAnimationTypes(analysis: TopicAnalysis): ClassificationResult {
    const applicableRules = this.evaluateRules(analysis);
    const typeScores = this.calculateTypeScores(applicableRules);
    
    const primaryType = this.selectPrimaryType(typeScores);
    const secondaryTypes = this.selectSecondaryTypes(typeScores, primaryType);
    const isHybrid = this.determineIfHybrid(typeScores, analysis);
    
    const confidence = this.calculateOverallConfidence(typeScores, primaryType);
    const reasoning = this.generateReasoning(applicableRules, analysis);

    return {
      primaryType,
      secondaryTypes,
      confidence,
      reasoning,
      isHybrid,
      rules: applicableRules
    };
  }

  /**
   * Create detailed animation plan with hybrid support
   */
  createAnimationPlan(analysis: TopicAnalysis, classification: ClassificationResult): AnimationPlan | HybridAnimationPlan {
    if (classification.isHybrid) {
      return this.createHybridAnimationPlan(analysis, classification);
    } else {
      return this.createStandardAnimationPlan(analysis, classification);
    }
  }

  /**
   * Evaluate which concepts require which animation technologies
   */
  evaluateConceptVisualization(concepts: Concept[]): Map<string, AnimationType[]> {
    const conceptVisualization = new Map<string, AnimationType[]>();

    concepts.forEach(concept => {
      const visualizationTypes = this.determineConceptVisualization(concept);
      conceptVisualization.set(concept.id, visualizationTypes);
    });

    return conceptVisualization;
  }

  /**
   * Generate decision tree explanation for classification
   */
  generateDecisionTree(analysis: TopicAnalysis): DecisionTreeNode {
    const rootNode: DecisionTreeNode = {
      id: 'root',
      condition: 'Start Classification',
      result: null,
      confidence: 1.0,
      children: []
    };

    // Build decision tree based on analysis
    this.buildDecisionTreeRecursive(rootNode, analysis, this.classificationRules);
    
    return rootNode;
  }

  private initializeClassificationRules(): ClassificationRule[] {
    return [
      // Three.js Rules (3D Spatial Concepts)
      {
        id: 'threejs_3d_infrastructure',
        name: '3D Infrastructure Visualization',
        priority: 10,
        conditions: [
          {
            field: 'concept_type',
            operator: 'equals',
            value: 'spatial',
            weight: 0.8
          },
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['server', 'client', 'database', 'network', 'architecture', 'infrastructure', 'topology'],
            weight: 0.9
          }
        ],
        result: 'threejs',
        confidence: 0.9
      },
      {
        id: 'threejs_client_server',
        name: 'Client-Server Model',
        priority: 9,
        conditions: [
          {
            field: 'concept_name',
            operator: 'contains',
            value: 'client-server',
            weight: 1.0
          }
        ],
        result: 'threejs',
        confidence: 0.95
      },
      {
        id: 'threejs_distributed_systems',
        name: 'Distributed Systems',
        priority: 8,
        conditions: [
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['microservices', 'distributed', 'cloud', 'containers', 'kubernetes'],
            weight: 0.85
          }
        ],
        result: 'threejs',
        confidence: 0.8
      },

      // Manim Rules (Logical Flows and Processes)
      {
        id: 'manim_http_flow',
        name: 'HTTP Request/Response Flow',
        priority: 10,
        conditions: [
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['http', 'request', 'response', 'protocol'],
            weight: 0.9
          },
          {
            field: 'concept_type',
            operator: 'equals',
            value: 'logical',
            weight: 0.8
          }
        ],
        result: 'manim',
        confidence: 0.9
      },
      {
        id: 'manim_dns_resolution',
        name: 'DNS Resolution Process',
        priority: 9,
        conditions: [
          {
            field: 'concept_name',
            operator: 'contains',
            value: 'dns',
            weight: 1.0
          }
        ],
        result: 'manim',
        confidence: 0.95
      },
      {
        id: 'manim_algorithms',
        name: 'Algorithms and Data Structures',
        priority: 8,
        conditions: [
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['algorithm', 'data structure', 'sorting', 'searching', 'tree', 'graph'],
            weight: 0.9
          }
        ],
        result: 'manim',
        confidence: 0.85
      },
      {
        id: 'manim_authentication_flow',
        name: 'Authentication Flows',
        priority: 7,
        conditions: [
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['authentication', 'authorization', 'oauth', 'jwt', 'session'],
            weight: 0.8
          }
        ],
        result: 'manim',
        confidence: 0.8
      },

      // Remotion Rules (Motion Graphics and Composition)
      {
        id: 'remotion_ui_animations',
        name: 'UI Animations and Transitions',
        priority: 6,
        conditions: [
          {
            field: 'concept_type',
            operator: 'equals',
            value: 'temporal',
            weight: 0.9
          },
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['animation', 'transition', 'loading', 'progress'],
            weight: 0.8
          }
        ],
        result: 'remotion',
        confidence: 0.8
      },
      {
        id: 'remotion_frontend_concepts',
        name: 'Frontend Development Concepts',
        priority: 5,
        conditions: [
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['frontend', 'react', 'vue', 'angular', 'component', 'state'],
            weight: 0.7
          }
        ],
        result: 'remotion',
        confidence: 0.7
      },

      // Hybrid Detection Rules
      {
        id: 'hybrid_fullstack',
        name: 'Full-Stack Application',
        priority: 12,
        conditions: [
          {
            field: 'concept_count',
            operator: 'greater_than',
            value: 5,
            weight: 0.6
          },
          {
            field: 'complexity',
            operator: 'equals',
            value: 'complex',
            weight: 0.8
          }
        ],
        result: 'hybrid',
        confidence: 0.8
      },
      {
        id: 'hybrid_web_architecture',
        name: 'Complete Web Architecture',
        priority: 11,
        conditions: [
          {
            field: 'concept_name',
            operator: 'in_array',
            value: ['fullstack', 'full-stack', 'end-to-end', 'complete'],
            weight: 0.9
          }
        ],
        result: 'hybrid',
        confidence: 0.85
      }
    ];
  }

  private evaluateRules(analysis: TopicAnalysis): ClassificationRule[] {
    const applicableRules: ClassificationRule[] = [];

    for (const rule of this.classificationRules) {
      const ruleScore = this.evaluateRule(rule, analysis);
      if (ruleScore > 0.3) { // Threshold for rule applicability
        applicableRules.push({
          ...rule,
          confidence: ruleScore
        });
      }
    }

    return applicableRules.sort((a, b) => b.confidence - a.confidence);
  }

  private evaluateRule(rule: ClassificationRule, analysis: TopicAnalysis): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const condition of rule.conditions) {
      const conditionScore = this.evaluateCondition(condition, analysis);
      totalScore += conditionScore * condition.weight;
      totalWeight += condition.weight;
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * rule.confidence : 0;
  }

  private evaluateCondition(condition: ClassificationCondition, analysis: TopicAnalysis): number {
    switch (condition.field) {
      case 'concept_type':
        return this.evaluateConceptTypeCondition(condition, analysis.concepts);
      
      case 'concept_name':
        return this.evaluateConceptNameCondition(condition, analysis.concepts);
      
      case 'entity_type':
        return this.evaluateEntityTypeCondition(condition, analysis.entities);
      
      case 'complexity':
        return condition.operator === 'equals' && analysis.complexity === condition.value ? 1.0 : 0.0;
      
      case 'concept_count':
        return this.evaluateNumericCondition(condition, analysis.concepts.length);
      
      default:
        return 0.0;
    }
  }

  private evaluateConceptTypeCondition(condition: ClassificationCondition, concepts: Concept[]): number {
    const matchingConcepts = concepts.filter(concept => {
      switch (condition.operator) {
        case 'equals':
          return concept.type === condition.value;
        case 'in_array':
          return condition.value.includes(concept.type);
        default:
          return false;
      }
    });

    return concepts.length > 0 ? matchingConcepts.length / concepts.length : 0;
  }

  private evaluateConceptNameCondition(condition: ClassificationCondition, concepts: Concept[]): number {
    const matchingConcepts = concepts.filter(concept => {
      const conceptName = concept.name.toLowerCase();
      
      switch (condition.operator) {
        case 'equals':
          return conceptName === condition.value.toLowerCase();
        case 'contains':
          return conceptName.includes(condition.value.toLowerCase());
        case 'in_array':
          return condition.value.some((val: string) => conceptName.includes(val.toLowerCase()));
        default:
          return false;
      }
    });

    return concepts.length > 0 ? matchingConcepts.length / concepts.length : 0;
  }

  private evaluateEntityTypeCondition(condition: ClassificationCondition, entities: Entity[]): number {
    const matchingEntities = entities.filter(entity => {
      switch (condition.operator) {
        case 'equals':
          return entity.type === condition.value;
        case 'in_array':
          return condition.value.includes(entity.type);
        default:
          return false;
      }
    });

    return entities.length > 0 ? matchingEntities.length / entities.length : 0;
  }

  private evaluateNumericCondition(condition: ClassificationCondition, value: number): number {
    switch (condition.operator) {
      case 'greater_than':
        return value > condition.value ? 1.0 : 0.0;
      case 'less_than':
        return value < condition.value ? 1.0 : 0.0;
      case 'equals':
        return value === condition.value ? 1.0 : 0.0;
      default:
        return 0.0;
    }
  }

  private calculateTypeScores(rules: ClassificationRule[]): Map<AnimationType, number> {
    const typeScores = new Map<AnimationType, number>();

    for (const rule of rules) {
      const currentScore = typeScores.get(rule.result) || 0;
      typeScores.set(rule.result, currentScore + rule.confidence);
    }

    return typeScores;
  }

  private selectPrimaryType(typeScores: Map<AnimationType, number>): AnimationType {
    let maxScore = 0;
    let primaryType: AnimationType = 'remotion'; // Default fallback

    for (const [type, score] of typeScores.entries()) {
      if (type !== 'hybrid' && score > maxScore) {
        maxScore = score;
        primaryType = type;
      }
    }

    return primaryType;
  }

  private selectSecondaryTypes(typeScores: Map<AnimationType, number>, primaryType: AnimationType): AnimationType[] {
    const secondaryTypes: AnimationType[] = [];
    const primaryScore = typeScores.get(primaryType) || 0;

    for (const [type, score] of typeScores.entries()) {
      if (type !== primaryType && type !== 'hybrid' && score > primaryScore * 0.5) {
        secondaryTypes.push(type);
      }
    }

    return secondaryTypes.sort((a, b) => (typeScores.get(b) || 0) - (typeScores.get(a) || 0));
  }

  private determineIfHybrid(typeScores: Map<AnimationType, number>, analysis: TopicAnalysis): boolean {
    const hybridScore = typeScores.get('hybrid') || 0;
    const nonHybridTypes = Array.from(typeScores.keys()).filter(type => type !== 'hybrid');
    
    // Hybrid if explicitly scored as hybrid or multiple high-scoring types
    return hybridScore > 0.5 || (nonHybridTypes.length >= 2 && analysis.complexity === 'complex');
  }

  private calculateOverallConfidence(typeScores: Map<AnimationType, number>, primaryType: AnimationType): number {
    const primaryScore = typeScores.get(primaryType) || 0;
    const totalScore = Array.from(typeScores.values()).reduce((sum, score) => sum + score, 0);
    
    return totalScore > 0 ? Math.min(0.95, primaryScore / totalScore) : 0.5;
  }

  private generateReasoning(rules: ClassificationRule[], analysis: TopicAnalysis): string[] {
    const reasoning: string[] = [];

    // Add top 3 most confident rules as reasoning
    const topRules = rules.slice(0, 3);
    
    for (const rule of topRules) {
      reasoning.push(`${rule.name}: ${(rule.confidence * 100).toFixed(1)}% confidence`);
    }

    // Add complexity-based reasoning
    reasoning.push(`Topic complexity: ${analysis.complexity} (${analysis.concepts.length} concepts identified)`);

    return reasoning;
  }

  private determineConceptVisualization(concept: Concept): AnimationType[] {
    const visualizationTypes: AnimationType[] = [];

    // Always include the primary visualization type
    visualizationTypes.push(concept.visualizationType);

    // Add additional types based on concept characteristics
    if (concept.type === 'spatial' && concept.visualizationType !== 'threejs') {
      visualizationTypes.push('threejs');
    }

    if (concept.type === 'logical' && concept.visualizationType !== 'manim') {
      visualizationTypes.push('manim');
    }

    // Always include Remotion for composition
    if (!visualizationTypes.includes('remotion')) {
      visualizationTypes.push('remotion');
    }

    return visualizationTypes;
  }

  private createStandardAnimationPlan(_analysis: TopicAnalysis, classification: ClassificationResult): AnimationPlan {
    return {
      primaryTechnology: classification.primaryType === 'hybrid' ? 'remotion' : classification.primaryType,
      secondaryTechnologies: classification.secondaryTypes,
      timeline: [], // Will be populated by orchestrator
      compositionStrategy: {
        type: classification.secondaryTypes.length > 0 ? 'layered' : 'sequential',
        blendMode: 'normal',
        transitions: ['fade', 'slide']
      }
    };
  }

  private createHybridAnimationPlan(analysis: TopicAnalysis, classification: ClassificationResult): HybridAnimationPlan {
    const baseplan = this.createStandardAnimationPlan(analysis, classification);
    
    return {
      ...baseplan,
      integrationStrategy: this.createIntegrationStrategy(analysis, classification),
      synchronizationPoints: this.createSynchronizationPoints(analysis),
      layerComposition: this.createLayerComposition(analysis, classification)
    };
  }

  private createIntegrationStrategy(analysis: TopicAnalysis, classification: ClassificationResult): IntegrationStrategy {
    const hasThreeJS = classification.secondaryTypes.includes('threejs') || classification.primaryType === 'threejs';
    const hasManim = classification.secondaryTypes.includes('manim') || classification.primaryType === 'manim';

    return {
      type: hasThreeJS && hasManim ? 'mixed' : 'layered',
      transitionStyle: analysis.complexity === 'complex' ? 'smooth' : 'fade',
      timingMode: 'synchronized'
    };
  }

  private createSynchronizationPoints(analysis: TopicAnalysis): SynchronizationPoint[] {
    const syncPoints: SynchronizationPoint[] = [];
    
    // Create sync points based on concept relationships
    analysis.relationships.forEach((relationship, index) => {
      if (relationship.confidence > 0.7) {
        syncPoints.push({
          id: `sync_${index}`,
          timestamp: index * 2, // Spread out over time
          services: ['remotion', 'threejs', 'manim'],
          event: `transition_${relationship.type}`,
          properties: {
            sourceId: relationship.sourceId,
            targetId: relationship.targetId,
            type: relationship.type
          }
        });
      }
    });

    return syncPoints;
  }

  private createLayerComposition(_analysis: TopicAnalysis, classification: ClassificationResult): LayerComposition[] {
    const layers: LayerComposition[] = [];
    let layerIndex = 0;

    // Base Remotion layer (always present)
    layers.push({
      id: 'remotion_base',
      layerIndex: layerIndex++,
      service: 'remotion',
      blendMode: 'normal',
      opacity: 1.0,
      startTime: 0,
      duration: 30 // Default duration
    });

    // Three.js layer for 3D content
    if (classification.secondaryTypes.includes('threejs') || classification.primaryType === 'threejs') {
      layers.push({
        id: 'threejs_3d',
        layerIndex: layerIndex++,
        service: 'threejs',
        blendMode: 'normal',
        opacity: 0.9,
        startTime: 2,
        duration: 20
      });
    }

    // Manim layer for diagrams
    if (classification.secondaryTypes.includes('manim') || classification.primaryType === 'manim') {
      layers.push({
        id: 'manim_diagrams',
        layerIndex: layerIndex++,
        service: 'manim',
        blendMode: 'multiply',
        opacity: 0.8,
        startTime: 5,
        duration: 15
      });
    }

    return layers;
  }

  private buildDecisionTreeRecursive(node: DecisionTreeNode, analysis: TopicAnalysis, rules: ClassificationRule[]): void {
    // This is a simplified decision tree builder
    // In a real implementation, this would be more sophisticated
    
    if (rules.length === 0) return;

    const topRule = rules[0];
    const childNode: DecisionTreeNode = {
      id: topRule.id,
      condition: topRule.name,
      result: topRule.result,
      confidence: topRule.confidence,
      children: []
    };

    node.children.push(childNode);

    // Recursively build for remaining rules (simplified)
    if (rules.length > 1) {
      this.buildDecisionTreeRecursive(childNode, analysis, rules.slice(1, 3)); // Limit depth
    }
  }
}

export interface DecisionTreeNode {
  id: string;
  condition: string;
  result: AnimationType | null;
  confidence: number;
  children: DecisionTreeNode[];
}