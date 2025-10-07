import React from 'react';
import { render, screen } from '@testing-library/react';
import RouteMap from '../components/RouteMap';

describe('RouteMap Component', () => {
  const mockWaypoints = [
    {
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 10,
      distance: 0,
      notes: 'Start point'
    },
    {
      latitude: 40.7589,
      longitude: -73.9851,
      altitude: 15,
      distance: 5.2,
      notes: 'Waypoint 1'
    },
    {
      latitude: 40.7831,
      longitude: -73.9712,
      altitude: 20,
      distance: 10.5,
      notes: 'End point'
    }
  ];

  test('renders map with waypoints', () => {
    render(<RouteMap waypoints={mockWaypoints} />);
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    expect(screen.getByTestId('polyline')).toBeInTheDocument();
  });

  test('renders no GPS data message when no waypoints', () => {
    render(<RouteMap waypoints={[]} />);
    
    expect(screen.getByText(/No GPS Data/i)).toBeInTheDocument();
    expect(screen.getByText(/This hike doesn't have any recorded waypoints/i)).toBeInTheDocument();
  });

  test('renders no GPS data message when waypoints is null', () => {
    render(<RouteMap waypoints={null} />);
    
    expect(screen.getByText(/No GPS Data/i)).toBeInTheDocument();
  });

  test('renders markers for waypoints', () => {
    render(<RouteMap waypoints={mockWaypoints} />);
    
    // Should have 3 markers (start, waypoint, end)
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(3);
  });
});
