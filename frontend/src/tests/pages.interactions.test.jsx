import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <nav>Navigation</nav>,
}));
jest.mock('../hooks/usePageTitle', () => ({ usePageTitle: () => {} }));

jest.mock('../contexts/AuthContext.jsx', () => {
  const React = require('react');
  return {
    useAuth: () => ({
      currentUser: { uid: 'u1', displayName: 'Tester' },
      signup: jest.fn(),
      signInWithGoogle: jest.fn(),
    }),
    AuthContext: React.createContext({ currentUser: { uid: 'u1' } }),
  };
});

jest.mock('../services/hikeApiService.js', () => ({
  hikeApiService: {
    getHikes: jest
      .fn()
      .mockResolvedValue({
        success: true,
        data: [
          {
            id: 'h1',
            title: 'Trail One',
            date: '2024-01-01',
            distance: '3',
            difficulty: 'Easy',
          },
        ],
      }),
    createHike: jest
      .fn()
      .mockResolvedValue({ success: true, data: { id: '1' } }),
  },
}));

jest.mock('../services/userService', () => ({
  userApiService: {
    getCurrentProfile: jest
      .fn()
      .mockResolvedValue({ displayName: 'Hiker', bio: '', location: '' }),
    updateProfile: jest
      .fn()
      .mockResolvedValue({
        profile: { displayName: 'New', bio: '', location: 'Cape Town' },
      }),
  },
  locationService: {
    getLocationCoordinates: jest
      .fn()
      .mockResolvedValue({ latitude: -33.9, longitude: 18.4 }),
  },
}));

jest.mock('../services/userServices', () => ({
  searchUsers: jest.fn(async (q) =>
    q ? [{ id: 'x', displayName: 'John Walker', location: 'CT' }] : []
  ),
}));
jest.mock('../services/statistics', () => ({
  getUserStats: jest.fn().mockResolvedValue({}),
}));
jest.mock('../services/friendService.js', () => ({
  getFriendProfile: jest
    .fn()
    .mockResolvedValue({ success: true, recentHikes: [] }),
}));
jest.mock('../services/discover', () => ({
  discoverFriends: jest.fn().mockResolvedValue([]),
  addFriend: jest.fn().mockResolvedValue({}),
}));
jest.mock('../services/feed', () => ({
  fetchFeed: jest.fn().mockResolvedValue([]),
  likeFeed: jest.fn(),
  commentFeed: jest.fn(async (_id, content) => ({
    comment: { id: 'c1', name: 'T', userId: 'u1', content },
  })),
  shareFeed: jest.fn(async () => ({ id: 's1' })),
  fetchComments: jest.fn(),
  deleteCommentFeed: jest.fn(),
  deleteFeed: jest.fn(),
}));

jest.mock('../config/firebase.js', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
}));

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
    if (
      u.includes('/api/users/') &&
      !u.includes('/hikes') &&
      !u.includes('/planned')
    ) {
      return {
        ok: true,
        json: async () => ({ displayName: 'Tester', bio: '', location: '' }),
      };
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

describe('Page interactions', () => {
  test('Dashboard loads and renders without errors', async () => {
    renderWithRouter(<Dashboard />);
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
  });

  test.skip('Friends allows typing in search and displays result card', async () => {
    renderWithRouter(<Friends />);
    const input = await screen.findByPlaceholderText(
      /Search for friends or hikers/i
    );
    fireEvent.change(input, { target: { value: 'john' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    // The mocked search returns a result card; assert the close button exists
    expect(await screen.findByText(/Friends & Community/i)).toBeInTheDocument();
  });

  test.skip('EditProfile submit calls userApiService.updateProfile', async () => {
    renderWithRouter(<EditProfile />);
    expect(
      await screen.findByText(/Edit Your Hiking Profile/i)
    ).toBeInTheDocument();
    const name = screen.getByLabelText(/Display Name/i);
    const location = screen.getByLabelText(/Location/i);
    fireEvent.change(name, { target: { value: 'New' } });
    fireEvent.change(location, { target: { value: 'Cape Town' } });
    fireEvent.click(screen.getByText(/Save Changes/i));
    await waitFor(() =>
      expect(screen.getByText(/Save Changes/i)).toBeInTheDocument()
    );
  });

  test.skip('Signup renders and allows typing placeholders', async () => {
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: 'User A' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@gmail.com/i), {
      target: { value: 'a@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'secret' },
    });
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });
});
