#!/usr/bin/env python3
"""
Tests for Manim diagram generators
"""

import pytest
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

class TestHTTPFlowGenerator:
    """Test HTTP flow diagram generator"""
    
    def test_basic_http_flow_script_generation(self):
        """Test basic HTTP flow script generation"""
        from generators.http_flow_generator import HTTPFlowGenerator
        
        generator = HTTPFlowGenerator()
        flow_data = {
            'title': 'Basic HTTP Request',
            'steps': [
                {'description': 'Send GET request', 'direction': 'request', 'method': 'GET', 'url': '/api/users'},
                {'description': 'Return user data', 'direction': 'response', 'status_code': 200}
            ]
        }
        
        script = generator.generate_script(flow_data, 'test-123')
        
        # Verify script contains expected elements
        assert 'Basic HTTP Request' in script
        assert 'HTTPFlow_test_123' in script
        assert 'Client' in script
        assert 'Server' in script
        assert 'GET /api/users' in script
        assert '200 OK' in script
    
    def test_http_flow_with_headers(self):
        """Test HTTP flow with headers enabled"""
        from generators.http_flow_generator import HTTPFlowGenerator
        
        generator = HTTPFlowGenerator()
        flow_data = {
            'title': 'HTTP with Headers',
            'show_headers': True,
            'steps': [
                {
                    'description': 'POST request with headers',
                    'direction': 'request',
                    'method': 'POST',
                    'url': '/api/login',
                    'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer token'}
                }
            ]
        }
        
        script = generator.generate_script(flow_data, 'test-headers')
        
        assert 'Content-Type: application/json' in script
        assert 'Authorization: Bearer token' in script
        assert 'POST /api/login' in script
    
    def test_rest_api_script_generation(self):
        """Test REST API specific script generation"""
        from generators.http_flow_generator import HTTPFlowGenerator
        
        generator = HTTPFlowGenerator()
        api_data = {
            'base_url': 'https://api.example.com',
            'endpoints': [
                {'method': 'GET', 'path': '/users', 'description': 'Get all users'},
                {'method': 'POST', 'path': '/users', 'description': 'Create new user'},
                {'method': 'PUT', 'path': '/users/:id', 'description': 'Update user'},
                {'method': 'DELETE', 'path': '/users/:id', 'description': 'Delete user'}
            ]
        }
        
        script = generator.generate_rest_api_script(api_data, 'rest-test')
        
        assert 'REST API Communication' in script
        assert 'https://api.example.com' in script
        assert 'GET /users' in script
        assert 'POST /users' in script
        assert 'Create new user' in script

class TestDNSResolutionGenerator:
    """Test DNS resolution diagram generator"""
    
    def test_basic_dns_resolution_script(self):
        """Test basic DNS resolution script generation"""
        from generators.dns_resolution_generator import DNSResolutionGenerator
        
        generator = DNSResolutionGenerator()
        dns_data = {
            'domain': 'example.com',
            'show_cache': True,
            'show_timing': True
        }
        
        script = generator.generate_script(dns_data, 'dns-test')
        
        assert 'DNS Resolution Process' in script
        assert 'example.com' in script
        assert 'DNSResolution_dns_test' in script
        assert 'Root Server' in script
        assert 'TLD Server' in script
        assert 'Authoritative' in script
        assert 'DNS Cache' in script
    
    def test_dns_security_script(self):
        """Test DNS security (DNSSEC) script generation"""
        from generators.dns_resolution_generator import DNSResolutionGenerator
        
        generator = DNSResolutionGenerator()
        security_data = {
            'domain': 'secure.example.com'
        }
        
        script = generator.generate_dns_security_script(security_data, 'dnssec-test')
        
        assert 'DNS Security (DNSSEC)' in script
        assert 'DNSSecurity_dnssec_test' in script
        assert 'Digital Signatures' in script
        assert 'Chain of Trust' in script
        assert 'DNS Spoofing' in script
        assert 'Cache Poisoning' in script

