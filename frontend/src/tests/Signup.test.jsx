import { render, screen } from "@testing-library/react";
import Signup from "../pages/Signup";
import { BrowserRouter } from "react-router-dom";

// Mock Firebase to avoid CI authentication errors
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    signup: jest.fn(),
    signInWithGoogle: jest.fn(),
    error: null,
    loading: false
  })
}));

test("signup component renders without crashing", () => {
  render(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>
  );
  
  // Basic test that the component renders without errors
  expect(document.body).toBeInTheDocument();
});
