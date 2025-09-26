// top of ServiceFeed.test.js or ServiceDiscover.test.js
const mockGetIdToken = jest.fn(() => Promise.resolve("fake-token"));

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { getIdToken: mockGetIdToken },
  }),
}));

import { discoverFriends, addFriend } from "../services/discover.js";

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("discover.js services", () => {
  test("discoverFriends returns suggestions on success", async () => {
    const mockData = [{ id: "u1", name: "Bob" }];
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    const result = await discoverFriends();
    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/discover", {
      headers: { Authorization: "Bearer fake-token" },
    });
    expect(result).toEqual(mockData);
  });

  test("addFriend adds a friend successfully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    await addFriend("f1");

    expect(global.fetch).toHaveBeenCalledWith("http://mock-api/discover/add", expect.objectContaining({
      method: "POST",
      headers: { Authorization: "Bearer fake-token", "Content-Type": "application/json" },
      body: JSON.stringify({ friendId: "f1" }),
    }));
  });
});
