// Simple tests for StatsOverview functionality - just testing imports and basic structure
describe('StatsOverview Component Tests', () => {
  test('StatsOverview component can be imported', async () => {
    const StatsOverview = await import('../components/StatsOverview');
    expect(StatsOverview.default).toBeDefined();
    expect(typeof StatsOverview.default).toBe('function');
  });

  test('StatsOverview component exports correctly', () => {
    const StatsOverviewModule = require('../components/StatsOverview');
    expect(StatsOverviewModule.default).toBeDefined();
  });
});
