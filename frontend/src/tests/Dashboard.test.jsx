import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock useAuth
const mockUseAuth = {
  currentUser: {
    displayName: 'Test User',
    email: 'test@example.com',
  },
  getUserProfile: jest.fn(),
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock Navigation component
jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockUseAuth.getUserProfile.mockClear();
  });

  it('renders navigation', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });
  });

  it('renders welcome header', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test User!/)).toBeInTheDocument();
    });
  });

  it('renders stats overview section', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Total Hikes')).toBeInTheDocument();
      expect(screen.getByText('Total Distance')).toBeInTheDocument();
      expect(screen.getByText('Total Elevation')).toBeInTheDocument();
      expect(screen.getAllByText('Achievements')).toHaveLength(2); // One in stats, one in section header
    });
  });

  it('renders quick actions section', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Log New Hike')).toBeInTheDocument();
      expect(screen.getByText('Plan Hike')).toBeInTheDocument();
      expect(screen.getByText('Explore Trails')).toBeInTheDocument();
    });
  });

  it('renders recent hikes section', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Recent Hikes')).toBeInTheDocument();
      expect(screen.getByText('Your latest hiking adventures')).toBeInTheDocument();
    });
  });

  it('renders profile information section', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
      expect(screen.getByText('Your hiking preferences and details')).toBeInTheDocument();
    });
  });

  it('renders achievements section', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue({
      displayName: 'Test User',
      bio: 'Test bio',
      location: 'Test Location',
      preferences: { difficulty: 'easy', terrain: 'forest' },
      stats: { totalHikes: 0, totalDistance: 0, totalElevation: 0, achievements: [] },
    });
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getAllByText('Achievements')).toHaveLength(2); // One in stats, one in section header
      expect(screen.getByText('Badges and milestones you\'ve earned')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockUseAuth.getUserProfile.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  it('shows fallback profile when getUserProfile fails', async () => {
    mockUseAuth.getUserProfile.mockRejectedValue(new Error('Failed to load profile'));
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Passionate hiker exploring new trails')).toBeInTheDocument();
      expect(screen.getByText('Mountain View, CA')).toBeInTheDocument();
    });
  });

  it('shows fallback profile when getUserProfile returns null', async () => {
    mockUseAuth.getUserProfile.mockResolvedValue(null);
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Passionate hiker exploring new trails')).toBeInTheDocument();
      expect(screen.getByText('Mountain View, CA')).toBeInTheDocument();
    });
  });

  it('displays user stats correctly', async () => {
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
    
    mockUseAuth.getUserProfile.mockResolvedValue(mockProfile);
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total Hikes
      expect(screen.getByText('25 km')).toBeInTheDocument(); // Total Distance
      expect(screen.getByText('1000 m')).toBeInTheDocument(); // Total Elevation
      expect(screen.getByText('2')).toBeInTheDocument(); // Achievements count
    });
  });
});
