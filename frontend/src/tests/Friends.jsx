import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Friends from '../pages/Friends';
import { getAuth } from 'firebase/auth';
import { fetchFeed, likeFeed, commentFeed, shareFeed, deleteCommentFeed, deleteFeed } from '../services/feed';
import { discoverFriends, addFriend, getUserDetails } from '../services/discover';

// Mock all dependencies
jest.mock('firebase/auth');
jest.mock('../services/feed');
jest.mock('../services/discover');
jest.mock('../components/ui/navigation', () => () => <div data-testid="navigation">Navigation</div>);
jest.mock('../components/ui/button', () => ({ children, ...props }) => <button {...props}>{children}</button>);
jest.mock('../components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardFooter: ({ children }) => <div data-testid="card-footer">{children}</div>,
  CardTitle: ({ children }) => <h3 data-testid="card-title">{children}</h3>,
  CardDescription: ({ children }) => <p data-testid="card-description">{children}</p>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
}));
jest.mock('../components/ui/input', () => ({ ...props }) => <input data-testid="input" {...props} />);
jest.mock('../components/ui/badge', () => ({
  Badge: ({ children, ...props }) => <span data-testid="badge" {...props}>{children}</span>,
  badgeVariants: () => ({})
}));
jest.mock('../components/ui/avatar', () => ({
  Avatar: ({ children }) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ children }) => <div data-testid="avatar-image">{children}</div>,
  AvatarFallback: ({ children }) => <div data-testid="avatar-fallback">{children}</div>,
}));
jest.mock('../components/ui/tabs', () => ({
  Tabs: ({ children }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, ...props }) => <button data-testid="tabs-trigger" {...props}>{children}</button>,
  TabsContent: ({ children, ...props }) => <div data-testid="tabs-content" {...props}>{children}</div>,
}));
jest.mock('../components/ui/view-friend-profile', () => ({ open, onOpenChange, person }) => 
  open ? <div data-testid="profile-view">Profile View: {person?.name}</div> : null
);
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  UserPlus: () => <div data-testid="user-plus-icon">UserPlus</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Mountain: () => <div data-testid="mountain-icon">Mountain</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Medal: () => <div data-testid="medal-icon">Medal</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Share2: () => <div data-testid="share-icon">Share2</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  MessageSquare: () => <div data-testid="message-icon">MessageSquare</div>,
}));

