import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

describe('Progress smoke', () => {
  test('renders with value', () => {
    const { Progress } = require('../components/ui/progress.jsx');
    render(<Progress value={25} />);
  });
});



