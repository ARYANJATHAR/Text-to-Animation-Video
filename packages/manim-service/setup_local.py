#!/usr/bin/env python3
"""
Local setup script for Manim service with virtual environment
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def create_virtual_environment():
    """Create a virtual environment"""
    venv_path = Path("./venv")
    
    if venv_path.exists():
        print("✅ Virtual environment already exists")
        return True
    
    print("🔧 Creating virtual environment...")
    try:
        subprocess.check_call([sys.executable, "-m", "venv", "venv"])
        print("✅ Virtual environment created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create virtual environment: {e}")
        print("💡 Make sure you have the 'venv' module installed:")
        print("   On Ubuntu/Debian: sudo apt install python3-venv")
        print("   On CentOS/RHEL: sudo yum install python3-venv")
        return False

def get_venv_python():
    """Get the path to the Python executable in the virtual environment"""
    if platform.system() == "Windows":
        return Path("./venv/Scripts/python.exe")
    else:
        return Path("./venv/bin/python")

def get_venv_pip():
    """Get the path to the pip executable in the virtual environment"""
    if platform.system() == "Windows":
        return Path("./venv/Scripts/pip.exe")
    else:
        return Path("./venv/bin/pip")

def install_dependencies():
    """Install required dependencies in virtual environment"""
    print("📦 Installing dependencies in virtual environment...")
    
    venv_pip = get_venv_pip()
    
    if not venv_pip.exists():
        print(f"❌ Virtual environment pip not found at {venv_pip}")
        return False
    
    try:
        # Upgrade pip first
        subprocess.check_call([str(venv_pip), "install", "--upgrade", "pip"])
        
        # Install requirements
        subprocess.check_call([str(venv_pip), "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully in virtual environment")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_output_directory():
    """Create output directory for generated videos"""
    output_dir = Path("./output")
    output_dir.mkdir(exist_ok=True)
    print(f"✅ Output directory created: {output_dir.absolute()}")

def create_env_file():
    """Create .env file with default settings"""
    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write("MANIM_OUTPUT_DIR=./output\n")
            f.write("FLASK_ENV=development\n")
            f.write("PORT=5001\n")
        print("✅ .env file created with default settings")
    else:
        print("✅ .env file already exists")

def run_tests():
    """Run the test suite using virtual environment"""
    print("🧪 Running tests in virtual environment...")
    
    venv_python = get_venv_python()
    
    if not venv_python.exists():
        print(f"❌ Virtual environment Python not found at {venv_python}")
        return False
    
    try:
        result = subprocess.run([str(venv_python), "test_generators_simple.py"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ All tests passed!")
            print(result.stdout)
            return True
        else:
            print("❌ Some tests failed:")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def start_service():
    """Start the Manim service using virtual environment"""
    venv_python = get_venv_python()
    
    if not venv_python.exists():
        print("❌ Virtual environment not found. Run setup first.")
        return False
    
    print("� Startieng Manim service...")
    print("📍 Service will be available at: http://localhost:5001")
    print("📁 Generated videos will be saved to: ./output")
    print("🛑 Press Ctrl+C to stop the service")
    print("=" * 50)
    
    try:
        # Set environment variables
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['MANIM_OUTPUT_DIR'] = './output'
        
        # Start the Flask app using virtual environment Python
        subprocess.run([str(venv_python), "app.py"], env=env)
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        return False
    
    return True

def print_usage_instructions():
    """Print usage instructions"""
    print("\n📋 Usage Instructions:")
    print("=" * 40)
    print("🔧 Setup (first time):")
    print("   python setup_local.py setup")
    print("\n🚀 Start service:")
    print("   python setup_local.py start")
    print("\n🧪 Run tests:")
    print("   python setup_local.py test")
    print("\n📋 Manual activation:")
    if platform.system() == "Windows":
        print("   .\\venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("   python app.py")

def main():
    """Main function with command-line arguments"""
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "setup":
            print("🚀 Setting up Manim Service with virtual environment...")
            print("=" * 60)
            
            if not check_python_version():
                return False
            
            if not create_virtual_environment():
                return False
            
            create_output_directory()
            create_env_file()
            
            if install_dependencies():
                print("✅ Setup complete!")
                run_choice = input("\n❓ Run tests to verify setup? (y/n): ").lower().strip()
                if run_choice == 'y':
                    run_tests()
                
                start_choice = input("\n❓ Start the service now? (y/n): ").lower().strip()
                if start_choice == 'y':
                    start_service()
            
            return True
            
        elif command == "start":
            return start_service()
            
        elif command == "test":
            return run_tests()
            
        else:
            print(f"❌ Unknown command: {command}")
            print_usage_instructions()
            return False
    
    else:
        # Interactive mode
        print("🚀 Manim Service Setup")
        print("=" * 30)
        print("1. Setup (first time)")
        print("2. Start service")
        print("3. Run tests")
        print("4. Show usage")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            return main_setup()
        elif choice == "2":
            return start_service()
        elif choice == "3":
            return run_tests()
        elif choice == "4":
            print_usage_instructions()
            return True
        else:
            print("❌ Invalid choice")
            return False

def main_setup():
    """Interactive setup function"""
    print("🚀 Setting up Manim Service with virtual environment...")
    print("=" * 60)
    
    if not check_python_version():
        return False
    
    if not create_virtual_environment():
        return False
    
    create_output_directory()
    create_env_file()
    
    if install_dependencies():
        print("✅ Setup complete!")
        run_choice = input("\n❓ Run tests to verify setup? (y/n): ").lower().strip()
        if run_choice == 'y':
            run_tests()
        
        start_choice = input("\n❓ Start the service now? (y/n): ").lower().strip()
        if start_choice == 'y':
            start_service()
    
    return True

if __name__ == "__main__":
    main()