describe('Friends Component', () => {
  const mockUser = {
    uid: 'user123',
    displayName: 'John Doe',
    email: 'john@example.com'
  };

  const mockAuth = {
    currentUser: mockUser
  };

  const mockFriends = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      location: 'Seattle, WA',
      totalHikes: 47,
      totalDistance: '234 km',
      lastHike: 'Mount Rainier Trail',
      lastHikeDate: '2 days ago',
      status: 'online',
      recentAchievement: '100km Milestone'
    }
  ];

  const mockActivities = [
    {
      id: 'activity1',
      userId: 'user123',
      name: 'John Doe',
      avatar: 'JD',
      action: 'completed',
      hike: 'Test Trail',
      description: 'Great hike!',
      stats: '5km in 2h',
      time: '1 hour ago',
      likes: [],
      comments: [],
      type: 'post'
    }
  ];

  const mockSuggestions = [
    {
      id: 'suggestion1',
      name: 'Suggested Friend',
      avatar: 'SF',
      mutualFriends: 3,
      commonTrails: ['Trail A', 'Trail B']
    }
  ];

  beforeEach(() => {
    getAuth.mockReturnValue(mockAuth);
    fetchFeed.mockResolvedValue({ activities: mockActivities });
    discoverFriends.mockResolvedValue(mockSuggestions);
    getUserDetails.mockResolvedValue(mockFriends[0]);
    likeFeed.mockResolvedValue({});
    commentFeed.mockResolvedValue({ comment: { id: 'comment1', content: 'Test comment' } });
    shareFeed.mockResolvedValue({ newActivityId: 'share1' });
    deleteCommentFeed.mockResolvedValue({});
    deleteFeed.mockResolvedValue({});
    addFriend.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Friends component with navigation', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByText('Friends & Community')).toBeInTheDocument();
    });
  });

  test('loads and displays friends tab by default', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(screen.getByText('My Friends')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  test('switches between tabs correctly', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  test('loads and displays activity feed', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(fetchFeed).toHaveBeenCalledTimes(1);
    });
    
    const activityTab = screen.getByText('Activity Feed');
    fireEvent.click(activityTab);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('completed Test Trail')).toBeInTheDocument();
    });
  });

  test('handles like functionality', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
    });
    
    await waitFor(() => {
      const likeButton = screen.getByText('0'); // Initial like count
      fireEvent.click(likeButton);
      
      expect(likeFeed).toHaveBeenCalledWith('activity1', true);
    });
  });

  test('handles add comment functionality', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
    });
    
    await waitFor(() => {
      const commentButton = screen.getByText('0'); // Initial comment count
      fireEvent.click(commentButton);
      
      const commentTextarea = screen.getByPlaceholderText('Add a comment...');
      fireEvent.change(commentTextarea, { target: { value: 'Test comment' } });
      fireEvent.keyDown(commentTextarea, { key: 'Enter', shiftKey: false });
      
      expect(commentFeed).toHaveBeenCalledWith('activity1', 'Test comment');
    });
  });

  test('handles share functionality', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
    });
    
    await waitFor(() => {
      const shareButtons = screen.getAllByText('Share');
      fireEvent.click(shareButtons[0]);
      
      expect(shareFeed).toHaveBeenCalled();
    });
  });

  test('handles add friend functionality', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
    });
    
    await waitFor(() => {
      expect(discoverFriends).toHaveBeenCalledTimes(1);
      
      const addFriendButton = screen.getByText('Add Friend');
      fireEvent.click(addFriendButton);
      
      expect(addFriend).toHaveBeenCalledWith('suggestion1');
    });
  });

  test('opens profile view when viewing profile', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const viewProfileButtons = screen.getAllByText('View Profile');
      fireEvent.click(viewProfileButtons[0]);
    });
    
    await waitFor(() => {
      expect(getUserDetails).toHaveBeenCalled();
      expect(screen.getByTestId('profile-view')).toBeInTheDocument();
    });
  });

  test('handles delete post functionality', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
    });
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete Post');
      fireEvent.click(deleteButtons[0]);
      
      expect(deleteFeed).toHaveBeenCalledWith('activity1');
    });
  });

  test('handles delete comment functionality', async () => {
    const activityWithComments = {
      ...mockActivities[0],
      comments: [{ id: 'comment1', userId: 'user123', name: 'John Doe', content: 'Test comment' }]
    };
    
    fetchFeed.mockResolvedValueOnce({ activities: [activityWithComments] });
    
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
    });
    
    await waitFor(() => {
      const commentButton = screen.getByText('1'); // Comment count
      fireEvent.click(commentButton);
      
      const deleteCommentButton = screen.getByText('Delete');
      fireEvent.click(deleteCommentButton);
      
      expect(deleteCommentFeed).toHaveBeenCalledWith('activity1', 'comment1');
    });
  });

  test('handles loading states', async () => {
    fetchFeed.mockImplementation(() => new Promise(() => {})); // Never resolves
    discoverFriends.mockImplementation(() => new Promise(() => {}));
    
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
      
      expect(screen.getByText('Loading suggestions...')).toBeInTheDocument();
    });
  });

  test('handles empty suggestions', async () => {
    discoverFriends.mockResolvedValue([]);
    
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
      
      expect(screen.getByText('No suggestions at the moment.')).toBeInTheDocument();
    });
  });

  test('handles service errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    fetchFeed.mockRejectedValue(new Error('Network error'));
    
    render(<Friends />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch feed:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('handles search functionality', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search for friends or hikers...');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expect(searchInput.value).toBe('test search');
    });
  });
});