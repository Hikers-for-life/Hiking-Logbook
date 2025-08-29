import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../components/auth/loginPage.jsx';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext
const mockLogin = jest.fn(() => Promise.resolve());
const mockGoogle = jest.fn(() => Promise.resolve());

jest.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    login: mockLogin,
    signInWithGoogle: mockGoogle,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnLogin = jest.fn();

  const renderWithRouter = (ui) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login modal when open is true', () => {
    renderWithRouter(
      <LoginPage open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your Password/i)).toBeInTheDocument();
  });

  test('does not render modal when open is false', () => {
    const { container } = renderWithRouter(
      <LoginPage open={false} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('updates input values correctly', () => {
    renderWithRouter(
      <LoginPage open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />
    );

    const emailInput = screen.getByPlaceholderText(/your@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls login and onOpenChange on form submit', async () => {
    renderWithRouter(
      <LoginPage open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />
    );

    const emailInput = screen.getByPlaceholderText(/your@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your Password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for async login
    await screen.findByText(/Sign In to Dashboard/i);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('social Google button works', async () => {
    renderWithRouter(
      <LoginPage open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />
    );

    const googleBtn = screen.getByText(/Google/i);
    fireEvent.click(googleBtn);

    // Wait for async Google sign-in
    await screen.findByText(/Google/i);

    expect(mockGoogle).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
