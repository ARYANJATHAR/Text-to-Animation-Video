#!/usr/bin/env python3
"""
Manim Service - REST API for generating mathematical diagrams and animations
"""

import os
import uuid
import json
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
OUTPUT_DIR = Path(os.getenv('MANIM_OUTPUT_DIR', './output'))
OUTPUT_DIR.mkdir(exist_ok=True)

class ManimServiceError(Exception):
    """Custom exception for Manim service errors"""
    pass

class ManimGenerator:
    """Core class for generating Manim animations"""
    
    def __init__(self):
        self.output_dir = OUTPUT_DIR
        
    def generate_http_flow_diagram(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate HTTP request flow diagram"""
        animation_id = str(uuid.uuid4())
        script_content = self._create_http_flow_script(flow_data, animation_id)
        
        return self._execute_manim_script(script_content, animation_id, "HTTPFlow")
    
    def generate_dns_resolution_diagram(self, dns_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate DNS resolution process diagram"""
        animation_id = str(uuid.uuid4())
        script_content = self._create_dns_resolution_script(dns_data, animation_id)
        
        return self._execute_manim_script(script_content, animation_id, "DNSResolution")
    
    def generate_data_structure_diagram(self, structure_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate data structure visualization"""
        animation_id = str(uuid.uuid4())
        script_content = self._create_data_structure_script(structure_data, animation_id)
        
        return self._execute_manim_script(script_content, animation_id, "DataStructure")
    
    def generate_process_flow_diagram(self, process_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate generic process flow diagram"""
        animation_id = str(uuid.uuid4())
        script_content = self._create_process_flow_script(process_data, animation_id)
        
        return self._execute_manim_script(script_content, animation_id, "ProcessFlow")
    
    def _create_http_flow_script(self, flow_data: Dict[str, Any], animation_id: str) -> str:
        """Create Manim script for HTTP flow visualization"""
        from generators.http_flow_generator import HTTPFlowGenerator
        generator = HTTPFlowGenerator()
        return generator.generate_script(flow_data, animation_id)
    
    def _create_dns_resolution_script(self, dns_data: Dict[str, Any], animation_id: str) -> str:
        """Create Manim script for DNS resolution visualization"""
        from generators.dns_resolution_generator import DNSResolutionGenerator
        generator = DNSResolutionGenerator()
        return generator.generate_script(dns_data, animation_id)
    
    def _create_data_structure_script(self, structure_data: Dict[str, Any], animation_id: str) -> str:
        """Create Manim script for data structure visualization"""
        from generators.data_structure_generator import DataStructureGenerator
        generator = DataStructureGenerator()
        return generator.generate_script(structure_data, animation_id)
    
    def _create_process_flow_script(self, process_data: Dict[str, Any], animation_id: str) -> str:
        """Create Manim script for generic process flow"""
        from generators.process_flow_generator import ProcessFlowGenerator
        generator = ProcessFlowGenerator()
        return generator.generate_script(process_data, animation_id)
    
    def _execute_manim_script(self, script_content: str, animation_id: str, class_name: str) -> Dict[str, Any]:
        """Execute Manim script and return video information"""
        try:
            # Create temporary script file
            script_file = self.output_dir / f"{animation_id}.py"
            with open(script_file, 'w') as f:
                f.write(script_content)
            
            # Execute Manim command
            output_file = self.output_dir / f"{animation_id}.mp4"
            cmd = [
                'manim',
                str(script_file),
                f"{class_name}_{animation_id.replace('-', '_')}",
                '--format=mp4',
                '--media_dir', str(self.output_dir),
                '--video_dir', str(self.output_dir),
                '--quality=medium_quality',
                '--disable_caching'
            ]
            
            logger.info(f"Executing Manim command: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            if result.returncode != 0:
                logger.error(f"Manim execution failed: {result.stderr}")
                raise ManimServiceError(f"Manim execution failed: {result.stderr}")
            
            # Find the generated video file
            video_files = list(self.output_dir.glob(f"*{animation_id}*.mp4"))
            if not video_files:
                # Try alternative naming pattern
                video_files = list(self.output_dir.glob(f"{class_name}_{animation_id.replace('-', '_')}.mp4"))
            
            if not video_files:
                raise ManimServiceError("Generated video file not found")
            
            video_file = video_files[0]
            
            # Get video duration (simplified - in real implementation would use ffprobe)
            duration = 10.0  # Default duration
            
            return {
                'id': animation_id,
                'file_path': str(video_file),
                'duration': duration,
                'resolution': [1920, 1080],
                'fps': 30,
                'status': 'completed'
            }
            
        except subprocess.TimeoutExpired:
            raise ManimServiceError("Manim execution timed out")
        except Exception as e:
            logger.error(f"Error executing Manim script: {str(e)}")
            raise ManimServiceError(f"Error executing Manim script: {str(e)}")
        finally:
            # Clean up script file
            if script_file.exists():
                script_file.unlink()

# Initialize Manim generator
manim_generator = ManimGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'manim-service'})

@app.route('/generate/http-flow', methods=['POST'])
def generate_http_flow():
    """Generate HTTP request flow diagram"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = manim_generator.generate_http_flow_diagram(data)
        return jsonify(result)
    
    except ManimServiceError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in generate_http_flow: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/generate/dns-resolution', methods=['POST'])
def generate_dns_resolution():
    """Generate DNS resolution process diagram"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = manim_generator.generate_dns_resolution_diagram(data)
        return jsonify(result)
    
    except ManimServiceError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in generate_dns_resolution: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/generate/data-structure', methods=['POST'])
def generate_data_structure():
    """Generate data structure visualization"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = manim_generator.generate_data_structure_diagram(data)
        return jsonify(result)
    
    except ManimServiceError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in generate_data_structure: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/generate/process-flow', methods=['POST'])
def generate_process_flow():
    """Generate generic process flow diagram"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = manim_generator.generate_process_flow_diagram(data)
        return jsonify(result)
    
    except ManimServiceError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in generate_process_flow: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/video/<animation_id>', methods=['GET'])
def get_video(animation_id: str):
    """Serve generated video file"""
    try:
        video_files = list(OUTPUT_DIR.glob(f"*{animation_id}*.mp4"))
        if not video_files:
            return jsonify({'error': 'Video not found'}), 404
        
        return send_file(video_files[0], as_attachment=True)
    
    except Exception as e:
        logger.error(f"Error serving video {animation_id}: {str(e)}")
        return jsonify({'error': 'Error serving video'}), 500

@app.route('/status/<animation_id>', methods=['GET'])
def get_status(animation_id: str):
    """Get animation generation status"""
    try:
        video_files = list(OUTPUT_DIR.glob(f"*{animation_id}*.mp4"))
        
        if video_files:
            return jsonify({
                'id': animation_id,
                'status': 'completed',
                'file_path': str(video_files[0])
            })
        else:
            return jsonify({
                'id': animation_id,
                'status': 'processing'
            })
    
    except Exception as e:
        logger.error(f"Error checking status for {animation_id}: {str(e)}")
        return jsonify({'error': 'Error checking status'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Manim service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)