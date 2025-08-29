// Simple utility functions test
describe('Utility Functions', () => {
  test('should handle string utilities', () => {
    const str = 'Hello World';
    expect(str.toUpperCase()).toBe('HELLO WORLD');
    expect(str.toLowerCase()).toBe('hello world');
    expect(str.split(' ')).toEqual(['Hello', 'World']);
    expect(str.replace('World', 'Jest')).toBe('Hello Jest');
  });

  test('should handle number utilities', () => {
    const num = 42.567;
    expect(Math.floor(num)).toBe(42);
    expect(Math.ceil(num)).toBe(43);
    expect(Math.round(num)).toBe(43);
    expect(num.toFixed(2)).toBe('42.57');
  });

  test('should handle date utilities', () => {
    const date = new Date('2023-01-01');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0); // January is 0
    expect(date.getDate()).toBe(1);
  });

  test('should handle array utilities', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
    expect(arr.reduce((sum, x) => sum + x, 0)).toBe(15);
    expect(arr.some(x => x > 3)).toBe(true);
    expect(arr.every(x => x > 0)).toBe(true);
  });

  test('should handle object utilities', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
    expect(Object.values(obj)).toEqual([1, 2, 3]);
    expect(Object.entries(obj)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
  });
});
