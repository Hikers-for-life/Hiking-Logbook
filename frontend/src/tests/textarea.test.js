import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../components/ui/textarea';

describe('Textarea component', () => {
  it('renders with default classes', () => {
    render(<Textarea placeholder="Type here..." />);
    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
    // base class should be applied
    expect(textarea.className).toMatch(/min-h-\[80px\]/);
  });

  it('merges custom className', () => {
    render(<Textarea placeholder="Custom" className="custom-class" />);
    const textarea = screen.getByPlaceholderText('Custom');
    expect(textarea.className).toMatch(/custom-class/);
  });

  it('forwards ref', () => {
    const ref = createRef();
    render(<Textarea ref={ref} placeholder="With ref" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('spreads props (disabled + value)', () => {
    render(<Textarea disabled defaultValue="Hello" />);
    const textarea = screen.getByDisplayValue('Hello');
    expect(textarea).toBeDisabled();
  });

  it('handles user input', async () => {
    render(<Textarea placeholder="Input test" />);
    const textarea = screen.getByPlaceholderText('Input test');
    await userEvent.type(textarea, 'Hiking');
    expect(textarea).toHaveValue('Hiking');
  });
});
