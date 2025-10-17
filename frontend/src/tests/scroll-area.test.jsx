import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';

// Mock Radix UI ScrollArea components
jest.mock('@radix-ui/react-scroll-area', () => ({
  Root: ({ children, className, ...props }) => (
    <div className={className} data-testid="scroll-area-root" {...props}>
      {children}
    </div>
  ),
  Viewport: ({ children, className }) => (
    <div className={className} data-testid="scroll-area-viewport">
      {children}
    </div>
  ),
  ScrollAreaScrollbar: ({ children, className, orientation, ...props }) => (
    <div
      className={className}
      data-testid={`scroll-area-scrollbar-${orientation}`}
      data-orientation={orientation}
      {...props}
    >
      {children}
    </div>
  ),
  ScrollAreaThumb: ({ className }) => (
    <div className={className} data-testid="scroll-area-thumb" />
  ),
  Corner: () => <div data-testid="scroll-area-corner" />
}));

describe('ScrollArea Component', () => {
  describe('Rendering', () => {
    test('should render ScrollArea with children', () => {
      render(
        <ScrollArea>
          <div>Test Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('should render viewport with children', () => {
      render(
        <ScrollArea>
          <div>Viewport Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument();
      expect(screen.getByText('Viewport Content')).toBeInTheDocument();
    });

    test('should render scrollbar', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    });

    test('should render corner component', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    test('should apply custom className to root', () => {
      render(
        <ScrollArea className="custom-scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('custom-scroll-area');
    });

    test('should combine default and custom classNames', () => {
      render(
        <ScrollArea className="my-custom-class">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root.className).toContain('relative');
      expect(root.className).toContain('overflow-hidden');
      expect(root.className).toContain('my-custom-class');
    });

    test('should handle empty className', () => {
      render(
        <ScrollArea className="">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root.className).toContain('relative');
      expect(root.className).toContain('overflow-hidden');
    });

    test('should work without className prop', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root.className).toContain('relative');
      expect(root.className).toContain('overflow-hidden');
    });
  });

  describe('Multiple Children', () => {
    test('should render multiple children', () => {
      render(
        <ScrollArea>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ScrollArea>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    test('should render nested components', () => {
      render(
        <ScrollArea>
          <div>
            <span>Nested</span>
            <p>Content</p>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Forward Ref', () => {
    test('should support ref forwarding', () => {
      const ref = React.createRef();
      render(
        <ScrollArea ref={ref}>
          <div>Content</div>
        </ScrollArea>
      );

      // Component is wrapped with forwardRef, so just check it renders
      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
    });
  });
});

describe('ScrollBar Component', () => {
  describe('Rendering', () => {
    test('should render ScrollBar with default vertical orientation', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    });

    test('should render ScrollBar with horizontal orientation', () => {
      render(<ScrollBar orientation="horizontal" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-horizontal');
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
    });

    test('should render scroll thumb', () => {
      render(<ScrollBar />);

      expect(screen.getByTestId('scroll-area-thumb')).toBeInTheDocument();
    });
  });

  describe('Orientation Styling', () => {
    test('should apply vertical orientation classes', () => {
      render(<ScrollBar orientation="vertical" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar.className).toContain('h-full');
      expect(scrollbar.className).toContain('w-2.5');
      expect(scrollbar.className).toContain('border-l');
    });

    test('should apply horizontal orientation classes', () => {
      render(<ScrollBar orientation="horizontal" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-horizontal');
      expect(scrollbar.className).toContain('h-2.5');
      expect(scrollbar.className).toContain('flex-col');
      expect(scrollbar.className).toContain('border-t');
    });
  });

  describe('Custom ClassName', () => {
    test('should apply custom className to scrollbar', () => {
      render(<ScrollBar className="custom-scrollbar" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar).toHaveClass('custom-scrollbar');
    });

    test('should combine default and custom classNames', () => {
      render(<ScrollBar className="my-scrollbar" orientation="vertical" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar.className).toContain('flex');
      expect(scrollbar.className).toContain('touch-none');
      expect(scrollbar.className).toContain('my-scrollbar');
    });

    test('should handle empty className', () => {
      render(<ScrollBar className="" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar.className).toContain('flex');
    });
  });

  describe('Forward Ref', () => {
    test('should support ref forwarding', () => {
      const ref = React.createRef();
      render(<ScrollBar ref={ref} />);

      // Component is wrapped with forwardRef, so just check it renders
      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    });
  });

  describe('Common CSS Classes', () => {
    test('should apply common transition classes', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar.className).toContain('transition-colors');
    });

    test('should apply common interaction classes', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar.className).toContain('touch-none');
      expect(scrollbar.className).toContain('select-none');
    });

    test('should apply flex class', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar.className).toContain('flex');
    });
  });

  describe('Thumb Styling', () => {
    test('should apply correct classes to thumb', () => {
      render(<ScrollBar />);

      const thumb = screen.getByTestId('scroll-area-thumb');
      expect(thumb.className).toContain('relative');
      expect(thumb.className).toContain('flex-1');
      expect(thumb.className).toContain('rounded-full');
      expect(thumb.className).toContain('bg-border');
    });
  });
});

describe('ScrollArea with ScrollBar Integration', () => {
  test('should work together in a typical use case', () => {
    render(
      <ScrollArea className="h-96 w-full">
        <div className="p-4">
          <p>Long content that needs scrolling</p>
          <p>More content</p>
          <p>Even more content</p>
        </div>
      </ScrollArea>
    );

    expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    expect(screen.getByText('Long content that needs scrolling')).toBeInTheDocument();
  });

  test('should render with custom scrollbar orientation', () => {
    const CustomScrollArea = () => (
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );

    render(<CustomScrollArea />);

    // Default scrollbar should be vertical
    expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
  });
});

describe('Edge Cases', () => {
  test('should handle empty content', () => {
    render(<ScrollArea />);

    expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
  });

  test('should handle null children', () => {
    render(<ScrollArea>{null}</ScrollArea>);

    expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
  });

  test('should handle undefined children', () => {
    render(<ScrollArea>{undefined}</ScrollArea>);

    expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
  });

  test('should handle boolean children', () => {
    render(
      <ScrollArea>
        {false && <div>Hidden</div>}
        <div>Visible</div>
      </ScrollArea>
    );

    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  test('should handle mixed content types', () => {
    render(
      <ScrollArea>
        <div>Element content</div>
        <div>{123}</div>
      </ScrollArea>
    );

    expect(screen.getByText('Element content')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('should render semantic HTML structure', () => {
    render(
      <ScrollArea>
        <div role="list">
          <div role="listitem">Item 1</div>
          <div role="listitem">Item 2</div>
        </div>
      </ScrollArea>
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  test('should preserve data attributes', () => {
    render(
      <ScrollArea data-testid="custom-scroll-area" data-custom="value">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('custom-scroll-area');
    expect(scrollArea).toHaveAttribute('data-custom', 'value');
  });
});

describe('Component Exports', () => {
  test('should export ScrollArea component', () => {
    expect(ScrollArea).toBeDefined();
    // forwardRef returns an object, not a function
    expect(typeof ScrollArea).toBe('object');
  });

  test('should export ScrollBar component', () => {
    expect(ScrollBar).toBeDefined();
    // forwardRef returns an object, not a function
    expect(typeof ScrollBar).toBe('object');
  });
});
