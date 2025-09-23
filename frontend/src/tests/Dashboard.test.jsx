import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' },
    getUserProfile: jest.fn(),
  }),
}));

// Mock Navigation component
jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

describe('Dashboard Component', () => {
  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

  const mockProfile = {
    displayName: 'Test User',
    bio: 'Test bio',
    location: 'Test Location',
    preferences: { difficulty: 'easy', terrain: 'forest' },
    stats: {
      totalHikes: 5,
      totalDistance: 25,
      totalElevation: 1000,
      achievements: ['First Hike', 'Mountain Climber'],
    },
  };

  beforeEach(() => {
    // Mock fetch to return the mock profile
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  

  test('displays user stats correctly', async () => {
    renderDashboard();

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText(mockProfile.stats.totalHikes.toString())).toBeInTheDocument();
      expect(screen.getByText(`${mockProfile.stats.totalDistance} km`)).toBeInTheDocument();
      expect(screen.getByText(`${mockProfile.stats.totalElevation} m`)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.stats.achievements.length.toString())).toBeInTheDocument();
    });
  });

  test('displays quick action buttons', async () => {
    renderDashboard();
    expect(await screen.findByText(/log new hike/i)).toBeInTheDocument();
    expect(screen.getByText(/plan hike/i)).toBeInTheDocument();
    expect(screen.getByText(/explore trails/i)).toBeInTheDocument();
  });

  test('renders Dashboard page with navigation', async () => {
  renderDashboard();
  const navigation = await screen.findByTestId('navigation');
  expect(navigation).toBeInTheDocument();

  const welcomeText = await screen.findByText(/welcome back, test user/i);
  expect(welcomeText).toBeInTheDocument();
});

test('displays profile information', async () => {
  renderDashboard();
  // Ensure we pick the profile info, not header
  const profileName = await screen.findByText('Test User', { selector: 'p' });
  expect(profileName).toBeInTheDocument();

  expect(screen.getByText(/test location/i)).toBeInTheDocument();
  expect(screen.getByText(/test bio/i)).toBeInTheDocument();
  expect(screen.getByText(/easy/i)).toBeInTheDocument();
  expect(screen.getByText(/forest/i)).toBeInTheDocument();
});


  test('displays achievements section', async () => {
    renderDashboard();
    expect(await screen.findByText(/first hike/i)).toBeInTheDocument();
    expect(screen.getByText(/mountain climber/i)).toBeInTheDocument();
  });

  test('handles edit profile button click', async () => {
    renderDashboard();
    const editButton = await screen.findByText(/edit profile/i);
    fireEvent.click(editButton);
    // Optional: Add assertions if a modal opens or action occurs
  });
});
