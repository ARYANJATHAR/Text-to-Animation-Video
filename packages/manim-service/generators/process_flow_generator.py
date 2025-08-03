#!/usr/bin/env python3
"""
Process Flow Diagram Generator for Manim
"""

from typing import Dict, List, Any
import json

class ProcessFlowGenerator:
    """Generate comprehensive process flow diagrams for technical concepts"""
    
    def generate_script(self, process_data: Dict[str, Any], animation_id: str) -> str:
        """Generate process flow visualization script"""
        steps = process_data.get('steps', [])
        title = process_data.get('title', 'Process Flow')
        flow_type = process_data.get('flow_type', 'linear')
        show_timing = process_data.get('show_timing', False)
        
        script = f'''
from manim import *
import json

class ProcessFlow_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        # Dark professional theme
        self.camera.background_color = "#0d1117"
        
        # Title
        title = Text("{title}", font_size=40, color=WHITE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)
        
        # Create process flow based on type
        if "{flow_type}" == "linear":
            self.create_linear_flow({json.dumps(steps)}, {show_timing})
        elif "{flow_type}" == "branching":
            self.create_branching_flow({json.dumps(steps)}, {show_timing})
        elif "{flow_type}" == "circular":
            self.create_circular_flow({json.dumps(steps)}, {show_timing})
        else:
            self.create_linear_flow({json.dumps(steps)}, {show_timing})
        
        # Show process summary
        self.show_process_summary({json.dumps(steps)})
        
        self.wait(3)
    
    def create_linear_flow(self, steps_data, show_timing):
        """Create linear process flow diagram"""
        step_objects = []
        arrows = []
        
        for i, step in enumerate(steps_data):
            step_name = step.get('name', f'Step {{i+1}}')
            step_type = step.get('type', 'process')
            description = step.get('description', '')
            timing = step.get('timing', f'{{i+1}}s') if show_timing else None
            
            # Create shape based on step type
            shape = self.create_step_shape(step_type, step_name)
            
            # Position vertically
            y_position = 2 - i * 1.8
            shape.shift(UP * y_position)
            
            # Add description if available
            if description:
                desc_text = Text(description, font_size=12, color=GRAY)
                desc_text.next_to(shape, RIGHT, buff=0.5)
                shape = VGroup(shape, desc_text)
            
            # Add timing if enabled
            if timing:
                timing_text = Text(f"⏱️ {{timing}}", font_size=10, color=YELLOW)
                timing_text.next_to(shape, LEFT, buff=0.5)
                shape = VGroup(shape, timing_text)
            
            step_objects.append(shape)
            
            # Create arrow to next step
            if i < len(steps_data) - 1:
                arrow = Arrow(
                    shape.get_bottom() + DOWN * 0.1,
                    shape.get_bottom() + DOWN * 0.7,
                    color=WHITE, stroke_width=2
                )
                arrows.append(arrow)
        
        # Animate creation
        for i, (step_obj, arrow) in enumerate(zip(step_objects, arrows + [None])):
            self.play(Create(step_obj))
            self.wait(0.5)
            
            if arrow:
                self.play(Create(arrow))
                self.wait(0.3)
        
        # Store references
        self.step_objects = step_objects
        self.arrows = arrows
    
    def create_branching_flow(self, steps_data, show_timing):
        """Create branching process flow with decision points"""
        step_objects = []
        arrows = []
        
        # Main flow
        main_steps = [step for step in steps_data if step.get('branch', 'main') == 'main']
        branch_steps = [step for step in steps_data if step.get('branch', 'main') != 'main']
        
        # Create main flow
        for i, step in enumerate(main_steps):
            step_name = step.get('name', f'Step {{i+1}}')
            step_type = step.get('type', 'process')
            
            shape = self.create_step_shape(step_type, step_name)
            shape.shift(UP * (2 - i * 2))
            step_objects.append(shape)
            
            # Decision point branches
            if step_type == 'decision':
                # Yes branch
                yes_step = next((s for s in branch_steps if s.get('condition') == 'yes'), None)
                if yes_step:
                    yes_shape = self.create_step_shape('process', yes_step.get('name', 'Yes'))
                    yes_shape.shift(RIGHT * 3 + UP * (2 - i * 2))
                    step_objects.append(yes_shape)
                    
                    yes_arrow = Arrow(shape.get_right(), yes_shape.get_left(), color=GREEN)
                    yes_label = Text("Yes", font_size=12, color=GREEN)
                    yes_label.next_to(yes_arrow, UP, buff=0.1)
                    arrows.extend([yes_arrow, yes_label])
                
                # No branch
                no_step = next((s for s in branch_steps if s.get('condition') == 'no'), None)
                if no_step:
                    no_shape = self.create_step_shape('process', no_step.get('name', 'No'))
                    no_shape.shift(LEFT * 3 + UP * (2 - i * 2))
                    step_objects.append(no_shape)
                    
                    no_arrow = Arrow(shape.get_left(), no_shape.get_right(), color=RED)
                    no_label = Text("No", font_size=12, color=RED)
                    no_label.next_to(no_arrow, UP, buff=0.1)
                    arrows.extend([no_arrow, no_label])
            
            # Main flow arrow
            if i < len(main_steps) - 1:
                main_arrow = Arrow(
                    shape.get_bottom(),
                    shape.get_bottom() + DOWN * 1.5,
                    color=WHITE
                )
                arrows.append(main_arrow)
        
        # Animate creation
        for step_obj in step_objects:
            self.play(Create(step_obj))
            self.wait(0.5)
        
        for arrow in arrows:
            self.play(Create(arrow))
            self.wait(0.3)
        
        self.step_objects = step_objects
        self.arrows = arrows
    
    def create_circular_flow(self, steps_data, show_timing):
        """Create circular/cyclical process flow"""
        if not steps_data:
            return
        
        step_objects = []
        arrows = []
        
        # Arrange steps in a circle
        num_steps = len(steps_data)
        radius = 2.5
        
        for i, step in enumerate(steps_data):
            step_name = step.get('name', f'Step {{i+1}}')
            step_type = step.get('type', 'process')
            
            # Calculate position on circle
            angle = i * 2 * PI / num_steps - PI/2  # Start from top
            x = radius * np.cos(angle)
            y = radius * np.sin(angle)
            
            shape = self.create_step_shape(step_type, step_name)
            shape.shift(RIGHT * x + UP * y)
            step_objects.append(shape)
            
            # Create arrow to next step (circular)
            next_i = (i + 1) % num_steps
            next_angle = next_i * 2 * PI / num_steps - PI/2
            next_x = radius * np.cos(next_angle)
            next_y = radius * np.sin(next_angle)
            
            # Calculate arrow positions
            start_pos = shape.get_center() + 0.5 * (RIGHT * np.cos(angle + PI/6) + UP * np.sin(angle + PI/6))
            end_pos = RIGHT * next_x + UP * next_y - 0.5 * (RIGHT * np.cos(next_angle - PI/6) + UP * np.sin(next_angle - PI/6))
            
            arrow = CurvedArrow(start_pos, end_pos, color=BLUE, angle=PI/6)
            arrows.append(arrow)
        
        # Animate creation
        for step_obj in step_objects:
            self.play(Create(step_obj))
            self.wait(0.4)
        
        for arrow in arrows:
            self.play(Create(arrow))
            self.wait(0.2)
        
        # Add cycle indicator
        cycle_text = Text("Continuous Cycle", font_size=16, color=YELLOW)
        cycle_text.shift(DOWN * 3.5)
        self.play(Write(cycle_text))
        
        self.step_objects = step_objects
        self.arrows = arrows
    
    def create_step_shape(self, step_type, step_name):
        """Create appropriate shape for step type"""
        if step_type == 'start':
            # Rounded rectangle for start
            shape = RoundedRectangle(
                width=2.5, height=0.8, corner_radius=0.4,
                color=GREEN, fill_opacity=0.2, stroke_width=2
            )
        elif step_type == 'end':
            # Rounded rectangle for end
            shape = RoundedRectangle(
                width=2.5, height=0.8, corner_radius=0.4,
                color=RED, fill_opacity=0.2, stroke_width=2
            )
        elif step_type == 'decision':
            # Diamond for decision
            shape = Polygon(
                [0, 0.6, 0], [1.5, 0, 0], [0, -0.6, 0], [-1.5, 0, 0],
                color=ORANGE, fill_opacity=0.2, stroke_width=2
            )
        elif step_type == 'subprocess':
            # Rectangle with double border for subprocess
            outer_rect = Rectangle(width=2.8, height=1, color=PURPLE, stroke_width=3)
            inner_rect = Rectangle(width=2.4, height=0.8, color=PURPLE, stroke_width=1)
            shape = VGroup(outer_rect, inner_rect)
        elif step_type == 'data':
            # Parallelogram for data
            shape = Polygon(
                [-1, -0.4, 0], [1, -0.4, 0], [1.3, 0.4, 0], [-0.7, 0.4, 0],
                color=BLUE, fill_opacity=0.2, stroke_width=2
            )
        else:
            # Default rectangle for process
            shape = Rectangle(
                width=2.5, height=0.8,
                color=BLUE, fill_opacity=0.2, stroke_width=2
            )
        
        # Add text label
        text = Text(step_name, font_size=14, color=WHITE)
        
        # Handle multi-line text
        if len(step_name) > 15:
            words = step_name.split()
            if len(words) > 1:
                mid = len(words) // 2
                line1 = ' '.join(words[:mid])
                line2 = ' '.join(words[mid:])
                text = Text(f"{{line1}}\\n{{line2}}", font_size=12, color=WHITE)
        
        text.move_to(shape.get_center())
        
        return VGroup(shape, text)
    
    def show_process_summary(self, steps_data):
        """Show summary information about the process"""
        if not steps_data:
            return
        
        # Count step types
        step_counts = {{}}
        total_steps = len(steps_data)
        
        for step in steps_data:
            step_type = step.get('type', 'process')
            step_counts[step_type] = step_counts.get(step_type, 0) + 1
        
        # Create summary box
        summary_box = RoundedRectangle(
            width=6, height=2, corner_radius=0.3,
            color=GRAY, fill_opacity=0.1, stroke_width=1
        )
        summary_box.to_edge(DOWN, buff=0.5)
        
        # Summary content
        summary_title = Text("Process Summary", font_size=18, color=YELLOW)
        
        summary_lines = [f"Total Steps: {{total_steps}}"]
        for step_type, count in step_counts.items():
            summary_lines.append(f"{{step_type.title()}}: {{count}}")
        
        summary_text = Text("\\n".join(summary_lines), font_size=14, color=WHITE)
        
        summary_content = VGroup(summary_title, summary_text)
        summary_content.arrange(DOWN, buff=0.3)
        summary_content.move_to(summary_box.get_center())
        
        # Animate summary
        self.play(Create(summary_box))
        self.play(Write(summary_content))
        self.wait(2)
'''
        
        return script
    
    def generate_authentication_flow_script(self, auth_data: Dict[str, Any], animation_id: str) -> str:
        """Generate authentication process flow"""
        auth_type = auth_data.get('type', 'basic')
        
        script = f'''
from manim import *

class AuthFlow_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        self.camera.background_color = "#0d1117"
        
        title = Text("Authentication Flow", font_size=36, color=WHITE)
        subtitle = Text("{{auth_type.title()}} Authentication", font_size=20, color=GRAY)
        title_group = VGroup(title, subtitle)
        title_group.arrange(DOWN, buff=0.3)
        title_group.to_edge(UP)
        
        self.play(Write(title), Write(subtitle))
        self.wait(1)
        
        if "{auth_type}" == "oauth":
            self.show_oauth_flow()
        elif "{auth_type}" == "jwt":
            self.show_jwt_flow()
        elif "{auth_type}" == "saml":
            self.show_saml_flow()
        else:
            self.show_basic_auth_flow()
        
        self.wait(3)
    
    def show_oauth_flow(self):
        """Show OAuth 2.0 authentication flow"""
        # Create actors
        user = self.create_actor("👤 User", LEFT * 5, BLUE)
        client = self.create_actor("📱 Client App", LEFT * 1.5, GREEN)
        auth_server = self.create_actor("🔐 Auth Server", RIGHT * 1.5, ORANGE)
        resource_server = self.create_actor("🗄️ Resource Server", RIGHT * 5, PURPLE)
        
        actors = [user, client, auth_server, resource_server]
        self.play(*[Create(actor) for actor in actors])
        self.wait(1)
        
        # OAuth flow steps
        steps = [
            (user, client, "1. Request access", BLUE),
            (client, auth_server, "2. Authorization request", GREEN),
            (auth_server, user, "3. Login prompt", ORANGE),
            (user, auth_server, "4. Credentials", BLUE),
            (auth_server, client, "5. Authorization code", ORANGE),
            (client, auth_server, "6. Token request", GREEN),
            (auth_server, client, "7. Access token", ORANGE),
            (client, resource_server, "8. API request + token", GREEN),
            (resource_server, client, "9. Protected resource", PURPLE)
        ]
        
        for from_actor, to_actor, message, color in steps:
            self.animate_message(from_actor, to_actor, message, color)
            self.wait(1)
    
    def create_actor(self, name, position, color):
        """Create an actor in the authentication flow"""
        box = RoundedRectangle(width=2, height=1, corner_radius=0.2, 
                              color=color, fill_opacity=0.2)
        text = Text(name, font_size=12, color=color)
        actor = VGroup(box, text)
        actor.shift(position + UP * 2)
        return actor
    
    def animate_message(self, from_actor, to_actor, message, color):
        """Animate message between actors"""
        arrow = Arrow(from_actor.get_bottom(), to_actor.get_bottom(), color=color)
        msg_text = Text(message, font_size=10, color=color)
        msg_text.next_to(arrow, UP, buff=0.1)
        
        self.play(Create(arrow), Write(msg_text))
        self.wait(0.5)
        self.play(FadeOut(arrow), FadeOut(msg_text))
'''
        
        return script