class TestDataStructureGenerator:
    """Test data structure visualization generator"""
    
    def test_array_visualization_script(self):
        """Test array visualization script generation"""
        from generators.data_structure_generator import DataStructureGenerator
        
        generator = DataStructureGenerator()
        structure_data = {
            'type': 'array',
            'data': [1, 2, 3, 4, 5],
            'show_complexity': True,
            'operations': [
                {'type': 'access', 'index': 2},
                {'type': 'update', 'index': 1, 'value': 10}
            ]
        }
        
        script = generator.generate_script(structure_data, 'array-test')
        
        assert 'Array Visualization' in script
        assert 'DataStructure_array_test' in script
        assert 'create_array_visualization' in script
        assert '[1, 2, 3, 4, 5]' in script
        assert 'Time Complexity' in script
        assert 'O(1)' in script  # Array access complexity
    
    def test_linked_list_visualization_script(self):
        """Test linked list visualization script generation"""
        from generators.data_structure_generator import DataStructureGenerator
        
        generator = DataStructureGenerator()
        structure_data = {
            'type': 'linked_list',
            'data': ['A', 'B', 'C'],
            'show_complexity': True
        }
        
        script = generator.generate_script(structure_data, 'list-test')
        
        assert 'Linked List Visualization' in script
        assert 'create_linked_list_visualization' in script
        assert "['A', 'B', 'C']" in script
        assert 'Non-contiguous memory' in script
        assert 'Sequential access O(n)' in script
    
    def test_stack_visualization_script(self):
        """Test stack visualization script generation"""
        from generators.data_structure_generator import DataStructureGenerator
        
        generator = DataStructureGenerator()
        structure_data = {
            'type': 'stack',
            'data': [10, 20, 30],
            'operations': [
                {'type': 'push', 'value': 40},
                {'type': 'pop'}
            ]
        }
        
        script = generator.generate_script(structure_data, 'stack-test')
        
        assert 'Stack Visualization' in script
        assert 'create_stack_visualization' in script
        assert 'LIFO: Last In, First Out' in script
        assert 'TOP' in script
    
    def test_binary_tree_visualization_script(self):
        """Test binary tree visualization script generation"""
        from generators.data_structure_generator import DataStructureGenerator
        
        generator = DataStructureGenerator()
        structure_data = {
            'type': 'binary_tree',
            'data': [50, 30, 70, 20, 40, 60, 80]
        }
        
        script = generator.generate_script(structure_data, 'tree-test')
        
        assert 'Binary Tree Visualization' in script
        assert 'create_binary_tree_visualization' in script
        assert 'Binary Tree Properties' in script
        assert 'Each node has ≤ 2 children' in script
        assert 'O(log n) operations' in script
    
    def test_algorithm_visualization_script(self):
        """Test algorithm visualization script generation"""
        from generators.data_structure_generator import DataStructureGenerator
        
        generator = DataStructureGenerator()
        algorithm_data = {
            'type': 'bubble_sort',
            'data': [64, 34, 25, 12, 22, 11, 90]
        }
        
        script = generator.generate_algorithm_script(algorithm_data, 'sort-test')
        
        assert 'Bubble Sort Algorithm' in script
        assert 'Algorithm_sort_test' in script
        assert 'animate_bubble_sort' in script
        assert '[64, 34, 25, 12, 22, 11, 90]' in script
    
    def test_complexity_data_retrieval(self):
        """Test complexity data retrieval for different structures"""
        from generators.data_structure_generator import DataStructureGenerator
        
        generator = DataStructureGenerator()
        
        # Test array complexity
        array_complexity = generator.get_complexity_data('array')
        assert array_complexity['access'] == 'O(1)'
        assert array_complexity['search'] == 'O(n)'
        assert array_complexity['space'] == 'O(n)'
        
        # Test hash table complexity
        hash_complexity = generator.get_complexity_data('hash_table')
        assert hash_complexity['search'] == 'O(1)'
        assert hash_complexity['insert'] == 'O(1)'
        assert hash_complexity['delete'] == 'O(1)'
        
        # Test binary tree complexity
        tree_complexity = generator.get_complexity_data('binary_tree')
        assert tree_complexity['access'] == 'O(log n)'
        assert tree_complexity['search'] == 'O(log n)'

