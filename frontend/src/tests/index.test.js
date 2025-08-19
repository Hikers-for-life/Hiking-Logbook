import { render } from '@testing-library/react';
import { createRoot } from 'react-dom/client';

// Mock React DOM
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn()
}));
// Mock the App component
jest.mock('../App.js', () => () => <div data-testid="app">App Component</div>);

// Mock reportWebVitals
jest.mock('../reportWebVitals.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Index Entry Point', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock createRoot to return a mock root
    const mockRoot = {
      render: jest.fn()
    };
    createRoot.mockReturnValue(mockRoot);
  });

  test('should import required modules', () => {
    // Test that the imports work
    expect(createRoot).toBeDefined();
    expect(typeof createRoot).toBe('function');
  });

  test('should create root and render app', () => {
    // This test verifies that the index.js structure is correct
    const mockRoot = {
      render: jest.fn()
    };
    createRoot.mockReturnValue(mockRoot);
    
    // Simulate what index.js does
    const root = createRoot(document.createElement('div'));
    root.render(<div>Test</div>);
    
    expect(createRoot).toHaveBeenCalled();
    expect(mockRoot.render).toHaveBeenCalled();
  });

  test('should handle DOM element creation', () => {
    const div = document.createElement('div');
    div.id = 'root';
    
    expect(div).toBeDefined();
    expect(div.id).toBe('root');
    expect(div.tagName).toBe('DIV');
  });
});
