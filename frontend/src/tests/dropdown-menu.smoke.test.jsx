import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

describe('DropdownMenu smoke', () => {
  test('renders container', () => {
    const Dropdown = require('../components/ui/dropdown-menu.jsx');
    const { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } = Dropdown;
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>Item</DropdownMenuContent>
      </DropdownMenu>
    );
  });
});



