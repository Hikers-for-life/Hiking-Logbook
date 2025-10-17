import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock AuthContext
const mockAuthContext = {
  currentUser: null,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  error: null,
  setError: jest.fn(),
  loading: false,
};

jest.mock('../contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => mockAuthContext,
}));

// Mock ProtectedRoute
jest.mock('../components/auth/ProtectedRoute.jsx', () => {
  return function MockProtectedRoute({ children }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

// Mock page components
jest.mock('../pages/Index.jsx', () => () => (
  <div data-testid="index-page">Index Page</div>
));
jest.mock('../pages/Logbook.jsx', () => () => (
  <div data-testid="logbook-page">Logbook Page</div>
));
jest.mock('../pages/HikePlanner.jsx', () => () => (
  <div data-testid="hike-planner-page">Hike Planner Page</div>
));
jest.mock('../components/auth/loginPage.jsx', () => () => (
  <div data-testid="login-page">Login Page</div>
));
jest.mock('../pages/Signup.jsx', () => () => (
  <div data-testid="signup-page">Signup Page</div>
));
jest.mock('../pages/EditProfile.jsx', () => () => (
  <div data-testid="edit-profile-page">Edit Profile Page</div>
));
jest.mock('../pages/Dashboard.jsx', () => () => (
  <div data-testid="dashboard-page">Dashboard Page</div>
));
jest.mock('../pages/NotFound.jsx', () => () => (
  <div data-testid="not-found-page">Not Found Page</div>
));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  test('includes index page in router', () => {
    render(<App />);
    expect(screen.getByTestId('index-page')).toBeInTheDocument();
  });

  test('App file can be imported', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
  test('includes all required imports', () => {
    // This only checks that the modules can be imported without throwing
    expect(() => require('../pages/Index.jsx')).not.toThrow();
    expect(() => require('../pages/Logbook.jsx')).not.toThrow();
    expect(() => require('../pages/HikePlanner.jsx')).not.toThrow();
    expect(() => require('../components/auth/loginPage.jsx')).not.toThrow();
    expect(() => require('../pages/Signup.jsx')).not.toThrow();
    expect(() => require('../pages/Dashboard.jsx')).not.toThrow();
    expect(() =>
      require('../components/auth/ProtectedRoute.jsx')
    ).not.toThrow();
  });
});
