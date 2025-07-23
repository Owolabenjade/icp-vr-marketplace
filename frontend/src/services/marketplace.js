import { canister, transform, errors } from './icp';
import { validateFormData, createListingSchema, updateListingSchema, purchaseSchema } from '../utils/validation';
import { icpUtils } from '../utils/helpers';

/**
* Marketplace Service - Handles all marketplace operations
*/
class MarketplaceService {
 constructor() {
   this.canisterName = 'marketplace';
 }

 /**
  * Create a new listing
  */
 async createListing(listingData) {
   try {
     // Validate input data
     const validation = await validateFormData(createListingSchema, listingData);
     if (!validation.success) {
       throw new Error(Object.values(validation.errors)[0]);
     }

     // Transform price to e8s
     const transformedData = {
       ...validation.data,
       price: icpUtils.toE8s(validation.data.price),
     };

     const result = await canister.call(this.canisterName, 'createListing', [transformedData]);
     return this.transformListingResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get listing by ID
  */
 async getListing(listingId) {
   try {
     const result = await canister.query(this.canisterName, 'getListing', [listingId]);
     return this.transformListingResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get all active listings
  */
 async getActiveListings(page = 1, limit = 20) {
   try {
     const result = await canister.query(this.canisterName, 'getActiveListings', []);
     const listings = result.map(listing => this.transformListingResponse(listing));
     
     // Client-side pagination
     const startIndex = (page - 1) * limit;
     const endIndex = startIndex + limit;
     
     return {
       listings: listings.slice(startIndex, endIndex),
       totalCount: listings.length,
       totalPages: Math.ceil(listings.length / limit),
       currentPage: page,
       hasNextPage: endIndex < listings.length,
       hasPrevPage: startIndex > 0,
     };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get listings with filters
  */
 async getListings(filters = {}) {
   try {
     // Transform filters for canister call
     const transformedFilters = this.transformListingFilters(filters);
     
     const result = await canister.query(this.canisterName, 'getListings', [transformedFilters]);
     const listings = result.map(listing => this.transformListingResponse(listing));
     
     // Apply client-side sorting if needed
     const sortedListings = this.sortListings(listings, filters.sortBy || 'newest');
     
     return {
       listings: sortedListings,
       totalCount: sortedListings.length,
       filters,
     };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get listings by seller
  */
 async getListingsBySeller(sellerId) {
   try {
     const result = await canister.query(this.canisterName, 'getListingsBySeller', [sellerId]);
     return result.map(listing => this.transformListingResponse(listing));
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get current user's listings
  */
 async getMyListings() {
   try {
     const result = await canister.call(this.canisterName, 'getMyListings', []);
     return result.map(listing => this.transformListingResponse(listing));
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Update listing
  */
 async updateListing(listingId, updateData) {
   try {
     // Validate input data
     const validation = await validateFormData(updateListingSchema, updateData);
     if (!validation.success) {
       throw new Error(Object.values(validation.errors)[0]);
     }

     // Transform price to e8s if provided
     const transformedData = { ...validation.data };
     if (transformedData.price !== undefined) {
       transformedData.price = icpUtils.toE8s(transformedData.price);
     }

     const result = await canister.call(this.canisterName, 'updateListing', [listingId, transformedData]);
     return this.transformListingResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Delete (deactivate) listing
  */
 async deleteListing(listingId) {
   try {
     await canister.call(this.canisterName, 'deleteListing', [listingId]);
     return { success: true };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Purchase asset
  */
 async purchaseAsset(purchaseData) {
   try {
     // Validate input data
     const validation = await validateFormData(purchaseSchema, purchaseData);
     if (!validation.success) {
       throw new Error(Object.values(validation.errors)[0]);
     }

     // Transform payment method to variant format
     const transformedData = {
       ...validation.data,
       paymentMethod: { [validation.data.paymentMethod]: null },
     };

     const result = await canister.call(this.canisterName, 'purchaseAsset', [transformedData]);
     return this.transformPurchaseResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get user's transaction history
  */
 async getMyTransactionHistory() {
   try {
     const result = await canister.call(this.canisterName, 'getMyTransactionHistory', []);
     return this.transformTransactionHistoryResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get transaction by ID
  */
 async getTransaction(transactionId) {
   try {
     const result = await canister.query(this.canisterName, 'getTransaction', [transactionId]);
     return this.transformTransactionResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get purchase record by ID
  */
 async getPurchaseRecord(purchaseId) {
   try {
     const result = await canister.query(this.canisterName, 'getPurchaseRecord', [purchaseId]);
     return this.transformPurchaseResponse(result);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get marketplace statistics
  */
 async getMarketplaceStats() {
   try {
     const result = await canister.query(this.canisterName, 'getMarketplaceStats', []);
     const stats = transform.bigIntToNumber(result);
     
     // Add formatted values
     return {
       ...stats,
       totalVolumeFormatted: icpUtils.format(stats.totalVolume),
       totalFeesFormatted: icpUtils.format(stats.totalFees),
       averageTransactionValue: stats.totalTransactions > 0 
         ? stats.totalVolume / stats.totalTransactions 
         : 0,
     };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get featured listings
  */
 async getFeaturedListings(limit = 10) {
   try {
     const result = await canister.query(this.canisterName, 'getFeaturedListings', []);
     const listings = result.map(listing => this.transformListingResponse(listing));
     return listings.slice(0, limit);
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Search listings by title/description
  */
 async searchListings(searchTerm, filters = {}) {
   try {
     const result = await canister.query(this.canisterName, 'searchListings', [searchTerm]);
     let listings = result.map(listing => this.transformListingResponse(listing));
     
     // Apply additional filters
     if (filters.category) {
       listings = listings.filter(listing => 
         listing.asset.metadata.category === filters.category
       );
     }
     
     if (filters.minPrice !== undefined) {
       const minPriceE8s = icpUtils.toE8s(filters.minPrice);
       listings = listings.filter(listing => listing.price >= minPriceE8s);
     }
     
     if (filters.maxPrice !== undefined) {
       const maxPriceE8s = icpUtils.toE8s(filters.maxPrice);
       listings = listings.filter(listing => listing.price <= maxPriceE8s);
     }
     
     // Sort results
     const sortedListings = this.sortListings(listings, filters.sortBy || 'relevance');
     
     return {
       listings: sortedListings,
       totalCount: sortedListings.length,
       searchTerm,
       filters,
     };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Get sales analytics for seller
  */
 async getSalesAnalytics(sellerId, timeframe = 'all') {
   try {
     // Get user's transaction history
     const history = await this.getMyTransactionHistory();
     
     // Filter sales (where user is seller)
     const sales = history.sales || [];
     
     // Filter by timeframe
     let filteredSales = sales;
     if (timeframe !== 'all') {
       const now = Date.now();
       const timeframeLimits = {
         'day': 24 * 60 * 60 * 1000,
         'week': 7 * 24 * 60 * 60 * 1000,
         'month': 30 * 24 * 60 * 60 * 1000,
         'year': 365 * 24 * 60 * 60 * 1000,
       };
       
       const limit = timeframeLimits[timeframe];
       if (limit) {
         filteredSales = sales.filter(sale => 
           (now - Number(sale.timestamp) / 1_000_000) <= limit
         );
       }
     }
     
     // Calculate analytics
     const totalSales = filteredSales.length;
     const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price, 0);
     const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;
     
     // Group by asset for top-selling assets
     const assetSales = {};
     filteredSales.forEach(sale => {
       const assetId = sale.asset.metadata.id;
       if (!assetSales[assetId]) {
         assetSales[assetId] = {
           asset: sale.asset,
           salesCount: 0,
           totalRevenue: 0,
         };
       }
       assetSales[assetId].salesCount += 1;
       assetSales[assetId].totalRevenue += sale.price;
     });
     
     const topAssets = Object.values(assetSales)
       .sort((a, b) => b.salesCount - a.salesCount)
       .slice(0, 10);
     
     return {
       timeframe,
       totalSales,
       totalRevenue,
       totalRevenueFormatted: icpUtils.format(totalRevenue),
       averageSalePrice,
       averageSalePriceFormatted: icpUtils.format(averageSalePrice),
       topSellingAssets: topAssets,
       recentSales: filteredSales.slice(0, 10),
     };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Check if user can purchase a specific listing
  */
 async canPurchaseListing(listingId) {
   try {
     const listing = await this.getListing(listingId);
     
     // Check if listing is active
     if (!listing.isActive) {
       return { canPurchase: false, reason: 'Listing is not active' };
     }
     
     // Additional checks could include:
     // - Check if user has sufficient funds
     // - Check if user already owns the asset
     // - Check if user is not the seller
     
     return { canPurchase: true, listing };
   } catch (error) {
     return { canPurchase: false, reason: error.message };
   }
 }

 /**
  * Estimate transaction fees
  */
 async estimateTransactionFees(price) {
   try {
     const priceE8s = icpUtils.toE8s(price);
     
     // 2.5% marketplace fee (as defined in marketplace canister)
     const marketplaceFee = Math.floor(priceE8s * 0.025);
     
     // ICP network fee (estimate)
     const networkFee = 10000; // 0.0001 ICP in e8s
     
     const totalFees = marketplaceFee + networkFee;
     const sellerReceives = priceE8s - marketplaceFee;
     
     return {
       price: priceE8s,
       marketplaceFee,
       networkFee,
       totalFees,
       sellerReceives,
       formatted: {
         price: icpUtils.format(priceE8s),
         marketplaceFee: icpUtils.format(marketplaceFee),
         networkFee: icpUtils.format(networkFee),
         totalFees: icpUtils.format(totalFees),
         sellerReceives: icpUtils.format(sellerReceives),
       },
     };
   } catch (error) {
     throw new Error('Failed to estimate transaction fees');
   }
 }

 /**
  * Helper: Transform listing response from canister
  */
 transformListingResponse(listing) {
   const transformed = transform.bigIntToNumber(listing);
   
   // Convert e8s price back to ICP for display
   if (transformed.price) {
     transformed.priceIcp = icpUtils.fromE8s(transformed.price);
     transformed.priceFormatted = icpUtils.format(transformed.price);
   }
   
   // Transform nested asset data
   if (transformed.asset && transformed.asset.price) {
     transformed.asset.priceIcp = icpUtils.fromE8s(transformed.asset.price);
     transformed.asset.priceFormatted = icpUtils.format(transformed.asset.price);
   }
   
   return transformed;
 }

 /**
  * Helper: Transform purchase response from canister
  */
 transformPurchaseResponse(purchase) {
   const transformed = transform.bigIntToNumber(purchase);
   
   // Convert e8s price back to ICP for display
   if (transformed.price) {
     transformed.priceIcp = icpUtils.fromE8s(transformed.price);
     transformed.priceFormatted = icpUtils.format(transformed.price);
   }
   
   // Transform nested asset data
   if (transformed.asset && transformed.asset.price) {
     transformed.asset.priceIcp = icpUtils.fromE8s(transformed.asset.price);
     transformed.asset.priceFormatted = icpUtils.format(transformed.asset.price);
   }
   
   return transformed;
 }

 /**
  * Helper: Transform transaction response from canister
  */
 transformTransactionResponse(transaction) {
   const transformed = transform.bigIntToNumber(transaction);
   
   // Convert e8s amount back to ICP for display
   if (transformed.amount) {
     transformed.amountIcp = icpUtils.fromE8s(transformed.amount);
     transformed.amountFormatted = icpUtils.format(transformed.amount);
   }
   
   // Transform status from variant to string
   if (transformed.status && typeof transformed.status === 'object') {
     transformed.statusString = Object.keys(transformed.status)[0];
   }
   
   // Transform payment method from variant to string
   if (transformed.paymentMethod && typeof transformed.paymentMethod === 'object') {
     transformed.paymentMethodString = Object.keys(transformed.paymentMethod)[0];
   }
   
   return transformed;
 }

 /**
  * Helper: Transform transaction history response from canister
  */
 transformTransactionHistoryResponse(history) {
   const transformed = transform.bigIntToNumber(history);
   
   // Transform purchases array
   if (transformed.purchases) {
     transformed.purchases = transformed.purchases.map(purchase => 
       this.transformPurchaseResponse(purchase)
     );
   }
   
   // Transform sales array
   if (transformed.sales) {
     transformed.sales = transformed.sales.map(sale => 
       this.transformPurchaseResponse(sale)
     );
   }
   
   // Add formatted totals
   if (transformed.totalSpent) {
     transformed.totalSpentFormatted = icpUtils.format(transformed.totalSpent);
   }
   
   if (transformed.totalEarned) {
     transformed.totalEarnedFormatted = icpUtils.format(transformed.totalEarned);
   }
   
   return transformed;
 }

 /**
  * Helper: Transform listing filters for canister call
  */
 transformListingFilters(filters) {
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
  * Helper: Sort listings by different criteria
  */
 sortListings(listings, sortBy) {
   switch (sortBy) {
     case 'newest':
       return listings.sort((a, b) => b.createdAt - a.createdAt);
     case 'oldest':
       return listings.sort((a, b) => a.createdAt - b.createdAt);
     case 'price_low':
       return listings.sort((a, b) => a.price - b.price);
     case 'price_high':
       return listings.sort((a, b) => b.price - a.price);
     case 'popular':
       return listings.sort((a, b) => (b.asset.downloads || 0) - (a.asset.downloads || 0));
     case 'rating':
       return listings.sort((a, b) => (b.asset.rating || 0) - (a.asset.rating || 0));
     case 'title':
       return listings.sort((a, b) => 
         a.asset.metadata.title.localeCompare(b.asset.metadata.title)
       );
     case 'relevance':
     default:
       return listings; // Keep original order for relevance
   }
 }

 /**
  * Helper: Get marketplace insights
  */
 async getMarketplaceInsights() {
   try {
     const [stats, featuredListings] = await Promise.all([
       this.getMarketplaceStats(),
       this.getFeaturedListings(5)
     ]);
     
     return {
       stats,
       featuredListings,
       trends: {
         // Placeholder for trend analysis
         topCategories: [],
         priceRanges: [],
         popularTags: [],
       },
     };
   } catch (error) {
     throw new Error(errors.getUserMessage(error));
   }
 }

 /**
  * Helper: Batch operations for multiple listings
  */
 async batchUpdateListings(updates) {
   try {
     const results = await Promise.allSettled(
       updates.map(({ listingId, updateData }) => 
         this.updateListing(listingId, updateData)
       )
     );
     
     return results.map((result, index) => ({
       listingId: updates[index].listingId,
       success: result.status === 'fulfilled',
       data: result.status === 'fulfilled' ? result.value : null,
       error: result.status === 'rejected' ? result.reason.message : null,
     }));
   } catch (error) {
     throw new Error('Batch update failed');
   }
 }

 /**
  * Helper: Get price recommendations for an asset
  */
 async getPriceRecommendations(assetData) {
   try {
     // Get similar assets for price comparison
     const similarAssets = await this.searchListings('', {
       category: assetData.category,
     });
     
     if (similarAssets.listings.length === 0) {
       return {
         recommended: 5, // Default 5 ICP
         min: 1,
         max: 10,
         confidence: 'low',
         reason: 'No similar assets found for comparison',
       };
     }
     
     const prices = similarAssets.listings.map(listing => listing.priceIcp);
     const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
     const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
     
     const recommended = Math.round((avgPrice + medianPrice) / 2 * 100) / 100;
     const min = Math.max(0.1, recommended * 0.7);
     const max = recommended * 1.5;
     
     return {
       recommended,
       min,
       max,
       confidence: prices.length > 10 ? 'high' : prices.length > 5 ? 'medium' : 'low',
       reason: `Based on ${prices.length} similar assets in ${assetData.category} category`,
       comparableAssets: similarAssets.listings.slice(0, 5),
     };
   } catch (error) {
     console.error('Error getting price recommendations:', error);
     return {
       recommended: 5,
       min: 1,
       max: 10,
       confidence: 'low',
       reason: 'Unable to analyze similar assets',
     };
   }
 }
}

// Create singleton instance
const marketplaceService = new MarketplaceService();

export default marketplaceService;
