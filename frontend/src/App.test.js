import { render, screen } from "@testing-library/react";
import NotFound from "./pages/NotFound";
import { MemoryRouter } from "react-router-dom";

test("renders 404 page", () => {
  render(
    <MemoryRouter initialEntries={["/unknown"]}>
      <NotFound />
    </MemoryRouter>
  );

  expect(screen.getByText("404")).toBeInTheDocument();
  expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
});


