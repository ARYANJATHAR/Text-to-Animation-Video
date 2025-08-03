#!/usr/bin/env python3
"""
HTTP Flow Diagram Generator for Manim
"""

from typing import Dict, List, Any
import json

class HTTPFlowGenerator:
    """Generate sophisticated HTTP request flow diagrams"""
    
    def generate_script(self, flow_data: Dict[str, Any], animation_id: str) -> str:
        """Generate comprehensive HTTP flow visualization script"""
        steps = flow_data.get('steps', [])
        title = flow_data.get('title', 'HTTP Request Flow')
        show_headers = flow_data.get('show_headers', True)
        show_status_codes = flow_data.get('show_status_codes', True)
        protocol_version = flow_data.get('protocol_version', 'HTTP/1.1')
        
        script = f'''
from manim import *
import json

class HTTPFlow_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        # Configuration
        self.camera.background_color = "#1e1e1e"
        
        # Title with protocol version
        title = Text("{title}", font_size=40, color=WHITE)
        protocol = Text("{protocol_version}", font_size=24, color=GRAY)
        title_group = VGroup(title, protocol)
        title_group.arrange(DOWN, buff=0.3)
        title_group.to_edge(UP, buff=0.5)
        
        self.play(Write(title), Write(protocol))
        self.wait(1)
        
        # Create client and server with detailed styling
        self.create_client_server_architecture()
        
        # Show HTTP request/response cycle
        self.animate_http_cycle({json.dumps(steps)}, {show_headers}, {show_status_codes})
        
        # Show final summary
        self.show_summary()
        
        self.wait(3)
    
    def create_client_server_architecture(self):
        """Create detailed client-server architecture"""
        # Client side
        client_box = RoundedRectangle(
            width=3, height=2, corner_radius=0.2, 
            color=BLUE, fill_opacity=0.1, stroke_width=2
        )
        client_icon = Text("🌐", font_size=48)
        client_label = Text("Client\\n(Browser)", font_size=20, color=BLUE)
        client_details = Text("Port: Dynamic\\nIP: 192.168.1.100", font_size=12, color=GRAY)
        
        client_group = VGroup(client_box, client_icon, client_label, client_details)
        client_group.arrange(DOWN, buff=0.2)
        client_group.shift(LEFT * 5)
        
        # Server side
        server_box = RoundedRectangle(
            width=3, height=2, corner_radius=0.2,
            color=GREEN, fill_opacity=0.1, stroke_width=2
        )
        server_icon = Text("🖥️", font_size=48)
        server_label = Text("Web Server\\n(Apache/Nginx)", font_size=20, color=GREEN)
        server_details = Text("Port: 80/443\\nIP: 203.0.113.1", font_size=12, color=GRAY)
        
        server_group = VGroup(server_box, server_icon, server_label, server_details)
        server_group.arrange(DOWN, buff=0.2)
        server_group.shift(RIGHT * 5)
        
        # Internet cloud
        internet = Text("☁️", font_size=36, color=YELLOW)
        internet_label = Text("Internet", font_size=16, color=YELLOW)
        internet_group = VGroup(internet, internet_label)
        internet_group.arrange(DOWN, buff=0.1)
        internet_group.shift(UP * 0.5)
        
        # Store references
        self.client_group = client_group
        self.server_group = server_group
        self.internet_group = internet_group
        
        # Animate creation
        self.play(
            Create(client_group),
            Create(server_group),
            Create(internet_group)
        )
        self.wait(1)
    
    def animate_http_cycle(self, steps_data, show_headers, show_status_codes):
        """Animate the complete HTTP request/response cycle"""
        
        for i, step in enumerate(steps_data):
            step_number = i + 1
            description = step.get('description', f'Step {{step_number}}')
            direction = step.get('direction', 'request')
            method = step.get('method', 'GET')
            url = step.get('url', '/api/data')
            status_code = step.get('status_code', 200)
            headers = step.get('headers', {{}})
            
            # Create step indicator
            step_indicator = Text(f"Step {{step_number}}: {{description}}", 
                                font_size=18, color=YELLOW)
            step_indicator.to_edge(DOWN, buff=2)
            
            self.play(Write(step_indicator))
            
            if direction == 'request':
                self.animate_request(method, url, headers if show_headers else None)
            else:
                self.animate_response(status_code if show_status_codes else None, 
                                    headers if show_headers else None)
            
            self.wait(1.5)
            self.play(FadeOut(step_indicator))
    
    def animate_request(self, method, url, headers):
        """Animate HTTP request with details"""
        # Request arrow
        request_arrow = Arrow(
            self.client_group.get_right() + RIGHT * 0.2,
            self.server_group.get_left() + LEFT * 0.2,
            color=ORANGE, stroke_width=4
        )
        
        # Request details
        request_text = f"{{method}} {{url}}"
        request_label = Text(request_text, font_size=16, color=ORANGE)
        request_label.next_to(request_arrow, UP, buff=0.2)
        
        # Headers (if enabled)
        if headers:
            header_lines = []
            for key, value in headers.items():
                header_lines.append(f"{{key}}: {{value}}")
            
            if header_lines:
                headers_text = "\\n".join(header_lines[:3])  # Show max 3 headers
                headers_label = Text(headers_text, font_size=12, color=GRAY)
                headers_label.next_to(request_label, DOWN, buff=0.1)
                
                self.play(
                    Create(request_arrow),
                    Write(request_label),
                    Write(headers_label)
                )
                
                self.wait(1)
                self.play(FadeOut(request_arrow), FadeOut(request_label), FadeOut(headers_label))
            else:
                self.play(Create(request_arrow), Write(request_label))
                self.wait(1)
                self.play(FadeOut(request_arrow), FadeOut(request_label))
        else:
            self.play(Create(request_arrow), Write(request_label))
            self.wait(1)
            self.play(FadeOut(request_arrow), FadeOut(request_label))
    
    def animate_response(self, status_code, headers):
        """Animate HTTP response with details"""
        # Response arrow
        response_arrow = Arrow(
            self.server_group.get_left() + LEFT * 0.2,
            self.client_group.get_right() + RIGHT * 0.2,
            color=GREEN, stroke_width=4
        )
        
        # Response details
        if status_code:
            status_text = self.get_status_text(status_code)
            response_text = f"{{status_code}} {{status_text}}"
        else:
            response_text = "Response"
            
        response_label = Text(response_text, font_size=16, color=GREEN)
        response_label.next_to(response_arrow, DOWN, buff=0.2)
        
        # Headers (if enabled)
        if headers:
            header_lines = []
            for key, value in headers.items():
                header_lines.append(f"{{key}}: {{value}}")
            
            if header_lines:
                headers_text = "\\n".join(header_lines[:3])  # Show max 3 headers
                headers_label = Text(headers_text, font_size=12, color=GRAY)
                headers_label.next_to(response_label, DOWN, buff=0.1)
                
                self.play(
                    Create(response_arrow),
                    Write(response_label),
                    Write(headers_label)
                )
                
                self.wait(1)
                self.play(FadeOut(response_arrow), FadeOut(response_label), FadeOut(headers_label))
            else:
                self.play(Create(response_arrow), Write(response_label))
                self.wait(1)
                self.play(FadeOut(response_arrow), FadeOut(response_label))
        else:
            self.play(Create(response_arrow), Write(response_label))
            self.wait(1)
            self.play(FadeOut(response_arrow), FadeOut(response_label))
    
    def get_status_text(self, status_code):
        """Get HTTP status text for status code"""
        status_texts = {{
            200: "OK",
            201: "Created",
            204: "No Content",
            301: "Moved Permanently",
            302: "Found",
            304: "Not Modified",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable"
        }}
        return status_texts.get(status_code, "Unknown")
    
    def show_summary(self):
        """Show summary of HTTP communication"""
        summary_title = Text("HTTP Communication Summary", font_size=24, color=YELLOW)
        summary_title.to_edge(DOWN, buff=1.5)
        
        summary_points = [
            "• Stateless protocol - each request is independent",
            "• Client initiates communication with requests",
            "• Server responds with status codes and data",
            "• Headers provide metadata about the communication"
        ]
        
        summary_text = Text("\\n".join(summary_points), font_size=14, color=WHITE)
        summary_text.next_to(summary_title, DOWN, buff=0.3)
        
        self.play(Write(summary_title))
        self.play(Write(summary_text))
        self.wait(2)
'''
        
        return script
    
    def generate_rest_api_script(self, api_data: Dict[str, Any], animation_id: str) -> str:
        """Generate REST API specific visualization"""
        endpoints = api_data.get('endpoints', [])
        base_url = api_data.get('base_url', 'https://api.example.com')
        
        script = f'''
from manim import *

class RESTAPIFlow_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"
        
        # Title
        title = Text("REST API Communication", font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Base URL
        base_url_text = Text("Base URL: {base_url}", font_size=18, color=GRAY)
        base_url_text.next_to(title, DOWN, buff=0.5)
        self.play(Write(base_url_text))
        
        # Create REST methods visualization
        self.show_rest_methods()
        
        # Show specific endpoints
        self.show_endpoints({json.dumps(endpoints)})
        
        self.wait(3)
    
    def show_rest_methods(self):
        """Show common REST HTTP methods"""
        methods = [
            ("GET", "Retrieve data", GREEN),
            ("POST", "Create new resource", BLUE),
            ("PUT", "Update entire resource", ORANGE),
            ("PATCH", "Partial update", YELLOW),
            ("DELETE", "Remove resource", RED)
        ]
        
        method_objects = []
        
        for i, (method, description, color) in enumerate(methods):
            method_box = Rectangle(width=1.5, height=0.6, color=color, fill_opacity=0.2)
            method_text = Text(method, font_size=16, color=color)
            desc_text = Text(description, font_size=12, color=WHITE)
            
            method_group = VGroup(method_box, method_text)
            method_group.arrange(DOWN, buff=0.1)
            
            full_group = VGroup(method_group, desc_text)
            full_group.arrange(DOWN, buff=0.2)
            
            # Position methods horizontally
            full_group.shift(LEFT * 4 + RIGHT * i * 2)
            method_objects.append(full_group)
        
        # Animate methods
        for method_obj in method_objects:
            self.play(Create(method_obj))
            self.wait(0.3)
        
        self.wait(1)
        
        # Store for later use
        self.method_objects = method_objects
    
    def show_endpoints(self, endpoints_data):
        """Show specific API endpoints"""
        if not endpoints_data:
            return
        
        # Clear methods
        self.play(*[FadeOut(obj) for obj in self.method_objects])
        
        for i, endpoint in enumerate(endpoints_data):
            method = endpoint.get('method', 'GET')
            path = endpoint.get('path', '/')
            description = endpoint.get('description', 'API endpoint')
            
            # Create endpoint visualization
            endpoint_text = Text(f"{{method}} {{path}}", font_size=20, color=BLUE)
            desc_text = Text(description, font_size=14, color=GRAY)
            
            endpoint_group = VGroup(endpoint_text, desc_text)
            endpoint_group.arrange(DOWN, buff=0.2)
            endpoint_group.shift(UP * (2 - i * 1))
            
            self.play(Write(endpoint_group))
            self.wait(1)
'''
        
        return script