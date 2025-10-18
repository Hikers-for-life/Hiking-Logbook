import {
  sendHikeInvitation,
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  getPendingInvitationsCount
} from '../services/hikeInviteService';


jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('hikeInviteService', () => {
  const mockGetAuth = require('firebase/auth').getAuth;

  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };

    mockGetAuth.mockReturnValue({ currentUser: mockUser });
  });

  const mockFetchSuccess = (data = {}) => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data }),
    });
  };

  const mockFetchFailure = (message = 'Server error') => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: message }),
    });
  };
    // ============ sendHikeInvitation ============
  test('sends a hike invitation successfully', async () => {
    const hikeDetails = {
      title: 'Morning Trail',
      location: 'Cape Town',
      date: '2025-10-20',
      distance: '10km',
      difficulty: 'Easy',
      description: 'Fun hike!',
    };

    mockFetchSuccess({ id: 'invite123' });

    const result = await sendHikeInvitation('hike1', 'friend1', hikeDetails);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/hike-invites/send'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('"friendId":"friend1"'),
      })
    );

    expect(result).toEqual({ id: 'invite123' });
  });

  test('throws error if user not authenticated', async () => {
    mockGetAuth.mockReturnValueOnce({ currentUser: null });

    await expect(
      sendHikeInvitation('hike1', 'friend1', {})
    ).rejects.toThrow('User not authenticated');
  });

  test('throws error when response is not ok', async () => {
    mockFetchFailure('Failed to send invitation');

    await expect(
      sendHikeInvitation('hike1', 'friend1', {})
    ).rejects.toThrow('Failed to send invitation');
  });

  // ============ getPendingInvitations ============
  test('fetches pending invitations successfully', async () => {
    const mockInvites = [{ id: 'i1' }, { id: 'i2' }];
    mockFetchSuccess(mockInvites);

    const result = await getPendingInvitations();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/hike-invites/pending'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mock-token' }),
      })
    );

    expect(result).toEqual(mockInvites);
  });

  test('throws error when fetching pending invitations fails', async () => {
    mockFetchFailure('Failed to fetch invitations');

    await expect(getPendingInvitations()).rejects.toThrow('Failed to fetch invitations');
  });

  // ============ acceptInvitation ============
  test('accepts invitation successfully', async () => {
    mockFetchSuccess({ status: 'accepted' });

    const result = await acceptInvitation('inv123');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/hike-invites/inv123/accept'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
      })
    );

    expect(result).toEqual({ status: 'accepted' });
  });

  test('throws error when acceptInvitation fails', async () => {
    mockFetchFailure('Failed to accept invitation');

    await expect(acceptInvitation('inv123')).rejects.toThrow('Failed to accept invitation');
  });

  // ============ rejectInvitation ============
  test('rejects invitation successfully', async () => {
    mockFetchSuccess({ status: 'rejected' });

    const result = await rejectInvitation('inv123');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/hike-invites/inv123/reject'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
      })
    );

    expect(result).toEqual({ status: 'rejected' });
  });

  test('throws error when rejectInvitation fails', async () => {
    mockFetchFailure('Failed to reject invitation');

    await expect(rejectInvitation('inv123')).rejects.toThrow('Failed to reject invitation');
  });

  // ============ getPendingInvitationsCount ============
  test('returns pending invitation count successfully', async () => {
    mockFetchSuccess({ count: 5 });

    const result = await getPendingInvitationsCount();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/hike-invites/pending/count'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mock-token' }),
      })
    );

    expect(result).toBe(5);
  });

  test('returns 0 when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getPendingInvitationsCount();

    expect(result).toBe(0);
  });
});
