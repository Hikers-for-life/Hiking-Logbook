import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../components/features-section';

describe('FeaturesSection', () => {
  it('renders the main heading', () => {
    render(<FeaturesSection />);
    expect(
      screen.getByText('Everything You Need for Your Hiking Journey')
    ).toBeInTheDocument();
  });

  it('renders the main description', () => {
    render(<FeaturesSection />);
    expect(
      screen.getByText(
        /From planning your next adventure to tracking your progress/i
      )
    ).toBeInTheDocument();
  });

  describe('Features Grid', () => {
    it('renders all 6 feature cards', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Plan Your Adventures')).toBeInTheDocument();
      expect(screen.getByText('Connect with Friends')).toBeInTheDocument();
      expect(screen.getByText('Track Achievements')).toBeInTheDocument();
      expect(screen.getByText('Capture Memories')).toBeInTheDocument();
      expect(screen.getByText('GPS Integration')).toBeInTheDocument();
      expect(screen.getByText('Progress Analytics')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/Schedule hikes, check weather conditions/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Share your hiking experiences, invite friends/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Set personal goals, earn badges/i)
      ).toBeInTheDocument();
    });
  });

  describe('Community Section', () => {
    it('renders community heading', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText('Join a Community of Adventurers')
      ).toBeInTheDocument();
    });

    it('renders community description', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/Connect with fellow hikers from around the world/i)
      ).toBeInTheDocument();
    });

    it('renders community features list', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText('Share photos and stories from your hikes')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Discover hidden gems and popular trails')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Celebrate achievements and milestones together')
      ).toBeInTheDocument();
    });

    it('renders hikers group image with correct alt text', () => {
      render(<FeaturesSection />);
      const image = screen.getByAltText(
        'Diverse group of hikers enjoying nature'
      );
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src');
    });
  });

  describe('App Preview Section', () => {
    it('renders app preview heading', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText('Take Your Adventures Anywhere')
      ).toBeInTheDocument();
    });

    it('renders app preview description', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/Access your hiking logs from any device/i)
      ).toBeInTheDocument();
    });

    it('renders app features list', () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText('Log hikes in real-time with GPS tracking')
      ).toBeInTheDocument();
      expect(
        screen.getByText('View detailed analytics and progress charts')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Plan and schedule future hiking adventures')
      ).toBeInTheDocument();
    });

    it('renders app preview image with correct alt text', () => {
      render(<FeaturesSection />);
      const image = screen.getByAltText(
        'Hiking Log app interface on smartphone'
      );
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src');
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct section classes', () => {
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20', 'bg-background');
    });

    it('renders cards with hover effects', () => {
      const { container } = render(<FeaturesSection />);
      const cards = container.querySelectorAll('.hover\\:shadow-elevation');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<FeaturesSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });

      expect(h2).toBeInTheDocument();
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('images have descriptive alt text', () => {
      render(<FeaturesSection />);
      const images = screen.getAllByRole('img');

      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });
  });
});
