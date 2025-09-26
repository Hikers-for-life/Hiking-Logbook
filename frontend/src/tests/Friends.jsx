import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Friends from "../pages/Friends";
import { BrowserRouter as Router } from "react-router-dom";

// ✅ Mock Firebase auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "test-uid", displayName: "Test User", email: "test@example.com" },
  })),
}));

// ✅ Mock feed and discover service functions
jest.mock("../services/feed", () => ({
  fetchFeed: jest.fn(),
  likePost: jest.fn(),
  addComment: jest.fn(),
  deletePost: jest.fn(),
}));

jest.mock("../services/discover", () => ({
  discoverFriends: jest.fn(),
  addFriend: jest.fn(),
  getUserDetails: jest.fn(),
}));

jest.mock("../components/ui/navigation", () => ({
  Navigation: () => <div data-testid="mock-navigation" />,
}));

// ✅ Import mocks
import { fetchFeed, likePost, addComment, deletePost } from "../services/feed";
import { discoverFriends, addFriend, getUserDetails } from "../services/discover";

// ✅ Mock data
const mockFeed = [
  {
    id: "p1",
    userId: "test-uid",
    name: "Test User",
    description: "Fun hike!",
    created_at: "2023-01-01T00:00:00Z",
    likes: [],
    comments: [],
  },
];

const mockSuggestions = [
  { id: "u1", name: "Suggested Friend", showAddFriend: true },
];

describe("Friends Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchFeed.mockResolvedValue(mockFeed);
    discoverFriends.mockResolvedValue(mockSuggestions);
    likePost.mockResolvedValue({});
    addComment.mockResolvedValue({});
    deletePost.mockResolvedValue({});
    addFriend.mockResolvedValue({});
    getUserDetails.mockResolvedValue({});
  });

  const renderPage = () =>
    render(
      <Router>
        <Friends />
      </Router>
    );

  test("renders page and loads feed", async () => {
    renderPage();

    // ✅ Ensure main title is present
    await waitFor(() => {
      expect(screen.getByText(/Friends & Community/i)).toBeInTheDocument();
    });

    // ✅ Search bar present
    expect(screen.getByPlaceholderText(/Search for friends or hikers/i)).toBeInTheDocument();

    // ✅ Feed content loads
    expect(await screen.findByText(/Fun hike!/i)).toBeInTheDocument();
  });

  test("likes a post", async () => {
    renderPage();

    await screen.findByText(/Fun hike!/i);

    const likeBtn = screen.getByRole("button", { name: /0/i });
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(likePost).toHaveBeenCalledWith("p1");
    });
  });

  test("adds a comment", async () => {
    renderPage();
    await screen.findByText(/Fun hike!/i);

    const commentBtn = screen.getByRole("button", { name: /0/i });
    fireEvent.click(commentBtn);

    const input = screen.getByPlaceholderText(/Add a comment/i);
    fireEvent.change(input, { target: { value: "Nice post!" } });

    const submitBtn = screen.getByRole("button", { name: /Post/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(addComment).toHaveBeenCalledWith("p1", "Nice post!");
    });
  });

  test("shares a post", async () => {
    renderPage();
    await screen.findByText(/Fun hike!/i);

    const shareBtn = screen.getByText(/Share/i);
    fireEvent.click(shareBtn);
    
    // We only assert that the UI didn't crash — no backend call here
    expect(shareBtn).toBeInTheDocument();
  });

  test("deletes a post", async () => {
    renderPage();
    await screen.findByText(/Fun hike!/i);

    const deleteBtn = screen.getByText(/Delete Post/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deletePost).toHaveBeenCalledWith("p1");
    });
  });

  test("renders discover suggestions and adds friend", async () => {
    renderPage();

    await waitFor(() => expect(discoverFriends).toHaveBeenCalled());

    expect(await screen.findByText(/Suggested Friend/i)).toBeInTheDocument();

    const addBtn = screen.getByText(/Add Friend/i);
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(addFriend).toHaveBeenCalledWith("u1");
    });
  });

  test("opens profile on view profile click", async () => {
    renderPage();

    await screen.findByText(/Suggested Friend/i);

    const viewBtns = await screen.findAllByText(/View Profile/i);
    fireEvent.click(viewBtns[0]);

    await waitFor(() => expect(getUserDetails).toHaveBeenCalled());
  });
});
