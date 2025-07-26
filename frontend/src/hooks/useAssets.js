import { useState, useEffect, useCallback } from 'react';
import { assetsService } from '../services';
import { errorUtils } from '../utils/helpers';
import { ITEMS_PER_PAGE } from '../utils/constants';

/**
 * useAssets Hook - For fetching and managing assets with filters
 */
export const useAssets = (options = {}) => {
  const {
    filters = {},
    sortBy = 'newest',
    page = 1,
    limit = ITEMS_PER_PAGE,
    autoFetch = true,
  } = options;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: page,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchAssets = useCallback(async (resetData = true) => {
    try {
      setLoading(true);
      setError(null);

      const searchFilters = {
        ...filters,
        sortBy,
      };

      let result;
      
      // Use different fetch methods based on filters
      if (filters.query) {
        result = await assetsService.searchAssets(searchFilters);
      } else if (filters.category) {
        result = await assetsService.getAssetsByCategory(filters.category, page, limit);
      } else {
        result = await assetsService.getAllAssets(page, limit);
      }

      if (resetData) {
        setAssets(result.assets || []);
      } else {
        setAssets(prev => [...prev, ...(result.assets || [])]);
      }

      setPagination({
        currentPage: result.currentPage || page,
        totalPages: result.totalPages || 0,
        totalCount: result.totalCount || 0,
        hasNextPage: result.hasNextPage || false,
        hasPrevPage: result.hasPrevPage || false,
      });

    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, page, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchAssets();
    }
  }, [fetchAssets, autoFetch]);

  const refresh = () => fetchAssets(true);
  const loadMore = () => fetchAssets(false);

  return {
    assets,
    loading,
    error,
    pagination,
    refresh,
    loadMore,
    fetchAssets,
  };
};

/**
 * useAsset Hook - For fetching a single asset
 */
export const useAsset = (assetId, withOwnership = false) => {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAsset = useCallback(async () => {
    if (!assetId) return;

    try {
      setLoading(true);
      setError(null);

      const result = withOwnership 
        ? await assetsService.getAssetWithOwnership(assetId)
        : await assetsService.getAsset(assetId);
        
      setAsset(result);
    } catch (err) {
      console.error('Error fetching asset:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [assetId, withOwnership]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return {
    asset,
    loading,
    error,
    refresh: fetchAsset,
  };
};

/**
 * useMyAssets Hook - For fetching current user's assets
 */
export const useMyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getMyAssets();
      setAssets(result);
    } catch (err) {
      console.error('Error fetching my assets:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refresh: fetchAssets,
  };
};

/**
 * useOwnedAssets Hook - For fetching user's owned assets
 */
export const useOwnedAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getOwnedAssets();
      setAssets(result);
    } catch (err) {
      console.error('Error fetching owned assets:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refresh: fetchAssets,
  };
};

/**
 * useAssetActions Hook - For asset management actions
 */
export const useAssetActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAsset = useCallback(async (assetData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.createAsset(assetData);
      return { success: true, asset: result };
    } catch (err) {
      console.error('Error creating asset:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (assetId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.updateAsset(assetId, updateData);
      return { success: true, asset: result };
    } catch (err) {
      console.error('Error updating asset:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkOwnership = useCallback(async (assetId) => {
    try {
      const result = await assetsService.checkOwnership(assetId);
      return result;
    } catch (err) {
      console.error('Error checking ownership:', err);
      return false;
    }
  }, []);

  return {
    createAsset,
    updateAsset,
    checkOwnership,
    loading,
    error,
  };
};

/**
 * useAssetUpload Hook - For handling asset file uploads
 */
export const useAssetUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadAssetFile = useCallback(async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const result = await assetsService.uploadAssetFile(file, (progress) => {
        setUploadProgress(progress);
      });

      return { success: true, upload: result };
    } catch (err) {
      console.error('Error uploading asset file:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const uploadPreviewImage = useCallback(async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const result = await assetsService.uploadPreviewImage(file, (progress) => {
        setUploadProgress(progress);
      });

      return { success: true, upload: result };
    } catch (err) {
      console.error('Error uploading preview image:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    uploadAssetFile,
    uploadPreviewImage,
    uploading,
    uploadProgress,
    error,
    resetUpload,
  };
};

/**
 * useFeaturedAssets Hook - For fetching featured assets
 */
export const useFeaturedAssets = (limit = 10) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getFeaturedAssets(limit);
      setAssets(result);
    } catch (err) {
      console.error('Error fetching featured assets:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refresh: fetchAssets,
  };
};

/**
 * useTrendingAssets Hook - For fetching trending assets
 */
export const useTrendingAssets = (limit = 10) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getTrendingAssets(limit);
      setAssets(result);
    } catch (err) {
      console.error('Error fetching trending assets:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refresh: fetchAssets,
  };
};

/**
 * useAssetStats Hook - For fetching asset statistics
 */
export const useAssetStats = (assetId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!assetId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getAssetStats(assetId);
      setStats(result);
    } catch (err) {
      console.error('Error fetching asset stats:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};

/**
 * useAssetCategories Hook - For fetching category data
 */
export const useAssetCategories = () => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategoryCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getCategoryCounts();
      setCategoryCounts(result);
    } catch (err) {
      console.error('Error fetching category counts:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts]);

  return {
    categoryCounts,
    loading,
    error,
    refresh: fetchCategoryCounts,
  };
};

/**
 * usePopularTags Hook - For fetching popular tags
 */
export const usePopularTags = (limit = 20) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await assetsService.getPopularTags(limit);
      setTags(result);
    } catch (err) {
      console.error('Error fetching popular tags:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    refresh: fetchTags,
  };
};

/**
 * Asset utilities for hooks
 */
export const assetUtils = {
  // Filter assets by criteria
  filterAssets: (assets, criteria) => {
    return assets.filter(asset => {
      if (criteria.category && asset.metadata.category !== criteria.category) {
        return false;
      }
      if (criteria.minPrice && asset.price < criteria.minPrice) {
        return false;
      }
      if (criteria.maxPrice && asset.price > criteria.maxPrice) {
        return false;
      }
      if (criteria.tags && criteria.tags.length > 0) {
        const hasMatchingTag = criteria.tags.some(tag =>
          asset.metadata.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      if (criteria.search) {
        const searchLower = criteria.search.toLowerCase();
        const titleMatch = asset.metadata.title.toLowerCase().includes(searchLower);
        const descMatch = asset.metadata.description.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });
  },

  // Sort assets by criteria
  sortAssets: (assets, sortBy) => {
    const sorted = [...assets];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => b.downloads - a.downloads);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'title':
        return sorted.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
      default:
        return sorted;
    }
  },

  // Group assets by category
  groupByCategory: (assets) => {
    return assets.reduce((groups, asset) => {
      const category = asset.metadata.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(asset);
      return groups;
    }, {});
  },

  // Get unique tags from assets
  extractTags: (assets) => {
    const allTags = assets.flatMap(asset => asset.metadata.tags);
    return [...new Set(allTags)].sort();
  },

  // Calculate price statistics
  getPriceStats: (assets) => {
    if (assets.length === 0) return null;

    const prices = assets.map(asset => asset.price).sort((a, b) => a - b);
    const sum = prices.reduce((acc, price) => acc + price, 0);

    return {
      min: prices[0],
      max: prices[prices.length - 1],
      average: sum / prices.length,
      median: prices[Math.floor(prices.length / 2)],
      total: sum,
    };
  },
};

export default useAssets;
