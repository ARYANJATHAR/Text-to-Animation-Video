import { describe, it, expect, beforeEach, vi } from 'vitest';
import { threeJSService } from '../index';

// Mock WebGL context for compatibility testing
const createMockWebGLContext = (supported: boolean = true) => {
  if (!supported) {
    return null;
  }

  return {
    getExtension: vi.fn(),
    getParameter: vi.fn(),
    createShader: vi.fn(),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    useProgram: vi.fn(),
    createBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    drawArrays: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    // WebGL constants
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    COLOR_BUFFER_BIT: 16384
  };
};

describe('WebGL Compatibility Tests', () => {
  beforeEach(() => {
    // Reset WebGL support state
    threeJSService['webGLSupported'] = null;
    vi.clearAllMocks();
  });

  it('should detect WebGL support in compatible environments', () => {
    // Mock WebGL support
    HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
      if (contextType === 'webgl' || contextType === 'experimental-webgl') {
        return createMockWebGLContext(true);
      }
      return null;
    });

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(true);
  });

  it('should detect lack of WebGL support in incompatible environments', () => {
    // Mock no WebGL support
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(false);
  });

  it('should handle WebGL context creation errors gracefully', () => {
    // Mock WebGL context creation error
    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      throw new Error('WebGL context creation failed');
    });

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(false);
  });

  it('should cache WebGL support detection results', () => {
    const mockGetContext = vi.fn(() => createMockWebGLContext(true));
    HTMLCanvasElement.prototype.getContext = mockGetContext;

    // First call
    const firstResult = threeJSService.validateWebGLSupport();
    // Second call
    const secondResult = threeJSService.validateWebGLSupport();

    expect(firstResult).toBe(true);
    expect(secondResult).toBe(true);
    expect(mockGetContext).toHaveBeenCalledTimes(1); // Should be cached
  });

  it('should handle different WebGL context types', () => {
    const mockGetContext = vi.fn((contextType) => {
      if (contextType === 'webgl') {
        return null; // Standard WebGL not supported
      }
      if (contextType === 'experimental-webgl') {
        return createMockWebGLContext(true); // Experimental WebGL supported
      }
      return null;
    });
    HTMLCanvasElement.prototype.getContext = mockGetContext;

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(true);
    expect(mockGetContext).toHaveBeenCalledWith('webgl');
    expect(mockGetContext).toHaveBeenCalledWith('experimental-webgl');
  });

  it('should fail gracefully when canvas creation fails', () => {
    // Mock document.createElement to fail
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn(() => {
      throw new Error('Canvas creation failed');
    });

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(false);

    // Restore original function
    document.createElement = originalCreateElement;
  });

  it('should validate WebGL extensions availability', () => {
    const mockContext = createMockWebGLContext(true);
    mockContext.getExtension = vi.fn((extension) => {
      // Mock common WebGL extensions
      const extensions: Record<string, any> = {
        'OES_texture_float': {},
        'OES_texture_half_float': {},
        'WEBGL_depth_texture': {},
        'EXT_texture_filter_anisotropic': {}
      };
      return extensions[extension] || null;
    });

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(true);
  });

  it('should handle WebGL parameter queries', () => {
    const mockContext = createMockWebGLContext(true);
    mockContext.getParameter = vi.fn((parameter) => {
      // Mock common WebGL parameters
      const parameters: Record<number, any> = {
        7936: 'WebGL 1.0', // VERSION
        7937: 'WebGL GLSL ES 1.0', // SHADING_LANGUAGE_VERSION
        7938: 'Mock WebGL Vendor', // VENDOR
        7939: 'Mock WebGL Renderer', // RENDERER
        3379: 16, // MAX_TEXTURE_SIZE
        34076: 16, // MAX_CUBE_MAP_TEXTURE_SIZE
        34024: 8, // MAX_VERTEX_ATTRIBS
        35660: 16, // MAX_VERTEX_UNIFORM_VECTORS
        35661: 16, // MAX_FRAGMENT_UNIFORM_VECTORS
        35659: 8 // MAX_VARYING_VECTORS
      };
      return parameters[parameter];
    });

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

    const isSupported = threeJSService.validateWebGLSupport();
    expect(isSupported).toBe(true);
  });
});