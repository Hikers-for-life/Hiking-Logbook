import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Toaster smoke', () => {
  test('renders without crashing', () => {
    const { Toaster } = require('../components/ui/toaster.jsx');
    render(
      <MemoryRouter>
        <Toaster />
      </MemoryRouter>
    );
  });
});
