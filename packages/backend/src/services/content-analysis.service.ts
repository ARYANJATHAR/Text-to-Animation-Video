import natural from 'natural';
import nlp from 'compromise';
import { 
  ContentAnalysisService as IContentAnalysisService,
  TopicAnalysis, 
  Concept, 
  Entity, 
  Relationship, 
  VisualElement,
  AnimationType,
  AnimationPlan,
  ConceptMetadata
} from 'shared-types';

export class ContentAnalysisService implements IContentAnalysisService {
  private tokenizer: natural.WordTokenizer;
  // private _stemmer: typeof natural.PorterStemmer;
  // private _tfidf: natural.TfIdf;

  // Web development concept patterns for classification
  private readonly conceptPatterns = {
    spatial: [
      'client-server', 'network', 'topology', 'infrastructure', 'architecture',
      'database', 'server', 'cdn', 'load balancer', 'microservices',
      'distributed', 'cloud', 'deployment', 'scaling', 'containers'
    ],
    logical: [
      'http', 'request', 'response', 'protocol', 'api', 'rest', 'graphql',
      'authentication', 'authorization', 'oauth', 'jwt', 'session',
      'algorithm', 'data structure', 'flow', 'process', 'workflow',
      'dns', 'routing', 'middleware', 'pipeline'
    ],
    temporal: [
      'animation', 'transition', 'loading', 'progress', 'timeline',
      'sequence', 'lifecycle', 'event', 'callback', 'async', 'promise',
      'rendering', 'paint', 'reflow', 'optimization'
    ]
  };

