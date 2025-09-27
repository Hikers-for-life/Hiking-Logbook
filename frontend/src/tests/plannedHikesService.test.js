// __tests__/plannedHikesService.test.js
import { plannedHikeApiService, plannedHikeUtils } from "../services/plannedHikesService";

global.fetch = jest.fn(); // mock fetch

// --- mock Firebase auth ---
jest.mock("../config/firebase.js", () => ({
  auth: {
    currentUser: {
      uid: "user-123",
      getIdToken: jest.fn().mockResolvedValue("fake-token"),
    },
  },
}));

describe("plannedHikeApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createPlannedHike sends POST with body", async () => {
    const mockHike = { title: "Morning Hike" };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockHike }),
    });

    const result = await plannedHikeApiService.createPlannedHike(mockHike);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/planned-hikes"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mockHike),
      })
    );
    expect(result).toEqual(mockHike);
  });

  test("deletePlannedHike calls DELETE", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await plannedHikeApiService.deletePlannedHike("hike123");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/planned-hikes/hike123"),
      expect.objectContaining({ method: "DELETE" })
    );
    expect(result).toEqual({ success: true });
  });

  test("handles fetch error properly", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Bad request" }),
    });

    await expect(plannedHikeApiService.getPlannedHikes()).rejects.toThrow(
      "Bad request"
    );
  });
});

describe("plannedHikeUtils", () => {
  test("validatePlannedHikeData detects missing fields", () => {
    const result = plannedHikeUtils.validatePlannedHikeData({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Title is required");
    expect(result.errors).toContain("Date is required");
    expect(result.errors).toContain("Start time is required");
    expect(result.errors).toContain("Location is required");
  });

  test("validatePlannedHikeData rejects past date", () => {
    const past = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const result = plannedHikeUtils.validatePlannedHikeData({
      title: "Old Hike",
      date: past,
      startTime: "09:00",
      location: "Trail",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Hike date cannot be in the past");
  });

  test("formatPlannedHikeData trims fields", () => {
    const input = {
      title: "  Test ",
      date: "2025-10-01",
      startTime: "08:00",
      location: " Valley ",
      distance: " 5 ",
      difficulty: "Moderate",
      description: " Cool ",
      notes: " Bring snacks ",
    };

    const result = plannedHikeUtils.formatPlannedHikeData(input);
    expect(result.title).toBe("Test");
    expect(result.location).toBe("Valley");
    expect(result.notes).toBe("Bring snacks");
  });

  test("canJoinPlannedHike prevents joining past hike", () => {
    const hike = { date: "2020-01-01", status: "planning" };
    const result = plannedHikeUtils.canJoinPlannedHike(hike, "user1");
    expect(result.canJoin).toBe(false);
    expect(result.reason).toMatch(/in the past/);
  });

  test("canJoinPlannedHike prevents joining cancelled hike", () => {
    const hike = { date: "2099-01-01", status: "cancelled" };
    const result = plannedHikeUtils.canJoinPlannedHike(hike);
    expect(result.canJoin).toBe(false);
    expect(result.reason).toMatch(/cancelled/);
  });

  test("getDaysUntilHike returns positive number for future", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const days = plannedHikeUtils.getDaysUntilHike(tomorrow);
    expect(days).toBeGreaterThanOrEqual(1);
  });
});
