// src/tests/discover.test.js
const request = require('supertest');
const express = require('express');
const discoverRouter = require('../routes/discover.js');
const { verifyAuth } = require('../middleware/auth.js');
const { getDatabase } = require('../config/firebase.js');
const { FieldValue } = require('firebase-admin/firestore');

jest.mock('../middleware/auth.js');
jest.mock('../config/firebase.js');

describe('Discover API', () => {
  let app;
  let mockDb;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/discover', discoverRouter);

    // Mock authentication
    verifyAuth.mockImplementation((req, res, next) => {
      req.user = { uid: 'user1' };
      next();
    });

    // Mock Firestore
    mockDb = {
      collection: jest.fn(),
    };
    getDatabase.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/discover', () => {
    test('returns suggested friends sorted by mutual friends', async () => {
      const usersDocs = [
        { id: 'user1', data: () => ({ friends: ['user2'] }) },
        { id: 'user2', data: () => ({ displayName: 'Alice', friends: ['user1'], trails: ['trail1'] }) },
        { id: 'user3', data: () => ({ displayName: 'Bob', friends: [], trails: [] }) },
      ];

      const snapshot = { docs: usersDocs };
      const getMock = jest.fn().mockResolvedValue(snapshot);
      const usersCollection = { get: getMock };
      mockDb.collection.mockReturnValueOnce(usersCollection); // for users

      // Mock friend_requests collection
      const pendingSnapshot = { forEach: jest.fn() };
      mockDb.collection.mockReturnValueOnce({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(pendingSnapshot) }) });

      const res = await request(app).get('/api/discover');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].mutualFriends).toBeGreaterThanOrEqual(res.body[1]?.mutualFriends || 0);
    });

    test('returns fallback suggestions if no mutual friends', async () => {
      const usersDocs = [
        { id: 'user1', data: () => ({ friends: [] }) },
        { id: 'user2', data: () => ({ displayName: 'Alice', friends: [] }) },
        { id: 'user3', data: () => ({ displayName: 'Bob', friends: [] }) },
      ];

      const snapshot = { docs: usersDocs };
      const getMock = jest.fn().mockResolvedValue(snapshot);
      mockDb.collection.mockReturnValueOnce({ get: getMock });
      mockDb.collection.mockReturnValueOnce({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ forEach: jest.fn() }) }) });

      const res = await request(app).get('/api/discover');

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/discover/add', () => {
    test('creates a friend request', async () => {
      const addMock = jest.fn().mockResolvedValue({ id: 'req1' });
      const getMock = jest.fn().mockResolvedValue({ empty: true });
      mockDb.collection.mockReturnValue({
        add: addMock,
        where: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({ get: getMock }),
          }),
        }),
      });

      const res = await request(app).post('/api/discover/add').send({ friendId: 'user2' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.requestId).toBe('req1');
    });

    test('returns 400 for missing friendId', async () => {
      const res = await request(app).post('/api/discover/add').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing friendId');
    });
  });

  describe('GET /api/discover/requests/incoming', () => {
    test('returns incoming requests with user info', async () => {
      const snapshot = { docs: [{ id: 'req1', data: () => ({ from: 'user2', to: 'user1', status: 'pending', createdAt: 'time' }) }] };
      const getMock = jest.fn().mockResolvedValue(snapshot);

      const userDoc = { exists: true, data: () => ({ displayName: 'Alice', avatar: 'A' }) };
      const docMock = jest.fn().mockResolvedValue(userDoc);

      mockDb.collection.mockReturnValueOnce({ where: jest.fn().mockReturnValue({ get: getMock }) })
        .mockReturnValueOnce({ doc: jest.fn().mockReturnValue({ get: docMock }) });

      const res = await request(app).get('/api/discover/requests/incoming');

      expect(res.status).toBe(200);
      expect(res.body[0].fromName).toBe('Alice');
    });
  });

  describe('POST /api/discover/requests/:id/respond', () => {
    test('accepts a friend request', async () => {
      const reqData = { from: 'user2', to: 'user1' };
      const getMock = jest.fn().mockResolvedValue({ exists: true, data: () => reqData });
      const updateMock = jest.fn().mockResolvedValue({});
      mockDb.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ get: getMock, update: updateMock }) });

      const res = await request(app).post('/api/discover/requests/req1/respond').send({ action: 'accept' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
    });

    test('declines a friend request', async () => {
      const reqData = { from: 'user2', to: 'user1' };
      const getMock = jest.fn().mockResolvedValue({ exists: true, data: () => reqData });
      const updateMock = jest.fn().mockResolvedValue({});
      mockDb.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ get: getMock, update: updateMock }) });

      const res = await request(app).post('/api/discover/requests/req1/respond').send({ action: 'decline' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('GET /api/discover/:id', () => {
    test('returns user details', async () => {
      const docMock = jest.fn().mockResolvedValue({ exists: true, data: () => ({ displayName: 'Alice' }) });
      mockDb.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(docMock) });

      const res = await request(app).get('/api/discover/user2');

      expect(res.status).toBe(200);
      expect(res.body.displayName).toBe('Alice');
    });

    test('returns 404 if user not found', async () => {
      const docMock = jest.fn().mockResolvedValue({ exists: false });
      mockDb.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(docMock) });

      const res = await request(app).get('/api/discover/unknown');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });
});
