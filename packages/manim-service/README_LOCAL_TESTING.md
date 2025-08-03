# Manim Service - Local Testing Guide

This guide will help you set up and test the Manim service locally using a virtual environment.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- At least 2GB of free disk space (for Manim dependencies)
- `venv` module (usually included with Python)

## Quick Start

### 1. Setup (One-time)

```bash
cd packages/manim-service
python setup_local.py setup
```

This will:
- Check your Python version
- Create a virtual environment (`./venv`)
- Install all dependencies
- Create necessary directories
- Create a `.env` file with default settings
- Optionally run tests and start the service

### 2. Start the Service

```bash
python setup_local.py start
```

### 3. Run Tests

```bash
python setup_local.py test
```

### 4. Manual Virtual Environment Activation (Optional)

**Windows:**
```cmd
venv\Scripts\activate
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

### 3. Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# Activate it (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create output directory
mkdir output

# Create .env file
echo "MANIM_OUTPUT_DIR=./output" > .env
echo "FLASK_ENV=development" >> .env
echo "PORT=5001" >> .env
```

The service will be available at: `http://localhost:5001`

### 5. All-in-One Commands

```bash
# Interactive mode - choose what to do
python setup_local.py

# Direct commands
python setup_local.py setup    # First-time setup
python setup_local.py start    # Start the service
python setup_local.py test     # Run tests
```

## API Endpoints

### Health Check
```bash
curl http://localhost:5001/health
```

### Generate HTTP Flow Diagram
```bash
curl -X POST http://localhost:5001/generate/http-flow \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User Login",
    "steps": [
      {
        "description": "Send login request",
        "direction": "request",
        "method": "POST",
        "url": "/api/login"
      },
      {
        "description": "Return success",
        "direction": "response",
        "status_code": 200
      }
    ]
  }'
```

### Generate DNS Resolution Diagram
```bash
curl -X POST http://localhost:5001/generate/dns-resolution \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "show_cache": true,
    "show_timing": true
  }'
```

### Generate Data Structure Diagram
```bash
curl -X POST http://localhost:5001/generate/data-structure \
  -H "Content-Type: application/json" \
  -d '{
    "type": "array",
    "data": [1, 2, 3, 4, 5],
    "show_complexity": false
  }'
```

### Generate Process Flow Diagram
```bash
curl -X POST http://localhost:5001/generate/process-flow \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User Registration",
    "flow_type": "linear",
    "steps": [
      {"name": "Start", "type": "start"},
      {"name": "Validate", "type": "process"},
      {"name": "Create Account", "type": "process"},
      {"name": "End", "type": "end"}
    ]
  }'
```

## File Structure

```
packages/manim-service/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── venv/                      # Virtual environment (created by setup)
├── generators/                # Diagram generators
│   ├── __init__.py
│   ├── http_flow_generator.py
│   ├── dns_resolution_generator.py
│   ├── data_structure_generator.py
│   └── process_flow_generator.py
├── tests/                     # Test files
│   └── test_generators.py
├── output/                    # Generated video files (ignored by git)
├── setup_local.py            # All-in-one setup, test, and start script
└── test_generators_simple.py # Simple generator tests
```

## Troubleshooting

### Common Issues

1. **Virtual environment not found**
   ```bash
   # Run the setup script first
   python setup_local.py
   ```

2. **Import Error: No module named 'manim'**
   ```bash
   # Make sure virtual environment is activated
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   
   # Then install dependencies
   pip install -r requirements.txt
   ```

3. **Virtual environment creation fails**
   ```bash
   # On Ubuntu/Debian
   sudo apt install python3-venv
   
   # On CentOS/RHEL
   sudo yum install python3-venv
   ```

4. **Port already in use**
   - Change the PORT in `.env` file
   - Or kill the process using port 5001

5. **Permission denied on output directory**
   ```bash
   chmod 755 output/
   ```

6. **Manim installation issues**
   - On Windows: Install Visual Studio Build Tools
   - On macOS: Install Xcode command line tools
   - On Linux: Install build-essential

### Testing Without Manim

If you can't install Manim but want to test the generators:

```bash
# This only tests the script generation, not actual video rendering
python test_generators_simple.py
python test_comprehensive.py
```

### Logs and Debugging

- Check the console output when running `python app.py`
- Generated videos are saved in the `./output` directory
- Enable debug mode by setting `FLASK_ENV=development` in `.env`

## Expected Output

When everything is working correctly:

1. **Generator Tests**: All tests should pass with ✅ marks
2. **API Tests**: All endpoints should return 200 status codes
3. **Video Files**: MP4 files should be generated in the `./output` directory
4. **Service Logs**: Should show successful Manim script executions

## Next Steps

Once local testing is working:

1. Test with different diagram types and parameters
2. Verify generated video quality
3. Test error handling with invalid inputs
4. Performance testing with multiple concurrent requests

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Check the console logs for detailed error messages
4. Ensure you have sufficient disk space and permissions