import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Friends from '../pages/Friends';
import { getAuth } from 'firebase/auth';
import { fetchFeed, likeFeed, commentFeed, shareFeed, deleteCommentFeed, deleteFeed } from '../services/feed';
import { discoverFriends, addFriend, getUserDetails } from '../services/discover';

// Mock all dependencies with proper React elements
jest.mock('firebase/auth');

// Mock services
jest.mock('../services/feed');
jest.mock('../services/discover');

// Mock UI components with simple but valid React elements
jest.mock('../components/ui/navigation', () => ({ 
  Navigation: () => <div data-testid="navigation">Navigation</div> 
}));

jest.mock('../components/ui/button', () => ({ 
  Button: ({ children, ...props }) => <button {...props}>{children}</button> 
}));

jest.mock('../components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardFooter: ({ children }) => <div data-testid="card-footer">{children}</div>,
  CardTitle: ({ children }) => <h3 data-testid="card-title">{children}</h3>,
  CardDescription: ({ children }) => <p data-testid="card-description">{children}</p>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('../components/ui/input', () => ({ 
  Input: (props) => <input data-testid="input" {...props} /> 
}));

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
  Tabs: ({ children, ...props }) => <div data-testid="tabs" {...props}>{children}</div>,
  TabsList: ({ children, ...props }) => <div data-testid="tabs-list" {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }) => <button data-testid="tabs-trigger" {...props}>{children}</button>,
  TabsContent: ({ children, ...props }) => <div data-testid="tabs-content" {...props}>{children}</div>,
}));

jest.mock('../components/ui/view-friend-profile', () => ({
  ProfileView: ({ open, onOpenChange, person }) => 
    open ? <div data-testid="profile-view">Profile View: {person?.name}</div> : null
}));

// Mock Lucide icons with proper components
const MockIcon = ({ testId, children }) => <div data-testid={testId}>{children}</div>;

jest.mock('lucide-react', () => ({
  Search: () => <MockIcon testId="search-icon">Search</MockIcon>,
  UserPlus: () => <MockIcon testId="user-plus-icon">UserPlus</MockIcon>,
  MapPin: () => <MockIcon testid="map-pin-icon">MapPin</MockIcon>,
  TrendingUp: () => <MockIcon testid="trending-up-icon">TrendingUp</MockIcon>,
  Mountain: () => <MockIcon testid="mountain-icon">Mountain</MockIcon>,
  Clock: () => <MockIcon testid="clock-icon">Clock</MockIcon>,
  Medal: () => <MockIcon testid="medal-icon">Medal</MockIcon>,
  Users: () => <MockIcon testid="users-icon">Users</MockIcon>,
  Share2: () => <MockIcon testid="share-icon">Share2</MockIcon>,
  Heart: () => <MockIcon testid="heart-icon">Heart</MockIcon>,
  MessageSquare: () => <MockIcon testid="message-icon">MessageSquare</MockIcon>,
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
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
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
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

  // Basic rendering test
  test('renders Friends component with main elements', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(screen.getByText('Friends & Community')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search for friends or hikers...')).toBeInTheDocument();
    });
  });

  // Test service integration
  test('loads feed data on mount', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(fetchFeed).toHaveBeenCalledTimes(1);
    });
  });

  test('loads suggestions when authenticated', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(discoverFriends).toHaveBeenCalledTimes(1);
    });
  });

  // Test tab functionality
  test('can switch to activity feed tab', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const activityTab = screen.getByText('Activity Feed');
      fireEvent.click(activityTab);
      
      // Should see activity feed content
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  test('can switch to discover tab', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
      
      // Should see discover content
      expect(screen.getByText('Suggested Friends')).toBeInTheDocument();
    });
  });

  // Test service error handling
  test('handles feed loading errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    fetchFeed.mockRejectedValue(new Error('Network error'));
    
    render(<Friends />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch feed:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('handles suggestions loading errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    discoverFriends.mockRejectedValue(new Error('Network error'));
    
    render(<Friends />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch suggestions:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  // Test friend actions
  test('handles adding a friend', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
    });
    
    await waitFor(() => {
      const addFriendButton = screen.getByText('Add Friend');
      fireEvent.click(addFriendButton);
      
      expect(addFriend).toHaveBeenCalledWith('suggestion1');
    });
  });

  // Test profile viewing
  test('opens profile view', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const viewProfileButtons = screen.getAllByText('View Profile');
      fireEvent.click(viewProfileButtons[0]);
    });
    
    await waitFor(() => {
      expect(getUserDetails).toHaveBeenCalled();
    });
  });

  // Test empty states
  test('shows empty suggestions message', async () => {
    discoverFriends.mockResolvedValue([]);
    
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No suggestions at the moment.')).toBeInTheDocument();
    });
  });

  // Test loading states
  test('shows loading state for suggestions', async () => {
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    discoverFriends.mockReturnValue(pendingPromise);
    
    render(<Friends />);
    
    await waitFor(() => {
      const discoverTab = screen.getByText('Discover');
      fireEvent.click(discoverTab);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Loading suggestions...')).toBeInTheDocument();
    });
    
    // Resolve the promise to clean up
    resolvePromise(mockSuggestions);
  });

  // Test search functionality
  test('handles search input', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search for friends or hikers...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expect(searchInput.value).toBe('test search');
    });
  });
});