class TestProcessFlowGenerator:
    """Test process flow diagram generator"""
    
    def test_linear_process_flow_script(self):
        """Test linear process flow script generation"""
        from generators.process_flow_generator import ProcessFlowGenerator
        
        generator = ProcessFlowGenerator()
        process_data = {
            'title': 'User Registration Process',
            'flow_type': 'linear',
            'show_timing': True,
            'steps': [
                {'name': 'Start', 'type': 'start', 'timing': '0s'},
                {'name': 'Validate Input', 'type': 'process', 'description': 'Check email format', 'timing': '1s'},
                {'name': 'Check Existing User', 'type': 'process', 'description': 'Query database', 'timing': '2s'},
                {'name': 'Create Account', 'type': 'process', 'description': 'Insert new user', 'timing': '3s'},
                {'name': 'Send Welcome Email', 'type': 'process', 'description': 'Email notification', 'timing': '4s'},
                {'name': 'End', 'type': 'end', 'timing': '5s'}
            ]
        }
        
        script = generator.generate_script(process_data, 'registration-test')
        
        assert 'User Registration Process' in script
        assert 'ProcessFlow_registration_test' in script
        assert 'create_linear_flow' in script
        assert 'Validate Input' in script
        assert 'Check email format' in script
        assert '⏱️ 1s' in script
    
    def test_branching_process_flow_script(self):
        """Test branching process flow script generation"""
        from generators.process_flow_generator import ProcessFlowGenerator
        
        generator = ProcessFlowGenerator()
        process_data = {
            'title': 'Authentication Flow',
            'flow_type': 'branching',
            'steps': [
                {'name': 'Start', 'type': 'start', 'branch': 'main'},
                {'name': 'Check Credentials', 'type': 'decision', 'branch': 'main'},
                {'name': 'Grant Access', 'type': 'process', 'branch': 'yes', 'condition': 'yes'},
                {'name': 'Deny Access', 'type': 'process', 'branch': 'no', 'condition': 'no'},
                {'name': 'End', 'type': 'end', 'branch': 'main'}
            ]
        }
        
        script = generator.generate_script(process_data, 'auth-test')
        
        assert 'Authentication Flow' in script
        assert 'create_branching_flow' in script
        assert 'Check Credentials' in script
        assert 'Grant Access' in script
        assert 'Deny Access' in script
        assert 'Yes' in script
        assert 'No' in script
    
    def test_circular_process_flow_script(self):
        """Test circular process flow script generation"""
        from generators.process_flow_generator import ProcessFlowGenerator
        
        generator = ProcessFlowGenerator()
        process_data = {
            'title': 'Continuous Integration Cycle',
            'flow_type': 'circular',
            'steps': [
                {'name': 'Code Commit', 'type': 'process'},
                {'name': 'Build', 'type': 'process'},
                {'name': 'Test', 'type': 'process'},
                {'name': 'Deploy', 'type': 'process'},
                {'name': 'Monitor', 'type': 'process'}
            ]
        }
        
        script = generator.generate_script(process_data, 'ci-test')
        
        assert 'Continuous Integration Cycle' in script
        assert 'create_circular_flow' in script
        assert 'Code Commit' in script
        assert 'Continuous Cycle' in script
        assert 'CurvedArrow' in script
    
    def test_authentication_flow_script(self):
        """Test authentication flow script generation"""
        from generators.process_flow_generator import ProcessFlowGenerator
        
        generator = ProcessFlowGenerator()
        auth_data = {
            'type': 'oauth'
        }
        
        script = generator.generate_authentication_flow_script(auth_data, 'oauth-test')
        
        assert 'Authentication Flow' in script
        assert 'OAuth Authentication' in script
        assert 'AuthFlow_oauth_test' in script
        assert 'show_oauth_flow' in script
        assert '👤 User' in script
        assert '📱 Client App' in script
        assert '🔐 Auth Server' in script
        assert '🗄️ Resource Server' in script
    
    def test_step_shape_creation(self):
        """Test step shape creation for different types"""
        from generators.process_flow_generator import ProcessFlowGenerator
        
        generator = ProcessFlowGenerator()
        
        # This would require Manim to be installed to actually test shape creation
        # For now, we test that the method exists and can be called
        assert hasattr(generator, 'create_step_shape')
        
        # Test that the script generation includes shape creation logic
        process_data = {
            'title': 'Shape Test',
            'steps': [
                {'name': 'Start', 'type': 'start'},
                {'name': 'Process', 'type': 'process'},
                {'name': 'Decision', 'type': 'decision'},
                {'name': 'Data', 'type': 'data'},
                {'name': 'Subprocess', 'type': 'subprocess'},
                {'name': 'End', 'type': 'end'}
            ]
        }
        
        script = generator.generate_script(process_data, 'shape-test')
        
        # Verify different shape types are handled
        assert 'RoundedRectangle' in script  # start/end
        assert 'Rectangle' in script  # process
        assert 'Polygon' in script  # decision/data
        assert 'VGroup' in script  # subprocess

class TestGeneratorIntegration:
    """Test integration between generators and main app"""
    
    def test_generator_imports(self):
        """Test that all generators can be imported"""
        from generators.http_flow_generator import HTTPFlowGenerator
        from generators.dns_resolution_generator import DNSResolutionGenerator
        from generators.data_structure_generator import DataStructureGenerator
        from generators.process_flow_generator import ProcessFlowGenerator
        
        # Verify all generators can be instantiated
        http_gen = HTTPFlowGenerator()
        dns_gen = DNSResolutionGenerator()
        ds_gen = DataStructureGenerator()
        pf_gen = ProcessFlowGenerator()
        
        assert http_gen is not None
        assert dns_gen is not None
        assert ds_gen is not None
        assert pf_gen is not None
    
    def test_generator_script_methods(self):
        """Test that all generators have required script generation methods"""
        from generators.http_flow_generator import HTTPFlowGenerator
        from generators.dns_resolution_generator import DNSResolutionGenerator
        from generators.data_structure_generator import DataStructureGenerator
        from generators.process_flow_generator import ProcessFlowGenerator
        
        # Test HTTP generator methods
        http_gen = HTTPFlowGenerator()
        assert hasattr(http_gen, 'generate_script')
        assert hasattr(http_gen, 'generate_rest_api_script')
        
        # Test DNS generator methods
        dns_gen = DNSResolutionGenerator()
        assert hasattr(dns_gen, 'generate_script')
        assert hasattr(dns_gen, 'generate_dns_security_script')
        
        # Test Data Structure generator methods
        ds_gen = DataStructureGenerator()
        assert hasattr(ds_gen, 'generate_script')
        assert hasattr(ds_gen, 'generate_algorithm_script')
        assert hasattr(ds_gen, 'get_complexity_data')
        
        # Test Process Flow generator methods
        pf_gen = ProcessFlowGenerator()
        assert hasattr(pf_gen, 'generate_script')
        assert hasattr(pf_gen, 'generate_authentication_flow_script')

if __name__ == '__main__':
    # Run tests
    pytest.main([__file__, '-v'])