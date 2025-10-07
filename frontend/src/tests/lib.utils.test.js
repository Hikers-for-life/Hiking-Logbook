import { cn } from '../lib/utils';

describe('lib/utils cn', () => {
  test('merges class names and removes duplicates', () => {
    const result = cn('a', 'b', 'a', { c: true, d: false }, ['e', null]);
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
    expect(result).toContain('e');
  });
});



