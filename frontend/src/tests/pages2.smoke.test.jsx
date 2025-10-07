import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Common mocks
jest.mock('../components/ui/navigation', () => ({ Navigation: () => <nav>Navigation</nav> }));
jest.mock('../hooks/usePageTitle', () => ({ usePageTitle: () => {} }));

jest.mock('../contexts/AuthContext.jsx', () => {
  const React = require('react');
  return {
    useAuth: () => ({ currentUser: { uid: 'u1', displayName: 'Tester' } }),
    AuthContext: React.createContext({ currentUser: { uid: 'u1' } })
  };
});

jest.mock('../services/hikeApiService.js', () => ({
  hikeApiService: {
    getHikes: jest.fn().mockResolvedValue({ success: true, data: [] }),
    createHike: jest.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
    updateHike: jest.fn().mockResolvedValue({ success: true }),
    deleteHike: jest.fn().mockResolvedValue({ success: true })
  }
}));

jest.mock('../services/plannedHikesService.js', () => ({
  plannedHikeApiService: {
    getPlannedHikes: jest.fn().mockResolvedValue([]),
    createPlannedHike: jest.fn().mockResolvedValue({ success: true }),
    updatePlannedHike: jest.fn().mockResolvedValue({ success: true }),
    deletePlannedHike: jest.fn().mockResolvedValue({ success: true }),
    startPlannedHike: jest.fn().mockResolvedValue({ success: true, id: 'active-1' })
  }
}));

jest.mock('../services/goalsApiService', () => ({
  goalsApi: {
    getGoals: jest.fn().mockResolvedValue([]),
    createGoal: jest.fn().mockResolvedValue({ id: 'g1', title: 'Goal', description: '', targetValue: 1, status: 'in_progress' }),
    updateGoal: jest.fn().mockResolvedValue({ id: 'g1', title: 'Goal', description: '', targetValue: 1, status: 'in_progress' }),
    deleteGoal: jest.fn().mockResolvedValue({ success: true })
  }
}));

jest.mock('../services/achievementApiService', () => ({
  achievementApiService: {
    getBadges: jest.fn().mockResolvedValue({ data: [] }),
    getStats: jest.fn().mockResolvedValue({ data: { totalHikes: 0, totalDistance: 0, totalDuration: 0, currentStreak: 0 } })
  }
}));

jest.mock('../config/firebase.js', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    }
  }
}));

// Pages
import Dashboard from '../pages/Dashboard.jsx';
import Friends from '../pages/Friends.jsx';
import EditProfile from '../pages/EditProfile.jsx';
import Signup from '../pages/Signup.jsx';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

beforeEach(() => {
  global.fetch = jest.fn(async (url) => {
    const u = typeof url === 'string' ? url : '';
    if (u.includes('/api/users/') && !u.includes('/hikes') && !u.includes('/planned')) {
      return { ok: true, json: async () => ({ displayName: 'Tester', bio: '', location: '' }) };
    }
    if (u.includes('/api/friends/')) {
      return { ok: true, json: async () => ({ success: true, data: [] }) };
    }
    if (u.includes('/api/users/') && u.includes('/hikes')) {
      return { ok: true, json: async () => ({ success: true, data: [] }) };
    }
    if (u.includes('/api/users/') && u.includes('/planned-hikes')) {
      return { ok: true, json: async () => ({ success: true, data: [] }) };
    }
    return { ok: true, json: async () => ({}) };
  });
});

describe('Additional page smoke tests', () => {
  test('Dashboard renders welcome header and quick actions', async () => {
    renderWithRouter(<Dashboard />);
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/Log New Hike/i)).toBeInTheDocument();
  });

  test('Friends renders page title and search input', async () => {
    renderWithRouter(<Friends />);
    expect(await screen.findByText(/Friends & Community/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search for friends or hikers/i)).toBeInTheDocument();
  });

  test('EditProfile renders form and Save Changes button', async () => {
    renderWithRouter(<EditProfile />);
    expect(await screen.findByText(/Edit Your Hiking Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
  });

  test('Signup renders', () => {
    renderWithRouter(<Signup />);
    expect(screen.getAllByText(/Create Account/i).length).toBeGreaterThan(0);
  });
});
