// services/gearChecklistService.js
import { dbUtils } from '../config/database.js';
import { initializeFirebase } from '../config/firebase.js';

export class GearChecklistService {
  constructor() {
    this.initializeService();
  }

  async initializeService() {
    try {
      await initializeFirebase();
      console.log('GearChecklistService initialized');
    } catch (error) {
      console.error('Failed to initialize GearChecklistService:', error);
    }
  }

  /**
   * Get user's gear checklist
   * @param {string} userId - The user's ID
   * @returns {Array} Array of gear items
   */
  async getUserGearChecklist(userId) {
    try {
      const checklist = await dbUtils.getUserGearChecklist(userId);
      console.log(
        `Retrieved gear checklist for user ${userId}: ${checklist.length} items`
      );
      return checklist;
    } catch (error) {
      console.error('GearChecklistService.getUserGearChecklist error:', error);
      throw error;
    }
  }

  /**
   * Update entire gear checklist
   * @param {string} userId - The user's ID
   * @param {Array} gearItems - Array of gear items
   * @returns {Object} Result with success status
   */
  async updateGearChecklist(userId, gearItems) {
    try {
      // Validate gear items
      this.validateGearItems(gearItems);

      const result = await dbUtils.updateUserGearChecklist(userId, gearItems);

      if (result.success) {
        console.log(
          `Gear checklist updated for user ${userId}: ${gearItems.length} items`
        );
        return result;
      }

      throw new Error('Failed to update gear checklist');
    } catch (error) {
      console.error('GearChecklistService.updateGearChecklist error:', error);
      throw error;
    }
  }

  /**
   * Add a new gear item
   * @param {string} userId - The user's ID
   * @param {string} itemName - The gear item name
   * @returns {Object} Result with success status and updated checklist
   */
  async addGearItem(userId, itemName) {
    try {
      // Validate item name
      if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
        throw new Error('Item name is required');
      }

      const sanitizedItemName = itemName.trim();

      // Check for duplicates
      const currentChecklist = await dbUtils.getUserGearChecklist(userId);
      const isDuplicate = currentChecklist.some(
        (item) => item.item.toLowerCase() === sanitizedItemName.toLowerCase()
      );

      if (isDuplicate) {
        throw new Error('Item already exists in checklist');
      }

      const result = await dbUtils.addGearItem(userId, sanitizedItemName);

      if (result.success) {
        console.log(
          `Added gear item "${sanitizedItemName}" for user ${userId}`
        );
        return result;
      }

      throw new Error('Failed to add gear item');
    } catch (error) {
      console.error('GearChecklistService.addGearItem error:', error);
      throw error;
    }
  }

  /**
   * Remove a gear item
   * @param {string} userId - The user's ID
   * @param {number} itemIndex - The index of the item to remove
   * @returns {Object} Result with success status and updated checklist
   */
  async removeGearItem(userId, itemIndex) {
    try {
      // Validate index
      if (typeof itemIndex !== 'number' || itemIndex < 0) {
        throw new Error('Invalid item index');
      }

      const result = await dbUtils.removeGearItem(userId, itemIndex);

      if (result.success) {
        console.log(
          `Removed gear item at index ${itemIndex} for user ${userId}`
        );
        return result;
      }

      throw new Error('Failed to remove gear item');
    } catch (error) {
      console.error('GearChecklistService.removeGearItem error:', error);
      throw error;
    }
  }

  /**
   * Toggle checked status of a gear item
   * @param {string} userId - The user's ID
   * @param {number} itemIndex - The index of the item to toggle
   * @returns {Object} Result with success status and updated checklist
   */
  async toggleGearItem(userId, itemIndex) {
    try {
      // Validate index
      if (typeof itemIndex !== 'number' || itemIndex < 0) {
        throw new Error('Invalid item index');
      }

      const result = await dbUtils.toggleGearItem(userId, itemIndex);

      if (result.success) {
        console.log(
          `Toggled gear item at index ${itemIndex} for user ${userId}`
        );
        return result;
      }

      throw new Error('Failed to toggle gear item');
    } catch (error) {
      console.error('GearChecklistService.toggleGearItem error:', error);
      throw error;
    }
  }

  /**
   * Reset all gear items to unchecked
   * @param {string} userId - The user's ID
   * @returns {Object} Result with success status
   */
  async resetGearChecklist(userId) {
    try {
      const currentChecklist = await dbUtils.getUserGearChecklist(userId);
      const resetChecklist = currentChecklist.map((item) => ({
        ...item,
        checked: false,
      }));

      const result = await this.updateGearChecklist(userId, resetChecklist);

      if (result.success) {
        console.log(`Reset gear checklist for user ${userId}`);
        return { ...result, checklist: resetChecklist };
      }

      throw new Error('Failed to reset gear checklist');
    } catch (error) {
      console.error('GearChecklistService.resetGearChecklist error:', error);
      throw error;
    }
  }

  /**
   * Get gear statistics
   * @param {string} userId - The user's ID
   * @returns {Object} Statistics about the gear checklist
   */
  async getGearStats(userId) {
    try {
      const checklist = await dbUtils.getUserGearChecklist(userId);

      const stats = {
        totalItems: checklist.length,
        checkedItems: checklist.filter((item) => item.checked).length,
        uncheckedItems: checklist.filter((item) => !item.checked).length,
        completionPercentage:
          checklist.length > 0
            ? Math.round(
                (checklist.filter((item) => item.checked).length /
                  checklist.length) *
                  100
              )
            : 0,
      };

      return stats;
    } catch (error) {
      console.error('GearChecklistService.getGearStats error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Validate gear items array
   * @param {Array} gearItems - Array of gear items to validate
   * @throws {Error} If validation fails
   */
  validateGearItems(gearItems) {
    if (!Array.isArray(gearItems)) {
      throw new Error('Gear items must be an array');
    }

    gearItems.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(
          `Invalid gear item at index ${index}: must be an object`
        );
      }

      if (
        !item.item ||
        typeof item.item !== 'string' ||
        item.item.trim() === ''
      ) {
        throw new Error(
          `Invalid gear item at index ${index}: item name is required`
        );
      }

      if (typeof item.checked !== 'boolean') {
        throw new Error(
          `Invalid gear item at index ${index}: checked must be a boolean`
        );
      }
    });
  }
}
