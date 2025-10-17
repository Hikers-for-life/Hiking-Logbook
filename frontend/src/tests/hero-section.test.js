import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../components/hero-section';

describe('HeroSection', () => {
  const mockOnGetStarted = jest.fn();
  const mockOnViewSampleLog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <HeroSection
        onGetStarted={mockOnGetStarted}
        onViewSampleLog={mockOnViewSampleLog}
      />
    );
  };

  describe('Hero Content', () => {
    it('renders the main heading', () => {
      renderComponent();
      expect(screen.getByText('Track Your')).toBeInTheDocument();
      expect(screen.getByText('Elevation Adventures')).toBeInTheDocument();
    });

    it('renders the hero description', () => {
      renderComponent();
      expect(
        screen.getByText(/Keep a digital logbook of your hikes/i)
      ).toBeInTheDocument();
    });

    it('applies gradient text styling to "Elevation Adventures"', () => {
      const { container } = renderComponent();
      const gradientText = container.querySelector(
        '.bg-gradient-trail.bg-clip-text'
      );
      expect(gradientText).toBeInTheDocument();
      expect(gradientText).toHaveTextContent('Elevation Adventures');
    });
  });

  describe('Call-to-Action Buttons', () => {
    it('renders "Start Your Journey" button', () => {
      renderComponent();
      expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    });

    it('renders "View Sample Log" button', () => {
      renderComponent();
      expect(screen.getByText('View Sample Log')).toBeInTheDocument();
    });

    it('calls onGetStarted when "Start Your Journey" is clicked', () => {
      renderComponent();
      const startButton = screen.getByText('Start Your Journey');
      fireEvent.click(startButton);
      expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
    });

    it('calls onViewSampleLog when "View Sample Log" is clicked', () => {
      renderComponent();
      const sampleButton = screen.getByText('View Sample Log');
      fireEvent.click(sampleButton);
      expect(mockOnViewSampleLog).toHaveBeenCalledTimes(1);
    });

    it('does not call handlers on initial render', () => {
      renderComponent();
      expect(mockOnGetStarted).not.toHaveBeenCalled();
      expect(mockOnViewSampleLog).not.toHaveBeenCalled();
    });
  });

  describe('Feature Cards', () => {
    it('renders all three feature cards', () => {
      renderComponent();
      expect(screen.getByText('Track Routes')).toBeInTheDocument();
      expect(screen.getByText('Plan Ahead')).toBeInTheDocument();
      expect(screen.getByText('Track Progress')).toBeInTheDocument();
    });

    it('renders "Track Routes" card with description', () => {
      renderComponent();
      expect(
        screen.getByText(/Log your hiking routes with GPS coordinates/i)
      ).toBeInTheDocument();
    });

    it('renders "Plan Ahead" card with description', () => {
      renderComponent();
      expect(
        screen.getByText(/Schedule hikes, check weather conditions/i)
      ).toBeInTheDocument();
    });

    it('renders "Track Progress" card with description', () => {
      renderComponent();
      expect(
        screen.getByText(/Set goals, earn achievements/i)
      ).toBeInTheDocument();
    });

    it('renders cards with correct styling classes', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('.bg-card\\/80');
      expect(cards).toHaveLength(3);
    });
  });

  describe('Background and Layout', () => {
    it('renders the hero section as a full-screen element', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-screen');
    });

    it('applies background image styling', () => {
      const { container } = renderComponent();
      const bgElement = container.querySelector('.bg-cover');
      expect(bgElement).toBeInTheDocument();
      expect(bgElement).toHaveStyle({
        backgroundImage: expect.stringContaining('url('),
      });
    });

    it('includes gradient overlay', () => {
      const { container } = renderComponent();
      const overlay = container.querySelector('.bg-gradient-to-b');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('applies fade-in animation to main content', () => {
      const { container } = renderComponent();
      const fadeInElement = container.querySelector('.animate-fade-in');
      expect(fadeInElement).toBeInTheDocument();
    });

    it('applies slide-up animation to feature cards', () => {
      const { container } = renderComponent();
      const slideUpElement = container.querySelector('.animate-slide-up');
      expect(slideUpElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderComponent();
      const h1 = screen.getByRole('heading', { level: 1 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h3Elements).toHaveLength(3);
    });

    it('buttons are keyboard accessible', () => {
      renderComponent();
      const buttons = screen.getAllByRole('button');

      expect(buttons).toHaveLength(2);
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });

    it('main section has appropriate semantic structure', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('includes responsive text sizing classes', () => {
      const { container } = renderComponent();
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl');
    });

    it('includes responsive button layout classes', () => {
      const { container } = renderComponent();
      const buttonContainer = container.querySelector(
        '.flex-col.sm\\:flex-row'
      );
      expect(buttonContainer).toBeInTheDocument();
    });

    it('includes responsive grid for feature cards', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('.grid.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });
  });
});
