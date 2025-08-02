# Text to Animated Video Generator

An AI-powered full-stack system that transforms educational web development topics into high-quality animated videos using Remotion, Three.js, and Manim.

## Project Structure

This is a monorepo containing three main packages:

```
text-to-animated-video-generator/
├── packages/
│   ├── frontend/          # React frontend with Remotion, Three.js, Tailwind CSS
│   ├── backend/           # Node.js/Express backend with animation services
│   └── shared-types/      # Shared TypeScript interfaces and types
├── package.json           # Root package.json with workspace configuration
└── tsconfig.json         # Root TypeScript configuration
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Remotion** - Video composition and rendering
- **Three.js** - 3D visualizations and WebGL
- **React Three Fiber** - React renderer for Three.js
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Bull** - Job queue for video processing
- **Redis** - Queue storage and caching
- **PostgreSQL** - Database for sessions and metadata

### Animation Technologies
- **Remotion** - React-based video composition
- **Three.js** - 3D spatial visualizations
- **Manim** - Mathematical diagrams and process flows

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Redis (for job queue)
- PostgreSQL (for data storage)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Backend
cp packages/backend/.env.example packages/backend/.env
# Edit packages/backend/.env with your configuration
```

3. Build shared types:
```bash
npm run build --workspace=shared-types
```

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or start them individually:
```bash
# Frontend (http://localhost:3000)
npm run dev:frontend

# Backend (http://localhost:3001)
npm run dev:backend
```

### Building

Build all packages:
```bash
npm run build
```

### Testing

Run tests for all packages:
```bash
npm run test
```

## Architecture Overview

The system uses a microservices approach where:

1. **Content Analysis Service** - Analyzes input text and determines optimal animation technology
2. **Remotion Service** - Handles React-based video composition and rendering
3. **Three.js Service** - Generates 3D visualizations for spatial concepts
4. **Manim Service** - Creates mathematical diagrams and process flows
5. **Video Orchestrator** - Coordinates all services and composes final videos

## API Endpoints

### Backend API (http://localhost:3001)

- `GET /health` - Health check
- `GET /api/status` - Service status
- `POST /api/generate` - Generate video from text input

## Development Workflow

1. **Requirements** - Define educational content requirements
2. **Design** - Create technical design and architecture
3. **Implementation** - Build features incrementally
4. **Testing** - Comprehensive testing across all animation technologies
5. **Integration** - Combine services into cohesive system

## Contributing

This project follows a spec-driven development approach. See the `.kiro/specs/` directory for detailed requirements, design, and implementation tasks.

## License

Private project - All rights reserved.