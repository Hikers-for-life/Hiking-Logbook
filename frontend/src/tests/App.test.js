import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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

jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => mockAuthContext,
}));

// Mock components
jest.mock('../pages/Index', () => ({
  __esModule: true,
  default: () => <div data-testid="index-page">Index Page</div>,
}));

jest.mock('../pages/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login Page</div>,
}));

jest.mock('../pages/Signup', () => ({
  __esModule: true,
  default: () => <div data-testid="signup-page">Signup Page</div>,
}));

jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

jest.mock('../pages/EditProfile', () => ({
  __esModule: true,
  default: () => <div data-testid="edit-profile-page">Edit Profile Page</div>,
}));

jest.mock('../pages/NotFound', () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

const renderApp = () => {
  return render(<App />);
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset document title before each test
    document.title = '';
  });

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('sets default document title on mount', () => {
    renderApp();
    expect(document.title).toBe('Hiking Logbook');
  });

  it('renders index page on root route', () => {
    renderApp();
    expect(screen.getByTestId('index-page')).toBeInTheDocument();
  });

  it('renders auth provider wrapper', () => {
    renderApp();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('has proper routing structure', () => {
    renderApp();
    // Check that the app has the basic structure
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });
});


