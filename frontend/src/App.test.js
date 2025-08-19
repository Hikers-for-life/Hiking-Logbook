import { render, screen } from "@testing-library/react";
import Index from "./pages/Index";
import { MemoryRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {}); // silence console.error
});

afterAll(() => {
  console.error.mockRestore();
});


test("renders Index page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Index />
    </MemoryRouter>
  );

  expect(screen.getByText(/Hiking Log/i)).toBeInTheDocument();
});

test("renders 404 page", () => {
  render(
    <MemoryRouter initialEntries={["/unknown"]}>
      <NotFound />
    </MemoryRouter>
  );

  expect(screen.getByText("404")).toBeInTheDocument();
  expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
});
