// SSR-safe service exports
let icpService = null;
let usersService = null;
let assetsService = null;
let marketplaceService = null;

// Initialize services only in browser
if (typeof window !== 'undefined') {
  try {
    icpService = require('./icp').default;
    usersService = require('./users').default;
    assetsService = require('./assets').default;
    marketplaceService = require('./marketplace').default;
  } catch (error) {
    console.warn('Failed to load services:', error);
  }
}

// Export individual services with null fallbacks for SSR
export { icpService };
export { usersService };
export { assetsService };
export { marketplaceService };

// Export specific utilities from ICP service with SSR safety
export const auth = {
  login: () => {
    if (!icpService) return Promise.reject(new Error('ICP service not available'));
    const { auth } = require('./icp');
    return auth.login();
  },
  logout: () => {
    if (!icpService) return Promise.reject(new Error('ICP service not available'));
    const { auth } = require('./icp');
    return auth.logout();
  },
  isAuthenticated: () => {
    if (!icpService) return false;
    const { auth } = require('./icp');
    return auth.isAuthenticated();
  },
  getPrincipal: () => {
    if (!icpService) return null;
    const { auth } = require('./icp');
    return auth.getPrincipal();
  },
  getIdentity: () => {
    if (!icpService) return null;
    const { auth } = require('./icp');
    return auth.getIdentity();
  },
  waitForAuth: () => {
    if (!icpService) return Promise.resolve(false);
    const { auth } = require('./icp');
    return auth.waitForAuth();
  },
  onSessionTimeout: (callback) => {
    if (!icpService) return () => {};
    const { auth } = require('./icp');
    return auth.onSessionTimeout(callback);
  },
};

export const actors = {
  get: (canisterName) => {
    if (!icpService) return null;
    const { actors } = require('./icp');
    return actors.get(canisterName);
  },
  getAll: () => {
    if (!icpService) return {};
    const { actors } = require('./icp');
    return actors.getAll();
  },
  reinit: () => {
    if (!icpService) return;
    const { actors } = require('./icp');
    return actors.reinit();
  },
  exists: (canisterName) => {
    if (!icpService) return false;
    const { actors } = require('./icp');
    return actors.exists(canisterName);
  },
};

export const canister = {
  call: (canisterName, method, args) => {
    if (!icpService) return Promise.reject(new Error('ICP service not available'));
    const { canister } = require('./icp');
    return canister.call(canisterName, method, args);
  },
  query: (canisterName, method, args) => {
    if (!icpService) return Promise.reject(new Error('ICP service not available'));
    const { canister } = require('./icp');
    return canister.query(canisterName, method, args);
  },
  batch: (calls) => {
    if (!icpService) return Promise.reject(new Error('ICP service not available'));
    const { canister } = require('./icp');
    return canister.batch(calls);
  },
  retry: (canisterName, method, args, maxRetries) => {
    if (!icpService) return Promise.reject(new Error('ICP service not available'));
    const { canister } = require('./icp');
    return canister.retry(canisterName, method, args, maxRetries);
  },
};

export const network = {
  getConfig: () => {
    const { getNetworkConfig } = require('../utils/constants');
    return getNetworkConfig();
  },
  isLocal: () => {
    if (!icpService) return true;
    const { network } = require('./icp');
    return network.isLocal();
  },
  isMainnet: () => {
    if (!icpService) return false;
    const { network } = require('./icp');
    return network.isMainnet();
  },
  getCanisterUrl: (canisterId) => {
    if (!icpService) return `http://127.0.0.1:4943/?canisterId=${canisterId}`;
    const { network } = require('./icp');
    return network.getCanisterUrl(canisterId);
  },
  checkConnectivity: () => {
    if (!icpService) return Promise.resolve(false);
    const { network } = require('./icp');
    return network.checkConnectivity();
  },
};

export const errors = {
  parse: (error) => {
    const { errorUtils } = require('../utils/helpers');
    return errorUtils.parseError(error);
  },
  isNetworkError: (error) => {
    const { errorUtils } = require('../utils/helpers');
    return errorUtils.isNetworkError(error);
  },
  isAuthError: (error) => {
    const { errorUtils } = require('../utils/helpers');
    return errorUtils.isAuthError(error);
  },
  getUserMessage: (error) => {
    const { errorUtils } = require('../utils/helpers');
    return errorUtils.getUserMessage(error);
  },
};

