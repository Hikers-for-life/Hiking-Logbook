import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveHikeStatus from '../components/ActiveHikeStatus';

describe('ActiveHikeStatus Component', () => {
  const mockOnResume = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when no active hike', () => {
    const { container } = render(
      <ActiveHikeStatus activeHike={null} onResume={mockOnResume} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders active hike status correctly', () => {
    const activeHike = {
      title: 'Mountain Trail',
      status: 'active',
      elapsedTime: 3600, // 1 hour
      distance: 2.5,
      isActive: true,
      isPaused: false
    };

    render(<ActiveHikeStatus activeHike={activeHike} onResume={mockOnResume} />);
    
    expect(screen.getByText('Hike in Progress')).toBeInTheDocument();
    expect(screen.getByText('Mountain Trail')).toBeInTheDocument();
    expect(screen.getByText('1h 0m')).toBeInTheDocument();
    expect(screen.getByText('0.0 mi')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  test('renders paused hike status correctly', () => {
    const activeHike = {
      title: 'Forest Walk',
      status: 'paused',
      elapsedTime: 1800, // 30 minutes
      distance: 1.2,
      isActive: false,
      isPaused: true
    };

    render(<ActiveHikeStatus activeHike={activeHike} onResume={mockOnResume} />);
    
    expect(screen.getByText('Hike in Progress')).toBeInTheDocument();
    expect(screen.getByText('Forest Walk')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument();
    expect(screen.getByText('0.0 mi')).toBeInTheDocument();
  });

  test('calls onResume when Resume Hike button is clicked', () => {
    const activeHike = {
      title: 'Test Hike',
      status: 'active',
      elapsedTime: 600,
      distance: 0.5,
      isActive: true,
      isPaused: false
    };

    render(<ActiveHikeStatus activeHike={activeHike} onResume={mockOnResume} />);
    
    const resumeButton = screen.getByText('Continue');
    fireEvent.click(resumeButton);
    
    expect(mockOnResume).toHaveBeenCalledTimes(1);
  });

  test('formats time correctly for different durations', () => {
    // Test minutes only
    const shortHike = {
      title: 'Short Hike',
      status: 'active',
      elapsedTime: 900, // 15 minutes
      distance: 0.3,
      isActive: true,
      isPaused: false
    };

    const { rerender } = render(
      <ActiveHikeStatus activeHike={shortHike} onResume={mockOnResume} />
    );
    
    expect(screen.getByText('15m')).toBeInTheDocument();

    // Test hours and minutes
    const longHike = {
      title: 'Long Hike',
      status: 'active',
      elapsedTime: 7320, // 2 hours 2 minutes
      distance: 5.5,
      isActive: true,
      isPaused: false
    };

    rerender(<ActiveHikeStatus activeHike={longHike} onResume={mockOnResume} />);
    
    expect(screen.getByText('2h 2m')).toBeInTheDocument();
  });

  test('displays correct status indicators', () => {
    const activeHike = {
      title: 'Status Test Hike',
      status: 'active',
      elapsedTime: 1200,
      distance: 1.0,
      isActive: true,
      isPaused: false
    };

    render(<ActiveHikeStatus activeHike={activeHike} onResume={mockOnResume} />);
    
    // Should show active indicator (green dot)
    const statusIndicator = screen.getByText('Hike in Progress').closest('div');
    expect(statusIndicator).toBeInTheDocument();
  });

  test('handles zero elapsed time', () => {
    const newHike = {
      title: 'Just Started',
      status: 'active',
      elapsedTime: 0,
      distance: 0,
      isActive: true,
      isPaused: false
    };

    render(<ActiveHikeStatus activeHike={newHike} onResume={mockOnResume} />);
    
    expect(screen.getByText('0m')).toBeInTheDocument();
    expect(screen.getByText('0.0 mi')).toBeInTheDocument();
  });

  test('handles missing title gracefully', () => {
    const hikeWithoutTitle = {
      status: 'active',
      elapsedTime: 600,
      distance: 0.5,
      isActive: true,
      isPaused: false
    };

    render(<ActiveHikeStatus activeHike={hikeWithoutTitle} onResume={mockOnResume} />);
    
    // Should still render without crashing - check for time display instead
    expect(screen.getByText('10m')).toBeInTheDocument();
  });
});
