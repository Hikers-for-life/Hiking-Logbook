import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './loginPage.jsx';

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login modal when open is true', () => {
    render(<Login open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your Password/i)).toBeInTheDocument();
  });

  test('does not render modal when open is false', () => {
    const { container } = render(<Login open={false} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />);
    expect(container.firstChild).toBeNull();
  });

  test('updates input values correctly', () => {
    render(<Login open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />);
    
    const emailInput = screen.getByPlaceholderText(/your@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your Password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls onLogin and onOpenChange on form submit', () => {
    render(<Login open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />);
    
    const emailInput = screen.getByPlaceholderText(/your@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your Password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(mockOnLogin).toHaveBeenCalledWith('test@example.com');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('social buttons are present', () => {
    render(<Login open={true} onLogin={mockOnLogin} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
  });
});
