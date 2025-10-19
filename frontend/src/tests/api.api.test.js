import { API_BASE } from '../api/api';

describe('api/API_BASE', () => {
  const originalEnv = process.env.REACT_APP_API_URL;

  afterEach(() => {
    process.env.REACT_APP_API_URL = originalEnv;
    jest.resetModules();
  });

  test('uses env var when provided', async () => {
    process.env.REACT_APP_API_URL = 'https://example.com/api';
    jest.resetModules();
    const { API_BASE: RELOADED } = require('../api/api');
    expect(RELOADED).toBe('https://example.com/api');
  });

  test('falls back to localhost when env is not set', async () => {
    delete process.env.REACT_APP_API_URL;
    jest.resetModules();
    const { API_BASE: RELOADED } = require('../api/api');
    expect(RELOADED).toBe('http://localhost:3001/api');
  });
});
