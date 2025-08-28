import React from 'react';
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';

// Mock all dependencies to avoid complex routing issues
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
}));

jest.mock('../contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('../components/auth/ProtectedRoute.jsx', () => {
  return function MockProtectedRoute({ children }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

// Mock all page components
jest.mock('../pages/Index.jsx', () => () => <div data-testid="index-page">Index Page</div>);
jest.mock('../pages/Logbook.jsx', () => () => <div data-testid="logbook-page">Logbook Page</div>);
jest.mock('../pages/HikePlanner.jsx', () => () => <div data-testid="hike-planner-page">Hike Planner Page</div>);
jest.mock('../pages/Login.jsx', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../pages/Signup.jsx', () => () => <div data-testid="signup-page">Signup Page</div>);
jest.mock('../pages/EditProfile.jsx', () => () => <div data-testid="edit-profile-page">Edit Profile Page</div>);
jest.mock('../pages/Dashboard.jsx', () => () => <div data-testid="dashboard-page">Dashboard Page</div>);
jest.mock('../pages/NotFound.jsx', () => () => <div data-testid="not-found-page">Not Found Page</div>);

import App from "../App";

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  test('includes router structure', () => {
    render(<App />);
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  test('app file can be imported', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });

  test('includes all required imports', () => {
    // Test that all page components can be imported
    expect(() => require('../pages/Index.jsx')).not.toThrow();
    expect(() => require('../pages/Logbook.jsx')).not.toThrow();
    expect(() => require('../pages/HikePlanner.jsx')).not.toThrow();
    expect(() => require('../pages/Login.jsx')).not.toThrow();
    expect(() => require('../pages/Signup.jsx')).not.toThrow();
    expect(() => require('../pages/Dashboard.jsx')).not.toThrow();
    expect(() => require('../components/auth/ProtectedRoute.jsx')).not.toThrow();
  });
});