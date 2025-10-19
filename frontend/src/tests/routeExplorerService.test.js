import '@testing-library/jest-dom';

describe('routeExplorerService', () => {
  let routeExplorerService;

  beforeAll(() => {
    routeExplorerService =
      require('../services/routeExplorerService').routeExplorerService;
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  test('discoverNationwideHikes returns curated list', async () => {
    const hikes = await routeExplorerService.discoverNationwideHikes();
    expect(Array.isArray(hikes)).toBe(true);
    expect(hikes.length).toBeGreaterThan(0);
    expect(hikes[0]).toHaveProperty('name');
  });

  test('discoverNearbyTrails builds POST payload and parses features', async () => {
    const mockFeatures = [
      {
        properties: {
          osm_id: 1,
          osm_tags: { name: 'Trail A', surface: 'rock' },
        },
        geometry: { coordinates: [[18.4, -33.9]] },
      },
      {
        properties: {
          osm_id: 2,
          osm_tags: { name: 'Trail B', surface: 'dirt' },
        },
        geometry: { coordinates: [[18.5, -33.8]] },
      },
    ];

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: mockFeatures }),
    });

    // Set up environment to have API key
    const originalEnv = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
    process.env.REACT_APP_OPENROUTESERVICE_API_KEY = 'test-api-key';

    const result = await routeExplorerService.discoverNearbyTrails(
      -33.9,
      18.4,
      5
    );

    // Restore original environment
    process.env.REACT_APP_OPENROUTESERVICE_API_KEY = originalEnv;

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('openrouteservice.org/pois'),
      expect.objectContaining({ method: 'POST' })
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('coordinates');
  });

  test('discoverNearbyTrails falls back to curated trails on bad response', async () => {
    // Mock API failure
    global.fetch.mockResolvedValueOnce({ ok: false });
    
    // Set up environment to have API key so it tries the API first
    const originalEnv = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
    process.env.REACT_APP_OPENROUTESERVICE_API_KEY = 'test-api-key';
    
    const result = await routeExplorerService.discoverNearbyTrails(-33.9, 18.4, 5);
    
    // Restore original environment
    process.env.REACT_APP_OPENROUTESERVICE_API_KEY = originalEnv;
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0); // Should return curated trails as fallback
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('coordinates');
  });

  test('discoverNearbyTrails uses curated trails when no API key', async () => {
    // Ensure no API key is set
    const originalEnv = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
    delete process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
    
    const result = await routeExplorerService.discoverNearbyTrails(-33.9, 18.4, 5);
    
    // Restore original environment
    process.env.REACT_APP_OPENROUTESERVICE_API_KEY = originalEnv;
    
    // Should not call fetch when no API key
    expect(global.fetch).not.toHaveBeenCalled();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0); // Should return curated trails
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('coordinates');
  });
});
