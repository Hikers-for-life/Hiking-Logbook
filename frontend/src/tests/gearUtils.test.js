// Tests for gearUtils
import { gearUtils } from '../services/gearService';

describe('gearUtils Tests', () => {
  describe('validateItemName', () => {
    test('should validate a valid item name', () => {
      const result = gearUtils.validateItemName('Hiking Boots');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject null item name', () => {
      const result = gearUtils.validateItemName(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Item name is required');
    });

    test('should reject undefined item name', () => {
      const result = gearUtils.validateItemName(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Item name is required');
    });

    test('should reject non-string item name', () => {
      const result = gearUtils.validateItemName(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Item name is required');
    });

    test('should reject empty string', () => {
      const result = gearUtils.validateItemName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Item name is required');
    });

    test('should reject whitespace-only string', () => {
      const result = gearUtils.validateItemName('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Item name cannot be empty');
    });

    test('should reject item name longer than 50 characters', () => {
      const longName = 'A'.repeat(51);
      const result = gearUtils.validateItemName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Item name must be 50 characters or less');
    });

    test('should accept item name with exactly 50 characters', () => {
      const maxName = 'A'.repeat(50);
      const result = gearUtils.validateItemName(maxName);
      expect(result.isValid).toBe(true);
    });

    test('should accept item name with special characters', () => {
      const result = gearUtils.validateItemName('First-Aid Kit (Large)');
      expect(result.isValid).toBe(true);
    });
  });

  describe('getDefaultGearItems', () => {
    test('should return day hike gear items by default', () => {
      const items = gearUtils.getDefaultGearItems();
      
      expect(items).toHaveLength(6);
      expect(items[0].item).toBe('Hiking Boots');
      expect(items[1].item).toBe('Water (3L)');
      expect(items.every(item => item.checked === false)).toBe(true);
    });

    test('should return day hike gear items when specified', () => {
      const items = gearUtils.getDefaultGearItems('day');
      
      expect(items).toHaveLength(6);
      expect(items.some(item => item.item === 'Hiking Boots')).toBe(true);
      expect(items.some(item => item.item === 'Water (3L)')).toBe(true);
    });

    test('should return overnight gear items', () => {
      const items = gearUtils.getDefaultGearItems('overnight');
      
      expect(items).toHaveLength(8);
      expect(items.some(item => item.item === 'Tent')).toBe(true);
      expect(items.some(item => item.item === 'Sleeping Bag')).toBe(true);
      expect(items.some(item => item.item === 'Cooking Gear')).toBe(true);
    });

    test('should return winter gear items', () => {
      const items = gearUtils.getDefaultGearItems('winter');
      
      expect(items).toHaveLength(7);
      expect(items.some(item => item.item === 'Winter Boots')).toBe(true);
      expect(items.some(item => item.item === 'Winter Layers')).toBe(true);
      expect(items.some(item => item.item === 'Hand/Foot Warmers')).toBe(true);
    });

    test('should return day hike gear for unknown type', () => {
      const items = gearUtils.getDefaultGearItems('unknown-type');
      
      expect(items).toHaveLength(6);
      expect(items[0].item).toBe('Hiking Boots');
    });

    test('all items should be unchecked by default', () => {
      const dayItems = gearUtils.getDefaultGearItems('day');
      const overnightItems = gearUtils.getDefaultGearItems('overnight');
      const winterItems = gearUtils.getDefaultGearItems('winter');
      
      expect(dayItems.every(item => item.checked === false)).toBe(true);
      expect(overnightItems.every(item => item.checked === false)).toBe(true);
      expect(winterItems.every(item => item.checked === false)).toBe(true);
    });
  });

  describe('sortGearItems', () => {
    const unsortedItems = [
      { item: 'Zebra', checked: false },
      { item: 'Alpha', checked: true },
      { item: 'Beta', checked: false },
      { item: 'Gamma', checked: true }
    ];

    test('should sort items alphabetically', () => {
      const sorted = gearUtils.sortGearItems(unsortedItems, 'alphabetical');
      
      expect(sorted[0].item).toBe('Alpha');
      expect(sorted[1].item).toBe('Beta');
      expect(sorted[2].item).toBe('Gamma');
      expect(sorted[3].item).toBe('Zebra');
    });

    test('should sort checked items first, then alphabetically', () => {
      const sorted = gearUtils.sortGearItems(unsortedItems, 'checked-first');
      
      expect(sorted[0].checked).toBe(true);
      expect(sorted[1].checked).toBe(true);
      expect(sorted[0].item).toBe('Alpha');
      expect(sorted[1].item).toBe('Gamma');
      expect(sorted[2].checked).toBe(false);
      expect(sorted[3].checked).toBe(false);
    });

    test('should sort unchecked items first, then alphabetically', () => {
      const sorted = gearUtils.sortGearItems(unsortedItems, 'unchecked-first');
      
      expect(sorted[0].checked).toBe(false);
      expect(sorted[1].checked).toBe(false);
      expect(sorted[0].item).toBe('Beta');
      expect(sorted[1].item).toBe('Zebra');
      expect(sorted[2].checked).toBe(true);
      expect(sorted[3].checked).toBe(true);
    });

    test('should return original array for unknown sort type', () => {
      const sorted = gearUtils.sortGearItems(unsortedItems, 'unknown');
      
      expect(sorted).toEqual(unsortedItems);
    });

    test('should not mutate original array', () => {
      const original = [...unsortedItems];
      gearUtils.sortGearItems(unsortedItems, 'alphabetical');
      
      expect(unsortedItems).toEqual(original);
    });

    test('should handle empty array', () => {
      const sorted = gearUtils.sortGearItems([], 'alphabetical');
      expect(sorted).toEqual([]);
    });

    test('should handle single item', () => {
      const singleItem = [{ item: 'Solo', checked: false }];
      const sorted = gearUtils.sortGearItems(singleItem, 'alphabetical');
      expect(sorted).toEqual(singleItem);
    });
  });

  describe('exportAsText', () => {
    test('should export checklist with checked and unchecked items', () => {
      const items = [
        { item: 'Water Bottle', checked: true },
        { item: 'First Aid Kit', checked: false },
        { item: 'Hiking Boots', checked: true },
        { item: 'Sunscreen', checked: false }
      ];

      const text = gearUtils.exportAsText(items);
      
      expect(text).toContain('GEAR CHECKLIST');
      expect(text).toContain('✅ CHECKED ITEMS:');
      expect(text).toContain('• Water Bottle');
      expect(text).toContain('• Hiking Boots');
      expect(text).toContain('⬜ UNCHECKED ITEMS:');
      expect(text).toContain('• First Aid Kit');
      expect(text).toContain('• Sunscreen');
    });

    test('should export checklist with only checked items', () => {
      const items = [
        { item: 'Water Bottle', checked: true },
        { item: 'Hiking Boots', checked: true }
      ];

      const text = gearUtils.exportAsText(items);
      
      expect(text).toContain('✅ CHECKED ITEMS:');
      expect(text).toContain('• Water Bottle');
      expect(text).toContain('• Hiking Boots');
      expect(text).not.toContain('⬜ UNCHECKED ITEMS:');
    });

    test('should export checklist with only unchecked items', () => {
      const items = [
        { item: 'First Aid Kit', checked: false },
        { item: 'Sunscreen', checked: false }
      ];

      const text = gearUtils.exportAsText(items);
      
      expect(text).toContain('GEAR CHECKLIST');
      expect(text).not.toContain('✅ CHECKED ITEMS:');
      expect(text).toContain('⬜ UNCHECKED ITEMS:');
      expect(text).toContain('• First Aid Kit');
      expect(text).toContain('• Sunscreen');
    });

    test('should handle empty checklist', () => {
      const text = gearUtils.exportAsText([]);
      
      expect(text).toContain('GEAR CHECKLIST');
      expect(text).not.toContain('✅ CHECKED ITEMS:');
      expect(text).not.toContain('⬜ UNCHECKED ITEMS:');
    });

    test('should format text with proper sections', () => {
      const items = [
        { item: 'Item 1', checked: true },
        { item: 'Item 2', checked: false }
      ];

      const text = gearUtils.exportAsText(items);
      
      expect(text.startsWith('GEAR CHECKLIST\n')).toBe(true);
      expect(text).toContain('==============');
    });

    test('should list all checked items before unchecked items', () => {
      const items = [
        { item: 'Unchecked', checked: false },
        { item: 'Checked', checked: true }
      ];

      const text = gearUtils.exportAsText(items);
      const checkedIndex = text.indexOf('Checked');
      const uncheckedIndex = text.indexOf('Unchecked');
      
      expect(checkedIndex).toBeLessThan(uncheckedIndex);
    });
  });

  describe('Edge cases', () => {
    test('validateItemName should trim spaces for length check', () => {
      const name = '  Valid Name  ';
      const result = gearUtils.validateItemName(name);
      expect(result.isValid).toBe(true);
    });

    test('sortGearItems should handle items with same name', () => {
      const items = [
        { item: 'Duplicate', checked: true },
        { item: 'Duplicate', checked: false }
      ];
      
      const sorted = gearUtils.sortGearItems(items, 'alphabetical');
      expect(sorted).toHaveLength(2);
    });

    test('exportAsText should handle items with special characters', () => {
      const items = [
        { item: 'First-Aid & Safety Kit', checked: true }
      ];
      
      const text = gearUtils.exportAsText(items);
      expect(text).toContain('First-Aid & Safety Kit');
    });

    test('getDefaultGearItems should return new array each time', () => {
      const items1 = gearUtils.getDefaultGearItems('day');
      const items2 = gearUtils.getDefaultGearItems('day');
      
      items1[0].checked = true;
      expect(items2[0].checked).toBe(false);
    });
  });
});
