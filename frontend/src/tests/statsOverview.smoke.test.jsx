import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

describe('StatsOverview smoke', () => {
  test('renders', () => {
    const StatsOverview = require('../components/StatsOverview.jsx').default;
    render(<StatsOverview />);
  });
});
