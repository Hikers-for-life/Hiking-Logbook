// backend/src/tests/feed.test.js
import request from 'supertest';
import express from 'express';
import feedRouter from '../routes/feed.js';

// Mock Firebase
jest.mock('../config/firebase.js', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockAdd = jest.fn();
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  return {
    getDatabase: () => ({
      collection: mockCollection,
    }),
    __mocks: {
      mockCollection,
      mockDoc,
      mockAdd,
      mockGet,
      mockUpdate,
      mockDelete,
    },
  };
});

import { getDatabase, __mocks } from '../config/firebase.js';

// Mock auth middleware
jest.mock('../middleware/auth.js', () => ({
  verifyAuth: (req, res, next) => {
    req.user = { uid: 'user123', email: 'user@test.com', name: 'Test User' };
    next();
  },
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/feed', feedRouter);

describe('Feed Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /feed should return activities', async () => {
    const mockDocs = [
      {
        id: '1',
        data: () => ({ action: 'completed', hike: 'Trail A', likes: [] }),
        ref: {
          collection: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({ docs: [] }),
          }),
        },
      },
    ];

    __mocks.mockCollection.mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: mockDocs }),
    });

    const res = await request(app).get('/feed');

    expect(res.status).toBe(200);
    expect(res.body.activities).toHaveLength(1);
    expect(res.body.activities[0].id).toBe('1');
    expect(res.body.activities[0].comments).toEqual([]);
  });

  test('POST /feed should create a new activity', async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: 'new123' });
    __mocks.mockCollection.mockReturnValue({ add: mockAdd });

    const newActivity = {
      action: 'completed',
      hike: 'Trail B',
      description: 'Nice hike!',
    };

    const res = await request(app).post('/feed').send(newActivity);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('new123');
    expect(res.body.action).toBe(newActivity.action);
    expect(mockAdd).toHaveBeenCalled();
  });

  test('POST /feed/:id/like should toggle like', async () => {
    const mockUpdate = jest.fn();
    const mockDocGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ likes: [] }),
    });

    __mocks.mockCollection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: mockDocGet,
        update: mockUpdate,
      }),
    });

    const res = await request(app).post('/feed/1/like');

    expect(res.status).toBe(200);
    expect(res.body.likedByUser).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  test('POST /feed/:id/comment should add a comment', async () => {
    const mockCommentAdd = jest.fn().mockResolvedValue({ id: 'cmt123' });
    const mockUserDocGet = jest
      .fn()
      .mockResolvedValue({ exists: true, data: () => ({ name: 'Test User' }) });

    __mocks.mockCollection.mockReturnValue({
      doc: jest.fn().mockImplementation((id) => {
        if (id === 'user123') return { get: mockUserDocGet };
        return {
          collection: jest.fn().mockReturnValue({ add: mockCommentAdd }),
        };
      }),
    });

    const res = await request(app)
      .post('/feed/1/comment')
      .send({ content: 'Nice post!' });

    expect(res.status).toBe(200);
    expect(res.body.comment.id).toBe('cmt123');
    expect(res.body.comment.content).toBe('Nice post!');
    expect(mockCommentAdd).toHaveBeenCalled();
  });

  test('DELETE /feed/:feedId/comments/:commentId should delete comment if owner', async () => {
    const mockDelete = jest.fn();
    const mockCommentDocGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'user123' }),
      ref: { delete: mockDelete },
    });

    __mocks.mockCollection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: mockCommentDocGet,
            delete: mockDelete,
          }),
        }),
      }),
    });

    const res = await request(app).delete('/feed/1/comments/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted');
  });

  test('DELETE /feed/:id should delete feed if owner', async () => {
    const mockDelete = jest.fn();
    const mockDocGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'user123' }),
      ref: { delete: mockDelete },
    });

    __mocks.mockCollection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: mockDocGet,
        delete: mockDelete,
      }),
    });

    const res = await request(app).delete('/feed/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted');
  });
});
