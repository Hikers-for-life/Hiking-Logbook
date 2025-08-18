import { render, screen, fireEvent } from "@testing-library/react";
import Signup from "./Signup";

test("signup form updates state and submits", () => {
  render(<Signup />);

  // Find inputs by placeholder text
  const nameInput = screen.getByPlaceholderText(/full name/i);
  const emailInput = screen.getByPlaceholderText(/email address/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);

  // Simulate user typing
  fireEvent.change(nameInput, { target: { value: "Ntokozo" } });
  fireEvent.change(emailInput, { target: { value: "ntokozo@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "mypassword" } });

  // Check that inputs updated
  expect(nameInput.value).toBe("Ntokozo");
  expect(emailInput.value).toBe("ntokozo@example.com");
  expect(passwordInput.value).toBe("mypassword");

  // Find submit button
  const submitButton = screen.getByRole("button", { name: /create account/i });
  fireEvent.click(submitButton);

  // Optionally check console.log (mock it if needed)
});
