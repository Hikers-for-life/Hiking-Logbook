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

describe('ProfileDropdown smoke', () => {
  test('renders without crashing', () => {
    const {
      ProfileDropdown,
    } = require('../components/ui/profile-dropdown.jsx');
    render(
      <ProfileDropdown
        onLogout={() => {}}
        onViewProfile={() => {}}
        onEditProfile={() => {}}
      />
    );
  });
});
