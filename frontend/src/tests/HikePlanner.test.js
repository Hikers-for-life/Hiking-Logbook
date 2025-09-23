import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HikePlanner from '../pages/HikePlanner';

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user', email: 'test@example.com' },
    logout: jest.fn(),
  }),
}));




// Mock navigation component
jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

// Mock NewHikePlanForm
jest.mock('../components/NewHikePlanForm', () => ({
  __esModule: true,
  default: ({ open, onOpenChange, onSubmit }) =>
    open ? (
      <div data-testid="new-plan-form">
        <button onClick={() => onSubmit({ id: 1, title: 'Test Plan' })}>
          Submit
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

describe('HikePlanner Component', () => {
  const renderHikePlanner = () =>
    render(
      <MemoryRouter>
        <HikePlanner />
      </MemoryRouter>
    );

  test('renders hike planner page with navigation', () => {
    renderHikePlanner();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    const hikes = screen.getAllByText(/hike/i);
    expect(hikes.length).toBeGreaterThan(0);

    const planners = screen.getAllByText(/planner/i);
    expect(planners.length).toBeGreaterThan(0);
  });

  test('displays quick action buttons', () => {
    renderHikePlanner();
    expect(screen.getByText(/plan new hike/i)).toBeInTheDocument();
    expect(screen.getByText(/explore routes/i)).toBeInTheDocument();
  });

  test('shows calendar view', () => {
    renderHikePlanner();
      // Check day headers (multiple matching elements)
    const suns = screen.getAllByText(/sun/i);
    const mons = screen.getAllByText(/mon/i);
    const sats = screen.getAllByText(/sat/i);

    expect(suns.length).toBeGreaterThan(0);
    expect(mons.length).toBeGreaterThan(0);
    expect(sats.length).toBeGreaterThan(0);
  });

  test('displays upcoming trips', () => {
    renderHikePlanner();
    expect(screen.getByText(/upcoming adventures/i)).toBeInTheDocument();
    expect(screen.getByText(/weekend warriors: lake summit/i)).toBeInTheDocument();
    expect(screen.getByText(/wildflower photography hike/i)).toBeInTheDocument();
  });

  test('shows gear checklist', () => {
    renderHikePlanner();
    expect(screen.getByText(/gear checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/hiking boots/i)).toBeInTheDocument();
    expect(screen.getByText(/water/i)).toBeInTheDocument();
  });

 test('displays weather card', () => {
  renderHikePlanner();
  
  // Just check the input exists (static, always renders)
  expect(screen.getByPlaceholderText(/search location/i)).toBeInTheDocument();
  
  // Optionally check other static labels like Humidity / Wind / Feels Like
  expect(screen.getByText(/humidity/i)).toBeInTheDocument();
  expect(screen.getByText(/wind speed/i)).toBeInTheDocument();
  expect(screen.getByText(/feels like/i)).toBeInTheDocument();
});



  test('opens new plan form when Plan New Hike clicked', () => {
    renderHikePlanner();
    fireEvent.click(screen.getByText(/plan new hike/i));
    expect(screen.getByTestId('new-plan-form')).toBeInTheDocument();
  });

  test('handles gear checklist interactions', () => {
    renderHikePlanner();
    const addItemInput = screen.getByPlaceholderText(/add gear item/i);
    fireEvent.change(addItemInput, { target: { value: 'Test Item' } });
    expect(addItemInput.value).toBe('Test Item');
  });

  test('displays trip status badges', () => {
    renderHikePlanner();
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/planning/i)).toBeInTheDocument();
  });

  test('shows difficulty badges for trips', () => {
    renderHikePlanner();
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    expect(screen.getByText(/easy/i)).toBeInTheDocument();
  });
});
