// __tests__/HikePlanner.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import HikePlanner from "../pages/HikePlanner";

// --- Mocks ---
jest.mock("../contexts/AuthContext.jsx", () => ({
  useAuth: () => ({
    currentUser: { uid: "test-user", displayName: "Test Hiker" },
  }),
}));

jest.mock("../components/ui/navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

jest.mock("../services/plannedHikesService.js", () => ({
  plannedHikeApiService: {
    getPlannedHikes: jest.fn(),
    createPlannedHike: jest.fn(),
    deletePlannedHike: jest.fn(),
    updatePlannedHike: jest.fn(),
    startPlannedHike: jest.fn(),
  },
}));

jest.mock("../services/gearService.js", () => ({
  useGearChecklist: jest.fn(),
}));

jest.mock("../components/NewHikePlanForm", () => () => (
  <div data-testid="new-hike-form">Mock NewHikePlanForm</div>
));

jest.mock("../components/RouteExplorer", () => () => (
  <div data-testid="route-explorer">Mock RouteExplorer</div>
));

describe("HikePlanner Component", () => {
  const { plannedHikeApiService } = require("../services/plannedHikesService.js");
  const { useGearChecklist } = require("../services/gearService.js");

  const renderHikePlanner = () =>
    render(
      <MemoryRouter>
        <HikePlanner />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();

    useGearChecklist.mockReturnValue({
      gearChecklist: [{ item: "Water Bottle", checked: false }],
      isLoading: false,
      error: null,
      loadGearChecklist: jest.fn(),
      addGearItem: jest.fn(),
      removeGearItem: jest.fn(),
      toggleGearItem: jest.fn(),
      resetGearChecklist: jest.fn(),
      totalItems: 1,
      checkedItems: 0,
      completionPercentage: 0,
    });
  });

  test("shows gear checklist items", async () => {
    plannedHikeApiService.getPlannedHikes.mockResolvedValueOnce([]);
    renderHikePlanner();
    expect(await screen.findByText("Water Bottle")).toBeInTheDocument();
  });

  test("opens new hike plan form when button is clicked", async () => {
    plannedHikeApiService.getPlannedHikes.mockResolvedValueOnce([]);
    renderHikePlanner();

    const button = await screen.findByRole("button", { name: /Plan New Hike/i });
    fireEvent.click(button);

    expect(await screen.findByTestId("new-hike-form")).toBeInTheDocument();
  });
});
