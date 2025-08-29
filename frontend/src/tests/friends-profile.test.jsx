import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { ProfileView } from "../components/ui/view-friend-profile";

// Mock components used in ProfileView
jest.mock("../components/ui/card", () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
}));
jest.mock("../components/ui/badge", () => ({ Badge: ({ children }) => <span>{children}</span> }));
jest.mock("../components/ui/button", () => ({ Button: ({ children, ...props }) => <button {...props}>{children}</button> }));
jest.mock("../components/ui/avatar", () => ({
  Avatar: ({ children }) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }) => <div>{children}</div>,
}));
jest.mock("../components/ui/dialog", () => ({
  Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
}));
jest.mock("lucide-react", () => ({
  MapPin: () => <div data-testid="map-pin" />,
  Mountain: () => <div />,
  Calendar: () => <div />,
  Clock: () => <div />,
  Medal: () => <div />,
  UserPlus: () => <div />,
  MessageCircle: () => <div />,
  TrendingUp: () => <div />,
  Target: () => <div />,
  Award: () => <div />
}));

describe("ProfileView component", () => {
  const person = {
    name: "Test User",
    avatar: "TU",
    status: "online",
    location: "Seattle, WA",
    totalHikes: 42,
    totalDistance: "200 km",
    totalElevation: "5,000m",
    achievements: [{ name: "Peak Collector", description: "Completed peaks", earned: "1 week ago" }],
    recentHikes: [{ name: "Mount Rainier", date: "2 days ago", distance: "8 km", duration: "3h", difficulty: "Hard" }],
    goals: [{ name: "Hike 500 km", progress: 50, target: "Dec 2025" }],
    joinedDate: "Jan 2023"
  };

  test("renders nothing if no person is provided", () => {
    const { container } = render(<ProfileView open={true} onOpenChange={() => {}} person={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders profile information correctly", () => {
    render(<ProfileView open={true} onOpenChange={() => {}} person={person} />);
    
    // Dialog open
    expect(screen.getByTestId("dialog")).toBeInTheDocument();

    // Avatar and name
    expect(screen.getByTestId("avatar")).toHaveTextContent(person.avatar);
    expect(screen.getByText(person.name)).toBeInTheDocument();

    // Location and joined date
    expect(screen.getByText(person.location)).toBeInTheDocument();
    expect(screen.getByText(/Hiking since/i)).toBeInTheDocument();

    // Stats
    expect(screen.getByText(person.totalHikes.toString())).toBeInTheDocument();
    expect(screen.getByText(person.totalDistance)).toBeInTheDocument();
    expect(screen.getByText(person.totalElevation)).toBeInTheDocument();

    // Achievements
    expect(screen.getByText(person.achievements[0].name)).toBeInTheDocument();
    expect(screen.getByText(person.achievements[0].description)).toBeInTheDocument();

    // Recent hikes
    expect(screen.getByText(person.recentHikes[0].name)).toBeInTheDocument();

    // Goals
    expect(screen.getByText(person.goals[0].name)).toBeInTheDocument();
    expect(screen.getByText(`${person.goals[0].progress}%`)).toBeInTheDocument();
  });

  test("renders Add Friend button if showAddFriend is true", () => {
    render(<ProfileView open={true} onOpenChange={() => {}} person={person} showAddFriend={true} />);
    expect(screen.getByRole("button", { name: /Add Friend/i })).toBeInTheDocument();
  });

  test("renders Message button if showAddFriend is false", () => {
    render(<ProfileView open={true} onOpenChange={() => {}} person={person} showAddFriend={false} />);
    expect(screen.getByRole("button", { name: /Message/i })).toBeInTheDocument();
  });
});
