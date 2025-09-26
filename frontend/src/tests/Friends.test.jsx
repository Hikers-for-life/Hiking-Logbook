// src/tests/Friends.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Friends from "../pages/Friends.jsx";

// at top of Friends.test.jsx
jest.mock("../contexts/AuthContext", () => {
  const actual = jest.requireActual("../contexts/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      currentUser: { uid: "test-uid", email: "test@example.com" },
      login: jest.fn(),
      logout: jest.fn(),
    }),
    AuthProvider: ({ children }) => <div>{children}</div>, // dummy
  };
});
// Mock services first
jest.mock("../services/feed.js", () => ({
  getFeed: jest.fn(() =>
    Promise.resolve([{ id: "post1", content: "Trail One", likes: 0 }])
  ),
  likeFeed: jest.fn(),
}));

jest.mock("../services/discover.js", () => ({
  getSuggestions: jest.fn(() =>
    Promise.resolve([{ id: "user1", name: "Bob" }])
  ),
  addFriend: jest.fn(),
}));

// Import the mocked services to assert calls
import * as feedService from "../services/feed.js";
import * as discoverService from "../services/discover.js";

describe("Friends Page", () => {
  it("allows liking a post", async () => {
  render(
    <MemoryRouter>
      <Friends />
    </MemoryRouter>
  );

  // More flexible matcher
  await screen.findByText((_, node) =>
    node.textContent.includes("Trail One")
  );

  const likeButton = await screen.findByRole("button", { name: /0/i });
  fireEvent.click(likeButton);

  await waitFor(() => expect(feedService.likeFeed).toHaveBeenCalled());
});

it("allows adding a friend", async () => {
  render(
    <MemoryRouter>
      <Friends />
    </MemoryRouter>
  );

  await screen.findByText(/Bob/i);

  const addButton = await screen.findByRole("button", { name: /Add Friend/i });
  fireEvent.click(addButton);

  await waitFor(() => expect(discoverService.addFriend).toHaveBeenCalled());
});

});
