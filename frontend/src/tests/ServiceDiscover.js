import { discoverFriends, addFriend } from "../discovers.js";

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

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

describe("discovers.js services", () => {
  describe("discoverFriends", () => {
    it("returns suggestions on success", async () => {
      const mockData = [{ id: "f1", name: "Alice", mutualFriends: 2 }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await discoverFriends();
      expect(global.fetch).toHaveBeenCalledWith("http://mock-api/discover", {
        headers: { Authorization: "Bearer fake-token" },
      });
      expect(result).toEqual(mockData);
    });

    it("throws error on failure", async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      await expect(discoverFriends()).rejects.toThrow(
        "Failed to fetch suggestions"
      );
    });
  });

  describe("addFriend", () => {
    it("adds a friend successfully", async () => {
      const mockResp = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResp,
      });

      const result = await addFriend("f1");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/discover/add",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          }),
          body: JSON.stringify({ friendId: "f1" }),
        })
      );
      expect(result).toEqual(mockResp);
    });

    it("throws error on failure", async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      await expect(addFriend("f1")).rejects.toThrow("Failed to add friend");
    });
  });
});
