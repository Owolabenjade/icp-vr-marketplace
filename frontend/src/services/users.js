import { canister, transform, errors } from './icp';
import { validateFormData, createUserSchema, updateUserSchema } from '../utils/validation';

/**
 * Users Service - Handles all user-related operations
 */
class UsersService {
  constructor() {
    this.canisterName = 'users';
  }

  /**
   * Create a new user profile
   */
  async createUser(userData) {
    try {
      // Validate input data
      const validation = await validateFormData(createUserSchema, userData);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const result = await canister.call(this.canisterName, 'createUser', [validation.data]);
      return transform.bigIntToNumber(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const result = await canister.query(this.canisterName, 'getCurrentUser', []);
      return transform.bigIntToNumber(result);
    } catch (error) {
      if (errors.parse(error).includes('NotFound')) {
        return null; // User profile doesn't exist yet
      }
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get user profile by ID
   */
  async getUser(userId) {
    try {
      const result = await canister.query(this.canisterName, 'getUser', [userId]);
      return transform.bigIntToNumber(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Update user profile
   */
  async updateUser(updateData) {
    try {
      // Validate input data
      const validation = await validateFormData(updateUserSchema, updateData);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const result = await canister.call(this.canisterName, 'updateUser', [validation.data]);
      return transform.bigIntToNumber(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const result = await canister.query(this.canisterName, 'getUserStats', [userId]);
      return transform.bigIntToNumber(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get current user statistics
   */
  async getMyStats() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User profile not found');
      }
      return await this.getUserStats(user.id);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username) {
    try {
      // This would need to be implemented in the canister
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Search users (if implemented in canister)
   */
  async searchUsers(query, limit = 10) {
    try {
      // Placeholder - would need to be implemented in canister
      return [];
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get user's complete profile with stats
   */
  async getUserProfile(userId) {
    try {
      const [user, stats] = await Promise.all([
        this.getUser(userId),
        this.getUserStats(userId).catch(() => null), // Stats might not exist
      ]);

      return {
        ...user,
        stats: stats || {
          totalAssetsCreated: 0,
          totalAssetsSold: 0,
          totalEarnings: 0,
          averageRating: 0,
          joinedAt: user.createdAt,
        },
      };
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Check if user profile exists and is complete
   */
  async checkUserSetup() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { 
          exists: false, 
          isComplete: false, 
          requiredFields: ['username'] 
        };
      }

      const requiredFields = [];
      if (!user.username || user.username.trim() === '') {
        requiredFields.push('username');
      }

      return {
        exists: true,
        isComplete: requiredFields.length === 0,
        requiredFields,
        user,
      };
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }
}

// Create singleton instance
const usersService = new UsersService();

export default usersService;
