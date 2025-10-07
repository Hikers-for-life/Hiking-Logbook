import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock heavy child components to avoid complex setup
jest.mock('../components/ui/navigation', () => ({ Navigation: () => <nav>Navigation</nav> }));
jest.mock('../components/hero-section', () => ({ HeroSection: () => (<section>Hero<section data-testid="hero-hooks" /> </section>) }));
jest.mock('../components/logbook-section', () => ({ LogbookSection: () => <section>Logbook Section</section> }));
jest.mock('../components/auth/loginPage.jsx', () => () => <div>Login Modal</div>);

jest.mock('../contexts/AuthContext.jsx', () => {
  const React = require('react');
  return {
    useAuth: () => ({ currentUser: { uid: 'u1', displayName: 'Tester' } }),
    AuthContext: React.createContext({ currentUser: { uid: 'u1' } })
  };
});

jest.mock('../services/plannedHikesService.js', () => ({
  plannedHikeApiService: {
    getPlannedHikes: jest.fn().mockResolvedValue([]),
    createPlannedHike: jest.fn().mockResolvedValue({ success: true }),
    updatePlannedHike: jest.fn().mockResolvedValue({ success: true }),
    deletePlannedHike: jest.fn().mockResolvedValue({ success: true }),
    startPlannedHike: jest.fn().mockResolvedValue({ success: true, id: 'active-1' }),
  }
}));

jest.mock('../services/gearService.js', () => ({
  useGearChecklist: () => ({
    gearChecklist: [],
    isLoading: false,
    error: null,
    loadGearChecklist: jest.fn(),
    addGearItem: jest.fn(),
    removeGearItem: jest.fn(),
    toggleGearItem: jest.fn(),
    resetGearChecklist: jest.fn(),
    totalItems: 0,
    checkedItems: 0,
    completionPercentage: 0,
  })
}));

jest.mock('../services/hikeApiService.js', () => ({
  hikeApiService: {
    getHikes: jest.fn().mockResolvedValue({ success: true, data: [] }),
    createHike: jest.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
    updateHike: jest.fn().mockResolvedValue({ success: true }),
    deleteHike: jest.fn().mockResolvedValue({ success: true })
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

// Provide authenticated firebase for services that require it
jest.mock('../config/firebase.js', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    }
  }
}));

// Components under test
import Index from '../pages/Index.jsx';
import HikePlanner from '../pages/HikePlanner.jsx';
import Logbook from '../pages/Logbook.jsx';
import Achievements from '../pages/Achievements.jsx';

function renderWithRouter(ui, initialEntries=['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
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
    return { ok: true, json: async () => ({}) };
  });
});

describe('Page smoke tests', () => {
  test('Index renders hero and logbook sections', () => {
    renderWithRouter(<Index />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText(/Logbook Section/i)).toBeInTheDocument();
    expect(screen.getByText(/Login Modal/i)).toBeInTheDocument();
  });

  test('HikePlanner renders without crashing (nav present)', async () => {
    renderWithRouter(<HikePlanner />);
    expect(await screen.findByText('Navigation')).toBeInTheDocument();
  });

  test('Logbook renders without crashing (nav present)', async () => {
    renderWithRouter(<Logbook />);
    expect(await screen.findByText('Navigation')).toBeInTheDocument();
  });

  test('Achievements renders heading and create goal button', async () => {
    renderWithRouter(<Achievements />);
    expect(await screen.findByText(/Achievements & Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Goal/i)).toBeInTheDocument();
  });
});
