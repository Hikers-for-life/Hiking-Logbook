import '@testing-library/jest-dom';

describe('Setup Tests', () => {
  test('should have jest-dom matchers available', () => {
    // Test that jest-dom matchers are working
    const element = document.createElement('div');
    element.textContent = 'Test Content';

    expect(element).toBeDefined();
    expect(element).toHaveTextContent('Test Content');
  });

  test('should handle DOM queries', () => {
    const container = document.createElement('div');
    container.innerHTML = '<button>Click me</button><input type="text" />';

    const button = container.querySelector('button');
    const input = container.querySelector('input');

    expect(button).toBeDefined();
    expect(input).toBeDefined();
    expect(button).toHaveTextContent('Click me');
    expect(input).toHaveAttribute('type', 'text');
  });
});
