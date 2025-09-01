import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Logbook from '../pages/Logbook';

// Mock the AuthContext
jest.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user', email: 'test@example.com' },
    logout: jest.fn(),
  }),
}));

// Mock the components to avoid complex rendering
jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>
}));

jest.mock('../components/NewHikeEntryForm', () => {
  return function MockNewHikeEntryForm({ open, onOpenChange, onSubmit }) {
    return open ? (
      <div data-testid="new-hike-form">
        <button onClick={() => onSubmit({ id: 1, title: 'Test Hike' })}>
          Submit
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null;
  };
});

describe('Logbook Component', () => {
  const renderLogbook = () => {
    return render(
      <MemoryRouter>
        <Logbook />
      </MemoryRouter>
    );
  };

  test('renders logbook page with navigation', () => {
    renderLogbook();
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByText('Track Your')).toBeInTheDocument();
    expect(screen.getByText('Hikes')).toBeInTheDocument();
  });

  test('displays hike entries', () => {
    renderLogbook();
    
    expect(screen.getByText('Sunrise at Eagle Peak')).toBeInTheDocument();
    expect(screen.getByText('Wildflower Meadow Adventure')).toBeInTheDocument();
  });

  test('has search functionality', () => {
    renderLogbook();
    
    const searchInput = screen.getByPlaceholderText(/search hikes/i);
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Eagle' } });
    expect(searchInput.value).toBe('Eagle');
  });

  test('has difficulty filter buttons', () => {
    renderLogbook();
    
    expect(screen.getByText('All')).toBeInTheDocument();
    // Use getAllByText since difficulty appears in both buttons and badges
    expect(screen.getAllByText('Easy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Moderate').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hard').length).toBeGreaterThan(0);
  });

  test('opens new entry form when button clicked', () => {
    renderLogbook();
    
    const newEntryButton = screen.getByText('Add Past Hike');
    fireEvent.click(newEntryButton);
    
    expect(screen.getByTestId('new-hike-form')).toBeInTheDocument();
  });

  test('starts active hike when Start Hike button clicked', () => {
    renderLogbook();
    
    const startHikeButton = screen.getByText('Start Hike');
    fireEvent.click(startHikeButton);
    
    // Should switch to active hike mode
    expect(screen.getByText('Start Your Hike')).toBeInTheDocument();
  });

  test('displays both Start Hike and Add Past Hike buttons', () => {
    renderLogbook();
    
    expect(screen.getByText('Start Hike')).toBeInTheDocument();
    expect(screen.getByText('Add Past Hike')).toBeInTheDocument();
  });

  test('shows updated header text from brief', () => {
    renderLogbook();
    
    expect(screen.getByText('Track Your')).toBeInTheDocument();
    expect(screen.getByText('Hikes')).toBeInTheDocument();
    expect(screen.getByText('Keep notes on location, weather, elevation, and route - along the way')).toBeInTheDocument();
  });

  test('does not show active hike status when no active hike', () => {
    renderLogbook();
    
    // ActiveHikeStatus should not be visible when there's no active hike
    expect(screen.queryByText('Active Hike in Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Hike Paused')).not.toBeInTheDocument();
  });

  test('displays stats cards', () => {
    renderLogbook();
    
    expect(screen.getByText('Total Hikes')).toBeInTheDocument();
    expect(screen.getByText('Miles Hiked')).toBeInTheDocument();
    expect(screen.getByText('Elevation Gained')).toBeInTheDocument();
    expect(screen.getByText('States Explored')).toBeInTheDocument();
  });

  test('shows route map button for hike entries', () => {
    renderLogbook();
    
    const routeMapButtons = screen.getAllByText('Route Map');
    expect(routeMapButtons.length).toBeGreaterThan(0);
  });

  test('handles difficulty filter changes', () => {
    renderLogbook();
    
    // Get the first Easy button (filter button, not badge)
    const easyButtons = screen.getAllByText('Easy');
    const easyFilterButton = easyButtons[0]; // Assume first one is the filter button
    fireEvent.click(easyFilterButton);
    
    // Should still show the Easy hike
    expect(screen.getByText('Wildflower Meadow Adventure')).toBeInTheDocument();
  });
});
