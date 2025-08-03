#!/usr/bin/env python3
"""
DNS Resolution Diagram Generator for Manim
"""

from typing import Dict, List, Any
import json

class DNSResolutionGenerator:
    """Generate comprehensive DNS resolution process diagrams"""
    
    def generate_script(self, dns_data: Dict[str, Any], animation_id: str) -> str:
        """Generate detailed DNS resolution visualization script"""
        domain = dns_data.get('domain', 'example.com')
        show_cache = dns_data.get('show_cache', True)
        show_timing = dns_data.get('show_timing', True)
        record_types = dns_data.get('record_types', ['A'])
        
        script = f'''
from manim import *
import json

class DNSResolution_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        # Dark theme
        self.camera.background_color = "#0f0f0f"
        
        # Title
        title = Text("DNS Resolution Process", font_size=40, color=WHITE)
        domain_query = Text(f"Resolving: {domain}", font_size=24, color=YELLOW)
        title_group = VGroup(title, domain_query)
        title_group.arrange(DOWN, buff=0.3)
        title_group.to_edge(UP, buff=0.5)
        
        self.play(Write(title), Write(domain_query))
        self.wait(1)
        
        # Create DNS infrastructure
        self.create_dns_infrastructure()
        
        # Show resolution process
        self.animate_dns_resolution("{domain}", {show_cache}, {show_timing}, {json.dumps(record_types)})
        
        # Show final result
        self.show_resolution_result("{domain}")
        
        self.wait(3)
    
    def create_dns_infrastructure(self):
        """Create comprehensive DNS server hierarchy"""
        
        # Client/Resolver
        client_box = RoundedRectangle(
            width=2.5, height=1.5, corner_radius=0.2,
            color=BLUE, fill_opacity=0.15, stroke_width=2
        )
        client_icon = Text("💻", font_size=32)
        client_label = Text("DNS Resolver\\n(ISP/Local)", font_size=14, color=BLUE)
        client_group = VGroup(client_box, client_icon, client_label)
        client_group.arrange(DOWN, buff=0.1)
        client_group.shift(DOWN * 3 + LEFT * 5)
        
        # Root DNS Server
        root_circle = Circle(radius=0.8, color=RED, fill_opacity=0.15, stroke_width=3)
        root_icon = Text("🌐", font_size=24)
        root_label = Text("Root Server\\n(.)", font_size=14, color=RED)
        root_details = Text("13 root servers\\nworldwide", font_size=10, color=GRAY)
        root_group = VGroup(root_circle, root_icon, root_label, root_details)
        root_group.arrange(DOWN, buff=0.1)
        root_group.shift(UP * 2.5)
        
        # TLD DNS Server
        tld_circle = Circle(radius=0.8, color=ORANGE, fill_opacity=0.15, stroke_width=3)
        tld_icon = Text("🏢", font_size=24)
        domain_parts = "{domain}".split('.')
        tld = domain_parts[-1] if len(domain_parts) > 1 else "com"
        tld_label = Text(f"TLD Server\\n(.{{tld}})", font_size=14, color=ORANGE)
        tld_details = Text("Top Level\\nDomain", font_size=10, color=GRAY)
        tld_group = VGroup(tld_circle, tld_icon, tld_label, tld_details)
        tld_group.arrange(DOWN, buff=0.1)
        tld_group.shift(UP * 0.5 + LEFT * 3)
        
        # Authoritative DNS Server
        auth_circle = Circle(radius=0.8, color=GREEN, fill_opacity=0.15, stroke_width=3)
        auth_icon = Text("🏛️", font_size=24)
        auth_label = Text(f"Authoritative\\n({domain})", font_size=14, color=GREEN)
        auth_details = Text("Final authority\\nfor domain", font_size=10, color=GRAY)
        auth_group = VGroup(auth_circle, auth_icon, auth_label, auth_details)
        auth_group.arrange(DOWN, buff=0.1)
        auth_group.shift(UP * 0.5 + RIGHT * 3)
        
        # Cache (if enabled)
        if {show_cache}:
            cache_box = RoundedRectangle(
                width=2, height=1, corner_radius=0.2,
                color=PURPLE, fill_opacity=0.15, stroke_width=2
            )
            cache_icon = Text("💾", font_size=20)
            cache_label = Text("DNS Cache", font_size=12, color=PURPLE)
            cache_group = VGroup(cache_box, cache_icon, cache_label)
            cache_group.arrange(DOWN, buff=0.1)
            cache_group.shift(DOWN * 1.5 + LEFT * 2)
            self.cache_group = cache_group
        
        # Store references
        self.client_group = client_group
        self.root_group = root_group
        self.tld_group = tld_group
        self.auth_group = auth_group
        
        # Animate creation
        creation_animations = [
            Create(client_group),
            Create(root_group),
            Create(tld_group),
            Create(auth_group)
        ]
        
        if {show_cache}:
            creation_animations.append(Create(cache_group))
        
        self.play(*creation_animations)
        self.wait(1)
    
    def animate_dns_resolution(self, domain, show_cache, show_timing, record_types):
        """Animate the complete DNS resolution process"""
        
        steps = [
            ("client", "root", f"Query: {{domain}}?", "1"),
            ("root", "client", f"Try .{{domain.split('.')[-1]}} TLD server", "2"),
            ("client", "tld", f"Query: {{domain}}?", "3"),
            ("tld", "client", f"Try authoritative server", "4"),
            ("client", "auth", f"Query: {{domain}}?", "5"),
            ("auth", "client", f"Answer: IP address", "6")
        ]
        
        if {{show_cache}}:
            # Add cache check step at the beginning
            steps.insert(0, ("client", "cache", f"Check cache for {{domain}}", "0"))
        
        for step_num, (from_server, to_server, message, step_id) in enumerate(steps):
            
            # Create step indicator
            step_text = Text(f"Step {{step_id}}: {{message}}", 
                           font_size=16, color=YELLOW)
            step_text.to_edge(DOWN, buff=0.5)
            
            self.play(Write(step_text))
            
            # Get server positions
            from_pos = self.get_server_position(from_server)
            to_pos = self.get_server_position(to_server)
            
            # Create arrow
            arrow = Arrow(from_pos, to_pos, color=self.get_step_color(step_num))
            
            # Create message label
            message_label = Text(message, font_size=12, color=WHITE)
            message_label.next_to(arrow, UP if from_pos[1] < to_pos[1] else DOWN, buff=0.1)
            
            # Show timing if enabled
            if show_timing:
                timings = [1, 50, 30, 25, 20, 15, 10]  # Cache hit is fastest
                timing_ms = timings[step_num % len(timings)]
                timing = Text(f"~{{timing_ms}}ms", 
                            font_size=10, color=GRAY)
                timing.next_to(message_label, DOWN, buff=0.1)
                
                self.play(Create(arrow), Write(message_label), Write(timing))
                self.wait(1.5)
                self.play(FadeOut(arrow), FadeOut(message_label), FadeOut(timing))
            else:
                self.play(Create(arrow), Write(message_label))
                self.wait(1.5)
                self.play(FadeOut(arrow), FadeOut(message_label))
            
            self.play(FadeOut(step_text))
            self.wait(0.5)
    
    def get_server_position(self, server_name):
        """Get position of DNS server"""
        positions = {{
            "client": self.client_group.get_center(),
            "cache": self.cache_group.get_center() if hasattr(self, 'cache_group') else self.client_group.get_center(),
            "root": self.root_group.get_center(),
            "tld": self.tld_group.get_center(),
            "auth": self.auth_group.get_center()
        }}
        return positions.get(server_name, ORIGIN)
    
    def get_step_color(self, step_num):
        """Get color for each step"""
        colors = [PURPLE, BLUE, ORANGE, YELLOW, GREEN, RED, PINK]
        return colors[step_num % len(colors)]
    
    def get_step_timing(self, step_num):
        """Get realistic timing for each step"""
        timings = [1, 50, 30, 25, 20, 15, 10]  # Cache hit is fastest
        return timings[step_num % len(timings)]
    
    def show_resolution_result(self, domain):
        """Show final DNS resolution result"""
        
        # Clear previous content
        result_box = RoundedRectangle(
            width=8, height=2, corner_radius=0.3,
            color=GREEN, fill_opacity=0.2, stroke_width=2
        )
        result_box.shift(DOWN * 2)
        
        # Result content
        result_title = Text("DNS Resolution Complete!", font_size=24, color=GREEN)
        result_details = Text(
            f"{domain} → 203.0.113.1\\n"
            f"Record Type: A\\n"
            f"TTL: 3600 seconds\\n"
            f"Total Resolution Time: ~150ms",
            font_size=16, color=WHITE
        )
        
        result_group = VGroup(result_title, result_details)
        result_group.arrange(DOWN, buff=0.3)
        result_group.move_to(result_box.get_center())
        
        # DNS record types explanation
        record_types_title = Text("Common DNS Record Types:", font_size=18, color=YELLOW)
        record_types_list = Text(
            "A: IPv4 address\\n"
            "AAAA: IPv6 address\\n"
            "CNAME: Canonical name\\n"
            "MX: Mail exchange\\n"
            "NS: Name server\\n"
            "TXT: Text records",
            font_size=14, color=GRAY
        )
        
        record_types_group = VGroup(record_types_title, record_types_list)
        record_types_group.arrange(DOWN, buff=0.2)
        record_types_group.to_edge(RIGHT, buff=1)
        
        # Animate result
        self.play(Create(result_box))
        self.play(Write(result_group))
        self.wait(1)
        self.play(Write(record_types_group))
        self.wait(2)
        
        # Show caching benefit
        cache_benefit = Text(
            "💡 DNS caching reduces future lookup times\\n"
            "from ~150ms to ~1ms for cached entries",
            font_size=14, color=BLUE
        )
        cache_benefit.to_edge(LEFT, buff=1).shift(DOWN * 1)
        
        self.play(Write(cache_benefit))
        self.wait(2)
'''
        
        return script
    
    def generate_dns_security_script(self, security_data: Dict[str, Any], animation_id: str) -> str:
        """Generate DNS security (DNSSEC) visualization"""
        domain = security_data.get('domain', 'secure.example.com')
        
        script = f'''
from manim import *

class DNSSecurity_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        self.camera.background_color = "#0f0f0f"
        
        # Title
        title = Text("DNS Security (DNSSEC)", font_size=36, color=WHITE)
        subtitle = Text("Protecting against DNS spoofing and cache poisoning", 
                       font_size=18, color=GRAY)
        title_group = VGroup(title, subtitle)
        title_group.arrange(DOWN, buff=0.3)
        title_group.to_edge(UP)
        
        self.play(Write(title), Write(subtitle))
        self.wait(1)
        
        # Show security threats
        self.show_dns_threats()
        
        # Show DNSSEC solution
        self.show_dnssec_solution()
        
        self.wait(3)
    
    def show_dns_threats(self):
        """Show common DNS security threats"""
        threats_title = Text("DNS Security Threats", font_size=24, color=RED)
        threats_title.shift(UP * 2)
        
        threats = [
            ("DNS Spoofing", "Attacker provides false DNS responses", RED),
            ("Cache Poisoning", "Malicious data stored in DNS cache", ORANGE),
            ("Man-in-the-Middle", "Intercepting DNS queries/responses", YELLOW)
        ]
        
        threat_objects = []
        for i, (threat, description, color) in enumerate(threats):
            threat_box = Rectangle(width=6, height=0.8, color=color, fill_opacity=0.1)
            threat_text = Text(f"{{threat}}: {{description}}", font_size=14, color=color)
            threat_text.move_to(threat_box.get_center())
            
            threat_group = VGroup(threat_box, threat_text)
            threat_group.shift(UP * (0.5 - i * 1))
            threat_objects.append(threat_group)
        
        self.play(Write(threats_title))
        for threat_obj in threat_objects:
            self.play(Create(threat_obj))
            self.wait(0.5)
        
        self.wait(1)
        
        # Clear threats
        self.play(
            FadeOut(threats_title),
            *[FadeOut(obj) for obj in threat_objects]
        )
    
    def show_dnssec_solution(self):
        """Show how DNSSEC solves security issues"""
        solution_title = Text("DNSSEC Solution", font_size=24, color=GREEN)
        solution_title.shift(UP * 2.5)
        
        # Digital signatures concept
        signature_box = RoundedRectangle(
            width=7, height=1.5, corner_radius=0.2,
            color=GREEN, fill_opacity=0.1, stroke_width=2
        )
        signature_text = Text(
            "Digital Signatures: Each DNS record is cryptographically signed\\n"
            "Chain of Trust: Signatures verified from root to authoritative server",
            font_size=16, color=GREEN
        )
        signature_text.move_to(signature_box.get_center())
        
        signature_group = VGroup(signature_box, signature_text)
        signature_group.shift(UP * 0.5)
        
        # Verification process
        verification_title = Text("Verification Process:", font_size=18, color=YELLOW)
        verification_steps = Text(
            "1. DNS resolver requests record + signature\\n"
            "2. Resolver verifies signature using public key\\n"
            "3. If signature valid → trust record\\n"
            "4. If signature invalid → reject record",
            font_size=14, color=WHITE
        )
        
        verification_group = VGroup(verification_title, verification_steps)
        verification_group.arrange(DOWN, buff=0.3)
        verification_group.shift(DOWN * 1.5)
        
        self.play(Write(solution_title))
        self.play(Create(signature_group))
        self.wait(1)
        self.play(Write(verification_group))
        self.wait(2)
'''
        
        return script