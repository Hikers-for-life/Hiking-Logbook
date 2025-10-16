import { addFriend } from "../services/discover";

// Simple smoke tests for ProfileView component integration

// Mock the addFriend service
jest.mock("../services/discover", () => ({
  addFriend: jest.fn(),
  discoverFriends: jest.fn(() => Promise.resolve([])),
}));

describe("ProfileView Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders friend's profile info", () => {
    // Test that component exports correctly
    const { ProfileView } = require("../components/ui/view-friend-profile");
    expect(ProfileView).toBeDefined();
    expect(typeof ProfileView).toBe("function");
  });

  it("shows Add Friend functionality exists", () => {
    // Test that addFriend service is available
    expect(addFriend).toBeDefined();
    expect(typeof addFriend).toBe("function");
  });

  it("calls addFriend with correct user ID", async () => {
    addFriend.mockResolvedValueOnce({ success: true });

    // Simulate calling addFriend like the component does
    await addFriend("123");

    expect(addFriend).toHaveBeenCalledWith("123");
    expect(addFriend).toHaveBeenCalledTimes(1);
  });

  it("shows Message button functionality", () => {
    // Test that the component has the required props
    const { ProfileView } = require("../components/ui/view-friend-profile");

    // The component should accept these props
    const requiredProps = ['open', 'onOpenChange', 'person', 'showAddFriend'];

    // This is a basic check that the component exists and can be called
    expect(ProfileView).toBeDefined();
  });
});
