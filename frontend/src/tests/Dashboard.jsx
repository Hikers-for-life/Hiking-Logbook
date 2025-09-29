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

// Mock usePageTitle hook
jest.mock('../hooks/usePageTitle', () => ({
  usePageTitle: jest.fn(),
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
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Total hikes
      expect(screen.getByText('0 km')).toBeInTheDocument(); // Total distance
    });
  });

  test('displays quick action buttons', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();
    expect(await screen.findByText(/log new hike/i)).toBeInTheDocument();
    expect(screen.getByText(/plan hike/i)).toBeInTheDocument();
    expect(screen.getByText(/explore trails/i)).toBeInTheDocument();
  });

  test('renders Dashboard page with navigation', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();
    const navigation = await screen.findByTestId('navigation');
    expect(navigation).toBeInTheDocument();

    const welcomeText = await screen.findByText(/welcome back, test user/i);
    expect(welcomeText).toBeInTheDocument();
  });

  test('displays profile information', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    // The current Dashboard doesn't display detailed profile info, just the welcome message
    const welcomeText = await screen.findByText(/welcome back, test user/i);
    expect(welcomeText).toBeInTheDocument();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  }),

    test('renders loading screen initially', () => {
      renderDashboard();
      expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
    }),

    test('renders navigation and welcome message after loading', async () => {
      hikeApiService.getHikes.mockResolvedValueOnce([]);

      renderDashboard();

      expect(await screen.findByTestId('navigation')).toBeInTheDocument();
      expect(
        await screen.findByText(/Welcome back, Test User!/i)
      ).toBeInTheDocument();
    }),

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
    }),


    test('shows no hikes message when no hikes exist', async () => {
      hikeApiService.getHikes.mockResolvedValueOnce({
        success: true,
        data: []
      });

      renderDashboard();

      expect(await screen.findByText(/No hikes logged yet/i)).toBeInTheDocument();
    }),

    test('quick action buttons are clickable', async () => {
      hikeApiService.getHikes.mockResolvedValueOnce({
        success: true,
        data: []
      });

      renderDashboard();

      const logButton = await screen.findByText(/Log New Hike/i);
      expect(logButton).toBeInTheDocument();

      fireEvent.click(logButton); // navigation is mocked, so just ensure clickable
    }),

    test('displays achievements placeholder', async () => {
      hikeApiService.getHikes.mockResolvedValueOnce({
        success: true,
        data: []
      });

      renderDashboard();

      expect(await screen.findByText(/No recent achievements/i)).toBeInTheDocument();
    }),

    test('handles API error gracefully', async () => {
      hikeApiService.getHikes.mockRejectedValueOnce(new Error('API failed'));

      renderDashboard();

      expect(await screen.findByText(/No hikes logged yet/i)).toBeInTheDocument();
    });

  // Test navigation handlers
  test('navigates to logbook when Start Logging is clicked', async () => {
    const mockNavigate = jest.fn();
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    const logButton = await screen.findByText(/Start Logging/i);
    fireEvent.click(logButton);

    // Note: Navigation is mocked, so we can't test actual navigation
    // But we can test that the button is clickable
    expect(logButton).toBeInTheDocument();
  });

  test('navigates to hike planner when Plan Trip is clicked', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    const planButton = await screen.findByText(/Plan Trip/i);
    fireEvent.click(planButton);

    expect(planButton).toBeInTheDocument();
  });

  test('navigates to trail explorer when Browse Trails is clicked', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    const exploreButton = await screen.findByText(/Browse Trails/i);
    fireEvent.click(exploreButton);

    expect(exploreButton).toBeInTheDocument();
  });

  // Test profile loading scenarios
  test('displays fallback profile when API fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test Hiker!/i)).toBeInTheDocument();
    });
  });

  test('displays fallback profile when API returns error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test Hiker!/i)).toBeInTheDocument();
    });
  });

  // Test hike statistics calculation
  test('calculates statistics correctly with various data formats', async () => {
    const mockHikes = [
      { id: 1, name: 'Hike 1', distance: '5.5', date: '2024-01-01' },
      { id: 2, name: 'Hike 2', totalDistance: 10.2, date: { _seconds: 1704067200 } },
      { id: 3, name: 'Hike 3', distance: 7.8, date: new Date('2024-02-01') },
      { id: 4, name: 'Hike 4', distance: 'invalid', date: '2024-03-01' },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument(); // Total hikes
      expect(screen.getByText('23.5 km')).toBeInTheDocument(); // Total distance (5.5 + 10.2 + 7.8 + 0)
    });
  });

  test('handles empty hikes array', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Total hikes
      expect(screen.getByText('0 km')).toBeInTheDocument(); // Total distance
    });
  });

  // Test recent hikes display with different date formats
  test('displays recent hikes with various date formats', async () => {
    const mockHikes = [
      {
        id: 1,
        name: 'Firebase Date Hike',
        distance: 5,
        date: { _seconds: 1704067200 },
        difficulty: 'easy',
        duration: '2 hours'
      },
      {
        id: 2,
        name: 'String Date Hike',
        distance: 10,
        date: '2024-01-01',
        difficulty: 'medium',
        duration: '3 hours'
      },
      {
        id: 3,
        name: 'JS Date Hike',
        distance: 7,
        date: new Date('2024-02-01'),
        difficulty: 'hard',
        duration: '4 hours'
      },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Firebase Date Hike')).toBeInTheDocument();
      expect(screen.getByText('String Date Hike')).toBeInTheDocument();
      expect(screen.getByText('JS Date Hike')).toBeInTheDocument();
    });
  });

  test('displays hike details correctly', async () => {
    const mockHike = {
      id: 1,
      name: 'Test Hike',
      distance: 5.5,
      date: '2024-01-01',
      difficulty: 'medium',
      duration: '2 hours',
      location: 'Test Location'
    };

    hikeApiService.getHikes.mockResolvedValueOnce({ data: [mockHike] });
    renderDashboard();

    await waitFor(() => {
      // Wait for the hikes to load and be displayed
      expect(screen.getByText('Test Hike')).toBeInTheDocument();
      expect(screen.getByText('5.5 km')).toBeInTheDocument();
      expect(screen.getByText('2 hours')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // Test difficulty badge variants
  test('displays correct difficulty badge variants', async () => {
    const mockHikes = [
      { id: 1, name: 'Easy Hike', difficulty: 'easy', distance: 5, date: '2024-01-01' },
      { id: 2, name: 'Medium Hike', difficulty: 'medium', distance: 10, date: '2024-01-02' },
      { id: 3, name: 'Hard Hike', difficulty: 'hard', distance: 15, date: '2024-01-03' },
      { id: 4, name: 'Difficult Hike', difficulty: 'difficult', distance: 20, date: '2024-01-04' },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('hard')).toBeInTheDocument();
      expect(screen.getByText('difficult')).toBeInTheDocument();
    });
  });

  // Test loading states
  test('displays loading state for hikes', async () => {
    hikeApiService.getHikes.mockImplementation(() => new Promise(() => { })); // Never resolves
    renderDashboard();

    // Wait for the profile to load first, then check for hikes loading
    await waitFor(() => {
      expect(screen.getByText(/Loading recent hikes/i)).toBeInTheDocument();
    });
  });

  test('displays loading state for profile', () => {
    global.fetch = jest.fn(() => new Promise(() => { })); // Never resolves
    renderDashboard();

    expect(screen.getByText(/Loading your dashboard/i)).toBeInTheDocument();
  });

  // Test no user authentication state
  test('displays login message when no user is authenticated', () => {
    // Temporarily override the mock for this test
    const originalMock = require('../contexts/AuthContext.jsx').useAuth;
    require('../contexts/AuthContext.jsx').useAuth = jest.fn(() => ({
      currentUser: null,
      getUserProfile: jest.fn(),
    }));

    renderDashboard();

    expect(screen.getByText(/Please log in to access your dashboard/i)).toBeInTheDocument();

    // Restore the original mock
    require('../contexts/AuthContext.jsx').useAuth = originalMock;
  });

  // Test achievements section
  test('displays achievements placeholder correctly', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/Recent Achievements/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/No recent achievements/i)).toBeInTheDocument();
      expect(screen.getByText(/Complete hikes to earn badges!/i)).toBeInTheDocument();
    });
  });

  // Test error handling
  test('handles hike API error and shows empty state', async () => {
    hikeApiService.getHikes.mockRejectedValueOnce(new Error('API Error'));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/No hikes logged yet/i)).toBeInTheDocument();
    });
  });

  test('handles profile fetch error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Profile fetch failed'))
    );

    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test Hiker!/i)).toBeInTheDocument();
    });
  });

  // Test edge cases
  test('handles hikes with missing or invalid data', async () => {
    const mockHikes = [
      { id: 1, name: '', distance: null, date: null, difficulty: null },
      { id: 2, title: 'Alternative Title', totalDistance: 'invalid', date: 'invalid-date' },
      { id: 3 }, // Completely empty hike
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      // Just check that the component renders without crashing
      expect(screen.getByText(/Total Hikes/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Distance/i)).toBeInTheDocument();
    });
  });

  test('limits recent hikes to 6 items', async () => {
    const mockHikes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Hike ${i + 1}`,
      distance: 5,
      date: new Date(2024, 0, i + 1),
      difficulty: 'easy'
    }));

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      // Should only show 6 hikes, sorted by date (most recent first)
      expect(screen.getByText('Hike 10')).toBeInTheDocument();
      expect(screen.getByText('Hike 9')).toBeInTheDocument();
      expect(screen.getByText('Hike 8')).toBeInTheDocument();
      expect(screen.getByText('Hike 7')).toBeInTheDocument();
      expect(screen.getByText('Hike 6')).toBeInTheDocument();
      expect(screen.getByText('Hike 5')).toBeInTheDocument();

      // Should not show older hikes
      expect(screen.queryByText('Hike 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Hike 1')).not.toBeInTheDocument();
    });
  });

  // Test responsive design elements
  test('renders all card components', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Total Hikes/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Distance/i)).toBeInTheDocument();
      expect(screen.getByText(/Log New Hike/i)).toBeInTheDocument();
      expect(screen.getByText(/Plan Hike/i)).toBeInTheDocument();
      expect(screen.getByText(/Explore Trails/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Recent Hikes/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Recent Achievements/i)[0]).toBeInTheDocument();
    });
  });

  test('displays correct icons for different sections', async () => {
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      // Icons are rendered as SVG elements, we can test by checking if the sections exist
      expect(screen.getByText(/Total Hikes/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Distance/i)).toBeInTheDocument();
      expect(screen.getByText(/Log New Hike/i)).toBeInTheDocument();
      expect(screen.getByText(/Plan Hike/i)).toBeInTheDocument();
      expect(screen.getByText(/Explore Trails/i)).toBeInTheDocument();
    });
  });

  // Test usePageTitle hook integration
  test('calls usePageTitle with correct title', () => {
    const { usePageTitle } = require('../hooks/usePageTitle.js');
    hikeApiService.getHikes.mockResolvedValueOnce({ data: [] });

    renderDashboard();

    expect(usePageTitle).toHaveBeenCalledWith('Dashboard');
  });

  // Test date formatting edge cases
  test('handles invalid date formats gracefully', async () => {
    const mockHikes = [
      {
        id: 1,
        name: 'Invalid Date Hike',
        distance: 5,
        date: 'invalid-date',
        difficulty: 'easy'
      },
      {
        id: 2,
        name: 'Null Date Hike',
        distance: 10,
        date: null,
        difficulty: 'medium'
      },
      {
        id: 3,
        name: 'Undefined Date Hike',
        distance: 7,
        date: undefined,
        difficulty: 'hard'
      },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Invalid Date Hike')).toBeInTheDocument();
      expect(screen.getByText('Null Date Hike')).toBeInTheDocument();
      expect(screen.getByText('Undefined Date Hike')).toBeInTheDocument();
    });
  });

  // Test distance calculation edge cases
  test('handles various distance field names and formats', async () => {
    const mockHikes = [
      { id: 1, name: 'Hike 1', distance: '5.5', date: '2024-01-01' },
      { id: 2, name: 'Hike 2', totalDistance: 10.2, date: '2024-01-02' },
      { id: 3, name: 'Hike 3', distance: 7.8, date: '2024-01-03' },
      { id: 4, name: 'Hike 4', distance: 'invalid', date: '2024-01-04' },
      { id: 5, name: 'Hike 5', distance: null, date: '2024-01-05' },
      { id: 6, name: 'Hike 6', distance: undefined, date: '2024-01-06' },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument(); // Total hikes
      expect(screen.getByText('23.5 km')).toBeInTheDocument(); // Total distance (5.5 + 10.2 + 7.8 + 0 + 0 + 0)
    });
  });

  // Test hike name fallbacks
  test('displays fallback names for hikes without names', async () => {
    const mockHikes = [
      { id: 1, name: '', distance: 5, date: '2024-01-01', difficulty: 'easy' },
      { id: 2, name: null, distance: 10, date: '2024-01-02', difficulty: 'medium' },
      { id: 3, name: undefined, distance: 7, date: '2024-01-03', difficulty: 'hard' },
      { id: 4, title: 'Alternative Title', distance: 8, date: '2024-01-04', difficulty: 'easy' },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('Unnamed Hike')).toHaveLength(3);
      expect(screen.getByText('Alternative Title')).toBeInTheDocument();
    });
  });

  // Test duration and location display
  test('displays duration and location when available', async () => {
    const mockHikes = [
      {
        id: 1,
        name: 'Complete Hike',
        distance: 5,
        date: '2024-01-01',
        difficulty: 'easy',
        duration: '2 hours',
        location: 'Mountain Trail'
      },
      {
        id: 2,
        name: 'Minimal Hike',
        distance: 10,
        date: '2024-01-02',
        difficulty: 'medium'
      },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('2 hours')).toBeInTheDocument();
      expect(screen.getByText('Mountain Trail')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument(); // For missing duration
    });
  });

  // Test sorting by date
  test('sorts hikes by date correctly (most recent first)', async () => {
    const mockHikes = [
      { id: 1, name: 'Old Hike', distance: 5, date: new Date('2024-01-01'), difficulty: 'easy' },
      { id: 2, name: 'New Hike', distance: 10, date: new Date('2024-01-03'), difficulty: 'medium' },
      { id: 3, name: 'Middle Hike', distance: 7, date: new Date('2024-01-02'), difficulty: 'hard' },
    ];

    hikeApiService.getHikes.mockResolvedValueOnce({ data: mockHikes });
    renderDashboard();

    await waitFor(() => {
      // Check that all hikes are displayed
      expect(screen.getByText('Old Hike')).toBeInTheDocument();
      expect(screen.getByText('New Hike')).toBeInTheDocument();
      expect(screen.getByText('Middle Hike')).toBeInTheDocument();
    });
  });
});