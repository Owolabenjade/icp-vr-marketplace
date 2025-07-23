// Export all services
export { default as icpService } from './icp';
export { default as usersService } from './users';
export { default as assetsService } from './assets';
export { default as marketplaceService } from './marketplace';

// Export specific utilities from ICP service
export { 
  auth, 
  actors, 
  canister, 
  network, 
  errors, 
  transform, 
  dev 
} from './icp';

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
  getCurrentUser: () => usersService.getCurrentUser(),
  updateProfile: (data) => usersService.updateUser(data),
  
  // Asset operations
  getAssets: (filters) => assetsService.searchAssets(filters),
  getAsset: (id) => assetsService.getAsset(id),
  createAsset: (data) => assetsService.createAsset(data),
  
  // Marketplace operations
  getListings: (filters) => marketplaceService.getListings(filters),
  purchaseAsset: (data) => marketplaceService.purchaseAsset(data),
  createListing: (data) => marketplaceService.createListing(data),
  
  // Common data fetching
  getMarketplaceData: async () => {
    const [listings, featuredAssets, stats] = await Promise.all([
      marketplaceService.getActiveListings(1, 10),
      assetsService.getFeaturedAssets(8),
      marketplaceService.getMarketplaceStats(),
    ]);
    
    return { listings, featuredAssets, stats };
  },
  
  getUserDashboardData: async () => {
    const [user, myAssets, myListings, transactionHistory] = await Promise.all([
      usersService.getCurrentUser(),
      assetsService.getMyAssets(),
      marketplaceService.getMyListings(),
      marketplaceService.getMyTransactionHistory(),
    ]);
    
    return { user, myAssets, myListings, transactionHistory };
  },
};

export default services;
