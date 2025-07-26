import { useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '../services';
import { errorUtils } from '../utils/helpers';
import { ITEMS_PER_PAGE } from '../utils/constants';

/**
 * useMarketplace Hook - For general marketplace operations
 */
export const useMarketplace = () => {
  const [stats, setStats] = useState(null);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarketplaceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [marketplaceStats, featured] = await Promise.all([
        marketplaceService.getMarketplaceStats(),
        marketplaceService.getFeaturedListings(8),
      ]);

      setStats(marketplaceStats);
      setFeaturedListings(featured);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  return {
    stats,
    featuredListings,
    loading,
    error,
    refresh: fetchMarketplaceData,
  };
};

/**
 * useListings Hook - For fetching and managing listings
 */
export const useListings = (options = {}) => {
  const {
    filters = {},
    sortBy = 'newest',
    page = 1,
    limit = ITEMS_PER_PAGE,
    autoFetch = true,
  } = options;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: page,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchListings = useCallback(async (resetData = true) => {
    try {
      setLoading(true);
      setError(null);

      const searchFilters = {
        ...filters,
        sortBy,
      };

      const result = await marketplaceService.getListings(searchFilters);
      
      // Client-side pagination for now
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedListings = result.listings.slice(startIndex, endIndex);

      if (resetData) {
        setListings(paginatedListings);
      } else {
        setListings(prev => [...prev, ...paginatedListings]);
      }

      setPagination({
        currentPage: page,
        totalPages: Math.ceil(result.totalCount / limit),
        totalCount: result.totalCount,
        hasNextPage: endIndex < result.totalCount,
        hasPrevPage: page > 1,
      });

    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, page, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchListings();
    }
  }, [fetchListings, autoFetch]);

  const refresh = () => fetchListings(true);
  const loadMore = () => fetchListings(false);

  return {
    listings,
    loading,
    error,
    pagination,
    refresh,
    loadMore,
    fetchListings,
  };
};

/**
 * useListing Hook - For fetching a single listing
 */
export const useListing = (listingId) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchListing = useCallback(async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.getListing(listingId);
      setListing(result);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return {
    listing,
    loading,
    error,
    refresh: fetchListing,
  };
};

/**
 * useMyListings Hook - For fetching current user's listings
 */
export const useMyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.getMyListings();
      setListings(result);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    refresh: fetchListings,
  };
};

/**
 * useListingActions Hook - For listing management actions
 */
export const useListingActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createListing = useCallback(async (listingData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.createListing(listingData);
      return { success: true, listing: result };
    } catch (err) {
      console.error('Error creating listing:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (listingId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.updateListing(listingId, updateData);
      return { success: true, listing: result };
    } catch (err) {
      console.error('Error updating listing:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (listingId) => {
    try {
      setLoading(true);
      setError(null);

      await marketplaceService.deleteListing(listingId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting listing:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createListing,
    updateListing,
    deleteListing,
    loading,
    error,
  };
};

/**
 * usePurchase Hook - For handling asset purchases
 */
export const usePurchase = () => {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  const purchaseAsset = useCallback(async (purchaseData) => {
    try {
      setPurchasing(true);
      setError(null);

      const result = await marketplaceService.purchaseAsset(purchaseData);
      return { success: true, purchase: result };
    } catch (err) {
      console.error('Purchase error:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setPurchasing(false);
    }
  }, []);

  const canPurchase = useCallback(async (listingId) => {
    try {
      const result = await marketplaceService.canPurchaseListing(listingId);
      return result;
    } catch (err) {
      console.error('Error checking purchase eligibility:', err);
      return { canPurchase: false, reason: errorUtils.getUserMessage(err) };
    }
  }, []);

  const estimateFees = useCallback(async (price) => {
    try {
      const result = await marketplaceService.estimateTransactionFees(price);
      return result;
    } catch (err) {
      console.error('Error estimating fees:', err);
      return null;
    }
  }, []);

  return {
    purchaseAsset,
    canPurchase,
    estimateFees,
    purchasing,
    error,
  };
};

/**
 * useTransactionHistory Hook - For fetching user's transaction history
 */
export const useTransactionHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.getMyTransactionHistory();
      setHistory(result);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refresh: fetchHistory,
  };
};

/**
 * useTransaction Hook - For fetching a specific transaction
 */
export const useTransaction = (transactionId) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.getTransaction(transactionId);
      setTransaction(result);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    loading,
    error,
    refresh: fetchTransaction,
  };
};

/**
 * useSalesAnalytics Hook - For seller analytics
 */
export const useSalesAnalytics = (timeframe = 'all') => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.getSalesAnalytics(null, timeframe);
      setAnalytics(result);
    } catch (err) {
      console.error('Error fetching sales analytics:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};

/**
 * useMarketplaceSearch Hook - For marketplace search functionality
 */
export const useMarketplaceSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const searchListings = useCallback(async (query, filters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await marketplaceService.searchListings(query, filters);
      setSearchResults(result.listings || []);
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)];
        return newHistory.slice(0, 10); // Keep last 10 searches
      });

    } catch (err) {
      console.error('Marketplace search error:', err);
      setError(errorUtils.getUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    searchListings,
    searchResults,
    loading,
    error,
    searchHistory,
    clearResults,
    clearHistory,
  };
};

/**
 * usePriceRecommendations Hook - For getting pricing suggestions
 */
export const usePriceRecommendations = (assetData) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    if (!assetData?.category) return;

    try {
      setLoading(true);
      const result = await marketplaceService.getPriceRecommendations(assetData);
      setRecommendations(result);
    } catch (err) {
      console.error('Error fetching price recommendations:', err);
      setRecommendations({
        recommended: 5,
        min: 1,
        max: 10,
        confidence: 'low',
        reason: 'Unable to fetch recommendations',
      });
    } finally {
      setLoading(false);
    }
  }, [assetData]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    refresh: fetchRecommendations,
  };
};

export default useMarketplace;
