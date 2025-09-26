// top of ServiceFeed.test.js or ServiceDiscover.test.js
const mockGetIdToken = jest.fn(() => Promise.resolve("fake-token"));

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { getIdToken: mockGetIdToken },
  }),
}));

import {
  fetchFeed,
  likeFeed,
  commentFeed,
  deleteCommentFeed,
  shareFeed,
  deleteFeed,
} from "../services/feed.js";

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("feed.js services", () => {
  test("fetchFeed returns feed data on success", async () => {
    const mockData = [{ id: "post1", content: "Hello" }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchFeed(1, 5);
    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/feed?page=1&limit=5", {
      headers: { Authorization: "Bearer fake-token" },
    });
    expect(result).toEqual(mockData);
  });

  test("likeFeed likes a feed successfully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await likeFeed("post1", true);

    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/feed/post1/like", expect.objectContaining({
      method: "POST",
      headers: { Authorization: "Bearer fake-token", "Content-Type": "application/json" },
      body: JSON.stringify({ like: true }),
    }));
  });

  test("commentFeed posts a comment successfully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await commentFeed("post1", "Nice!");

    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/feed/post1/comment", expect.objectContaining({
      method: "POST",
      headers: { Authorization: "Bearer fake-token", "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Nice!" }),
    }));
  });

  test("deleteCommentFeed deletes a comment successfully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await deleteCommentFeed("post1", "c1");

    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/feed/post1/comments/c1", expect.objectContaining({
      method: "DELETE",
      headers: { Authorization: "Bearer fake-token" },
    }));
  });

  test("shareFeed shares a feed successfully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await shareFeed("post1", { message: "Check this out" });

    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/feed/post1/share", expect.objectContaining({
      method: "POST",
      headers: { Authorization: "Bearer fake-token", "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Check this out" }),
    }));
  });

  test("deleteFeed deletes a feed successfully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await deleteFeed("post1");

    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/feed/post1", expect.objectContaining({
      method: "DELETE",
      headers: { Authorization: "Bearer fake-token" },
    }));
  });
});