  // Entity types for web development topics
  private readonly entityTypes = {
    technology: ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'node', 'express', 'mongodb', 'postgresql'],
    protocol: ['http', 'https', 'tcp', 'udp', 'websocket', 'ftp', 'smtp'],
    concept: ['frontend', 'backend', 'fullstack', 'api', 'database', 'server', 'client'],
    method: ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'],
    component: ['header', 'body', 'footer', 'navbar', 'sidebar', 'modal', 'form']
  };

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    // this._stemmer = natural.PorterStemmer;
    // this._tfidf = new natural.TfIdf();
  }

  async analyzeTopic(input: string): Promise<TopicAnalysis> {
    // Clean and normalize input
    const cleanInput = this.preprocessText(input);
    
    // Extract concepts using multiple approaches
    const concepts = await this.extractConcepts(cleanInput);
    
    // Extract entities
    const entities = this.extractEntities(cleanInput);
    
    // Identify relationships between concepts
    const relationships = this.identifyRelationships(concepts, entities, cleanInput);
    
    // Determine complexity
    const complexity = this.assessComplexity(concepts, entities, relationships);
    
    // Identify visual elements needed
    const visualElements = this.identifyVisualElements(concepts, entities);

    return {
      concepts,
      entities,
      relationships,
      complexity,
      visualElements
    };
  }

  async extractConcepts(text: string): Promise<Concept[]> {
    const concepts: Concept[] = [];
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    
    // Use compromise for better NLP analysis
    const doc = nlp(text);
    const nouns = doc.nouns().out('array');
    const verbs = doc.verbs().out('array');
    const topics = doc.topics().out('array');

    // Combine different extraction methods
    const allTerms = [...new Set([...tokens, ...nouns, ...verbs, ...topics])];
    
    // Filter and classify terms as concepts
    const conceptTerms = allTerms.filter(term => 
      term.length > 2 && 
      !this.isStopWord(term) &&
      this.isRelevantTerm(term)
    );

    conceptTerms.forEach((term, index) => {
      const conceptType = this.classifyConceptType(term, text);
      const visualizationType = this.determineVisualizationType(term, conceptType);
      
      concepts.push({
        id: `concept_${index}`,
        name: term,
        type: conceptType,
        visualizationType,
        relationships: [], // Will be populated by identifyRelationships
        metadata: this.generateConceptMetadata(term, text)
      });
    });

    return concepts;
  }

  classifyAnimationType(analysis: TopicAnalysis): AnimationType[] {
    const types: Set<AnimationType> = new Set();
    
    // Analyze concepts to determine animation types needed
    analysis.concepts.forEach(concept => {
      switch (concept.visualizationType) {
        case 'threejs':
          types.add('threejs');
          break;
        case 'manim':
          types.add('manim');
          break;
        case 'remotion':
          types.add('remotion');
          break;
      }
    });

    // Always include Remotion as it's the composition layer
    types.add('remotion');

    // Determine if hybrid approach is needed
    if (types.size > 2) {
      types.add('hybrid');
    }

    return Array.from(types);
  }

  async generateAnimationPlan(classification: AnimationType[]): Promise<AnimationPlan> {
    // Determine primary technology based on classification
    const primaryTechnology = this.selectPrimaryTechnology(classification);
    
    // Get secondary technologies
    const secondaryTechnologies = classification.filter(type => 
      type !== primaryTechnology && type !== 'hybrid'
    );

    return {
      primaryTechnology,
      secondaryTechnologies,
      timeline: [], // Will be populated by orchestrator
      compositionStrategy: {
        type: classification.includes('hybrid') ? 'layered' : 'sequential',
        blendMode: 'normal',
        transitions: ['fade', 'slide']
      }
    };
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];
    const doc = nlp(text);
    
    // Extract named entities
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const organizations = doc.organizations().out('array');

    // Add web development specific entities
    Object.entries(this.entityTypes).forEach(([type, terms]) => {
      terms.forEach(term => {
        if (text.toLowerCase().includes(term)) {
          entities.push({
            id: `entity_${entities.length}`,
            name: term,
            type,
            confidence: this.calculateEntityConfidence(term, text)
          });
        }
      });
    });

    // Add general named entities
    [...people, ...places, ...organizations].forEach(entity => {
      entities.push({
        id: `entity_${entities.length}`,
        name: entity,
        type: 'named_entity',
        confidence: 0.8
      });
    });

    return entities;
  }

  private identifyRelationships(concepts: Concept[], _entities: Entity[], text: string): Relationship[] {
    const relationships: Relationship[] = [];
    
    // Simple relationship detection based on proximity and common patterns
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const concept1 = concepts[i];
        const concept2 = concepts[j];
        
        const relationshipType = this.detectRelationshipType(concept1.name, concept2.name, text);
        if (relationshipType) {
          relationships.push({
            id: `rel_${relationships.length}`,
            sourceId: concept1.id,
            targetId: concept2.id,
            type: relationshipType,
            confidence: this.calculateRelationshipConfidence(concept1.name, concept2.name, text)
          });
        }
      }
    }

    return relationships;
  }

  private assessComplexity(concepts: Concept[], entities: Entity[], relationships: Relationship[]): 'simple' | 'moderate' | 'complex' {
    const conceptCount = concepts.length;
    const relationshipCount = relationships.length;
    const entityCount = entities.length;
    
    // If no concepts found, it's simple
    if (conceptCount === 0) return 'simple';
    
    const complexityScore = conceptCount + (relationshipCount * 2) + entityCount;
    
    if (complexityScore <= 3) return 'simple';
    if (complexityScore <= 10) return 'moderate';
    return 'complex';
  }

  private identifyVisualElements(concepts: Concept[], _entities: Entity[]): VisualElement[] {
    const visualElements: VisualElement[] = [];
    
    concepts.forEach((concept, index) => {
      const elementType = this.mapConceptToVisualElement(concept);
      visualElements.push({
        id: `visual_${index}`,
        type: elementType,
        description: `Visual representation of ${concept.name}`,
        technology: concept.visualizationType
      });
    });

    return visualElements;
  }

  private classifyConceptType(term: string, context: string): 'spatial' | 'logical' | 'temporal' | 'hierarchical' {
    const lowerTerm = term.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    // Check against predefined patterns with exact matching
    if (this.conceptPatterns.spatial.some(pattern => 
      lowerTerm.includes(pattern) || lowerContext.includes(pattern + ' ' + lowerTerm) || lowerContext.includes(lowerTerm + ' ' + pattern)
    )) {
      return 'spatial';
    }
    if (this.conceptPatterns.logical.some(pattern => 
      lowerTerm.includes(pattern) || lowerContext.includes(pattern + ' ' + lowerTerm) || lowerContext.includes(lowerTerm + ' ' + pattern)
    )) {
      return 'logical';
    }
    if (this.conceptPatterns.temporal.some(pattern => 
      lowerTerm.includes(pattern) || lowerContext.includes(pattern + ' ' + lowerTerm) || lowerContext.includes(lowerTerm + ' ' + pattern)
    )) {
      return 'temporal';
    }
    
    // Default to hierarchical for structured concepts
    return 'hierarchical';
  }

  private determineVisualizationType(term: string, conceptType: 'spatial' | 'logical' | 'temporal' | 'hierarchical'): 'remotion' | 'threejs' | 'manim' {
    switch (conceptType) {
      case 'spatial':
        // 3D concepts go to Three.js
        if (this.is3DConcept(term)) {
          return 'threejs';
        }
        return 'remotion';
      
      case 'logical':
        // Logical flows and processes go to Manim
        return 'manim';
      
      case 'temporal':
        // Time-based animations go to Remotion
        return 'remotion';
      
      case 'hierarchical':
        // Hierarchical structures can go to Manim for diagrams
        return 'manim';
      
      default:
        return 'remotion';
    }
  }

  private is3DConcept(term: string): boolean {
    const threeDConcepts = [
      'server', 'client', 'network', 'topology', 'infrastructure',
      'architecture', 'database', 'cdn', 'load balancer', 'container',
      'microservice', 'distributed', 'cloud'
    ];
    
    return threeDConcepts.some(concept => term.includes(concept));
  }

  private generateConceptMetadata(term: string, context: string): ConceptMetadata {
    const complexity = this.assessTermComplexity(term, context);
    const visualElements = this.identifyTermVisualElements(term);
    const keywords = this.extractRelatedKeywords(term, context);

    return {
      complexity,
      visualElements,
      keywords
    };
  }

  private assessTermComplexity(term: string, context: string): 'simple' | 'moderate' | 'complex' {
    // Simple heuristic based on term characteristics
    const termLength = term.length;
    const contextMentions = (context.match(new RegExp(term, 'gi')) || []).length;
    
    if (termLength <= 5 && contextMentions >= 3) return 'simple';
    if (termLength <= 10 && contextMentions >= 2) return 'moderate';
    return 'complex';
  }

  private identifyTermVisualElements(term: string): string[] {
    const visualMappings: Record<string, string[]> = {
      'server': ['3d_model', 'icon', 'diagram'],
      'client': ['3d_model', 'icon', 'animation'],
      'http': ['flow_diagram', 'animation', 'text'],
      'database': ['3d_model', 'icon', 'diagram'],
      'api': ['flow_diagram', 'text', 'animation']
    };

    return visualMappings[term] || ['text', 'animation'];
  }

  private extractRelatedKeywords(term: string, context: string): string[] {
    const tokens = this.tokenizer.tokenize(context.toLowerCase()) || [];
    const termIndex = tokens.indexOf(term);
    
    if (termIndex === -1) return [];
    
    // Get surrounding words as related keywords
    const start = Math.max(0, termIndex - 3);
    const end = Math.min(tokens.length, termIndex + 4);
    
    return tokens.slice(start, end).filter(token => 
      token !== term && 
      !this.isStopWord(token) && 
      token.length > 2
    );
  }

  private selectPrimaryTechnology(classification: AnimationType[]): 'remotion' | 'threejs' | 'manim' {
    // Remove 'hybrid' from consideration
    const technologies = classification.filter(type => type !== 'hybrid');
    
    // Priority order: threejs > manim > remotion (remotion is always included as composition layer)
    if (technologies.includes('threejs')) return 'threejs';
    if (technologies.includes('manim')) return 'manim';
    return 'remotion';
  }

  private calculateEntityConfidence(term: string, text: string): number {
    const mentions = (text.toLowerCase().match(new RegExp(term, 'g')) || []).length;
    const textLength = text.split(' ').length;
    
    // Simple confidence based on frequency and text length
    return Math.min(0.9, (mentions / textLength) * 10);
  }

  private detectRelationshipType(term1: string, term2: string, text: string): string | null {
    const relationshipPatterns = {
      'depends_on': ['requires', 'needs', 'uses', 'relies on'],
      'part_of': ['contains', 'includes', 'has', 'consists of'],
      'leads_to': ['causes', 'results in', 'triggers', 'leads to'],
      'interacts_with': ['communicates', 'connects', 'interfaces', 'works with']
    };

    for (const [relType, patterns] of Object.entries(relationshipPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return relType;
      }
    }

    // Check for proximity-based relationships
    const term1Index = text.indexOf(term1);
    const term2Index = text.indexOf(term2);
    
    if (term1Index !== -1 && term2Index !== -1 && Math.abs(term1Index - term2Index) < 50) {
      return 'interacts_with';
    }

    return null;
  }

  private calculateRelationshipConfidence(term1: string, term2: string, text: string): number {
    const term1Index = text.indexOf(term1);
    const term2Index = text.indexOf(term2);
    
    if (term1Index === -1 || term2Index === -1) return 0.1;
    
    const distance = Math.abs(term1Index - term2Index);
    const maxDistance = 100; // Maximum meaningful distance
    
    return Math.max(0.1, 1 - (distance / maxDistance));
  }

  private mapConceptToVisualElement(concept: Concept): '3d_model' | 'diagram' | 'animation' | 'text' {
    switch (concept.visualizationType) {
      case 'threejs':
        return '3d_model';
      case 'manim':
        return 'diagram';
      case 'remotion':
        return 'animation';
      default:
        return 'text';
    }
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  private isRelevantTerm(term: string): boolean {
    // Check if term is relevant to web development
    const webDevTerms = [
      ...this.conceptPatterns.spatial,
      ...this.conceptPatterns.logical,
      ...this.conceptPatterns.temporal,
      ...Object.values(this.entityTypes).flat()
    ];

    // First check if it's a known web dev term
    const isWebDevTerm = webDevTerms.some(webTerm => 
      term.includes(webTerm) || webTerm.includes(term)
    );

    if (isWebDevTerm) return true;

    // For other terms, be more selective
    const irrelevantWords = ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'weather', 'nice', 'today', 'cats', 'like'];
    if (irrelevantWords.includes(term.toLowerCase())) return false;

    // Include longer terms that might be relevant, but not common words
    return term.length >= 6;
  }
}