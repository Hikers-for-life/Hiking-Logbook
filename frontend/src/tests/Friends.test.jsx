import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import Friends from "../pages/Friends.jsx";

// Mock all components used in Friends page
jest.mock("../components/ui/navigation", () => ({ Navigation: () => <div data-testid="navigation">Navigation</div> }));
jest.mock("../components/ui/card", () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
}));
jest.mock("../components/ui/input", () => ({ Input: (props) => <input {...props} data-testid="search-input" /> }));
jest.mock("../components/ui/badge", () => ({ Badge: ({ children }) => <span>{children}</span> }));
jest.mock("../components/ui/avatar", () => ({
  Avatar: ({ children }) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }) => <div>{children}</div>,
}));
jest.mock("../components/ui/tabs", () => ({
  Tabs: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children }) => <button>{children}</button>,
  TabsContent: ({ children }) => <div>{children}</div>,
}));
jest.mock("../components/ui/view-friend-profile", () => ({
  ProfileView: ({ open }) => open ? <div data-testid="profile-view">Profile View</div> : null,
}));
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  MapPin: () => <div />,
  Mountain: () => <div />,
  Medal: () => <div />,
  Clock: () => <div />,
  TrendingUp: () => <div />,
  Users: () => <div />,
  Share2: () => <div />,
  Heart: () => <div />,
  MessageSquare: () => <div />,
  UserPlus: () => <div />
}));

describe("Friends Page", () => {
  test("renders navigation and main sections", () => {
    render(<Friends />);

    // Navigation present
    expect(screen.getByTestId("navigation")).toBeInTheDocument();

    // Search input present
    expect(screen.getByTestId("search-input")).toBeInTheDocument();

    // Tabs exist
    expect(screen.getByRole("button", { name: /My Friends/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Activity Feed/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Discover/i })).toBeInTheDocument();
  });

  test("renders friend cards", () => {
    render(<Friends />);
    const cards = screen.getAllByTestId("card");
    expect(cards.length).toBeGreaterThan(0);
  });

  test("opens profile view when 'View Profile' is clicked", () => {
    render(<Friends />);
    const viewButtons = screen.getAllByRole("button", { name: /View Profile/i });
    expect(viewButtons.length).toBeGreaterThan(0);

    fireEvent.click(viewButtons[0]);
    expect(screen.getByTestId("profile-view")).toBeInTheDocument();
  });
});
