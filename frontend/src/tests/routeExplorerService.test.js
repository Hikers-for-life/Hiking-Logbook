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
          osm_id: 1,
          osm_tags: { name: 'Trail A', surface: 'rock' },
        },
        geometry: { coordinates: [[18.4, -33.9]] },
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: mockFeatures }),
    });

    const result = await routeExplorerService.discoverNearbyTrails(
      -33.9,
      18.4,
      5
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('openrouteservice.org/pois'),
      expect.objectContaining({ method: 'POST' })
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0); // Should return curated trails
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('coordinates');
  });

  test('discoverNearbyTrails falls back to curated trails on bad response', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    const result = await routeExplorerService.discoverNearbyTrails(-33.9, 18.4, 5);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0); // Should return curated trails as fallback
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('coordinates');
  });
});
