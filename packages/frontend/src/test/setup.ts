import '@testing-library/jest-dom'

// Mock Remotion's global functions for testing
global.vi = global.vi || {
  mock: () => {},
  importActual: (path: string) => import(path),
};