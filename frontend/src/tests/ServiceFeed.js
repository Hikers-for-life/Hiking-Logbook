import {
  fetchFeed,
  likeFeed,
  commentFeed,
  deleteCommentFeed,
  shareFeed,
  deleteFeed,
} from "../feed.js";

// --- Mock Firebase Auth ---
const mockGetIdToken = jest.fn(() => Promise.resolve("fake-token"));
jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { getIdToken: mockGetIdToken },
  }),
}));

// --- Mock API_BASE ---
jest.mock("../../api/api.js", () => ({
  API_BASE: "http://mock-api",
}));

// Reset fetch before each test
beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

describe("feed.js services", () => {
  describe("fetchFeed", () => {
    it("returns feed data on success", async () => {
      const mockData = [{ id: "1", text: "hello" }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchFeed(1, 5);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/feed?page=1&limit=5",
        { headers: { Authorization: "Bearer fake-token" } }
      );
      expect(result).toEqual(mockData);
    });

    it("throws error on failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server Error",
      });

      await expect(fetchFeed()).rejects.toThrow(
        "Failed to fetch feed: 500 Server Error"
      );
    });
  });

  describe("likeFeed", () => {
    it("likes a feed successfully", async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await likeFeed("post1", true);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/feed/post1/like",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
          body: JSON.stringify({ like: true }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("throws error if like fails", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      await expect(likeFeed("post1", true)).rejects.toThrow(
        "Failed to like feed: 400 Bad Request"
      );
    });
  });

  describe("commentFeed", () => {
    it("posts a comment successfully", async () => {
      const mockComment = { id: "c1", content: "Nice!" };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      });

      const result = await commentFeed("post1", "Nice!");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/feed/post1/comment",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ content: "Nice!" }),
        })
      );
      expect(result).toEqual(mockComment);
    });

    it("throws error on failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      await expect(commentFeed("post1", "Bad")).rejects.toThrow(
        "Failed to comment: 403 Forbidden"
      );
    });
  });

  describe("deleteCommentFeed", () => {
    it("deletes a comment successfully", async () => {
      const mockResp = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResp,
      });

      const result = await deleteCommentFeed("post1", "c1");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/feed/post1/comments/c1",
        expect.objectContaining({ method: "DELETE" })
      );
      expect(result).toEqual(mockResp);
    });

    it("throws error on failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not Found",
      });

      await expect(deleteCommentFeed("post1", "c1")).rejects.toThrow(
        "Failed to delete comment: 404 Not Found"
      );
    });
  });

  describe("shareFeed", () => {
    it("shares a feed successfully", async () => {
      const mockResp = { id: "shared1" };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResp,
      });

      const result = await shareFeed("post1", { message: "Check this out" });
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/feed/post1/share",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ message: "Check this out" }),
        })
      );
      expect(result).toEqual(mockResp);
    });

    it("throws error when share fails", async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      await expect(shareFeed("post1", {})).rejects.toThrow("Failed to share");
    });
  });

  describe("deleteFeed", () => {
    it("deletes a feed successfully", async () => {
      const mockResp = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResp,
      });

      const result = await deleteFeed("post1");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/feed/post1",
        expect.objectContaining({ method: "DELETE" })
      );
      expect(result).toEqual(mockResp);
    });

    it("throws error when delete fails", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Error",
      });

      await expect(deleteFeed("post1")).rejects.toThrow(
        "Failed to delete post: 500 Internal Error"
      );
    });
  });
});
