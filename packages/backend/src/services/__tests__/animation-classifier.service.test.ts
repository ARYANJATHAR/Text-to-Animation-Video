import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationClassifierService, ClassificationResult } from '../animation-classifier.service.js';
import type { TopicAnalysis, Concept, HybridAnimationPlan } from 'shared-types';

describe('AnimationClassifierService', () => {
  let service: AnimationClassifierService;

  beforeEach(() => {
    service = new AnimationClassifierService();
  });

  describe('classifyAnimationTypes', () => {
    it('should classify Three.js for 3D spatial concepts', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'client-server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['architecture'] }
          },
          {
            id: 'concept2',
            name: 'database',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: ['3d_model'], keywords: ['storage'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'server', type: 'technology', confidence: 0.9 },
          { id: 'entity2', name: 'client', type: 'technology', confidence: 0.8 }
        ],
        relationships: [],
        complexity: 'moderate',
        visualElements: [
          { id: 'visual1', type: '3d_model', description: 'Server visualization', technology: 'threejs' }
        ]
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.primaryType).toBe('threejs');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.reasoning.some(r => r.includes('3D Infrastructure') || r.includes('Client-Server'))).toBe(true);
      expect(result.isHybrid).toBe(false);
    });

    it('should classify Manim for logical flow concepts', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'http',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['protocol'] }
          },
          {
            id: 'concept2',
            name: 'request',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: ['diagram'], keywords: ['flow'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'http', type: 'protocol', confidence: 0.95 }
        ],
        relationships: [
          { id: 'rel1', sourceId: 'concept1', targetId: 'concept2', type: 'leads_to', confidence: 0.8 }
        ],
        complexity: 'moderate',
        visualElements: [
          { id: 'visual1', type: 'diagram', description: 'HTTP flow diagram', technology: 'manim' }
        ]
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.primaryType).toBe('manim');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.reasoning.some(r => r.includes('HTTP') || r.includes('Flow'))).toBe(true);
      expect(result.isHybrid).toBe(false);
    });

    it('should classify Remotion for temporal/UI concepts', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'animation',
            type: 'temporal',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: ['animation'], keywords: ['transition'] }
          },
          {
            id: 'concept2',
            name: 'frontend',
            type: 'hierarchical',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['animation'], keywords: ['ui'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'react', type: 'technology', confidence: 0.9 }
        ],
        relationships: [],
        complexity: 'simple',
        visualElements: [
          { id: 'visual1', type: 'animation', description: 'UI animation', technology: 'remotion' }
        ]
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.primaryType).toBe('remotion');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.reasoning.some(r => r.includes('UI') || r.includes('Frontend'))).toBe(true);
      expect(result.isHybrid).toBe(false);
    });

    it('should identify hybrid approach for complex multi-technology topics', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'client-server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['architecture'] }
          },
          {
            id: 'concept2',
            name: 'http',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['protocol'] }
          },
          {
            id: 'concept3',
            name: 'animation',
            type: 'temporal',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: ['animation'], keywords: ['transition'] }
          },
          {
            id: 'concept4',
            name: 'database',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['storage'] }
          },
          {
            id: 'concept5',
            name: 'api',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['interface'] }
          },
          {
            id: 'concept6',
            name: 'fullstack',
            type: 'hierarchical',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'complex', visualElements: ['animation'], keywords: ['complete'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'server', type: 'technology', confidence: 0.9 },
          { id: 'entity2', name: 'client', type: 'technology', confidence: 0.8 },
          { id: 'entity3', name: 'http', type: 'protocol', confidence: 0.95 }
        ],
        relationships: [
          { id: 'rel1', sourceId: 'concept1', targetId: 'concept2', type: 'interacts_with', confidence: 0.8 },
          { id: 'rel2', sourceId: 'concept2', targetId: 'concept4', type: 'leads_to', confidence: 0.7 }
        ],
        complexity: 'complex',
        visualElements: [
          { id: 'visual1', type: '3d_model', description: 'Server visualization', technology: 'threejs' },
          { id: 'visual2', type: 'diagram', description: 'HTTP flow', technology: 'manim' },
          { id: 'visual3', type: 'animation', description: 'UI transitions', technology: 'remotion' }
        ]
      };

      const result = service.classifyAnimationTypes(analysis);

      // Should detect multiple technologies or hybrid approach
      expect(['threejs', 'manim', 'remotion']).toContain(result.primaryType);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.reasoning).toBeInstanceOf(Array);
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('should handle DNS resolution as Manim classification', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'dns',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['resolution'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'dns', type: 'protocol', confidence: 0.95 }
        ],
        relationships: [],
        complexity: 'moderate',
        visualElements: [
          { id: 'visual1', type: 'diagram', description: 'DNS resolution process', technology: 'manim' }
        ]
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.primaryType).toBe('manim');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.reasoning.some(r => r.includes('DNS'))).toBe(true);
    });

    it('should provide detailed reasoning for classification decisions', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'microservices',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'complex', visualElements: ['3d_model'], keywords: ['distributed'] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'complex',
        visualElements: []
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.reasoning).toBeInstanceOf(Array);
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.reasoning.some(reason => reason.includes('confidence'))).toBe(true);
      expect(result.reasoning.some(reason => reason.includes('complexity'))).toBe(true);
    });
  });

  describe('createAnimationPlan', () => {
    it('should create standard animation plan for single technology', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'frontend',
            type: 'temporal',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: ['animation'], keywords: ['ui'] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'simple',
        visualElements: []
      };

      const classification: ClassificationResult = {
        primaryType: 'remotion',
        secondaryTypes: [],
        confidence: 0.8,
        reasoning: ['UI Animations: 80% confidence'],
        isHybrid: false,
        rules: []
      };

      const plan = service.createAnimationPlan(analysis, classification);

      expect(plan.primaryTechnology).toBe('remotion');
      expect(plan.secondaryTechnologies).toHaveLength(0);
      expect(plan.compositionStrategy.type).toBe('sequential');
      expect('integrationStrategy' in plan).toBe(false); // Should be standard plan, not hybrid
    });

    it('should create hybrid animation plan for complex multi-technology topics', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'client-server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['architecture'] }
          },
          {
            id: 'concept2',
            name: 'http',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['protocol'] }
          }
        ],
        entities: [],
        relationships: [
          { id: 'rel1', sourceId: 'concept1', targetId: 'concept2', type: 'interacts_with', confidence: 0.8 }
        ],
        complexity: 'complex',
        visualElements: []
      };

      const classification: ClassificationResult = {
        primaryType: 'threejs',
        secondaryTypes: ['manim'],
        confidence: 0.75,
        reasoning: ['3D Infrastructure: 85% confidence', 'HTTP Flow: 80% confidence'],
        isHybrid: true,
        rules: []
      };

      const plan = service.createAnimationPlan(analysis, classification) as HybridAnimationPlan;

      expect(plan.primaryTechnology).toBe('threejs');
      expect(plan.secondaryTechnologies).toContain('manim');
      expect('integrationStrategy' in plan).toBe(true);
      expect('synchronizationPoints' in plan).toBe(true);
      expect('layerComposition' in plan).toBe(true);
      
      expect(['sequential', 'parallel', 'layered', 'mixed']).toContain(plan.integrationStrategy.type);
      expect(plan.synchronizationPoints).toBeInstanceOf(Array);
      expect(plan.layerComposition).toBeInstanceOf(Array);
      expect(plan.layerComposition.length).toBeGreaterThan(0);
    });

    it('should create appropriate synchronization points for hybrid plans', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['infrastructure'] }
          }
        ],
        entities: [],
        relationships: [
          { id: 'rel1', sourceId: 'concept1', targetId: 'concept1', type: 'interacts_with', confidence: 0.9 }
        ],
        complexity: 'complex',
        visualElements: []
      };

      const classification: ClassificationResult = {
        primaryType: 'threejs',
        secondaryTypes: ['manim', 'remotion'],
        confidence: 0.8,
        reasoning: ['Complex system'],
        isHybrid: true,
        rules: []
      };

      const plan = service.createAnimationPlan(analysis, classification) as HybridAnimationPlan;

      expect(plan.synchronizationPoints).toBeInstanceOf(Array);
      if (plan.synchronizationPoints.length > 0) {
        const syncPoint = plan.synchronizationPoints[0];
        expect(syncPoint).toHaveProperty('id');
        expect(syncPoint).toHaveProperty('timestamp');
        expect(syncPoint).toHaveProperty('services');
        expect(syncPoint).toHaveProperty('event');
        expect(syncPoint.services).toBeInstanceOf(Array);
      }
    });

    it('should create layer composition for hybrid plans', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'fullstack',
            type: 'hierarchical',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'complex', visualElements: ['animation'], keywords: ['complete'] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'complex',
        visualElements: []
      };

      const classification: ClassificationResult = {
        primaryType: 'remotion',
        secondaryTypes: ['threejs', 'manim'],
        confidence: 0.7,
        reasoning: ['Full-stack application'],
        isHybrid: true,
        rules: []
      };

      const plan = service.createAnimationPlan(analysis, classification) as HybridAnimationPlan;

      expect(plan.layerComposition).toBeInstanceOf(Array);
      expect(plan.layerComposition.length).toBeGreaterThan(0);
      
      // Should always have a Remotion base layer
      const remotionLayer = plan.layerComposition.find(layer => layer.service === 'remotion');
      expect(remotionLayer).toBeDefined();
      expect(remotionLayer?.layerIndex).toBe(0);
      expect(remotionLayer?.blendMode).toBe('normal');
      expect(remotionLayer?.opacity).toBe(1.0);
    });
  });

  describe('evaluateConceptVisualization', () => {
    it('should map concepts to appropriate visualization technologies', () => {
      const concepts: Concept[] = [
        {
          id: 'concept1',
          name: 'server',
          type: 'spatial',
          visualizationType: 'threejs',
          relationships: [],
          metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['infrastructure'] }
        },
        {
          id: 'concept2',
          name: 'http',
          type: 'logical',
          visualizationType: 'manim',
          relationships: [],
          metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['protocol'] }
        },
        {
          id: 'concept3',
          name: 'animation',
          type: 'temporal',
          visualizationType: 'remotion',
          relationships: [],
          metadata: { complexity: 'simple', visualElements: ['animation'], keywords: ['transition'] }
        }
      ];

      const result = service.evaluateConceptVisualization(concepts);

      expect(result.size).toBe(3);
      expect(result.get('concept1')).toContain('threejs');
      expect(result.get('concept2')).toContain('manim');
      expect(result.get('concept3')).toContain('remotion');
      
      // All concepts should include Remotion for composition
      result.forEach(types => {
        expect(types).toContain('remotion');
      });
    });

    it('should suggest additional visualization types for complex concepts', () => {
      const concepts: Concept[] = [
        {
          id: 'concept1',
          name: 'database',
          type: 'spatial',
          visualizationType: 'remotion', // Primary is Remotion but should suggest Three.js
          relationships: [],
          metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['storage'] }
        }
      ];

      const result = service.evaluateConceptVisualization(concepts);

      const visualizationTypes = result.get('concept1') || [];
      expect(visualizationTypes).toContain('remotion');
      expect(visualizationTypes).toContain('threejs'); // Should suggest Three.js for spatial concepts
    });
  });

  describe('generateDecisionTree', () => {
    it('should generate decision tree with root node', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'http',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['protocol'] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'moderate',
        visualElements: []
      };

      const tree = service.generateDecisionTree(analysis);

      expect(tree).toBeDefined();
      expect(tree.id).toBe('root');
      expect(tree.condition).toBe('Start Classification');
      expect(tree.result).toBeNull();
      expect(tree.confidence).toBe(1.0);
      expect(tree.children).toBeInstanceOf(Array);
    });

    it('should build decision tree with child nodes', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'client-server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['architecture'] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'moderate',
        visualElements: []
      };

      const tree = service.generateDecisionTree(analysis);

      expect(tree.children.length).toBeGreaterThan(0);
      if (tree.children.length > 0) {
        const firstChild = tree.children[0];
        expect(firstChild).toHaveProperty('id');
        expect(firstChild).toHaveProperty('condition');
        expect(firstChild).toHaveProperty('result');
        expect(firstChild).toHaveProperty('confidence');
        expect(firstChild).toHaveProperty('children');
      }
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty analysis gracefully', () => {
      const analysis: TopicAnalysis = {
        concepts: [],
        entities: [],
        relationships: [],
        complexity: 'simple',
        visualElements: []
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result).toBeDefined();
      expect(result.primaryType).toBe('remotion'); // Default fallback
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.isHybrid).toBe(false);
    });

    it('should handle analysis with only entities', () => {
      const analysis: TopicAnalysis = {
        concepts: [],
        entities: [
          { id: 'entity1', name: 'javascript', type: 'technology', confidence: 0.9 }
        ],
        relationships: [],
        complexity: 'simple',
        visualElements: []
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result).toBeDefined();
      expect(result.primaryType).toBe('remotion');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle concepts with unknown visualization types', () => {
      const concepts: Concept[] = [
        {
          id: 'concept1',
          name: 'unknown',
          type: 'hierarchical',
          visualizationType: 'remotion',
          relationships: [],
          metadata: { complexity: 'simple', visualElements: [], keywords: [] }
        }
      ];

      const result = service.evaluateConceptVisualization(concepts);

      expect(result.size).toBe(1);
      expect(result.get('concept1')).toContain('remotion');
    });

    it('should maintain reasonable confidence bounds', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'test',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: [], keywords: [] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'simple',
        visualElements: []
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Integration with real-world scenarios', () => {
    it('should classify full-stack web application correctly', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'fullstack',
            type: 'hierarchical',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'complex', visualElements: ['animation'], keywords: ['complete'] }
          },
          {
            id: 'concept2',
            name: 'client-server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['architecture'] }
          },
          {
            id: 'concept3',
            name: 'api',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['diagram'], keywords: ['interface'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'react', type: 'technology', confidence: 0.9 },
          { id: 'entity2', name: 'node', type: 'technology', confidence: 0.8 },
          { id: 'entity3', name: 'mongodb', type: 'technology', confidence: 0.7 }
        ],
        relationships: [
          { id: 'rel1', sourceId: 'concept2', targetId: 'concept3', type: 'interacts_with', confidence: 0.8 }
        ],
        complexity: 'complex',
        visualElements: [
          { id: 'visual1', type: '3d_model', description: 'Architecture', technology: 'threejs' },
          { id: 'visual2', type: 'diagram', description: 'API flow', technology: 'manim' },
          { id: 'visual3', type: 'animation', description: 'UI transitions', technology: 'remotion' }
        ]
      };

      const result = service.classifyAnimationTypes(analysis);

      // Should handle complex full-stack scenarios
      expect(['threejs', 'manim', 'remotion']).toContain(result.primaryType);
      expect(result.confidence).toBeGreaterThanOrEqual(0);

      const plan = service.createAnimationPlan(analysis, result);
      expect(plan).toBeDefined();
      expect(plan.primaryTechnology).toBeDefined();
      
      // Check if it's a hybrid plan
      if ('layerComposition' in plan) {
        const hybridPlan = plan as HybridAnimationPlan;
        expect(hybridPlan.layerComposition.length).toBeGreaterThan(0);
        expect(['sequential', 'parallel', 'layered', 'mixed']).toContain(hybridPlan.integrationStrategy.type);
      }
    });

    it('should handle microservices architecture classification', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'concept1',
            name: 'microservices',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'complex', visualElements: ['3d_model'], keywords: ['distributed'] }
          },
          {
            id: 'concept2',
            name: 'containers',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'moderate', visualElements: ['3d_model'], keywords: ['deployment'] }
          }
        ],
        entities: [
          { id: 'entity1', name: 'kubernetes', type: 'technology', confidence: 0.8 },
          { id: 'entity2', name: 'docker', type: 'technology', confidence: 0.9 }
        ],
        relationships: [],
        complexity: 'complex',
        visualElements: []
      };

      const result = service.classifyAnimationTypes(analysis);

      expect(result.primaryType).toBe('threejs');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.reasoning.some(reason => reason.includes('Distributed Systems'))).toBe(true);
    });
  });
});