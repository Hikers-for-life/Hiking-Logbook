import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react'; // ✅ added within
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Logbook from '../pages/Logbook';

// Mock AuthContext
jest.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user', email: 'test@example.com' },
    logout: jest.fn(),
  }),
}));
//BEGINNING OF ANNAH 
// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../components/StatsCards', () => ({
  StatsCards: () => (
    <div data-testid="stats-cards">
      <div>Total Hikes</div>
      <div>Miles Hiked</div>
      <div>Elevation Gained</div>
      <div>States Explored</div>
    </div>
  ),
}), { virtual: true });

import { getDocs } from 'firebase/firestore';

const mockHikes = [
  {
    id: '1',
    title: 'Sunrise at Eagle Peak',
    difficulty: 'Hard',
    date: '2024-07-01',
    location: 'Eagle Peak',
    distance: '5 miles',
    elevation: '2000 ft',
    duration: '3h',
    weather: 'Sunny',
    notes: 'Beautiful morning hike!',
    photos: 4,
  },
  {
    id: '2',
    title: 'Wildflower Meadow Adventure',
    difficulty: 'Easy',
    date: '2024-08-10',
    location: 'Meadow Valley',
    distance: '2 miles',
    elevation: '200 ft',
    duration: '1h',
    weather: 'Cloudy',
    notes: 'Lots of flowers along the trail.',
    photos: 2,
  },
];

beforeEach(() => {
  getDocs.mockResolvedValue({
    docs: mockHikes.map(hike => ({
      id: hike.id,
      data: () => hike,
    })),
  });
});
//END OF ANNAH

// Mock other components
jest.mock('../components/ui/navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

jest.mock('../components/NewHikeEntryForm', () => {
  return function MockNewHikeEntryForm({ open, onOpenChange, onSubmit }) {
    return open ? (
      <div data-testid="new-hike-form">
        <button onClick={() => onSubmit({ id: 1, title: 'Test Hike' })}>Submit</button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null;
  };
});

describe('Logbook Component', () => {
  const renderLogbook = () =>
    render(
      <MemoryRouter>
        <Logbook />
      </MemoryRouter>
    );

  test('renders logbook page with navigation', async () => {
    renderLogbook();
    expect(await screen.findByTestId('navigation')).toBeInTheDocument();
    expect(await screen.findByText('Track Your')).toBeInTheDocument();
    expect(await screen.findByText('Hikes')).toBeInTheDocument();
  });

  test('displays hike entries', async () => {
    renderLogbook();
    expect(await screen.findByText('Sunrise at Eagle Peak')).toBeInTheDocument();
    expect(await screen.findByText('Wildflower Meadow Adventure')).toBeInTheDocument();
  });

  test('has search functionality', async () => {
    renderLogbook();
    const searchInput = await screen.findByPlaceholderText(/search hikes/i);
    fireEvent.change(searchInput, { target: { value: 'Eagle' } });
    expect(searchInput.value).toBe('Eagle');
  });

  test('displays stats cards', async () => {
    renderLogbook();
    const statsContainer = await screen.findByTestId('stats-cards'); // ✅ use test id
    expect(within(statsContainer).getByText(/total hikes/i)).toBeInTheDocument();
    expect(within(statsContainer).getByText(/miles hiked/i)).toBeInTheDocument();
    expect(within(statsContainer).getByText(/elevation gained/i)).toBeInTheDocument();
    expect(within(statsContainer).getByText(/states explored/i)).toBeInTheDocument();
  });

  test('shows route map button for hike entries', async () => {
    renderLogbook();

    const routeMapButtons = await screen.findAllByText('Route Map');
    expect(routeMapButtons.length).toBeGreaterThan(0);
  });

  test('handles difficulty filter changes', async () => {
    renderLogbook();

    const easyButtons = await screen.findAllByText('Easy');
    const easyFilterButton = easyButtons[0];
    fireEvent.click(easyFilterButton);

    expect(await screen.findByText('Wildflower Meadow Adventure')).toBeInTheDocument();
  });
});
