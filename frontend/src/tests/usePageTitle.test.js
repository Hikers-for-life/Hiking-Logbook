import { renderHook } from '@testing-library/react';
import { usePageTitle } from '../hooks/usePageTitle';

// Mock document.title
let mockTitle = '';
Object.defineProperty(document, 'title', {
  get: () => mockTitle,
  set: (value) => {
    mockTitle = value;
  },
  configurable: true,
});

describe('usePageTitle', () => {
  beforeEach(() => {
    mockTitle = '';
  });

  it('should set title with default append', () => {
    renderHook(() => usePageTitle('Dashboard'));

    expect(document.title).toBe('Dashboard | Hiking Logbook');
  });

  it('should set title without append when appendDefault is false', () => {
    renderHook(() => usePageTitle('Dashboard', false));

    expect(document.title).toBe('Dashboard');
  });

  it('should set default title when no title is provided', () => {
    renderHook(() => usePageTitle());

    expect(document.title).toBe('Hiking Logbook');
  });

  it('should set default title when empty string is provided', () => {
    renderHook(() => usePageTitle(''));

    expect(document.title).toBe('Hiking Logbook');
  });

  it('should set default title when appendDefault is false and no title', () => {
    renderHook(() => usePageTitle('', false));

    expect(document.title).toBe('Hiking Logbook');
  });

  it('should reset title on unmount', () => {
    const { unmount } = renderHook(() => usePageTitle('Dashboard'));

    expect(document.title).toBe('Dashboard | Hiking Logbook');

    unmount();

    expect(document.title).toBe('Hiking Logbook');
  });
});
