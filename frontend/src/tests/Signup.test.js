
import { render, screen, fireEvent } from "@testing-library/react";
import Signup from "../pages/Signup";
import { BrowserRouter } from "react-router-dom";
import { act } from '@testing-library/react';

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


describe("Signup component", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
  });

  test("renders without crashing", () => {
    expect(document.body).toBeInTheDocument();
  });

  test("renders email and password input fields", () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    //expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/^Confirm Password$/i);
  });

  test("renders signup button", () => {
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  test("calls signup function when form is submitted", async () => {
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i); // exact match
    const confirmInput = screen.getByLabelText(/^confirm password$/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password123" } });

  await act(async () => {
    fireEvent.click(submitButton);
  });

    expect(mockAuthContext.signup).toHaveBeenCalledWith("test@example.com", "password123", "Test User");
  });
});

