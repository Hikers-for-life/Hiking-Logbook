import { render, screen } from '@testing-library/react';
import NotFound from '../pages/NotFound.jsx';

describe('NotFound Page', () => {
  test('renders 404 message and return link', () => {
    render(<NotFound />);

    // Check the main heading
    expect(screen.getByText('404')).toBeInTheDocument();

    // Check the description
    expect(screen.getByText(/Oops! Page not found/i)).toBeInTheDocument();

    // Check the return link
    const link = screen.getByRole('link', { name: /Return to Home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
