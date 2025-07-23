import { canister, transform, errors } from './icp';
import { validateFormData, createAssetSchema, updateAssetSchema, searchFiltersSchema } from '../utils/validation';
import { fileUtils, icpUtils } from '../utils/helpers';

/**
 * Assets Service - Handles all VR asset operations
 */
class AssetsService {
  constructor() {
    this.canisterName = 'assets';
  }

  /**
   * Create a new VR asset
   */
  async createAsset(assetData) {
    try {
      // Validate input data
      const validation = await validateFormData(createAssetSchema, assetData);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // Transform price to e8s if needed
      const transformedData = {
        ...validation.data,
        price: icpUtils.toE8s(validation.data.price),
      };

      const result = await canister.call(this.canisterName, 'createAsset', [transformedData]);
      return this.transformAssetResponse(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId) {
    try {
      const result = await canister.query(this.canisterName, 'getAsset', [assetId]);
      return this.transformAssetResponse(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get asset with ownership status for current user
   */
  async getAssetWithOwnership(assetId) {
    try {
      const result = await canister.call(this.canisterName, 'getAssetWithOwnership', [assetId]);
      return this.transformAssetResponse(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get all assets with pagination
   */
  async getAllAssets(page = 1, limit = 20) {
    try {
      const result = await canister.query(this.canisterName, 'getAllAssets', []);
      const assets = result.map(asset => this.transformAssetResponse(asset));
      
      // Client-side pagination (in production, this would be server-side)
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        assets: assets.slice(startIndex, endIndex),
        totalCount: assets.length,
        totalPages: Math.ceil(assets.length / limit),
        currentPage: page,
        hasNextPage: endIndex < assets.length,
        hasPrevPage: startIndex > 0,
      };
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get assets by category
   */
  async getAssetsByCategory(category, page = 1, limit = 20) {
    try {
      const categoryVariant = { [category]: null };
      const result = await canister.query(this.canisterName, 'getAssetsByCategory', [categoryVariant]);
      const assets = result.map(asset => this.transformAssetResponse(asset));
      
      // Client-side pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        assets: assets.slice(startIndex, endIndex),
        totalCount: assets.length,
        totalPages: Math.ceil(assets.length / limit),
        currentPage: page,
        hasNextPage: endIndex < assets.length,
        hasPrevPage: startIndex > 0,
      };
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get assets by creator
   */
  async getAssetsByCreator(creatorId) {
    try {
      const result = await canister.query(this.canisterName, 'getAssetsByCreator', [creatorId]);
      return result.map(asset => this.transformAssetResponse(asset));
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get current user's assets
   */
  async getMyAssets() {
    try {
      const result = await canister.call(this.canisterName, 'getMyAssets', []);
      return result.map(asset => this.transformAssetResponse(asset));
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get assets by tag
   */
  async getAssetsByTag(tag) {
    try {
      const result = await canister.query(this.canisterName, 'getAssetsByTag', [tag]);
      return result.map(asset => this.transformAssetResponse(asset));
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Search assets with filters
   */
  async searchAssets(filters = {}) {
    try {
      // Validate search filters
      const validation = await validateFormData(searchFiltersSchema, filters);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // Transform filters for canister call
      const transformedFilters = this.transformSearchFilters(validation.data);
      
      const result = await canister.query(this.canisterName, 'searchAssets', [transformedFilters]);
      const assets = result.map(asset => this.transformAssetResponse(asset));
      
      // Apply client-side sorting if needed
      const sortedAssets = this.sortAssets(assets, filters.sortBy || 'newest');
      
      return {
        assets: sortedAssets,
        totalCount: sortedAssets.length,
        filters: validation.data,
      };
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Update asset
   */
  async updateAsset(assetId, updateData) {
    try {
      // Validate input data
      const validation = await validateFormData(updateAssetSchema, updateData);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // Transform price to e8s if provided
      const transformedData = { ...validation.data };
      if (transformedData.price !== undefined) {
        transformedData.price = icpUtils.toE8s(transformedData.price);
      }

      const result = await canister.call(this.canisterName, 'updateAsset', [assetId, transformedData]);
      return this.transformAssetResponse(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(assetId) {
    try {
      const result = await canister.query(this.canisterName, 'getAssetStats', [assetId]);
      return transform.bigIntToNumber(result);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get owned assets for current user
   */
  async getOwnedAssets() {
    try {
      const result = await canister.call(this.canisterName, 'getOwnedAssets', []);
      return result.map(asset => this.transformAssetResponse(asset));
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Check if current user owns an asset
   */
  async checkOwnership(assetId) {
    try {
      const result = await canister.call(this.canisterName, 'checkOwnership', [assetId]);
      return result;
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get featured assets
   */
  async getFeaturedAssets(limit = 10) {
    try {
      const result = await canister.query(this.canisterName, 'getFeaturedAssets', []);
      const assets = result.map(asset => this.transformAssetResponse(asset));
      return assets.slice(0, limit);
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get trending assets (based on recent downloads/views)
   */
  async getTrendingAssets(limit = 10) {
    try {
      // For now, use featured assets as trending
      // In production, this would be a separate canister method
      const featured = await this.getFeaturedAssets(limit * 2);
      
      // Sort by downloads in descending order
      const trending = featured
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, limit);
        
      return trending;
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Get recommended assets for user (placeholder implementation)
   */
  async getRecommendedAssets(userId, limit = 10) {
    try {
      // Placeholder - in production, this would use recommendation algorithms
      const featured = await this.getFeaturedAssets(limit);
      return featured;
    } catch (error) {
      throw new Error(errors.getUserMessage(error));
    }
  }

  /**
   * Upload asset file (placeholder - in production would integrate with storage service)
   */
  async uploadAssetFile(file, onProgress) {
    try {
      // Validate file
      if (!fileUtils.isVRAsset(file)) {
        throw new Error('Invalid VR asset file format');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('File size exceeds 100MB limit');
      }

      // Generate file hash
      const fileHash = await fileUtils.generateHash(file);
      
      // Simulate upload progress
      return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Return mock upload result
            resolve({
              fileHash,
              downloadUrl: `https://storage.example.com/${fileHash}`,
              fileSize: file.size,
              fileName: file.name,
            });
          }
          
          if (onProgress) {
            onProgress(Math.min(progress, 100));
          }
        }, 200);
      });
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload preview image
   */
  async uploadPreviewImage(file, onProgress) {
    try {
      // Validate file
      if (!fileUtils.isImage(file)) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size exceeds 5MB limit');
      }

      // Simulate upload progress
      return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 25;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Return mock upload result
            resolve({
              url: URL.createObjectURL(file), // In production, would be actual URL
              fileName: file.name,
              fileSize: file.size,
            });
          }
          
          if (onProgress) {
            onProgress(Math.min(progress, 100));
          }
        }, 150);
      });
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Helper: Transform asset response from canister
   */
  transformAssetResponse(asset) {
    const transformed = transform.bigIntToNumber(asset);
    
    // Convert e8s price back to ICP for display
    if (transformed.price) {
      transformed.priceIcp = icpUtils.fromE8s(transformed.price);
      transformed.priceFormatted = icpUtils.format(transformed.price);
    }
    
    // Add computed fields
    if (transformed.metadata) {
      transformed.metadata.fileSizeFormatted = fileUtils.formatSize(transformed.metadata.fileSize);
    }
    
    return transformed;
  }

  /**
   * Helper: Transform search filters for canister call
   */
  transformSearchFilters(filters) {
    const transformed = { ...filters };
    
    // Transform category to variant format
    if (transformed.category) {
      transformed.category = { [transformed.category]: null };
    }
    
    // Transform price filters to e8s
    if (transformed.minPrice !== undefined) {
      transformed.minPrice = icpUtils.toE8s(transformed.minPrice);
    }
    if (transformed.maxPrice !== undefined) {
      transformed.maxPrice = icpUtils.toE8s(transformed.maxPrice);
    }
    
    return transformed;
  }

  /**
   * Helper: Sort assets by different criteria
   */
  sortAssets(assets, sortBy) {
    switch (sortBy) {
      case 'newest':
        return assets.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
      case 'oldest':
        return assets.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
      case 'price_low':
        return assets.sort((a, b) => a.price - b.price);
      case 'price_high':
        return assets.sort((a, b) => b.price - a.price);
      case 'popular':
        return assets.sort((a, b) => b.downloads - a.downloads);
      case 'rating':
        return assets.sort((a, b) => b.rating - a.rating);
      case 'title':
        return assets.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
      default:
        return assets;
    }
  }

  /**
   * Helper: Get asset categories with counts
   */
  async getCategoryCounts() {
    try {
      const allAssets = await this.getAllAssets(1, 1000); // Get all assets
      const categoryCounts = {};
      
      allAssets.assets.forEach(asset => {
        const category = asset.metadata.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      return categoryCounts;
    } catch (error) {
      console.error('Error getting category counts:', error);
      return {};
    }
  }

  /**
   * Helper: Get popular tags
   */
  async getPopularTags(limit = 20) {
    try {
      const allAssets = await this.getAllAssets(1, 1000); // Get all assets
      const tagCounts = {};
      
      allAssets.assets.forEach(asset => {
        asset.metadata.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      // Sort by count and return top tags
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
        
      return sortedTags;
    } catch (error) {
      console.error('Error getting popular tags:', error);
      return [];
    }
  }
}

// Create singleton instance
const assetsService = new AssetsService();

export default assetsService;
