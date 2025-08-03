# Manim Service

A Python-based REST API service for generating mathematical diagrams and educational animations using the Manim library.

## Features

- **HTTP Flow Diagrams**: Generate visualizations of HTTP request/response cycles
- **DNS Resolution Diagrams**: Create step-by-step DNS resolution process animations
- **Data Structure Visualizations**: Generate animations for arrays, linked lists, and trees
- **Process Flow Diagrams**: Create flowcharts for technical processes
- **REST API**: Simple HTTP endpoints for animation generation
- **Video Output**: Generates MP4 videos compatible with Remotion integration

## Installation

### Prerequisites

- Python 3.11+
- FFmpeg
- System dependencies for Manim (Cairo, Pango)

### Local Development

1. Install system dependencies (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install ffmpeg libcairo2-dev libpango1.0-dev pkg-config python3-dev
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the service:
```bash
python start.py
```

### Docker Deployment

```bash
docker build -t manim-service .
docker run -p 5001:5001 -v $(pwd)/output:/app/output manim-service
```

## API Endpoints

### Health Check
```
GET /health
```

### Generate HTTP Flow Diagram
```
POST /generate/http-flow
Content-Type: application/json

{
  "title": "HTTP Request Flow",
  "steps": [
    {"description": "Client sends request", "direction": "request"},
    {"description": "Server processes request", "direction": "response"},
    {"description": "Server sends response", "direction": "response"}
  ]
}
```

### Generate DNS Resolution Diagram
```
POST /generate/dns-resolution
Content-Type: application/json

{
  "domain": "example.com"
}
```

### Generate Data Structure Visualization
```
POST /generate/data-structure
Content-Type: application/json

{
  "type": "array",
  "data": [1, 2, 3, 4, 5]
}
```

### Generate Process Flow Diagram
```
POST /generate/process-flow
Content-Type: application/json

{
  "title": "User Authentication",
  "steps": [
    {"name": "Start", "type": "start"},
    {"name": "Check credentials", "type": "process"},
    {"name": "Valid?", "type": "decision"},
    {"name": "Grant access", "type": "end"}
  ]
}
```

### Get Animation Status
```
GET /status/{animation_id}
```

### Download Video
```
GET /video/{animation_id}
```

## Response Format

All generation endpoints return:
```json
{
  "id": "unique-animation-id",
  "file_path": "/path/to/generated/video.mp4",
  "duration": 10.0,
  "resolution": [1920, 1080],
  "fps": 30,
  "status": "completed"
}
```

## Configuration

Environment variables:

- `PORT`: Service port (default: 5001)
- `FLASK_ENV`: Environment mode (development/production)
- `MANIM_OUTPUT_DIR`: Directory for generated videos (default: ./output)
- `LOG_LEVEL`: Logging level (default: INFO)

## Testing

Run tests:
```bash
pytest tests/
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## Integration with Remotion

The service generates MP4 videos that can be imported into Remotion compositions:

1. Generate animation via API
2. Download video file using `/video/{animation_id}` endpoint
3. Import video into Remotion composition as a video asset
4. Synchronize timing with Remotion timeline

## Error Handling

The service includes comprehensive error handling:

- **Input validation**: Validates request data format
- **Manim execution errors**: Handles script compilation and rendering failures
- **Timeout protection**: Prevents long-running animations from blocking the service
- **File management**: Automatic cleanup of temporary files
- **Graceful degradation**: Returns meaningful error messages

## Performance Considerations

- **Timeout**: Manim execution is limited to 120 seconds
- **Concurrent requests**: Service supports multiple concurrent animation generations
- **File cleanup**: Temporary script files are automatically cleaned up
- **Resource monitoring**: Consider memory and CPU usage for complex animations

## Development

### Adding New Animation Types

1. Create a new generation method in `ManimGenerator` class
2. Add corresponding Manim script template
3. Create API endpoint in `app.py`
4. Add tests in `tests/test_manim_service.py`

### Script Templates

Manim scripts are generated dynamically based on input data. Each animation type has its own script template that includes:

- Scene class definition
- Animation sequence
- Proper timing and transitions
- Educational content structure

## Troubleshooting

### Common Issues

1. **Manim not found**: Ensure Manim is installed and in PATH
2. **FFmpeg errors**: Install FFmpeg system package
3. **Permission errors**: Check output directory permissions
4. **Memory issues**: Monitor system resources for complex animations
5. **Timeout errors**: Increase timeout for complex diagrams

### Debugging

Enable debug mode:
```bash
export FLASK_ENV=development
python start.py
```

Check logs for detailed error information and Manim execution output.