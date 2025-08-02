import { describe, it, expect, beforeEach } from 'vitest';
import { ContentAnalysisService } from '../content-analysis.service.js';
import type { TopicAnalysis } from 'shared-types';

describe('ContentAnalysisService', () => {
  let service: ContentAnalysisService;

  beforeEach(() => {
    service = new ContentAnalysisService();
  });

  describe('analyzeTopic', () => {
    it('should analyze a simple HTTP topic', async () => {
      const input = 'How HTTP works between client and server';
      const result = await service.analyzeTopic(input);

      expect(result).toBeDefined();
      expect(result.concepts.length).toBeGreaterThan(0);
      expect(result.entities.length).toBeGreaterThan(0);
      expect(['simple', 'moderate', 'complex']).toContain(result.complexity);
      expect(result.visualElements.length).toBeGreaterThan(0);
    });

    it('should identify HTTP-related concepts', async () => {
      const input = 'HTTP request response cycle with GET and POST methods';
      const result = await service.analyzeTopic(input);

      const conceptNames = result.concepts.map(c => c.name);
      expect(conceptNames).toContain('http');
      expect(conceptNames).toContain('request');
      expect(conceptNames).toContain('response');
    });

    it('should classify 3D spatial concepts correctly', async () => {
      const input = 'Client-server architecture with database and load balancer';
      const result = await service.analyzeTopic(input);

      const spatialConcepts = result.concepts.filter(c => c.type === 'spatial');
      expect(spatialConcepts.length).toBeGreaterThan(0);
      
      const threeJSConcepts = result.concepts.filter(c => c.visualizationType === 'threejs');
      expect(threeJSConcepts.length).toBeGreaterThan(0);
    });

    it('should identify logical flow concepts for Manim', async () => {
      const input = 'DNS resolution process and HTTP request flow';
      const result = await service.analyzeTopic(input);

      const logicalConcepts = result.concepts.filter(c => c.type === 'logical');
      expect(logicalConcepts.length).toBeGreaterThan(0);
      
      const manimConcepts = result.concepts.filter(c => c.visualizationType === 'manim');
      expect(manimConcepts.length).toBeGreaterThan(0);
    });

    it('should handle complex topics with multiple concept types', async () => {
      const input = 'Full-stack web application with React frontend, Node.js backend, PostgreSQL database, and REST API communication';
      const result = await service.analyzeTopic(input);

      expect(result.complexity).toBe('complex');
      expect(result.concepts.length).toBeGreaterThan(5);
      
      // Should have multiple visualization types
      const visualizationTypes = [...new Set(result.concepts.map(c => c.visualizationType))];
      expect(visualizationTypes.length).toBeGreaterThan(1);
    });

    it('should extract web development entities', async () => {
      const input = 'JavaScript React application with Express server and MongoDB database';
      const result = await service.analyzeTopic(input);

      const entityNames = result.entities.map(e => e.name);
      expect(entityNames).toContain('javascript');
      expect(entityNames).toContain('react');
      expect(entityNames).toContain('express');
      expect(entityNames).toContain('mongodb');
    });

    it('should identify relationships between concepts', async () => {
      const input = 'Client sends HTTP request to server which queries database';
      const result = await service.analyzeTopic(input);

      expect(result.relationships.length).toBeGreaterThan(0);
      
      // Should have relationships with reasonable confidence
      const highConfidenceRels = result.relationships.filter(r => r.confidence > 0.3);
      expect(highConfidenceRels.length).toBeGreaterThan(0);
    });
  });

  describe('extractConcepts', () => {
    it('should extract relevant web development concepts', async () => {
      const text = 'frontend backend API database server client';
      const concepts = await service.extractConcepts(text);

      expect(concepts.length).toBeGreaterThan(0);
      
      const conceptNames = concepts.map(c => c.name);
      expect(conceptNames).toContain('frontend');
      expect(conceptNames).toContain('backend');
      expect(conceptNames).toContain('database');
    });

    it('should filter out stop words and irrelevant terms', async () => {
      const text = 'the quick brown fox jumps over the lazy dog with HTTP server';
      const concepts = await service.extractConcepts(text);

      const conceptNames = concepts.map(c => c.name);
      expect(conceptNames).not.toContain('the');
      expect(conceptNames).not.toContain('quick');
      expect(conceptNames).not.toContain('brown');
      expect(conceptNames.some(name => name.includes('http'))).toBe(true);
      expect(conceptNames.some(name => name.includes('server'))).toBe(true);
    });

    it('should assign appropriate concept types', async () => {
      const text = 'client-server architecture with HTTP request flow and DNS resolution process';
      const concepts = await service.extractConcepts(text);

      const spatialConcepts = concepts.filter(c => c.type === 'spatial');
      const logicalConcepts = concepts.filter(c => c.type === 'logical');
      
      // Should have at least some concepts classified
      expect(concepts.length).toBeGreaterThan(0);
      expect(spatialConcepts.length + logicalConcepts.length).toBeGreaterThan(0);
    });

    it('should generate concept metadata', async () => {
      const text = 'HTTP server client database';
      const concepts = await service.extractConcepts(text);

      concepts.forEach(concept => {
        expect(concept.metadata).toBeDefined();
        expect(['simple', 'moderate', 'complex']).toContain(concept.metadata.complexity);
        expect(concept.metadata.visualElements).toBeInstanceOf(Array);
        expect(concept.metadata.keywords).toBeInstanceOf(Array);
      });
    });
  });

  describe('classifyAnimationType', () => {
    it('should always include Remotion as composition layer', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'test1',
            name: 'test',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: [], keywords: [] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'simple',
        visualElements: []
      };

      const result = service.classifyAnimationType(analysis);
      expect(result).toContain('remotion');
    });

    it('should identify Three.js needs for 3D concepts', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'test1',
            name: 'server',
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

      const result = service.classifyAnimationType(analysis);
      expect(result).toContain('threejs');
      expect(result).toContain('remotion');
    });

    it('should identify Manim needs for logical flows', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'test1',
            name: 'http',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: [], keywords: [] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'simple',
        visualElements: []
      };

      const result = service.classifyAnimationType(analysis);
      expect(result).toContain('manim');
      expect(result).toContain('remotion');
    });

    it('should identify hybrid needs for complex topics', () => {
      const analysis: TopicAnalysis = {
        concepts: [
          {
            id: 'test1',
            name: 'server',
            type: 'spatial',
            visualizationType: 'threejs',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: [], keywords: [] }
          },
          {
            id: 'test2',
            name: 'http',
            type: 'logical',
            visualizationType: 'manim',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: [], keywords: [] }
          },
          {
            id: 'test3',
            name: 'animation',
            type: 'temporal',
            visualizationType: 'remotion',
            relationships: [],
            metadata: { complexity: 'simple', visualElements: [], keywords: [] }
          }
        ],
        entities: [],
        relationships: [],
        complexity: 'complex',
        visualElements: []
      };

      const result = service.classifyAnimationType(analysis);
      expect(result).toContain('hybrid');
      expect(result).toContain('threejs');
      expect(result).toContain('manim');
      expect(result).toContain('remotion');
    });
  });

  describe('generateAnimationPlan', () => {
    it('should generate plan for single technology', async () => {
      const classification: ('remotion')[] = ['remotion'];
      const plan = await service.generateAnimationPlan(classification);

      expect(plan.primaryTechnology).toBe('remotion');
      expect(plan.secondaryTechnologies).toHaveLength(0);
      expect(plan.compositionStrategy.type).toBe('sequential');
    });

    it('should generate plan for hybrid approach', async () => {
      const classification: ('remotion' | 'threejs' | 'manim' | 'hybrid')[] = ['remotion', 'threejs', 'manim', 'hybrid'];
      const plan = await service.generateAnimationPlan(classification);

      expect(plan.primaryTechnology).toBe('threejs'); // Priority order
      expect(plan.secondaryTechnologies).toContain('manim');
      expect(plan.compositionStrategy.type).toBe('layered');
    });

    it('should prioritize Three.js over Manim', async () => {
      const classification: ('remotion' | 'threejs' | 'manim')[] = ['remotion', 'threejs', 'manim'];
      const plan = await service.generateAnimationPlan(classification);

      expect(plan.primaryTechnology).toBe('threejs');
      expect(plan.secondaryTechnologies).toContain('manim');
    });

    it('should include composition strategy', async () => {
      const classification: ('remotion' | 'manim')[] = ['remotion', 'manim'];
      const plan = await service.generateAnimationPlan(classification);

      expect(plan.compositionStrategy).toBeDefined();
      expect(plan.compositionStrategy.blendMode).toBe('normal');
      expect(plan.compositionStrategy.transitions).toContain('fade');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty input gracefully', async () => {
      const result = await service.analyzeTopic('');
      
      expect(result).toBeDefined();
      expect(result.concepts).toHaveLength(0);
      expect(result.entities).toHaveLength(0);
      expect(result.complexity).toBe('simple');
    });

    it('should handle non-technical input', async () => {
      const input = 'The weather is nice today and I like cats';
      const result = await service.analyzeTopic(input);

      expect(result).toBeDefined();
      expect(result.complexity).toBe('simple');
      // Should have minimal or no web development concepts
      expect(result.concepts.length).toBeLessThanOrEqual(2);
    });

    it('should handle special characters and punctuation', async () => {
      const input = 'HTTP/2.0 & WebSocket connections (SSL/TLS encrypted)';
      const result = await service.analyzeTopic(input);

      expect(result).toBeDefined();
      expect(result.concepts.length).toBeGreaterThan(0);
      
      const conceptNames = result.concepts.map(c => c.name);
      expect(conceptNames.some(name => name.includes('http'))).toBe(true);
    });

    it('should handle very long input text', async () => {
      const longInput = 'HTTP '.repeat(100) + 'server client database API';
      const result = await service.analyzeTopic(longInput);

      expect(result).toBeDefined();
      expect(result.concepts.length).toBeGreaterThan(0);
      expect(['moderate', 'complex']).toContain(result.complexity);
    });
  });

  describe('Integration scenarios', () => {
    it('should analyze real-world web development topics', async () => {
      const topics = [
        'How does a REST API work?',
        'Client-server architecture explained',
        'DNS resolution process step by step',
        'Frontend vs Backend development',
        'Database normalization and relationships',
        'HTTP request lifecycle in web browsers',
        'Microservices architecture patterns',
        'Authentication and authorization flows'
      ];

      for (const topic of topics) {
        const result = await service.analyzeTopic(topic);
        
        expect(result).toBeDefined();
        expect(result.concepts.length).toBeGreaterThan(0);
        expect(result.visualElements.length).toBeGreaterThan(0);
        
        // Each topic should have appropriate animation classification
        const animationTypes = service.classifyAnimationType(result);
        expect(animationTypes).toContain('remotion');
        expect(animationTypes.length).toBeGreaterThan(0);
      }
    });

    it('should provide consistent results for similar topics', async () => {
      const topic1 = 'HTTP request and response cycle';
      const topic2 = 'How HTTP requests work with responses';
      
      const result1 = await service.analyzeTopic(topic1);
      const result2 = await service.analyzeTopic(topic2);

      // Should have similar concept types and visualization approaches
      const types1 = service.classifyAnimationType(result1);
      const types2 = service.classifyAnimationType(result2);
      
      expect(types1).toEqual(expect.arrayContaining(['remotion']));
      expect(types2).toEqual(expect.arrayContaining(['remotion']));
      
      // Should both identify HTTP-related concepts
      const hasHTTP1 = result1.concepts.some(c => c.name.includes('http'));
      const hasHTTP2 = result2.concepts.some(c => c.name.includes('http'));
      expect(hasHTTP1).toBe(true);
      expect(hasHTTP2).toBe(true);
    });
  });
});