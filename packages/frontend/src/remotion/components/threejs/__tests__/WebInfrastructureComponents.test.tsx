import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  WebServerComponent,
  DatabaseComponent,
  CDNComponent,
  LoadBalancerComponent,
  APIGatewayComponent,
  CacheComponent,
  createInfrastructureComponent
} from '../WebInfrastructureComponents';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }: any) => (
    <div data-testid="text" {...props}>
      {children}
    </div>
  ),
  Box: (props: any) => <div data-testid="box" {...props} />,
  Cylinder: (props: any) => <div data-testid="cylinder" {...props} />,
  Sphere: (props: any) => <div data-testid="sphere" {...props} />,
  Cone: (props: any) => <div data-testid="cone" {...props} />
}));

describe('WebInfrastructureComponents', () => {
  const defaultProps = {
    position: { x: 0, y: 0, z: 0 },
    animated: true,
    scale: 1,
    showLabel: true
  };

  describe('WebServerComponent', () => {
    it('should render web server with rack-style visualization', () => {
      const { getAllByTestId } = render(
        <WebServerComponent {...defaultProps} label="Test Server" />
      );

      // Should have multiple box elements for chassis and slots
      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(1);

      // Should have spheres for status lights
      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(0);
    });

    it('should show label when enabled', () => {
      const { getByTestId } = render(
        <WebServerComponent {...defaultProps} label="Web Server" showLabel={true} />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('Web Server');
    });

    it('should hide label when disabled', () => {
      const { queryByTestId } = render(
        <WebServerComponent {...defaultProps} showLabel={false} />
      );

      const label = queryByTestId('text');
      expect(label).toBeNull();
    });

    it('should handle different scales', () => {
      const { container } = render(
        <WebServerComponent {...defaultProps} scale={2} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should disable animation when specified', () => {
      const { container } = render(
        <WebServerComponent {...defaultProps} animated={false} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('DatabaseComponent', () => {
    it('should render database with cylindrical storage visualization', () => {
      const { getAllByTestId } = render(
        <DatabaseComponent {...defaultProps} label="Test Database" />
      );

      // Should have multiple cylinders for storage layers
      const cylinders = getAllByTestId('cylinder');
      expect(cylinders.length).toBeGreaterThan(3);

      // Should have spheres for data visualization
      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(0);
    });

    it('should show database label', () => {
      const { getByTestId } = render(
        <DatabaseComponent {...defaultProps} label="Database Server" />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('Database Server');
    });

    it('should render connection ports', () => {
      const { getAllByTestId } = render(
        <DatabaseComponent {...defaultProps} />
      );

      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(0);
    });
  });

  describe('CDNComponent', () => {
    it('should render CDN with global distribution visualization', () => {
      const { getAllByTestId } = render(
        <CDNComponent {...defaultProps} label="CDN Node" />
      );

      // Should have spheres for core and satellites
      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(10); // Core + satellites

      // Should have boxes for data streams
      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(5);
    });

    it('should show CDN label', () => {
      const { getByTestId } = render(
        <CDNComponent {...defaultProps} label="Content Delivery Network" />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('Content Delivery Network');
    });
  });

  describe('LoadBalancerComponent', () => {
    it('should render load balancer with traffic distribution', () => {
      const { getAllByTestId } = render(
        <LoadBalancerComponent {...defaultProps} />
      );

      // Should have main body box
      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(0);

      // Should have cylinders for ports
      const cylinders = getAllByTestId('cylinder');
      expect(cylinders.length).toBeGreaterThan(3);

      // Should have spheres for traffic and status
      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(5);
    });

    it('should show load balancer label', () => {
      const { getByTestId } = render(
        <LoadBalancerComponent {...defaultProps} label="Load Balancer" />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('Load Balancer');
    });
  });

  describe('APIGatewayComponent', () => {
    it('should render API gateway with request routing', () => {
      const { getAllByTestId } = render(
        <APIGatewayComponent {...defaultProps} />
      );

      // Should have cone for main structure
      const cones = getAllByTestId('cone');
      expect(cones.length).toBe(1);

      // Should have boxes for endpoints
      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(5);

      // Should have spheres for requests and core
      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(3);
    });

    it('should show API gateway label', () => {
      const { getByTestId } = render(
        <APIGatewayComponent {...defaultProps} label="API Gateway" />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('API Gateway');
    });
  });

  describe('CacheComponent', () => {
    it('should render cache with fast access visualization', () => {
      const { getAllByTestId } = render(
        <CacheComponent {...defaultProps} />
      );

      // Should have main cache body box
      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(4); // Main body + memory modules

      // Should have spheres for particles and indicators
      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(10);
    });

    it('should show cache label', () => {
      const { getByTestId } = render(
        <CacheComponent {...defaultProps} label="Redis Cache" />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('Redis Cache');
    });
  });

  describe('createInfrastructureComponent', () => {
    it('should create web server component', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('web-server', defaultProps)
      );

      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(1);
    });

    it('should create database component', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('database', defaultProps)
      );

      const cylinders = getAllByTestId('cylinder');
      expect(cylinders.length).toBeGreaterThan(1);
    });

    it('should create CDN component', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('cdn', defaultProps)
      );

      const spheres = getAllByTestId('sphere');
      expect(spheres.length).toBeGreaterThan(5);
    });

    it('should create load balancer component', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('load-balancer', defaultProps)
      );

      const cylinders = getAllByTestId('cylinder');
      expect(cylinders.length).toBeGreaterThan(3);
    });

    it('should create API gateway component', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('api-gateway', defaultProps)
      );

      const cones = getAllByTestId('cone');
      expect(cones.length).toBe(1);
    });

    it('should create cache component', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('cache', defaultProps)
      );

      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(4);
    });

    it('should fallback to web server for unknown types', () => {
      const { getAllByTestId } = render(
        createInfrastructureComponent('unknown-type', {
          ...defaultProps,
          label: 'Unknown Component'
        })
      );

      const boxes = getAllByTestId('box');
      expect(boxes.length).toBeGreaterThan(1);

      const label = getAllByTestId('text')[0];
      expect(label).toHaveTextContent('unknown-type');
    });
  });

  describe('Component Positioning', () => {
    it('should handle different positions correctly', () => {
      const position = { x: 5, y: 3, z: -2 };
      const { container } = render(
        <WebServerComponent {...defaultProps} position={position} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle negative positions', () => {
      const position = { x: -5, y: -3, z: -2 };
      const { container } = render(
        <DatabaseComponent {...defaultProps} position={position} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('should handle animated state for all components', () => {
      const components = [
        WebServerComponent,
        DatabaseComponent,
        CDNComponent,
        LoadBalancerComponent,
        APIGatewayComponent,
        CacheComponent
      ];

      components.forEach((Component) => {
        const { container } = render(
          <Component {...defaultProps} animated={true} />
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle non-animated state for all components', () => {
      const components = [
        WebServerComponent,
        DatabaseComponent,
        CDNComponent,
        LoadBalancerComponent,
        APIGatewayComponent,
        CacheComponent
      ];

      components.forEach((Component) => {
        const { container } = render(
          <Component {...defaultProps} animated={false} />
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Scale Variations', () => {
    it('should handle different scale values', () => {
      const scales = [0.5, 1, 1.5, 2];
      
      scales.forEach((scale) => {
        const { container } = render(
          <WebServerComponent {...defaultProps} scale={scale} />
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle zero scale', () => {
      const { container } = render(
        <DatabaseComponent {...defaultProps} scale={0} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Label Variations', () => {
    it('should handle long labels', () => {
      const longLabel = 'This is a very long label that should still work correctly';
      const { getByTestId } = render(
        <CDNComponent {...defaultProps} label={longLabel} />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent(longLabel);
    });

    it('should handle empty labels', () => {
      const { getByTestId } = render(
        <LoadBalancerComponent {...defaultProps} label="" />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent('');
    });

    it('should handle special characters in labels', () => {
      const specialLabel = 'Server-01_#@$%';
      const { getByTestId } = render(
        <APIGatewayComponent {...defaultProps} label={specialLabel} />
      );

      const label = getByTestId('text');
      expect(label).toHaveTextContent(specialLabel);
    });
  });
});