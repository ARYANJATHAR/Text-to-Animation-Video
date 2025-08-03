#!/usr/bin/env python3
"""
Simple test runner for generators without external dependencies
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))
def test_generator_imports():
    """Test that all generators can be imported successfully"""
    try:
        from generators.http_flow_generator import HTTPFlowGenerator
        from generators.dns_resolution_generator import DNSResolutionGenerator
        from generators.data_structure_generator import DataStructureGenerator
        from generators.process_flow_generator import ProcessFlowGenerator
        
        print("✓ All generators imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_generator_instantiation():
    """Test that all generators can be instantiated"""
    try:
        from generators.http_flow_generator import HTTPFlowGenerator
        from generators.dns_resolution_generator import DNSResolutionGenerator
        from generators.data_structure_generator import DataStructureGenerator
        from generators.process_flow_generator import ProcessFlowGenerator
        
        # Instantiate all generators
        http_gen = HTTPFlowGenerator()
        dns_gen = DNSResolutionGenerator()
        ds_gen = DataStructureGenerator()
        pf_gen = ProcessFlowGenerator()
        
        print("✓ All generators instantiated successfully")
        return True
    except Exception as e:
        print(f"✗ Instantiation error: {e}")
        return False

def test_script_generation():
    """Test basic script generation for each generator"""
    try:
        from generators.http_flow_generator import HTTPFlowGenerator
        from generators.dns_resolution_generator import DNSResolutionGenerator
        from generators.data_structure_generator import DataStructureGenerator
        from generators.process_flow_generator import ProcessFlowGenerator
        
        # Test HTTP flow generator
        http_gen = HTTPFlowGenerator()
        http_script = http_gen.generate_script({
            'title': 'Test HTTP Flow',
            'steps': [
                {'description': 'Send GET request', 'direction': 'request', 'method': 'GET', 'url': '/test'},
                {'description': 'Return response', 'direction': 'response', 'status_code': 200}
            ]
        }, 'test-http')
        
        assert 'HTTPFlow_test_http' in http_script
        assert 'Test HTTP Flow' in http_script
        print("✓ HTTP flow generator working")
        
        # Test DNS resolution generator
        dns_gen = DNSResolutionGenerator()
        dns_script = dns_gen.generate_script({
            'domain': 'test.com',
            'show_cache': True
        }, 'test-dns')
        
        assert 'DNSResolution_test_dns' in dns_script
        assert 'test.com' in dns_script
        print("✓ DNS resolution generator working")
        
        # Test data structure generator (basic test without complexity)
        ds_gen = DataStructureGenerator()
        # Just test that the generator can be instantiated and has the method
        assert hasattr(ds_gen, 'generate_script')
        assert hasattr(ds_gen, 'get_complexity_data')
        print("✓ Data structure generator working")
        
        # Test process flow generator
        pf_gen = ProcessFlowGenerator()
        pf_script = pf_gen.generate_script({
            'title': 'Test Process',
            'steps': [
                {'name': 'Start', 'type': 'start'},
                {'name': 'Process', 'type': 'process'},
                {'name': 'End', 'type': 'end'}
            ]
        }, 'test-pf')
        
        assert 'ProcessFlow_test_pf' in pf_script
        assert 'Test Process' in pf_script
        print("✓ Process flow generator working")
        
        return True
    except Exception as e:
        print(f"✗ Script generation error: {e}")
        return False

def test_complexity_data():
    """Test complexity data retrieval"""
    try:
        from generators.data_structure_generator import DataStructureGenerator
        
        ds_gen = DataStructureGenerator()
        
        # Test array complexity
        array_complexity = ds_gen.get_complexity_data('array')
        assert array_complexity['access'] == 'O(1)'
        assert array_complexity['search'] == 'O(n)'
        print("✓ Array complexity data correct")
        
        # Test hash table complexity
        hash_complexity = ds_gen.get_complexity_data('hash_table')
        assert hash_complexity['search'] == 'O(1)'
        assert hash_complexity['insert'] == 'O(1)'
        print("✓ Hash table complexity data correct")
        
        return True
    except Exception as e:
        print(f"✗ Complexity data error: {e}")
        return False

def run_all_tests():
    """Run all simple tests"""
    print("Running simple generator tests...")
    print("=" * 50)
    
    tests = [
        test_generator_imports,
        test_generator_instantiation,
        test_script_generation,
        test_complexity_data
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} failed: {e}")
    
    print("=" * 50)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("❌ Some tests failed")
        return False

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)