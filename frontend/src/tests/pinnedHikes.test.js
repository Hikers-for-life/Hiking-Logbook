import { render, screen, fireEvent } from '@testing-library/react';
import PinnedHikes from '../components/PinnedHikes';

const mockPinnedHikes = [
  {
    id: 1,
    title: "Mount Washington Summit",
    location: "White Mountains, NH",
    date: "2024-08-05",
    distance: "12.4 mi",
    elevation: "4,322 ft",
    duration: "6h 30m",
    difficulty: "Hard",
    notes: "Incredible views from the summit! Weather was perfect, saw amazing sunrise.",
    pinnedAt: "2024-08-06"
  },
  {
    id: 2,
    title: "Bear Mountain Trail",
    location: "Harriman State Park, NY",
    date: "2024-07-22",
    distance: "5.8 mi",
    elevation: "1,284 ft",
    duration: "3h 45m",
    difficulty: "Moderate",
    notes: "Great family-friendly hike. Spotted some wildlife on the way down.",
    pinnedAt: "2024-07-23"
  }
];

describe('PinnedHikes', () => {
  const mockOnUnpinHike = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Header', () => {
    it('renders header with count when hikes are present', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('Pinned Hikes (2)')).toBeInTheDocument();
    });

    it('displays correct count for single hike', () => {
      render(<PinnedHikes pinnedHikes={[mockPinnedHikes[0]]} />);
      expect(screen.getByText('Pinned Hikes (1)')).toBeInTheDocument();
    });
  });

  describe('Hike Cards', () => {
    it('renders all pinned hikes', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('Mount Washington Summit')).toBeInTheDocument();
      expect(screen.getByText('Bear Mountain Trail')).toBeInTheDocument();
    });

    it('displays hike locations', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('White Mountains, NH')).toBeInTheDocument();
      expect(screen.getByText('Harriman State Park, NY')).toBeInTheDocument();
    });

    it('displays difficulty badges', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('displays pinned dates', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('Pinned 2024-08-06')).toBeInTheDocument();
      expect(screen.getByText('Pinned 2024-07-23')).toBeInTheDocument();
    });
  });

  describe('Hike Details', () => {
    it('displays distance information', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('12.4 mi')).toBeInTheDocument();
      expect(screen.getByText('5.8 mi')).toBeInTheDocument();
    });

    it('displays elevation information', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('4,322 ft')).toBeInTheDocument();
      expect(screen.getByText('1,284 ft')).toBeInTheDocument();
    });

    it('displays duration information', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('6h 30m')).toBeInTheDocument();
      expect(screen.getByText('3h 45m')).toBeInTheDocument();
    });

    it('displays date information', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(screen.getByText('2024-08-05')).toBeInTheDocument();
      expect(screen.getByText('2024-07-22')).toBeInTheDocument();
    });

    it('displays all stat labels', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const distanceLabels = screen.getAllByText('Distance');
      const elevationLabels = screen.getAllByText('Elevation');
      const durationLabels = screen.getAllByText('Duration');
      const dateLabels = screen.getAllByText('Date');

      expect(distanceLabels).toHaveLength(2);
      expect(elevationLabels).toHaveLength(2);
      expect(durationLabels).toHaveLength(2);
      expect(dateLabels).toHaveLength(2);
    });
  });

  describe('Notes', () => {
    it('displays hike notes when present', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      expect(
        screen.getByText(/"Incredible views from the summit! Weather was perfect, saw amazing sunrise."/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/"Great family-friendly hike. Spotted some wildlife on the way down."/i)
      ).toBeInTheDocument();
    });

    it('does not render notes section when notes are absent', () => {
      const hikeWithoutNotes = [{ ...mockPinnedHikes[0], notes: null }];
      const { container } = render(<PinnedHikes pinnedHikes={hikeWithoutNotes} />);
      const notesSection = container.querySelector('.bg-muted\\/30');
      expect(notesSection).not.toBeInTheDocument();
    });
  });

  describe('View Details Functionality', () => {
    it('renders view details buttons', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons).toHaveLength(2);
    });

    it('calls onViewDetails with correct hike data when clicked', () => {
      render(
        <PinnedHikes
          pinnedHikes={mockPinnedHikes}
          onViewDetails={mockOnViewDetails}
        />
      );
      const viewDetailsButtons = screen.getAllByText('View Details');
      fireEvent.click(viewDetailsButtons[0]);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockPinnedHikes[0]);
    });

    it('does not throw error when onViewDetails is not provided', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(() => fireEvent.click(viewDetailsButtons[0])).not.toThrow();
    });
  });

  describe('Difficulty Badge Colors', () => {
    it('applies correct color for Easy difficulty', () => {
      const easyHike = [{ ...mockPinnedHikes[0], difficulty: 'Easy' }];
      const { container } = render(<PinnedHikes pinnedHikes={easyHike} />);
      const badge = container.querySelector('.bg-meadow\\/20');
      expect(badge).toBeInTheDocument();
    });

    it('applies correct color for Moderate difficulty', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const moderateBadge = screen.getByText('Moderate');
      expect(moderateBadge.className).toContain('bg-trail/20');
    });

    it('applies correct color for Hard difficulty', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const hardBadge = screen.getByText('Hard');
      expect(hardBadge.className).toContain('bg-summit/20');
    });
  });

  describe('Styling and Layout', () => {
    it('applies hover effects to hike cards', () => {
      const { container } = render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const hikeCards = container.querySelectorAll('.hover\\:bg-muted\\/50');
      expect(hikeCards).toHaveLength(2);
    });

    it('uses grid layout for stats', () => {
      const { container } = render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const gridElements = container.querySelectorAll('.grid-cols-2.md\\:grid-cols-4');
      expect(gridElements).toHaveLength(2);
    });

    it('applies card styling', () => {
      const { container } = render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const card = container.querySelector('.shadow-elevation');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading for card title', () => {
      render(<PinnedHikes pinnedHikes={mockPinnedHikes} />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('all buttons are keyboard accessible', () => {
      render(
        <PinnedHikes
          pinnedHikes={mockPinnedHikes}
          onUnpinHike={mockOnUnpinHike}
          onViewDetails={mockOnViewDetails}
        />
      );
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles hike without notes gracefully', () => {
      const hikeWithoutNotes = [{ ...mockPinnedHikes[0], notes: '' }];
      render(<PinnedHikes pinnedHikes={hikeWithoutNotes} />);
      expect(screen.getByText('Mount Washington Summit')).toBeInTheDocument();
    });

    it('renders correctly with single hike', () => {
      render(<PinnedHikes pinnedHikes={[mockPinnedHikes[0]]} />);
      expect(screen.getByText('Mount Washington Summit')).toBeInTheDocument();
      expect(screen.queryByText('Bear Mountain Trail')).not.toBeInTheDocument();
    });

    it('uses sample data when no props provided', () => {
      render(<PinnedHikes />);
      expect(screen.getByText('Mount Washington Summit')).toBeInTheDocument();
    });
  });
});