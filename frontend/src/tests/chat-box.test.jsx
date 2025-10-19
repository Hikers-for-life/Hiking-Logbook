import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

// Simple smoke test for ChatBox component
describe('ChatBox Component - Smoke Tests', () => {
  // Mock all dependencies to prevent errors
  beforeAll(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();

    // Suppress console errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('ChatBox component can be imported', () => {
    const { ChatBox } = require('../components/ui/chat-box');
    expect(ChatBox).toBeDefined();
  });

  test('ChatBox exports default', () => {
    const ChatBoxDefault = require('../components/ui/chat-box').default;
    expect(ChatBoxDefault).toBeDefined();
  });
});
