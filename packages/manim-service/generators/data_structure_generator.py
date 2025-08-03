#!/usr/bin/env python3
"""
Data Structure Visualization Generator for Manim
"""

from typing import Dict, List, Any
import json

class DataStructureGenerator:
    """Generate comprehensive data structure and algorithm visualizations"""
    
    def generate_script(self, structure_data: Dict[str, Any], animation_id: str) -> str:
        """Generate data structure visualization script"""
        structure_type = structure_data.get('type', 'array')
        data = structure_data.get('data', [1, 2, 3, 4, 5])
        operations = structure_data.get('operations', [])
        show_complexity = structure_data.get('show_complexity', True)
        complexity_info = self.get_complexity_data(structure_type)
        
        script = f'''
from manim import *
import json

class DataStructure_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        # Dark theme for better visibility
        self.camera.background_color = "#1a1a1a"
        
        # Complexity information
        complexity_info = {json.dumps(complexity_info)}
        
        # Title
        title = Text(f"{structure_type.replace('_', ' ').title()} Visualization", 
                    font_size=36, color=WHITE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)
        
        # Show time complexity if enabled
        if {show_complexity}:
            self.show_complexity_info()
        
        # Create and animate the data structure
        if "{structure_type}" == "array":
            self.create_array_visualization({json.dumps(data)}, {json.dumps(operations)})
        elif "{structure_type}" == "linked_list":
            self.create_linked_list_visualization({json.dumps(data)}, {json.dumps(operations)})
        elif "{structure_type}" == "stack":
            self.create_stack_visualization({json.dumps(data)}, {json.dumps(operations)})
        elif "{structure_type}" == "queue":
            self.create_queue_visualization({json.dumps(data)}, {json.dumps(operations)})
        elif "{structure_type}" == "binary_tree":
            self.create_binary_tree_visualization({json.dumps(data)}, {json.dumps(operations)})
        elif "{structure_type}" == "hash_table":
            self.create_hash_table_visualization({json.dumps(data)}, {json.dumps(operations)})
        elif "{structure_type}" == "graph":
            self.create_graph_visualization({json.dumps(data)}, {json.dumps(operations)})
        else:
            self.create_generic_visualization({json.dumps(data)})
        
        self.wait(3)
    
    def show_complexity_info(self):
        """Show time and space complexity information"""
        
        complexity_title = Text("Time Complexity", font_size=20, color=YELLOW)
        complexity_title.to_edge(LEFT, buff=1).shift(UP * 2)
        
        complexity_text = Text(
            f"Access: {complexity_info['access']}\\n"
            f"Search: {complexity_info['search']}\\n"
            f"Insert: {complexity_info['insert']}\\n"
            f"Delete: {complexity_info['delete']}",
            font_size=14, color=WHITE
        )
        complexity_text.next_to(complexity_title, DOWN, buff=0.3)
        
        space_title = Text("Space Complexity", font_size=20, color=BLUE)
        space_title.next_to(complexity_text, DOWN, buff=0.5)
        
        space_text = Text(f"Space: {complexity_info['space']}", font_size=14, color=WHITE)
        space_text.next_to(space_title, DOWN, buff=0.3)
        
        complexity_group = VGroup(complexity_title, complexity_text, space_title, space_text)
        
        self.play(Write(complexity_group))
        self.wait(1)
        
        # Store for later reference
        self.complexity_group = complexity_group
    
    def get_complexity_data(self, structure_type):
        """Get complexity data for different data structures"""
        complexities = {
            "array": {
                "access": "O(1)", "search": "O(n)", "insert": "O(n)", "delete": "O(n)", "space": "O(n)"
            },
            "linked_list": {
                "access": "O(n)", "search": "O(n)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "stack": {
                "access": "O(n)", "search": "O(n)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "queue": {
                "access": "O(n)", "search": "O(n)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "binary_tree": {
                "access": "O(log n)", "search": "O(log n)", "insert": "O(log n)", "delete": "O(log n)", "space": "O(n)"
            },
            "hash_table": {
                "access": "N/A", "search": "O(1)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "graph": {
                "access": "O(V+E)", "search": "O(V+E)", "insert": "O(1)", "delete": "O(V+E)", "space": "O(V+E)"
            }
        }
        return complexities.get(structure_type, {
            "access": "O(?)", "search": "O(?)", "insert": "O(?)", "delete": "O(?)", "space": "O(?)"
        })
    
    def create_array_visualization(self, data, operations):
        """Create detailed array visualization with operations"""
        # Create array boxes with indices
        boxes = []
        values = []
        indices = []
        
        for i, value in enumerate(data):
            # Box
            box = Rectangle(width=1.2, height=1, color=BLUE, fill_opacity=0.2, stroke_width=2)
            box.shift(RIGHT * (i - len(data)/2 + 0.5) * 1.4)
            
            # Value
            value_text = Text(str(value), font_size=20, color=WHITE)
            value_text.move_to(box.get_center())
            
            # Index
            index_text = Text(str(i), font_size=14, color=GRAY)
            index_text.next_to(box, DOWN, buff=0.2)
            
            boxes.append(box)
            values.append(value_text)
            indices.append(index_text)
        
        # Memory addresses (simulated)
        addresses = []
        base_address = 1000
        for i, box in enumerate(boxes):
            addr_text = Text(f"0x{base_address + i*4:X}", font_size=10, color=GRAY)
            addr_text.next_to(box, UP, buff=0.2)
            addresses.append(addr_text)
        
        # Animate creation
        array_elements = boxes + values + indices + addresses
        
        self.play(*[Create(elem) for elem in array_elements])
        self.wait(1)
        
        # Show array properties
        properties = Text(
            "Properties:\\n"
            "• Fixed size\\n"
            "• Contiguous memory\\n"
            "• Random access O(1)\\n"
            "• Cache-friendly",
            font_size=12, color=GREEN
        )
        properties.to_edge(RIGHT, buff=1)
        self.play(Write(properties))
        self.wait(1)
        
        # Perform operations if any
        self.perform_array_operations(operations, boxes, values, indices)
        
        # Store references
        self.array_boxes = boxes
        self.array_values = values
        self.array_indices = indices
    
    def create_linked_list_visualization(self, data, operations):
        """Create linked list visualization with pointers"""
        nodes = []
        arrows = []
        
        for i, value in enumerate(data):
            # Node structure: [data|next]
            data_box = Rectangle(width=1, height=0.8, color=GREEN, fill_opacity=0.2)
            pointer_box = Rectangle(width=0.6, height=0.8, color=ORANGE, fill_opacity=0.2)
            
            # Position nodes
            node_x = i * 3 - len(data) * 1.5 + 1.5
            data_box.shift(RIGHT * node_x)
            pointer_box.shift(RIGHT * (node_x + 0.8))
            
            # Value text
            value_text = Text(str(value), font_size=16, color=WHITE)
            value_text.move_to(data_box.get_center())
            
            # Pointer indicator
            if i < len(data) - 1:
                pointer_text = Text("→", font_size=16, color=ORANGE)
                pointer_text.move_to(pointer_box.get_center())
                
                # Arrow to next node
                arrow = Arrow(
                    pointer_box.get_right(),
                    pointer_box.get_right() + RIGHT * 1.4,
                    color=ORANGE, stroke_width=2
                )
                arrows.append(arrow)
            else:
                pointer_text = Text("∅", font_size=16, color=RED)
                pointer_text.move_to(pointer_box.get_center())
            
            node_group = VGroup(data_box, pointer_box, value_text, pointer_text)
            nodes.append(node_group)
        
        # Animate creation
        for i, node in enumerate(nodes):
            self.play(Create(node))
            if i < len(arrows):
                self.play(Create(arrows[i]))
            self.wait(0.5)
        
        # Show linked list properties
        properties = Text(
            "Properties:\\n"
            "• Dynamic size\\n"
            "• Non-contiguous memory\\n"
            "• Sequential access O(n)\\n"
            "• Efficient insertion/deletion",
            font_size=12, color=GREEN
        )
        properties.to_edge(RIGHT, buff=1)
        self.play(Write(properties))
        self.wait(1)
        
        # Perform operations
        self.perform_linked_list_operations(operations, nodes, arrows)
    
    def create_stack_visualization(self, data, operations):
        """Create stack (LIFO) visualization"""
        stack_base = Rectangle(width=2.5, height=0.3, color=GRAY, fill_opacity=0.5)
        stack_base.shift(DOWN * 3)
        
        self.play(Create(stack_base))
        
        # Stack elements
        elements = []
        for i, value in enumerate(data):
            element = Rectangle(width=2, height=0.6, color=BLUE, fill_opacity=0.3, stroke_width=2)
            element.shift(DOWN * (2.5 - i * 0.7))
            
            value_text = Text(str(value), font_size=16, color=WHITE)
            value_text.move_to(element.get_center())
            
            element_group = VGroup(element, value_text)
            elements.append(element_group)
            
            self.play(Create(element_group))
            self.wait(0.3)
        
        # Stack pointer (top)
        if elements:
            top_pointer = Arrow(
                elements[-1].get_right() + RIGHT * 0.5,
                elements[-1].get_right(),
                color=RED
            )
            top_label = Text("TOP", font_size=14, color=RED)
            top_label.next_to(top_pointer, RIGHT, buff=0.2)
            
            self.play(Create(top_pointer), Write(top_label))
        
        # Show LIFO principle
        lifo_text = Text("LIFO: Last In, First Out", font_size=16, color=YELLOW)
        lifo_text.to_edge(UP, buff=2)
        self.play(Write(lifo_text))
        
        # Perform stack operations
        self.perform_stack_operations(operations, elements, stack_base)
    
    def create_binary_tree_visualization(self, data, operations):
        """Create binary tree visualization"""
        if not data:
            return
        
        # Create tree nodes
        nodes = {{}}
        edges = []
        
        # Root node
        root_value = data[0]
        root_circle = Circle(radius=0.4, color=PURPLE, fill_opacity=0.3)
        root_text = Text(str(root_value), font_size=16, color=WHITE)
        root_group = VGroup(root_circle, root_text)
        nodes[0] = root_group
        
        self.play(Create(root_group))
        self.wait(0.5)
        
        # Add child nodes
        for i in range(1, min(len(data), 7)):  # Limit to 7 nodes for visibility
            node_circle = Circle(radius=0.4, color=PURPLE, fill_opacity=0.3)
            node_text = Text(str(data[i]), font_size=16, color=WHITE)
            node_group = VGroup(node_circle, node_text)
            
            # Position based on binary tree structure
            level = int(math.log2(i + 1))
            position_in_level = i - (2**level - 1)
            
            x_offset = (position_in_level - (2**(level-1) - 0.5)) * (4 / 2**level)
            y_offset = -level * 1.5
            
            node_group.shift(RIGHT * x_offset + UP * y_offset)
            nodes[i] = node_group
            
            # Create edge to parent
            parent_index = (i - 1) // 2
            if parent_index in nodes:
                edge = Line(
                    nodes[parent_index].get_center(),
                    node_group.get_center(),
                    color=WHITE, stroke_width=2
                )
                edges.append(edge)
                
                self.play(Create(edge), Create(node_group))
                self.wait(0.3)
        
        # Show tree properties
        properties = Text(
            "Binary Tree Properties:\\n"
            "• Each node has ≤ 2 children\\n"
            "• Left subtree < root < right subtree\\n"
            "• Height determines performance\\n"
            "• Balanced trees: O(log n) operations",
            font_size=12, color=GREEN
        )
        properties.to_edge(RIGHT, buff=1)
        self.play(Write(properties))
        self.wait(1)
    
    def perform_array_operations(self, operations, boxes, values, indices):
        """Perform and animate array operations"""
        for operation in operations:
            op_type = operation.get('type', 'access')
            index = operation.get('index', 0)
            value = operation.get('value', None)
            
            if op_type == 'access':
                self.highlight_array_element(boxes[index], values[index], "ACCESS", GREEN)
            elif op_type == 'update' and value is not None:
                self.update_array_element(boxes[index], values[index], str(value))
            elif op_type == 'search':
                self.search_array_element(boxes, values, str(value))
    
    def highlight_array_element(self, box, value, operation, color):
        """Highlight array element during operation"""
        original_color = box.color
        
        # Highlight
        self.play(box.animate.set_color(color))
        
        # Show operation label
        op_label = Text(operation, font_size=12, color=color)
        op_label.next_to(box, UP, buff=0.5)
        self.play(Write(op_label))
        self.wait(1)
        
        # Restore
        self.play(FadeOut(op_label), box.animate.set_color(original_color))
    
    def perform_stack_operations(self, operations, elements, stack_base):
        """Perform stack operations (push/pop)"""
        current_elements = elements.copy()
        
        for operation in operations:
            op_type = operation.get('type', 'push')
            value = operation.get('value', 0)
            
            if op_type == 'push':
                # Create new element
                new_element = Rectangle(width=2, height=0.6, color=BLUE, fill_opacity=0.3)
                new_element.shift(DOWN * (2.5 - len(current_elements) * 0.7))
                
                value_text = Text(str(value), font_size=16, color=WHITE)
                value_text.move_to(new_element.get_center())
                
                element_group = VGroup(new_element, value_text)
                current_elements.append(element_group)
                
                # Animate push
                push_label = Text("PUSH", font_size=14, color=GREEN)
                push_label.next_to(element_group, RIGHT, buff=0.5)
                
                self.play(Create(element_group), Write(push_label))
                self.wait(1)
                self.play(FadeOut(push_label))
                
            elif op_type == 'pop' and current_elements:
                # Remove top element
                top_element = current_elements.pop()
                
                pop_label = Text("POP", font_size=14, color=RED)
                pop_label.next_to(top_element, RIGHT, buff=0.5)
                
                self.play(Write(pop_label))
                self.play(FadeOut(top_element), FadeOut(pop_label))
                self.wait(1)
    
    def create_generic_visualization(self, data):
        """Create generic data structure visualization"""
        title = Text("Generic Data Structure", font_size=24, color=WHITE)
        title.shift(UP * 2)
        
        data_text = Text(f"Data: {data}", font_size=18, color=BLUE)
        data_text.next_to(title, DOWN, buff=1)
        
        self.play(Write(title), Write(data_text))
        self.wait(2)
'''
        
        return script
    
    def generate_algorithm_script(self, algorithm_data: Dict[str, Any], animation_id: str) -> str:
        """Generate algorithm visualization script"""
        algorithm_type = algorithm_data.get('type', 'sorting')
        data = algorithm_data.get('data', [64, 34, 25, 12, 22, 11, 90])
        
        script = f'''
from manim import *

class Algorithm_{animation_id.replace("-", "_")}(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a1a"
        
        title = Text(f"{algorithm_type.replace('_', ' ').title()} Algorithm", 
                    font_size=36, color=WHITE)
        title.to_edge(UP)
        self.play(Write(title))
        
        if "{algorithm_type}" == "bubble_sort":
            self.animate_bubble_sort({json.dumps(data)})
        elif "{algorithm_type}" == "binary_search":
            self.animate_binary_search({json.dumps(sorted(data))}, {data[0] if data else 25})
        elif "{algorithm_type}" == "dfs":
            self.animate_dfs()
        elif "{algorithm_type}" == "bfs":
            self.animate_bfs()
        
        self.wait(3)
    
    def animate_bubble_sort(self, data):
        """Animate bubble sort algorithm"""
        # Create bars representing data
        bars = []
        values = []
        
        for i, value in enumerate(data):
            bar_height = value / max(data) * 3
            bar = Rectangle(width=0.6, height=bar_height, color=BLUE, fill_opacity=0.7)
            bar.shift(RIGHT * (i - len(data)/2 + 0.5) * 0.8 + UP * bar_height/2)
            
            value_text = Text(str(value), font_size=12, color=WHITE)
            value_text.next_to(bar, DOWN, buff=0.1)
            
            bars.append(bar)
            values.append(value_text)
        
        # Create all bars
        self.play(*[Create(bar) for bar in bars])
        self.play(*[Write(value) for value in values])
        self.wait(1)
        
        # Bubble sort animation
        n = len(data)
        for i in range(n):
            for j in range(0, n - i - 1):
                # Highlight comparison
                self.play(
                    bars[j].animate.set_color(RED),
                    bars[j + 1].animate.set_color(RED)
                )
                
                if data[j] > data[j + 1]:
                    # Swap animation
                    data[j], data[j + 1] = data[j + 1], data[j]
                    
                    # Animate swap
                    self.play(
                        bars[j].animate.shift(RIGHT * 0.8),
                        bars[j + 1].animate.shift(LEFT * 0.8),
                        values[j].animate.shift(RIGHT * 0.8),
                        values[j + 1].animate.shift(LEFT * 0.8)
                    )
                    
                    # Update references
                    bars[j], bars[j + 1] = bars[j + 1], bars[j]
                    values[j], values[j + 1] = values[j + 1], values[j]
                
                # Reset colors
                self.play(
                    bars[j].animate.set_color(BLUE),
                    bars[j + 1].animate.set_color(BLUE)
                )
                
                self.wait(0.3)
            
            # Mark as sorted
            self.play(bars[n - 1 - i].animate.set_color(GREEN))
        
        # Mark first element as sorted
        if bars:
            self.play(bars[0].animate.set_color(GREEN))
'''
        
        return script
    
    def get_complexity_data(self, structure_type):
        """Get complexity data for different data structures"""
        complexities = {
            "array": {
                "access": "O(1)", "search": "O(n)", "insert": "O(n)", "delete": "O(n)", "space": "O(n)"
            },
            "linked_list": {
                "access": "O(n)", "search": "O(n)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "stack": {
                "access": "O(n)", "search": "O(n)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "queue": {
                "access": "O(n)", "search": "O(n)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "binary_tree": {
                "access": "O(log n)", "search": "O(log n)", "insert": "O(log n)", "delete": "O(log n)", "space": "O(n)"
            },
            "hash_table": {
                "access": "N/A", "search": "O(1)", "insert": "O(1)", "delete": "O(1)", "space": "O(n)"
            },
            "graph": {
                "access": "O(V+E)", "search": "O(V+E)", "insert": "O(1)", "delete": "O(V+E)", "space": "O(V+E)"
            }
        }
        return complexities.get(structure_type, {
            "access": "O(?)", "search": "O(?)", "insert": "O(?)", "delete": "O(?)", "space": "O(?)"
        })