import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard.jsx';

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
    hikeApiService.getHikes.mockResolvedValueOnce([
      { id: 1, name: 'Trail One', distance: 5, date: '2024-01-01' },
      { id: 2, name: 'Trail Two', distance: 10, date: '2024-02-01' },
    ]);

    renderDashboard();

    expect(await screen.findByText('2')).toBeInTheDocument(); // Total hikes
    expect(await screen.findByText('15 km')).toBeInTheDocument(); // Distance
  });


  test('shows no hikes message when no hikes exist', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText(/No hikes logged yet/i)).toBeInTheDocument();
  });

  test('quick action buttons are clickable', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce([]);

    renderDashboard();

    const logButton = await screen.findByText(/Log New Hike/i);
    expect(logButton).toBeInTheDocument();

    fireEvent.click(logButton); // navigation is mocked, so just ensure clickable
  });

  test('displays achievements placeholder', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText(/No recent achievements/i)).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    hikeApiService.getHikes.mockRejectedValueOnce(new Error('API failed'));

    renderDashboard();

    expect(await screen.findByText(/No hikes logged yet/i)).toBeInTheDocument();
  });
});
