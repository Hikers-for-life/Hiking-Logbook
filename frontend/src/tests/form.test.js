import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from '../components/ui/form';

// Mock utilities
jest.mock('../lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}));

// Test component
const TestFormComponent = ({ onSubmit }) => {
  const form = useForm({ mode: 'onChange' });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="testField"
          rules={{ required: 'This field is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Label</FormLabel>
              <FormControl>
                <input {...field} placeholder="Enter text" data-testid="test-input" />
              </FormControl>
              <FormDescription>This is a test description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit" data-testid="submit-button">Submit</button>
      </form>
    </Form>
  );
};

describe('Form Components', () => {
  it('renders the form and input', () => {
    render(<TestFormComponent />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('shows error when submitted empty', async () => {
    render(<TestFormComponent />);
    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('submits form correctly', async () => {
    const onSubmit = jest.fn();
    render(<TestFormComponent onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('test-input'), { target: { value: 'Hello' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ testField: 'Hello' }, expect.anything());
    });
  });
});
