import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('../contexts/AuthContext.jsx', () => {
  const React = require('react');
  return {
    useAuth: () => ({ currentUser: { uid: 'u1', displayName: 'Test' } }),
    AuthContext: React.createContext({ currentUser: { uid: 'u1' } }),
  };
});

describe.skip('ProfileView smoke', () => {
  test('renders closed without crashing', () => {
    const { ProfileView } = require('../components/ui/profile-view.jsx');
    render(<ProfileView open={false} onOpenChange={() => {}} />);
  });
});
