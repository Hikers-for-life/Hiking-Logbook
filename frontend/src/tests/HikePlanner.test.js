import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HikePlanner from '../pages/HikePlanner';

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

jest.mock('../components/NewHikePlanForm', () => {
  return function MockNewHikePlanForm({ open, onOpenChange, onSubmit }) {
    return open ? (
      <div data-testid="new-plan-form">
        <button onClick={() => onSubmit({ id: 1, title: 'Test Plan' })}>
          Submit
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null;
  };
});

describe('HikePlanner Component', () => {
  const renderHikePlanner = () => {
    return render(
      <MemoryRouter>
        <HikePlanner />
      </MemoryRouter>
    );
  };

  test('renders hike planner page with navigation', () => {
    renderHikePlanner();
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByText('Hike')).toBeInTheDocument();
    expect(screen.getByText('Planner')).toBeInTheDocument();
  });

  test('displays quick action buttons', () => {
    renderHikePlanner();
    
    expect(screen.getByText('Plan New Hike')).toBeInTheDocument();
    expect(screen.getByText('Explore Routes')).toBeInTheDocument();
  });

  test('shows calendar view', () => {
    renderHikePlanner();
    
    expect(screen.getByText('March 2024')).toBeInTheDocument();
    // Check for day headers - use getAllByText since there might be multiple
    expect(screen.getAllByText('Sun').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sat').length).toBeGreaterThan(0);
  });

  test('displays upcoming trips', () => {
    renderHikePlanner();
    
    expect(screen.getByText('Upcoming Adventures')).toBeInTheDocument();
    expect(screen.getByText('Weekend Warriors: Lake Summit')).toBeInTheDocument();
    expect(screen.getByText('Wildflower Photography Hike')).toBeInTheDocument();
  });

  test('shows gear checklist', () => {
    renderHikePlanner();
    
    expect(screen.getByText('Gear Checklist')).toBeInTheDocument();
    expect(screen.getByText('Hiking Boots')).toBeInTheDocument();
    expect(screen.getByText('Water (3L)')).toBeInTheDocument();
  });

  test('displays weather forecast in Celsius', () => {
    renderHikePlanner();
    
    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('18°C')).toBeInTheDocument();
    expect(screen.getByText('22°C')).toBeInTheDocument();
  });

  test('opens new plan form when Plan New Hike clicked', () => {
    renderHikePlanner();
    
    const planButton = screen.getByText('Plan New Hike');
    fireEvent.click(planButton);
    
    expect(screen.getByTestId('new-plan-form')).toBeInTheDocument();
  });

  test('shows monthly stats', () => {
    renderHikePlanner();
    
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Planned Hikes')).toBeInTheDocument();
    expect(screen.getByText('Total Distance')).toBeInTheDocument();
    expect(screen.getByText('Friends Invited')).toBeInTheDocument();
  });

  test('handles gear checklist interactions', () => {
    renderHikePlanner();
    
    const addItemInput = screen.getByPlaceholderText('Add gear item...');
    expect(addItemInput).toBeInTheDocument();
    
    fireEvent.change(addItemInput, { target: { value: 'Test Item' } });
    expect(addItemInput.value).toBe('Test Item');
  });

  test('displays trip status badges', () => {
    renderHikePlanner();
    
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    expect(screen.getByText('planning')).toBeInTheDocument();
  });

  test('shows difficulty badges for trips', () => {
    renderHikePlanner();
    
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });
});
