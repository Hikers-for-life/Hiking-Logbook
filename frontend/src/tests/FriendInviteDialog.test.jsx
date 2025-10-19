import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendInviteDialog from '../components/FriendInviteDialog';
import { useAuth } from '../contexts/AuthContext';
import { hikeInviteService } from '../services/hikeInviteService';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/hikeInviteService', () => ({
  hikeInviteService: {
    sendHikeInvitation: jest.fn(),
  },
}));

global.fetch = jest.fn();

describe('FriendInviteDialog Component', () => {
  const mockHike = {
    id: 'hike123',
    title: 'Mountain Adventure',
    location: 'Table Mountain',
    date: '2025-10-20',
    distance: '12km',
    difficulty: 'Medium',
    description: 'A scenic hike',
    startTime: '08:00',
  };

  const mockUser = { uid: 'user123' };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: mockUser });
  });

  test('renders dialog with hike info', () => {
    render(<FriendInviteDialog open={true} onOpenChange={jest.fn()} hike={mockHike} />);
    expect(screen.getByText('Invite Friends to Hike')).toBeInTheDocument();
    expect(screen.getByText('Mountain Adventure')).toBeInTheDocument();
    expect(screen.getByText('Table Mountain')).toBeInTheDocument();
  });


  test('shows empty state when no friends are available', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<FriendInviteDialog open={true} onOpenChange={jest.fn()} hike={mockHike} />);

    await waitFor(() => {
      expect(screen.getByText('No friends to invite yet')).toBeInTheDocument();
    });
  });

  test('filters friends by search term', async () => {
    const mockFriends = [
      { id: 'f1', displayName: 'Alice Johnson' },
      { id: 'f2', displayName: 'Bob Smith' },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockFriends }),
    });

    render(<FriendInviteDialog open={true} onOpenChange={jest.fn()} hike={mockHike} />);

    await waitFor(() => screen.getByText('Alice Johnson'));

    fireEvent.change(screen.getByPlaceholderText('Search friends...'), {
      target: { value: 'Bob' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });
  });

  test('sends an invitation when Invite button is clicked', async () => {
    window.alert = jest.fn();

    const mockFriends = [{ id: 'f1', displayName: 'Alice Johnson' }];

    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockFriends }),
    });

    hikeInviteService.sendHikeInvitation.mockResolvedValueOnce({ success: true });

    render(<FriendInviteDialog open={true} onOpenChange={jest.fn()} hike={mockHike} />);

    await waitFor(() => screen.getByText('Alice Johnson'));

    fireEvent.click(screen.getByText('Invite'));

    await waitFor(() => {
      expect(hikeInviteService.sendHikeInvitation).toHaveBeenCalledWith(
        'hike123',
        'f1',
        expect.objectContaining({
          title: 'Mountain Adventure',
          location: 'Table Mountain',
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith('Invitation sent to Alice Johnson!');
  });

  test('handles error loading friends', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<FriendInviteDialog open={true} onOpenChange={jest.fn()} hike={mockHike} />);

    await waitFor(() => {
      expect(screen.getByText('No friends to invite yet')).toBeInTheDocument();
    });
  });

  test('shows Invited badge after sending an invite', async () => {
    const mockFriends = [{ id: 'f1', displayName: 'Alice Johnson' }];
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockFriends }),
    });
    hikeInviteService.sendHikeInvitation.mockResolvedValueOnce({ success: true });

    render(<FriendInviteDialog open={true} onOpenChange={jest.fn()} hike={mockHike} />);
    await waitFor(() => screen.getByText('Alice Johnson'));

    fireEvent.click(screen.getByText('Invite'));

    await waitFor(() => {
      expect(screen.getByText('Invited')).toBeInTheDocument();
    });
  });

  test('calls onOpenChange(false) when Done is clicked', async () => {
    const handleClose = jest.fn();

    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<FriendInviteDialog open={true} onOpenChange={handleClose} hike={mockHike} />);
    fireEvent.click(screen.getByText('Done'));

    expect(handleClose).toHaveBeenCalledWith(false);
  });
});