export const transform = {
  bigIntToNumber: (obj) => {
    if (!icpService) return obj;
    const { transform } = require('./icp');
    return transform.bigIntToNumber(obj);
  },
  numberToBigInt: (obj, bigIntFields) => {
    if (!icpService) return obj;
    const { transform } = require('./icp');
    return transform.numberToBigInt(obj, bigIntFields);
  },
  formatPrincipal: (principal) => {
    if (!icpService) return 'Unknown';
    const { transform } = require('./icp');
    return transform.formatPrincipal(principal);
  },
  timestampToDate: (timestamp) => {
    return new Date(Number(timestamp) / 1_000_000);
  },
  dateToTimestamp: (date) => {
    return BigInt(date.getTime() * 1_000_000);
  },
};

export const dev = {
  enableDebug: () => {
    if (!icpService) return;
    const { dev } = require('./icp');
    return dev.enableDebug();
  },
  getService: () => {
    if (!icpService) return null;
    const { dev } = require('./icp');
    return dev.getService();
  },
  logState: () => {
    if (!icpService) {
      console.log('ICP Service not available (SSR environment)');
      return;
    }
    const { dev } = require('./icp');
    return dev.logState();
  },
  testConnection: () => {
    if (!icpService) return Promise.resolve({ error: 'Not available during SSR' });
    const { dev } = require('./icp');
    return dev.testConnection();
  },
};

// Service factory for getting all services in one place
export const services = {
  icp: icpService,
  users: usersService,
  assets: assetsService,
  marketplace: marketplaceService,
};

// Convenience functions for common operations
export const api = {
  // Authentication
  login: () => auth.login(),
  logout: () => auth.logout(),
  isAuthenticated: () => auth.isAuthenticated(),

  // User operations
  getCurrentUser: () => {
    if (!usersService) return Promise.reject(new Error('Users service not available'));
    return usersService.getCurrentUser();
  },
  updateProfile: (data) => {
    if (!usersService) return Promise.reject(new Error('Users service not available'));
    return usersService.updateUser(data);
  },

  // Asset operations
  getAssets: (filters) => {
    if (!assetsService) return Promise.reject(new Error('Assets service not available'));
    return assetsService.searchAssets(filters);
  },
  getAsset: (id) => {
    if (!assetsService) return Promise.reject(new Error('Assets service not available'));
    return assetsService.getAsset(id);
  },
  createAsset: (data) => {
    if (!assetsService) return Promise.reject(new Error('Assets service not available'));
    return assetsService.createAsset(data);
  },

  // Marketplace operations
  getListings: (filters) => {
    if (!marketplaceService) return Promise.reject(new Error('Marketplace service not available'));
    return marketplaceService.getListings(filters);
  },
  purchaseAsset: (data) => {
    if (!marketplaceService) return Promise.reject(new Error('Marketplace service not available'));
    return marketplaceService.purchaseAsset(data);
  },
  createListing: (data) => {
    if (!marketplaceService) return Promise.reject(new Error('Marketplace service not available'));
    return marketplaceService.createListing(data);
  },

  // Common data fetching
  getMarketplaceData: async () => {
    if (!marketplaceService || !assetsService) {
      return { listings: [], featuredAssets: [], stats: null };
    }
    
    try {
      const [listings, featuredAssets, stats] = await Promise.all([
        marketplaceService.getActiveListings(1, 10),
        assetsService.getFeaturedAssets(8),
        marketplaceService.getMarketplaceStats(),
      ]);

      return { listings, featuredAssets, stats };
    } catch (error) {
      console.error('Failed to get marketplace data:', error);
      return { listings: [], featuredAssets: [], stats: null };
    }
  },

  getUserDashboardData: async () => {
    if (!usersService || !assetsService || !marketplaceService) {
      return { user: null, myAssets: [], myListings: [], transactionHistory: [] };
    }

    try {
      const [user, myAssets, myListings, transactionHistory] = await Promise.all([
        usersService.getCurrentUser(),
        assetsService.getMyAssets(),
        marketplaceService.getMyListings(),
        marketplaceService.getMyTransactionHistory(),
      ]);

      return { user, myAssets, myListings, transactionHistory };
    } catch (error) {
      console.error('Failed to get user dashboard data:', error);
      return { user: null, myAssets: [], myListings: [], transactionHistory: [] };
    }
  },
};

export default services;
