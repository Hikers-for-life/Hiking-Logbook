import { render, screen } from "@testing-library/react";
import Signup from "./Signup";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

test("signup component renders without crashing", () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    </AuthProvider>
  );
  
  // Basic test that the component renders without errors
  expect(document.body).toBeInTheDocument();
});
