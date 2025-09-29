import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock AuthContext

jest.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user', displayName: 'Test Hiker' },

    getUserProfile: jest.fn(),
  }),
}));

// Mock Navigation component
jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));


// Mock hikeApiService
jest.mock('../services/hikeApiService.js', () => ({
  hikeApiService: {
    getHikes: jest.fn(),
  },
}));

// Silence console errors for fetch fallback profile
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false, // trigger fallback profile
    json: () => Promise.resolve({}),
  })
);

describe('Dashboard Component', () => {
  const { hikeApiService } = require('../services/hikeApiService.js');

  const renderDashboard = () => {
    return render(

      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading screen initially', () => {
    renderDashboard();
    expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
  });

  test('renders navigation and welcome message after loading', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByTestId('navigation')).toBeInTheDocument();
    expect(
      await screen.findByText(/Welcome back, Test Hiker!/i)
    ).toBeInTheDocument();
  });

  test('displays stats with total hikes and distance', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 1, name: 'Trail One', distance: 5, date: '2024-01-01' },
        { id: 2, name: 'Trail Two', distance: 10, date: '2024-02-01' },
      ]
    });

    renderDashboard();

    // Wait for loading to complete and stats to be displayed
    expect(await screen.findByText('2')).toBeInTheDocument(); // Total hikes
    expect(await screen.findByText('15 km')).toBeInTheDocument(); // Distance
  });


  test('shows no hikes message when no hikes exist', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({
      success: true,
      data: []
    });

    renderDashboard();

    expect(await screen.findByText(/No hikes logged yet/i)).toBeInTheDocument();
  });

  test('quick action buttons are clickable', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({
      success: true,
      data: []
    });

    renderDashboard();

    const logButton = await screen.findByText(/Log New Hike/i);
    expect(logButton).toBeInTheDocument();

    fireEvent.click(logButton); // navigation is mocked, so just ensure clickable
  });

  test('displays achievements placeholder', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({
      success: true,
      data: []
    });

    renderDashboard();

    expect(await screen.findByText(/No recent achievements/i)).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    hikeApiService.getHikes.mockRejectedValueOnce(new Error('API failed'));

    renderDashboard();

    expect(await screen.findByText(/No hikes logged yet/i)).toBeInTheDocument();

  });
});
