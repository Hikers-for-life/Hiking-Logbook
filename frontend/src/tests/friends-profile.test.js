
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileView } from '../components/ui/view-friend-profile';
import { sendFriendRequest } from '../services/discover';


// Simple smoke tests for ProfileView component integration

// Mock the addFriend service

jest.mock('../services/discover', () => ({
  sendFriendRequest: jest.fn(),
}));

// Mock useToast
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('ProfileView', () => {
  const mockPerson = {
    uid: '123',
    displayName: 'Test User',
    bio: 'This is a test bio',
    location: 'Cape Town',
    createdAt: new Date(),
    achievements: [
      {
        name: 'Peak Collector',
        description: 'Completed 10+ peaks',
        earned: '1 week ago',
      },
    ],
  };

  it("renders friend's profile info", () => {
    render(
      <ProfileView
        open={true}
        onOpenChange={jest.fn()}
        person={mockPerson}
        showAddFriend={false}
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio')).toBeInTheDocument();
    expect(screen.getByText(/Completed 10\+ peaks/)).toBeInTheDocument();
  });

  it('shows Add Friend button when showAddFriend is true', () => {
    render(
      <ProfileView
        open={true}
        onOpenChange={jest.fn()}
        person={mockPerson}
        showAddFriend={true}
      />
    );

    expect(screen.getByText('Add Friend')).toBeInTheDocument();
  });

  it('calls addFriend and disables button after success', async () => {
    sendFriendRequest.mockResolvedValueOnce({ success: true });

    render(
      <ProfileView
        open={true}
        onOpenChange={jest.fn()}
        person={mockPerson}
        showAddFriend={true}
      />
    );

    const button = screen.getByText('Add Friend');
    fireEvent.click(button);

    await waitFor(() => {
      expect(sendFriendRequest).toHaveBeenCalledWith('123');
    });

    // After success, button should now be disabled and show "Friend Added"
    await waitFor(() => {
      expect(screen.getByText('Request Sent')).toBeInTheDocument();
    });
  });

  it('shows Message button when showAddFriend is false', () => {
    render(
      <ProfileView
        open={true}
        onOpenChange={jest.fn()}
        person={mockPerson}
        showAddFriend={false}
      />
    );

    expect(screen.getByText('Message')).toBeInTheDocument();

  });
});
