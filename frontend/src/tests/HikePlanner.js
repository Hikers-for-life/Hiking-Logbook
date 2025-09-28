// __tests__/HikePlanner.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import HikePlanner from "../pages/HikePlanner.jsx";

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

  test('renders hike planner page with navigation', () => {
    renderHikePlanner();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    const hikes = screen.getAllByText(/hike/i);
    expect(hikes.length).toBeGreaterThan(0);

    const planners = screen.getAllByText(/planner/i);
    expect(planners.length).toBeGreaterThan(0);
  });

  test('displays quick action buttons', () => {
    renderHikePlanner();
    expect(screen.getByText(/plan new hike/i)).toBeInTheDocument();
    expect(screen.getByText(/explore routes/i)).toBeInTheDocument();
  });

  test('shows calendar view', () => {
    renderHikePlanner();
      // Check day headers (multiple matching elements)
    const suns = screen.getAllByText(/sun/i);
    const mons = screen.getAllByText(/mon/i);
    const sats = screen.getAllByText(/sat/i);

    expect(suns.length).toBeGreaterThan(0);
    expect(mons.length).toBeGreaterThan(0);
    expect(sats.length).toBeGreaterThan(0);
  });

  test('displays upcoming trips', async () => {
    // Mock planned hikes data that matches test expectations
    const mockPlannedHikes = [
      {
        id: '1',
        title: 'Weekend Warriors: Lake Summit',
        location: 'Lake District',
        date: new Date('2024-12-25'),
        distance: '8.5 mi',
        difficulty: 'Medium',
        status: 'confirmed',
        description: 'A beautiful hike to the lake summit',
        startTime: '08:00'
      },
      {
        id: '2', 
        title: 'Wildflower Photography Hike',
        location: 'Meadow Valley',
        date: new Date('2024-12-26'),
        distance: '5.2 mi',
        difficulty: 'Easy',
        status: 'confirmed',
        description: 'Perfect for nature photography',
        startTime: '09:00'
      }
    ];
    
    plannedHikeApiService.getPlannedHikes.mockResolvedValueOnce(mockPlannedHikes);
    
    renderHikePlanner();
    
    expect(screen.getByText(/upcoming adventures/i)).toBeInTheDocument();
    
    // Wait for the data to load and then check for the specific trip titles
    expect(await screen.findByText(/weekend warriors: lake summit/i)).toBeInTheDocument();
    expect(await screen.findByText(/wildflower photography hike/i)).toBeInTheDocument();
  });

  test('shows gear checklist', () => {
    // Override the default mock to include the expected gear items
    useGearChecklist.mockReturnValue({
      gearChecklist: [
        { item: "Hiking Boots", checked: false },
        { item: "Water Bottle", checked: false }
      ],
      isLoading: false,
      error: null,
      loadGearChecklist: jest.fn(),
      addGearItem: jest.fn(),
      removeGearItem: jest.fn(),
      toggleGearItem: jest.fn(),
      resetGearChecklist: jest.fn(),
      totalItems: 2,
      checkedItems: 0,
      completionPercentage: 0,
    });
    
    renderHikePlanner();
    expect(screen.getByText(/gear checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/hiking boots/i)).toBeInTheDocument();
    expect(screen.getByText(/water/i)).toBeInTheDocument();
  });

 test('displays weather card', () => {
  renderHikePlanner();
  
  // Just check the input exists (static, always renders)
  expect(screen.getByPlaceholderText(/search location/i)).toBeInTheDocument();
  
  // Optionally check other static labels like Humidity / Wind / Feels Like
  expect(screen.getByText(/humidity/i)).toBeInTheDocument();
  expect(screen.getByText(/wind speed/i)).toBeInTheDocument();
  expect(screen.getByText(/feels like/i)).toBeInTheDocument();
});


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
