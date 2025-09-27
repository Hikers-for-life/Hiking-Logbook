import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileView } from '../components/ui/profile-view';
import { useAuth } from '../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: jest.fn(),
}));

const mockCurrentUser = {
  uid: 'user123',
};

const mockProfileData = {
  displayName: 'Alex Adventurer',
  email: 'alex@trailblazers.com',
  location: 'Zion National Park',
  bio: 'Exploring one trail at a time.',
  createdAt: { _seconds: 1672531200 }, // Jan 1, 2023
  hikes: [
    { id: 'hike1', name: 'Emerald Pools Trail', status: 'completed', distance: 4.8, elevationGain: 210, endTime: '2025-08-15T10:00:00Z' },
    { id: 'hike2', name: 'The Narrows', status: 'completed', totalDistance: '8.2', totalElevation: '150', endTime: '2025-09-20T12:00:00Z' },
    { id: 'hike3', name: 'Angels Landing', status: 'planned', distance: 8.7, elevation: 450, date: '2025-10-01T08:00:00Z' },
    { id: 'hike4', name: 'Canyon Overlook', status: 'completed', distance: 1.6, elevation: 50, endTime: '2025-07-05T14:00:00Z' },
  ]
};

describe('ProfileView', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: mockCurrentUser });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      })
    );
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props) =>
    render(
      <MemoryRouter>
        <ProfileView open={true} onOpenChange={() => {}} {...props} />
      </MemoryRouter>
    );

  test('fetches and displays user profile information', async () => {
    renderComponent();

    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3001/api/users/${mockCurrentUser.uid}`);
    
    // Check for user info
    expect(await screen.findByText('Alex Adventurer')).toBeInTheDocument();
    expect(screen.getByText('Zion National Park')).toBeInTheDocument();
    expect(screen.getByText('Exploring one trail at a time.')).toBeInTheDocument();
    expect(screen.getByText('Joined Since January 1st, 2023')).toBeInTheDocument();
  });

  test('displays the 2 most recent completed hikes, sorted correctly', async () => {
    renderComponent();
    
    // Should display The Narrows (Sep 20) and Emerald Pools (Aug 15)
    // Canyon Overlook (Jul 5) should not be shown. Angels Landing is planned.
    expect(await screen.findByText('The Narrows')).toBeInTheDocument();
    expect(screen.getByText('Sep 20, 2025')).toBeInTheDocument();

    expect(screen.getByText('Emerald Pools Trail')).toBeInTheDocument();
    expect(screen.getByText('Aug 15, 2025')).toBeInTheDocument();

    expect(screen.queryByText('Angels Landing')).not.toBeInTheDocument();
    expect(screen.queryByText('Canyon Overlook')).not.toBeInTheDocument();
  });
  
  test('displays placeholder messages when data is missing', async () => {
    // Mock a response with no hikes or bio/location
    const emptyProfile = {
      ...mockProfileData,
      bio: '',
      location: '',
      hikes: [],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(emptyProfile),
    });

    renderComponent();
    
    await waitFor(() => {
        expect(screen.getByText('Not set')).toBeInTheDocument();
        expect(screen.getByText('No bio yet')).toBeInTheDocument();
        expect(screen.getByText('No goals set yet')).toBeInTheDocument();
        expect(screen.getByText('No achievements to display')).toBeInTheDocument();
        expect(screen.getByText('No recent hikes completed')).toBeInTheDocument();
    });
  });

  test('conditionally renders "Add Friend" button', async () => {
    // Test without the prop
    const { rerender } = renderComponent({ showAddFriend: false });
    await screen.findByText('Alex Adventurer'); // Wait for render
    expect(screen.queryByRole('button', { name: /add friend/i })).not.toBeInTheDocument();

    // Test with the prop
    rerender(
      <MemoryRouter>
        <ProfileView open={true} onOpenChange={() => {}} showAddFriend={true} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /add friend/i })).toBeInTheDocument();
  });

  test('"Edit Profile" button links to the correct page', async () => {
    renderComponent();
    const editButton = await screen.findByRole('link', { name: /edit profile/i });
    expect(editButton).toHaveAttribute('href', '/edit-profile');
  });
});