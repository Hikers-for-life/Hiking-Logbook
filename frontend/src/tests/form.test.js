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


jest.mock('../lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}));

// Mock @radix-ui/react-primitive first (it's causing the createSlot error)
jest.mock('@radix-ui/react-primitive', () => {
  const React = require('react');
  
  const Primitive = {
    div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref })),
    span: React.forwardRef((props, ref) => React.createElement('span', { ...props, ref })),
    label: React.forwardRef((props, ref) => React.createElement('label', { ...props, ref })),
    button: React.forwardRef((props, ref) => React.createElement('button', { ...props, ref })),
  };
  
  return {
    Primitive,
    Root: Primitive.div,
  };
});

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => {
  const React = require('react');
  
  const Root = React.forwardRef(({ children, ...props }, ref) => 
    React.createElement('label', { ...props, ref }, children)
  );
  
  return {
    Root,
    Label: Root,
  };
});

jest.mock('../components/ui/label', () => {
  const React = require('react');
  return {
    Label: React.forwardRef(({ children, className, ...props }, ref) => (
      React.createElement('label', { ref, className, ...props }, children)
    )),
  };
});

// Mock @radix-ui/react-slot to match version 1.2.3
jest.mock('@radix-ui/react-slot', () => {
  const React = require('react');
  
  const Slot = React.forwardRef(({ children, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...props, ref });
    }
    
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { ...props, ref });
    }
    
    return React.createElement('span', { ...props, ref }, children);
  });
  
  return {
    Slot,
  };
});

// Test component that uses the form components
const TestFormComponent = ({ onSubmit, defaultValues = {}, validationSchema }) => {
  const form = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const handleSubmit = (data) => {
    if (onSubmit) onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="testField"
          rules={validationSchema ? { required: 'This field is required' } : undefined}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Label</FormLabel>
              <FormControl>

                <input
                  {...field}
                  placeholder="Enter text"
                  data-testid="test-input"
                />
              </FormControl>
              <FormDescription>
                This is a test description
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />


        <button type="submit" data-testid="submit-button">
          Submit
        </button>


      </form>
    </Form>
  );
};


// Component to test useFormField hook outside of FormField context
const TestUseFormFieldComponent = () => {
  try {
    const formField = useFormField();
    return <div data-testid="form-field-data">{JSON.stringify(formField)}</div>;
  } catch (error) {
    return <div data-testid="form-field-error">{error.message}</div>;
  }
};

describe('Form Components', () => {
  describe('Form', () => {
    it('renders form with all components correctly', () => {
      render(<TestFormComponent />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      const onSubmit = jest.fn();
      render(<TestFormComponent onSubmit={onSubmit} />);
      
      const input = screen.getByTestId('test-input');
      const submitButton = screen.getByTestId('submit-button');
      
      fireEvent.change(input, { target: { value: 'test value' } });
      fireEvent.click(submitButton);
      
      // Wait for form submission
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(onSubmit).toHaveBeenCalledWith({ testField: 'test value' });
    });
  });

  describe('FormField', () => {
    it('provides field context to child components', () => {
      render(<TestFormComponent />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('renders with validation rules', async () => {
      render(<TestFormComponent validationSchema={true} />);
      
      const submitButton = screen.getByTestId('submit-button');
      
      // Trigger validation by submitting empty form
      fireEvent.click(submitButton);
      
      // Wait for validation to process
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('FormItem', () => {
    it('renders with default className', () => {
      render(
        <TestFormComponent />
      );
      
      const formItems = document.querySelectorAll('.space-y-2');
      expect(formItems.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      const TestCustomFormItem = () => {
        const form = useForm();
        return (
          <Form {...form}>
            <FormItem className="custom-class" data-testid="form-item">
              Content
            </FormItem>
          </Form>
        );
      };
      
      render(<TestCustomFormItem />);
      
      const formItem = screen.getByTestId('form-item');
      expect(formItem).toHaveClass('space-y-2', 'custom-class');

    });
  });

  describe('FormLabel', () => {
    it('renders label without error state', () => {
      render(<TestFormComponent />);
      
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).not.toHaveClass('text-destructive');
    });

    it('renders label with error state', async () => {
      render(<TestFormComponent validationSchema={true} />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton); // Trigger validation error
      
      // Wait for validation to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('text-destructive');
    });
  });

  describe('FormControl', () => {
    it('renders control with proper accessibility attributes', () => {
      render(<TestFormComponent />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('updates aria-invalid when there is an error', async () => {
      render(<TestFormComponent validationSchema={true} />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton); // Trigger validation error
      
      // Wait for validation to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('FormDescription', () => {
    it('renders description with default styling', () => {
      render(<TestFormComponent />);
      
      const description = screen.getByText('This is a test description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('has correct id for accessibility', () => {
      render(<TestFormComponent />);
      
      const description = screen.getByText('This is a test description');
      expect(description).toHaveAttribute('id');
      expect(description.id).toContain('form-item-description');
    });
  });

  describe('FormMessage', () => {
    it('renders error message when there is an error', async () => {
      render(<TestFormComponent validationSchema={true} />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton); // Trigger validation error
      
      // Wait for validation to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('renders with correct styling', async () => {
      render(<TestFormComponent validationSchema={true} />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton); // Trigger validation error
      
      // Wait for validation to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const message = screen.getByText('This field is required');
      expect(message).toHaveClass('text-sm', 'font-medium', 'text-destructive');
    });

    it('returns null when no error and no children', () => {
      const TestMessageEmpty = () => {
        const form = useForm();
        
        return (
          <Form {...form}>
            <FormField
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage data-testid="empty-message" />
                </FormItem>
              )}
            />
          </Form>
        );
      };
      
      render(<TestMessageEmpty />);
      
      expect(screen.queryByTestId('empty-message')).not.toBeInTheDocument();
    });
  });

  describe('useFormField hook', () => {
    it('throws error when used outside FormField context', () => {
      render(<TestUseFormFieldComponent />);
      
      const errorElement = screen.getByTestId('form-field-error');
      // The actual error comes from useFormContext being null
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('Cannot destructure property');
    });

    it('returns correct field data when used within FormField', () => {
      const TestUseFormFieldInContext = () => {
        const form = useForm({ defaultValues: { test: 'value' } });
        
        return (
          <Form {...form}>
            <FormField
              name="test"
              render={() => {
                const fieldData = useFormField();
                return (
                  <FormItem>
                    <div data-testid="field-name">{fieldData.name}</div>
                    <div data-testid="field-id">{fieldData.id}</div>
                  </FormItem>
                );
              }}
            />
          </Form>
        );
      };
      
      render(<TestUseFormFieldInContext />);
      
      expect(screen.getByTestId('field-name')).toHaveTextContent('test');
      expect(screen.getByTestId('field-id')).toBeInTheDocument();
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles string conversion of complex error objects', () => {
      const TestComplexError = () => {
        const form = useForm();
        
        React.useEffect(() => {
          // Set a complex error object
          form.setError('test', { 
            message: { toString: () => 'Complex error message' }
          });
        }, [form]);
        
        return (
          <Form {...form}>
            <FormField
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        );
      };
      
      render(<TestComplexError />);
      
      expect(screen.getByText('Complex error message')).toBeInTheDocument();
    });
  });
});

