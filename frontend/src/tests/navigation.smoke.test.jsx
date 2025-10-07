import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../contexts/AuthContext.jsx', () => {
  const React = require('react');
  return {
    useAuth: () => ({ currentUser: null, logout: jest.fn() }),
    AuthContext: React.createContext({ currentUser: null })
  };
});

describe('Navigation component (public user)', () => {
  test('renders and toggles mobile menu', () => {
    const { Navigation } = require('../components/ui/navigation.jsx');
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );
    expect(screen.getByText(/Hiking Logbook/i)).toBeInTheDocument();
    // Toggle mobile button
    const buttons = screen.getAllByRole('button');
    const toggle = buttons[buttons.length - 1];
    fireEvent.click(toggle);
  });
});



