import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

// Mock FontAwesome CSS
jest.mock("@fortawesome/fontawesome-free/css/all.min.css", () => ({}));

// Mock the mountain image
jest.mock("../components/assets/forest-waterfall.jpg", () => "mock-image.jpg");

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
    expect(screen.getByText(/Continue your hiking journey/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Home/i)).toBeInTheDocument();
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

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

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

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

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

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: "fail@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });

    fireEvent.click(submitButton);

    expect(await screen.findByText(/Failed to log in. Please check your credentials/i)).toBeInTheDocument();
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

  // NEW TESTS FOR ADDITIONAL FUNCTIONALITY

  test("form fields are cleared when modal opens", () => {
    const { rerender } = renderWithRouter(
      <LoginPage
        open={false}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Open modal
    rerender(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  test("form fields are cleared on component mount", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  test("loading state is shown during login", async () => {
    // Make login promise pending
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText(/Signing In.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    act(() => {
      resolveLogin();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Signing In.../i)).not.toBeInTheDocument();
    });
  });

  test("loading state is shown during Google sign-in", async () => {
    // Make Google sign-in promise pending
    let resolveGoogle;
    const googlePromise = new Promise((resolve) => {
      resolveGoogle = resolve;
    });
    mockGoogle.mockReturnValueOnce(googlePromise);

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const googleButton = screen.getByText(/Google/i);
    fireEvent.click(googleButton);

    // Check loading state
    expect(googleButton).toBeDisabled();

    // Resolve the promise
    act(() => {
      resolveGoogle();
    });

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });
  });

  test("error message is cleared when form is submitted", async () => {
    // First, create an error
    mockLogin.mockRejectedValueOnce(new Error("bad creds"));

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: "fail@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to log in. Please check your credentials/i)).toBeInTheDocument();
    });

    // Reset mock and try again
    mockLogin.mockResolvedValueOnce();

    fireEvent.change(emailInput, { target: { value: "success@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "correct" } });
    fireEvent.click(submitButton);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Failed to log in. Please check your credentials/i)).not.toBeInTheDocument();
    });
  });

  test("form submission triggers login process", async () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Click the submit button to trigger form submission
    fireEvent.click(submitButton);

    // Verify that the login process is triggered (which includes preventDefault)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  test("back button has proper hover styling", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const backBtn = screen.getByRole("button", { name: /back to home/i });

    // Test mouse enter
    fireEvent.mouseEnter(backBtn);
    expect(backBtn).toBeInTheDocument();

    // Test mouse leave
    fireEvent.mouseLeave(backBtn);
    expect(backBtn).toBeInTheDocument();
  });

  test("handles missing onOpenChange prop gracefully", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
      // onOpenChange is undefined
      />
    );

    const backBtn = screen.getByRole("button", { name: /back to home/i });

    // Should not throw when clicked
    expect(() => fireEvent.click(backBtn)).not.toThrow();
  });

  test("handles missing onSignup prop gracefully", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      // onSignup is undefined
      />
    );

    const signupBtn = screen.getByRole("button", { name: /sign up/i });

    // Should not throw when clicked
    expect(() => fireEvent.click(signupBtn)).not.toThrow();
  });

  test("input fields have correct attributes", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("autoComplete", "off");

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("autoComplete", "new-password");
  });

  test("banner displays correct background image", () => {
    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Find the banner div that contains the background image
    const banner = screen.getByText(/Welcome Back/i).closest("div");
    const bannerWithBackground = banner?.parentElement;
    expect(bannerWithBackground).toHaveStyle("background-image: url(mock-image.jpg)");
  });

  test("console.error is called on login failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    mockLogin.mockRejectedValueOnce(new Error("bad creds"));

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByText(/Sign In to Dashboard/i);

    fireEvent.change(emailInput, { target: { value: "fail@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Login error:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test("console.error is called on Google sign-in failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    mockGoogle.mockRejectedValueOnce(new Error("google error"));

    renderWithRouter(
      <LoginPage
        open={true}
        onLogin={mockOnLogin}
        onOpenChange={mockOnOpenChange}
      />
    );

    const googleButton = screen.getByText(/Google/i);
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Google sign-in error:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});