import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../components/auth/loginPage.jsx";
import { MemoryRouter } from "react-router-dom";

// Mock AuthContext
const mockLogin = jest.fn(() => Promise.resolve());
const mockGoogle = jest.fn(() => Promise.resolve());

jest.mock("../contexts/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: mockLogin,
    signInWithGoogle: mockGoogle,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage Component (full coverage)", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnLogin = jest.fn();
  const mockOnSignup = jest.fn();

  const renderWithRouter = (ui) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login modal when open is true", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@gmail.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your Password/i)
    ).toBeInTheDocument();
  });

  test("does not render modal when open is false", () => {
    const { container } = renderWithRouter(
      <LoginPage
        open={false}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("updates input values correctly", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/your@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("calls login and navigates on submit", async () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/your@gmail.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText(/Sign In to Dashboard/i));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error on login failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("bad creds"));

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/your@gmail.com/i), {
      target: { value: "fail@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your Password/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText(/Sign In to Dashboard/i));

    expect(await screen.findByText(/Failed to log in/i)).toBeInTheDocument();
  });

  test("social Google button works", async () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const googleBtn = screen.getByText(/Google/i);
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockGoogle).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error on Google sign-in failure", async () => {
    mockGoogle.mockRejectedValueOnce(new Error("google error"));

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    fireEvent.click(screen.getByText(/Google/i));

    expect(
      await screen.findByText(/Failed to sign in with Google/i)
    ).toBeInTheDocument();
  });

  test("back button closes modal and navigates home", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const backBtn = screen.getByRole("button", { name: /back to home/i });
    fireEvent.click(backBtn);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("signup button triggers onSignup", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
        onSignup={mockOnSignup}
      />
    );

    const signupBtn = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signupBtn);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnSignup).toHaveBeenCalled();
  });

  test("hover states do not throw", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const backBtn = screen.getByRole("button", { name: /back to home/i });
    fireEvent.mouseEnter(backBtn);
    fireEvent.mouseLeave(backBtn);
    // Just ensure no crash
    expect(backBtn).toBeInTheDocument();
  });
});
