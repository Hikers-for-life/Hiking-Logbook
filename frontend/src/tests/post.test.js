import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Post from '../pages/Post';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getFeedById } from '../services/feed';

// Mock dependencies
jest.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/feed', () => ({
  getFeedById: jest.fn(),
}));

describe('Post component', () => {
  const mockUser = { uid: 'user1', name: 'Test User' };
  const mockPost = {
    id: 'post1',
    name: 'John Doe',
    avatar: 'JD',
    type: 'original',
    description: 'This is a test post',
    created_at: '2025-10-17T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: mockUser });
  });

  const renderWithRouter = (id) =>
    render(
      <MemoryRouter initialEntries={[`/post/${id}`]}>
        <Routes>
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders loading state initially', async () => {
    getFeedById.mockReturnValue(new Promise(() => {})); // never resolves
    renderWithRouter('post1');
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders post content when fetched successfully', async () => {
    getFeedById.mockResolvedValueOnce(mockPost);
    renderWithRouter('post1');

    await waitFor(() => expect(getFeedById).toHaveBeenCalledWith('post1'));

    expect(await screen.findByText(mockPost.name)).toBeInTheDocument();
    expect(await screen.findByText(mockPost.description)).toBeInTheDocument();
    expect(await screen.findByText(/back to feed/i)).toBeInTheDocument();
  });

  it('renders post not found if getFeedById returns null', async () => {
    getFeedById.mockResolvedValueOnce(null);
    renderWithRouter('invalid-post');

    await waitFor(() => expect(getFeedById).toHaveBeenCalledWith('invalid-post'));

    expect(await screen.findByText(/post not found/i)).toBeInTheDocument();
  });

  it('renders share type posts correctly', async () => {
    const sharePost = {
      id: 'post2',
      name: 'Jane Smith',
      avatar: 'JS',
      type: 'share',
      shareCaption: 'Check this out!',
      original: { id: 'post1', description: 'Original post content' },
      created_at: '2025-10-17T11:00:00Z',
    };
    getFeedById.mockResolvedValueOnce(sharePost);

    renderWithRouter('post2');

    await waitFor(() => expect(getFeedById).toHaveBeenCalledWith('post2'));

    expect(await screen.findByText(sharePost.name)).toBeInTheDocument();
    expect(await screen.findByText(sharePost.shareCaption)).toBeInTheDocument();
    expect(await screen.findByText(/original post content/i)).toBeInTheDocument();
  });

  it('logs an error if fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getFeedById.mockRejectedValueOnce(new Error('Fetch failed'));

    renderWithRouter('post3');

    await waitFor(() => expect(getFeedById).toHaveBeenCalledWith('post3'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load post'), expect.any(Error));

    consoleSpy.mockRestore();
  });
});
