import { reducer, toast, useToast } from '../hooks/use-toast';

describe('toast reducer', () => {
  it('should add a toast', () => {
    const action = { type: 'ADD_TOAST', toast: { id: '1', message: 'Hello' } };
    const state = reducer({ toasts: [] }, action);
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].message).toBe('Hello');
  });

  it('should update a toast', () => {
    const initial = { toasts: [{ id: '1', message: 'Hello' }] };
    const action = { type: 'UPDATE_TOAST', toast: { id: '1', message: 'Hi' } };
    const state = reducer(initial, action);
    expect(state.toasts[0].message).toBe('Hi');
  });

  it('should dismiss a toast', () => {
    const initial = { toasts: [{ id: '1', message: 'Hello', open: true }] };
    const action = { type: 'DISMISS_TOAST', toastId: '1' };
    const state = reducer(initial, action);
    expect(state.toasts[0].open).toBe(false);
  });

  it('should remove a toast', () => {
    const initial = { toasts: [{ id: '1', message: 'Hello' }] };
    const action = { type: 'REMOVE_TOAST', toastId: '1' };
    const state = reducer(initial, action);
    expect(state.toasts).toHaveLength(0);
  });

  it('should return current state for unknown action type (default case)', () => {
    const initial = { toasts: [{ id: '1', message: 'Hello' }] };
    const action = { type: 'UNKNOWN_ACTION' };
    const state = reducer(initial, action);
    expect(state).toBe(initial);
  });
});

describe('toast function', () => {
  it('should create a toast and return dismiss/update', () => {
    const t = toast({ message: 'Hello' });
    expect(t).toHaveProperty('id');
    expect(typeof t.dismiss).toBe('function');
    expect(typeof t.update).toBe('function');
  });
});
