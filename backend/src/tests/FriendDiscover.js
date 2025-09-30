// backend/src/tests/discover.test.js
import request from "supertest";
import express from "express";
import discoverRouter from "../routes/discover.js";
import { FieldValue } from "firebase-admin/firestore";

// Mock Firebase
jest.mock("../config/firebase.js", () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();

  return {
    getDatabase: () => ({
      collection: mockCollection,
    }),
    __mocks: { mockCollection, mockDoc, mockGet, mockUpdate },
    FieldValue: { arrayUnion: (...args) => args },
  };
});

import { getDatabase, __mocks } from "../config/firebase.js";

// Mock auth middleware
jest.mock("../middleware/auth.js", () => ({
  verifyAuth: (req, res, next) => {
    req.user = { uid: "user123", name: "Test User", email: "user@test.com" };
    next();
  },
}));

// Setup express app
const app = express();
app.use(express.json());
app.use("/api/discover", discoverRouter);

describe("Discover Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/discover - should return suggested friends", async () => {
    const mockDocs = [
      { id: "user123", data: () => ({ friends: ["user456"], name: "Me" }) },
      { id: "user456", data: () => ({ friends: ["user123"], displayName: "Alice", trails: ["Trail A"] }) },
      { id: "user789", data: () => ({ friends: [], name: "Bob", trails: ["Trail B"] }) },
    ];

    __mocks.mockCollection.mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: mockDocs }),
    });

    const res = await request(app).get("/api/discover");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "user789", name: "Bob", mutualFriends: 0, commonTrails: ["Trail B"] }),
      ])
    );
  });

  test("POST /api/discover/add - should add friend", async () => {
    const mockUpdate = jest.fn().mockResolvedValue(true);

    const mockDoc = jest.fn().mockReturnValue({
      update: mockUpdate,
    });

    __mocks.mockCollection.mockReturnValue({ doc: mockDoc });

    const res = await request(app)
      .post("/api/discover/add")
      .send({ friendId: "friend123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Ensure both user and friend got arrayUnion called
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledWith({ friends: ["friend123"] });
    expect(mockUpdate).toHaveBeenCalledWith({ friends: ["user123"] });
  });

  test("POST /api/discover/add - missing friendId should return 400", async () => {
    const res = await request(app).post("/api/discover/add").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing friendId");
  });
});
