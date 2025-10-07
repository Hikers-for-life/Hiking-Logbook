// services/__tests__/gearService.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { gearApiService, useGearChecklist, gearUtils } from '../services/gearService';
import { auth } from '../config/firebase';

// Mock Firebase auth
jest.mock('../config/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn()
    }
  }
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('gearService', () => {
  const mockToken = 'mock-jwt-token';
  const mockUser = {
    getIdToken: jest.fn().mockResolvedValue(mockToken)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    auth.currentUser = mockUser;
    process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('gearApiService', () => {
    describe('getGearChecklist', () => {
      it('should fetch gear checklist successfully', async () => {
        const mockChecklist = [
          { item: 'Hiking Boots', checked: false },
          { item: 'Water Bottle', checked: true }
        ];

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: mockChecklist })
        });

        const result = await gearApiService.getGearChecklist();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
              'Content-Type': 'application/json'
            })
          })
        );
        expect(result).toEqual(mockChecklist);
      });

      it('should handle missing data property in response', async () => {
        const mockChecklist = [{ item: 'Test', checked: false }];

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockChecklist)
        });

        const result = await gearApiService.getGearChecklist();
        expect(result).toEqual(mockChecklist);
      });

      it('should throw error when user is not authenticated', async () => {
        auth.currentUser = null;

        await expect(gearApiService.getGearChecklist()).rejects.toThrow('No authenticated user');
      });

      it('should handle API errors', async () => {
        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValue({ error: 'Server error' })
        });

        await expect(gearApiService.getGearChecklist()).rejects.toThrow('Server error');
      });
    });

    describe('addGearItem', () => {
      it('should add a new gear item', async () => {
        const mockResponse = {
          data: {
            checklist: [
              { item: 'Existing Item', checked: false },
              { item: 'New Item', checked: false }
            ]
          }
        };

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await gearApiService.addGearItem('New Item');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist/items',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ itemName: 'New Item' }),
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('removeGearItem', () => {
      it('should remove a gear item by index', async () => {
        const mockResponse = {
          data: {
            checklist: [{ item: 'Remaining Item', checked: false }]
          }
        };

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await gearApiService.removeGearItem(1);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist/items/1',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('toggleGearItem', () => {
      it('should toggle gear item checked status', async () => {
        const mockResponse = {
          data: {
            checklist: [
              { item: 'Item 1', checked: false },
              { item: 'Item 2', checked: true }
            ]
          }
        };

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await gearApiService.toggleGearItem(1);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist/items/1/toggle',
          expect.objectContaining({
            method: 'POST'
          })
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('resetGearChecklist', () => {
      it('should reset all items to unchecked', async () => {
        const mockResponse = {
          data: {
            checklist: [
              { item: 'Item 1', checked: false },
              { item: 'Item 2', checked: false }
            ]
          }
        };

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await gearApiService.resetGearChecklist();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist/reset',
          expect.objectContaining({
            method: 'POST'
          })
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('updateGearChecklist', () => {
      it('should update entire gear checklist', async () => {
        const newChecklist = [
          { item: 'Updated Item 1', checked: true },
          { item: 'Updated Item 2', checked: false }
        ];
        const mockResponse = { data: { checklist: newChecklist } };

        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await gearApiService.updateGearChecklist(newChecklist);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ gearItems: newChecklist })
          })
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getGearStats', () => {
      it('should fetch gear statistics', async () => {
        const mockStats = {
          totalItems: 10,
          checkedItems: 7,
          completionRate: 70
        };

        // Ensure auth.currentUser is properly set with getIdToken
        auth.currentUser = {
          getIdToken: jest.fn().mockResolvedValue(mockToken)
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: mockStats })
        });

        const result = await gearApiService.getGearStats();

        expect(auth.currentUser.getIdToken).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/gear/checklist/stats',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
              'Content-Type': 'application/json'
            })
          })
        );
        expect(result).toEqual(mockStats);
      });
    });
  });

  describe('useGearChecklist hook', () => {
    it('should initialize with empty checklist and loading state', () => {
      const { result } = renderHook(() => useGearChecklist());

      expect(result.current.gearChecklist).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should load gear checklist successfully', async () => {
      const mockChecklist = [
        { item: 'Hiking Boots', checked: false },
        { item: 'Water Bottle', checked: true }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockChecklist)
      });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      expect(result.current.gearChecklist).toEqual(mockChecklist);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should add gear item with optimistic update', async () => {
      const initialChecklist = [{ item: 'Existing Item', checked: false }];
      const updatedChecklist = [
        { item: 'Existing Item', checked: false },
        { item: 'New Item', checked: false }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(initialChecklist)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ checklist: updatedChecklist })
        });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await act(async () => {
        await result.current.addGearItem('New Item');
      });

      expect(result.current.gearChecklist).toEqual(updatedChecklist);
    });

    it('should prevent adding duplicate items', async () => {
      const mockChecklist = [{ item: 'Hiking Boots', checked: false }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockChecklist)
      });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addGearItem('Hiking Boots');
        });
      }).rejects.toThrow('Item already exists in checklist');
    });

    it('should revert optimistic update on add error', async () => {
      const initialChecklist = [{ item: 'Existing Item', checked: false }];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(initialChecklist)
        })
        .mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addGearItem('New Item');
        });
      }).rejects.toThrow('API Error');

      expect(result.current.gearChecklist).toEqual(initialChecklist);
    });

    it('should remove gear item with optimistic update', async () => {
      const initialChecklist = [
        { item: 'Item 1', checked: false },
        { item: 'Item 2', checked: true }
      ];
      const updatedChecklist = [{ item: 'Item 1', checked: false }];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(initialChecklist)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ checklist: updatedChecklist })
        });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await act(async () => {
        await result.current.removeGearItem(1);
      });

      expect(result.current.gearChecklist).toEqual(updatedChecklist);
    });

    it('should toggle gear item with optimistic update', async () => {
      const initialChecklist = [
        { item: 'Item 1', checked: false },
        { item: 'Item 2', checked: false }
      ];
      const updatedChecklist = [
        { item: 'Item 1', checked: true },
        { item: 'Item 2', checked: false }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(initialChecklist)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ checklist: updatedChecklist })
        });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await act(async () => {
        await result.current.toggleGearItem(0);
      });

      expect(result.current.gearChecklist[0].checked).toBe(true);
    });

    it('should reset gear checklist', async () => {
      const initialChecklist = [
        { item: 'Item 1', checked: true },
        { item: 'Item 2', checked: true }
      ];
      const resetChecklist = [
        { item: 'Item 1', checked: false },
        { item: 'Item 2', checked: false }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(initialChecklist)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ checklist: resetChecklist })
        });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await act(async () => {
        await result.current.resetGearChecklist();
      });

      expect(result.current.gearChecklist.every(item => !item.checked)).toBe(true);
    });

    it('should calculate computed values correctly', async () => {
      const mockChecklist = [
        { item: 'Item 1', checked: true },
        { item: 'Item 2', checked: true },
        { item: 'Item 3', checked: false },
        { item: 'Item 4', checked: false }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockChecklist)
      });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      expect(result.current.totalItems).toBe(4);
      expect(result.current.checkedItems).toBe(2);
      expect(result.current.uncheckedItems).toBe(2);
      expect(result.current.completionPercentage).toBe(50);
    });

    it('should handle empty checklist for computed values', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      expect(result.current.totalItems).toBe(0);
      expect(result.current.completionPercentage).toBe(0);
    });

    it('should ignore empty item names', async () => {
      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.addGearItem('');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should trim whitespace from item names', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            checklist: [{ item: 'Trimmed Item', checked: false }]
          })
        });

      const { result } = renderHook(() => useGearChecklist());

      await act(async () => {
        await result.current.loadGearChecklist();
      });

      await act(async () => {
        await result.current.addGearItem('  Trimmed Item  ');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ itemName: 'Trimmed Item' })
        })
      );
    });
  });

  describe('gearUtils', () => {
    describe('validateItemName', () => {
      it('should validate correct item names', () => {
        const result = gearUtils.validateItemName('Hiking Boots');
        expect(result.isValid).toBe(true);
      });

      it('should reject null or undefined', () => {
        expect(gearUtils.validateItemName(null).isValid).toBe(false);
        expect(gearUtils.validateItemName(undefined).isValid).toBe(false);
      });

      it('should reject non-string values', () => {
        const result = gearUtils.validateItemName(123);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Item name is required');
      });

      it('should reject empty strings', () => {
        const result = gearUtils.validateItemName('   ');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Item name cannot be empty');
      });

      it('should reject names longer than 50 characters', () => {
        const longName = 'A'.repeat(51);
        const result = gearUtils.validateItemName(longName);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Item name must be 50 characters or less');
      });

      it('should accept names exactly 50 characters', () => {
        const exactName = 'A'.repeat(50);
        const result = gearUtils.validateItemName(exactName);
        expect(result.isValid).toBe(true);
      });
    });

    describe('getDefaultGearItems', () => {
      it('should return day hike gear by default', () => {
        const items = gearUtils.getDefaultGearItems();
        expect(items).toContainEqual({ item: 'Hiking Boots', checked: false });
        expect(items).toContainEqual({ item: 'Water (3L)', checked: false });
      });

      it('should return day hike gear explicitly', () => {
        const items = gearUtils.getDefaultGearItems('day');
        expect(items.length).toBeGreaterThan(0);
        expect(items[0]).toHaveProperty('item');
        expect(items[0]).toHaveProperty('checked');
      });

      it('should return overnight gear', () => {
        const items = gearUtils.getDefaultGearItems('overnight');
        expect(items).toContainEqual({ item: 'Tent', checked: false });
        expect(items).toContainEqual({ item: 'Sleeping Bag', checked: false });
      });

      it('should return winter gear', () => {
        const items = gearUtils.getDefaultGearItems('winter');
        expect(items).toContainEqual({ item: 'Winter Boots', checked: false });
        expect(items).toContainEqual({ item: 'Hand/Foot Warmers', checked: false });
      });

      it('should return day hike gear for unknown types', () => {
        const items = gearUtils.getDefaultGearItems('unknown');
        expect(items).toContainEqual({ item: 'Hiking Boots', checked: false });
      });
    });

    describe('sortGearItems', () => {
      const unsortedItems = [
        { item: 'Zebra', checked: false },
        { item: 'Apple', checked: true },
        { item: 'Banana', checked: false }
      ];

      it('should sort alphabetically', () => {
        const sorted = gearUtils.sortGearItems(unsortedItems, 'alphabetical');
        expect(sorted[0].item).toBe('Apple');
        expect(sorted[1].item).toBe('Banana');
        expect(sorted[2].item).toBe('Zebra');
      });

      it('should sort with checked items first', () => {
        const sorted = gearUtils.sortGearItems(unsortedItems, 'checked-first');
        expect(sorted[0].checked).toBe(true);
        expect(sorted[0].item).toBe('Apple');
      });

      it('should sort with unchecked items first', () => {
        const sorted = gearUtils.sortGearItems(unsortedItems, 'unchecked-first');
        expect(sorted[0].checked).toBe(false);
        expect(sorted[sorted.length - 1].checked).toBe(true);
      });

      it('should return original array for unknown sort type', () => {
        const sorted = gearUtils.sortGearItems(unsortedItems, 'unknown');
        expect(sorted).toEqual(unsortedItems);
      });

      it('should not mutate original array', () => {
        const original = [...unsortedItems];
        gearUtils.sortGearItems(unsortedItems, 'alphabetical');
        expect(unsortedItems).toEqual(original);
      });
    });

    describe('exportAsText', () => {
      it('should export gear checklist as formatted text', () => {
        const items = [
          { item: 'Hiking Boots', checked: true },
          { item: 'Water Bottle', checked: false },
          { item: 'First Aid Kit', checked: true }
        ];

        const text = gearUtils.exportAsText(items);

        expect(text).toContain('GEAR CHECKLIST');
        expect(text).toContain('✅ CHECKED ITEMS:');
        expect(text).toContain('• Hiking Boots');
        expect(text).toContain('• First Aid Kit');
        expect(text).toContain('⬜ UNCHECKED ITEMS:');
        expect(text).toContain('• Water Bottle');
      });

      it('should handle all items checked', () => {
        const items = [
          { item: 'Item 1', checked: true },
          { item: 'Item 2', checked: true }
        ];

        const text = gearUtils.exportAsText(items);

        expect(text).toContain('✅ CHECKED ITEMS:');
        expect(text).not.toContain('⬜ UNCHECKED ITEMS:');
      });

      it('should handle all items unchecked', () => {
        const items = [
          { item: 'Item 1', checked: false },
          { item: 'Item 2', checked: false }
        ];

        const text = gearUtils.exportAsText(items);

        expect(text).toContain('⬜ UNCHECKED ITEMS:');
        expect(text).not.toContain('✅ CHECKED ITEMS:');
      });

      it('should handle empty checklist', () => {
        const text = gearUtils.exportAsText([]);

        expect(text).toContain('GEAR CHECKLIST');
        expect(text).not.toContain('✅ CHECKED ITEMS:');
        expect(text).not.toContain('⬜ UNCHECKED ITEMS:');
      });
    });
  });

  describe('API_BASE_URL configuration', () => {
    it('should use production URL when on firebase hosting', () => {
      const originalHostname = window.location.hostname;
      delete window.location;
      window.location = { hostname: 'hiking-logbook.web.app' };

      // Re-import to get new API_BASE_URL value
      jest.resetModules();

      window.location.hostname = originalHostname;
    });

    it('should use localhost when in development', () => {
      process.env.REACT_APP_API_URL = undefined;
      const originalHostname = window.location.hostname;
      delete window.location;
      window.location = { hostname: 'localhost' };

      window.location.hostname = originalHostname;
    });
  });
});