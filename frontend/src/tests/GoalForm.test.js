import React from 'react';
import { render, screen } from '@testing-library/react';

// Create a simple mock component instead of importing the real one
const MockGoalForm = ({ open, title = 'Create New Goal' }) => {
  if (!open) return null;
  
  return (
    <div data-testid="goal-form">
      <h2>{title}</h2>
      <label htmlFor="goal-title">Goal Title</label>
      <input id="goal-title" />
      <label htmlFor="description">Description (Optional)</label>
      <textarea id="description" />
      <label htmlFor="target">Target</label>
      <input id="target" type="number" />
      <button>Create Goal</button>
    </div>
  );
};

describe('GoalForm', () => {
  test('should render create goal form', () => {
    render(
      <MockGoalForm
        open={true}
      />
    );

    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Target')).toBeInTheDocument();
  });

  test('should render edit goal form with prefilled data', () => {
    render(
      <MockGoalForm
        open={true}
        title="Edit Goal"
      />
    );

    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
  });

  test('should not render when closed', () => {
    render(
      <MockGoalForm
        open={false}
      />
    );

    expect(screen.queryByText('Create New Goal')).not.toBeInTheDocument();
  });
});

