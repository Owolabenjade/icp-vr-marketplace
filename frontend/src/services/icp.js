import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { getNetworkConfig, CANISTER_IDS } from '../utils/constants';
import { errorUtils } from '../utils/helpers';

/**
* ICP Agent and Authentication Service
*/
class ICPService {
 constructor() {
   this.agent = null;
   this.authClient = null;
   this.isAuthenticated = false;
   this.identity = null;
   this.principal = null;
   this.actors = {};
   this.initialized = false;

   // Only initialize in browser environment
   if (typeof window !== 'undefined') {
     this.init();
   }
 }

 /**
  * Initialize the ICP service
  */
 async init() {
   if (this.initialized) return;
   
   try {
     await this.initAuthClient();
     await this.initAgent();
     await this.checkAuthentication();
     this.initialized = true;
   } catch (error) {
     console.error('Failed to initialize ICP service:', error);
   }
 }

 /**
  * Initialize Auth Client
  */
 async initAuthClient() {
   if (typeof window === 'undefined') {
     console.warn('AuthClient can only be initialized in browser environment');
     return;
   }

   this.authClient = await AuthClient.create({
     idleOptions: {
       idleTimeout: 1000 * 60 * 30, // 30 minutes
       disableDefaultIdleCallback: true,
       onIdle: () => {
         this.handleSessionTimeout();
       },
     },
   });
 }

 /**
  * Initialize HTTP Agent
  */
 async initAgent() {
   const network = getNetworkConfig();

   this.agent = new HttpAgent({
     host: network.host,
     identity: this.identity,
   });

   // Disable certificate verification for local development
   if (network.host.includes('localhost') || network.host.includes('127.0.0.1')) {
     await this.agent.fetchRootKey();
   }
 }

 /**
  * Check if user is authenticated
  */
 async checkAuthentication() {
   if (!this.authClient || typeof window === 'undefined') {
     return false;
   }

   this.isAuthenticated = await this.authClient.isAuthenticated();

   if (this.isAuthenticated) {
     this.identity = this.authClient.getIdentity();
     this.principal = this.identity.getPrincipal();

     // Update agent with authenticated identity
     this.agent.replaceIdentity(this.identity);

     return true;
   }

   return false;
 }

 /**
  * Login with Internet Identity
  */
 async login() {
   if (typeof window === 'undefined') {
     throw new Error('Login can only be performed in browser environment');
   }

   try {
     if (!this.authClient) {
       await this.init();
     }

     if (!this.authClient) {
       throw new Error('Auth client not initialized');
     }

     const network = getNetworkConfig();

     return new Promise((resolve, reject) => {
       this.authClient.login({
         identityProvider: network.identityProvider,
         onSuccess: async () => {
           await this.checkAuthentication();
           this.initActors(); // Initialize actors after login
           resolve({
             success: true,
             principal: this.principal?.toString(),
             identity: this.identity,
           });
         },
         onError: (error) => {
           console.error('Login failed:', error);
           reject(new Error('Login failed'));
         },
       });
     });
   } catch (error) {
     console.error('Login error:', error);
     throw new Error(errorUtils.parseError(error));
   }
 }

 /**
  * Logout
  */
 async logout() {
   try {
     if (this.authClient) {
       await this.authClient.logout();
     }

     this.isAuthenticated = false;
     this.identity = null;
     this.principal = null;
     this.actors = {};

     // Reset agent to anonymous
     await this.initAgent();

     return { success: true };
   } catch (error) {
     console.error('Logout error:', error);
     throw new Error(errorUtils.parseError(error));
   }
 }

 /**
  * Handle session timeout
  */
 handleSessionTimeout() {
   console.warn('Session timed out');
   this.logout();

   // Emit event for UI to handle
   if (typeof window !== 'undefined') {
     window.dispatchEvent(new CustomEvent('session-timeout'));
   }
 }

 /**
  * Get user principal
  */
 getPrincipal() {
   return this.principal?.toString() || null;
 }

 /**
  * Get user identity
  */
 getIdentity() {
   return this.identity;
 }

 /**
  * Check if user is authenticated
  */
 isUserAuthenticated() {
   return this.isAuthenticated && this.principal && !this.principal.isAnonymous();
 }

 /**
  * Initialize actors for all canisters
  */
 initActors() {
   try {
     // Initialize marketplace actor
     if (CANISTER_IDS.marketplace) {
       this.actors.marketplace = this.createActor(
         CANISTER_IDS.marketplace,
         this.getMarketplaceIDL()
       );
     }

     // Initialize assets actor
     if (CANISTER_IDS.assets) {
       this.actors.assets = this.createActor(
         CANISTER_IDS.assets,
         this.getAssetsIDL()
       );
     }

     // Initialize users actor
     if (CANISTER_IDS.users) {
       this.actors.users = this.createActor(
         CANISTER_IDS.users,
         this.getUsersIDL()
       );
     }
   } catch (error) {
     console.error('Failed to initialize actors:', error);
   }
 }

 /**
  * Create actor for a canister
  */
 createActor(canisterId, idl) {
   try {
     return Actor.createActor(idl, {
       agent: this.agent,
       canisterId: Principal.fromText(canisterId),
     });
   } catch (error) {
     console.error(`Failed to create actor for canister ${canisterId}:`, error);
     return null;
   }
 }

 /**
  * Get actor for a specific canister
  */
 getActor(canisterName) {
   const actor = this.actors[canisterName];
   if (!actor) {
     console.warn(`Actor for ${canisterName} not found`);
     return null;
   }
   return actor;
 }

 /**
  * Make authenticated call to canister
  */
 async call(canisterName, method, args = []) {
   try {
     if (!this.isUserAuthenticated()) {
       throw new Error('User not authenticated');
     }

     const actor = this.getActor(canisterName);
     if (!actor) {
       throw new Error(`Actor for ${canisterName} not found`);
     }

     const result = await actor[method](...args);
     return this.handleCanisterResponse(result);
   } catch (error) {
     console.error(`Call to ${canisterName}.${method} failed:`, error);
     throw new Error(errorUtils.parseError(error));
   }
 }

 /**
  * Make query call to canister (read-only)
  */
 async query(canisterName, method, args = []) {
   try {
     const actor = this.getActor(canisterName);
     if (!actor) {
       throw new Error(`Actor for ${canisterName} not found`);
     }

     const result = await actor[method](...args);
     return this.handleCanisterResponse(result);
   } catch (error) {
     console.error(`Query to ${canisterName}.${method} failed:`, error);
     throw new Error(errorUtils.parseError(error));
   }
 }

 /**
  * Handle canister response (Result<T, E> pattern)
  */
 handleCanisterResponse(result) {
   if (typeof result === 'object' && result !== null) {
     if ('ok' in result) {
       return result.ok;
     }
     if ('err' in result) {
       throw new Error(this.parseCanisterError(result.err));
     }
   }
   return result;
 }

 /**
  * Parse canister error messages
  */
 parseCanisterError(error) {
   if (typeof error === 'string') {
     return error;
   }

   if (typeof error === 'object' && error !== null) {
     if ('NotFound' in error) return 'Resource not found';
     if ('Unauthorized' in error) return 'Unauthorized access';
     if ('BadRequest' in error) return error.BadRequest || 'Bad request';
     if ('InternalError' in error) return error.InternalError || 'Internal error';
     if ('InsufficientFunds' in error) return 'Insufficient funds';
     if ('AssetNotForSale' in error) return 'Asset not for sale';
     if ('AlreadyOwned' in error) return 'Asset already owned';
   }

   return 'Unknown error occurred';
 }

 /**
  * Get marketplace canister IDL (Interface Description Language)
  * In production, these would be auto-generated from .did files
  */
 getMarketplaceIDL() {
   // Simplified IDL - in production, import from generated declarations
   return ({ IDL }) => {
     const Result = (T, E) => IDL.Variant({ ok: T, err: E });
     const ApiError = IDL.Variant({
       NotFound: IDL.Null,
       Unauthorized: IDL.Null,
       BadRequest: IDL.Text,
       InternalError: IDL.Text,
       InsufficientFunds: IDL.Null,
       AssetNotForSale: IDL.Null,
       AlreadyOwned: IDL.Null,
     });

     return IDL.Service({
       // Add marketplace methods here
       getActiveListings: IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
       createListing: IDL.Func([IDL.Record({})], [Result(IDL.Record({}), ApiError)], []),
       purchaseAsset: IDL.Func([IDL.Record({})], [Result(IDL.Record({}), ApiError)], []),
       // ... other methods
     });
   };
 }

 /**
  * Get assets canister IDL
  */
 getAssetsIDL() {
   return ({ IDL }) => {
     const Result = (T, E) => IDL.Variant({ ok: T, err: E });
     const ApiError = IDL.Variant({
       NotFound: IDL.Null,
       Unauthorized: IDL.Null,
       BadRequest: IDL.Text,
       InternalError: IDL.Text,
     });

     return IDL.Service({
       getAllAssets: IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
       createAsset: IDL.Func([IDL.Record({})], [Result(IDL.Record({}), ApiError)], []),
       getAsset: IDL.Func([IDL.Text], [Result(IDL.Record({}), ApiError)], ['query']),
       // ... other methods
     });
   };
 }

 /**
  * Get users canister IDL
  */
 getUsersIDL() {
   return ({ IDL }) => {
     const Result = (T, E) => IDL.Variant({ ok: T, err: E });
     const ApiError = IDL.Variant({
       NotFound: IDL.Null,
       Unauthorized: IDL.Null,
       BadRequest: IDL.Text,
       InternalError: IDL.Text,
     });

     return IDL.Service({
       getCurrentUser: IDL.Func([], [Result(IDL.Record({}), ApiError)], ['query']),
       createUser: IDL.Func([IDL.Record({})], [Result(IDL.Record({}), ApiError)], []),
       updateUser: IDL.Func([IDL.Record({})], [Result(IDL.Record({}), ApiError)], []),
       // ... other methods
     });
   };
 }

 /**
  * Utility methods
  */

 // Convert BigInt to Number safely
 bigIntToNumber(bigInt) {
   if (typeof bigInt === 'bigint') {
     return Number(bigInt);
   }
   return bigInt;
 }

 // Convert Number to BigInt safely
 numberToBigInt(number) {
   return BigInt(Math.floor(number));
 }

 // Format Principal for display
 formatPrincipal(principal) {
   const principalStr = principal.toString();
   if (principalStr.length > 15) {
     return `${principalStr.slice(0, 5)}...${principalStr.slice(-5)}`;
   }
   return principalStr;
 }

 // Get canister status
 async getCanisterStatus(canisterId) {
   try {
     // This would require management canister access
     // Simplified implementation
     return { status: 'running' };
   } catch (error) {
     console.error('Failed to get canister status:', error);
     return { status: 'unknown' };
   }
 }
}

// Create singleton instance only in browser
let icpService = null;
if (typeof window !== 'undefined') {
  icpService = new ICPService();
}

/**
* Authentication helpers
*/
export const auth = {
 // Login with Internet Identity
 login: () => {
   if (!icpService) throw new Error('ICP service not available');
   return icpService.login();
 },

 // Logout
 logout: () => {
   if (!icpService) throw new Error('ICP service not available');
   return icpService.logout();
 },

 // Check if authenticated
 isAuthenticated: () => {
   if (!icpService) return false;
   return icpService.isUserAuthenticated();
 },

 // Get current user principal
 getPrincipal: () => {
   if (!icpService) return null;
   return icpService.getPrincipal();
 },

 // Get current identity
 getIdentity: () => {
   if (!icpService) return null;
   return icpService.getIdentity();
 },

 // Wait for authentication status
 waitForAuth: () => {
   return new Promise((resolve) => {
     const checkAuth = () => {
       if (icpService && icpService.isUserAuthenticated()) {
         resolve(true);
       } else {
         setTimeout(checkAuth, 100);
       }
     };
     checkAuth();
   });
 },

 // Listen for session timeout
 onSessionTimeout: (callback) => {
   if (typeof window !== 'undefined') {
     window.addEventListener('session-timeout', callback);
     return () => window.removeEventListener('session-timeout', callback);
   }
   return () => {};
 },
};

/**
* Actor management helpers
*/
export const actors = {
 // Get specific actor
 get: (canisterName) => {
   if (!icpService) return null;
   return icpService.getActor(canisterName);
 },

 // Get all actors
 getAll: () => {
   if (!icpService) return {};
   return icpService.actors;
 },

 // Reinitialize actors (useful after login)
 reinit: () => {
   if (!icpService) return;
   return icpService.initActors();
 },

 // Check if actor exists
 exists: (canisterName) => {
   if (!icpService) return false;
   return !!icpService.actors[canisterName];
 },
};

/**
* Canister call helpers
*/
export const canister = {
 // Make authenticated call
 call: (canisterName, method, args) => {
   if (!icpService) throw new Error('ICP service not available');
   return icpService.call(canisterName, method, args);
 },

 // Make query call
 query: (canisterName, method, args) => {
   if (!icpService) throw new Error('ICP service not available');
   return icpService.query(canisterName, method, args);
 },

 // Batch multiple calls
 batch: async (calls) => {
   if (!icpService) throw new Error('ICP service not available');
   
   const results = await Promise.allSettled(
     calls.map(({ canisterName, method, args, type = 'call' }) => {
       return type === 'query'
         ? icpService.query(canisterName, method, args)
         : icpService.call(canisterName, method, args);
     })
   );

   return results.map((result, index) => ({
     ...calls[index],
     success: result.status === 'fulfilled',
     data: result.status === 'fulfilled' ? result.value : null,
     error: result.status === 'rejected' ? result.reason.message : null,
   }));
 },

 // Retry failed calls
 retry: async (canisterName, method, args, maxRetries = 3) => {
   if (!icpService) throw new Error('ICP service not available');
   
   let lastError;

   for (let attempt = 0; attempt < maxRetries; attempt++) {
     try {
       return await icpService.call(canisterName, method, args);
     } catch (error) {
       lastError = error;
       console.warn(`Attempt ${attempt + 1} failed:`, error.message);

       if (attempt < maxRetries - 1) {
         // Exponential backoff
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
       }
     }
   }

   throw lastError;
 },
};

/**
* Network utilities
*/
export const network = {
 // Get current network configuration
 getConfig: () => getNetworkConfig(),

 // Check if local development
 isLocal: () => {
   const config = getNetworkConfig();
   return config.host.includes('localhost') || config.host.includes('127.0.0.1');
 },

 // Check if mainnet
 isMainnet: () => {
   const config = getNetworkConfig();
   return config.host.includes('icp0.io') || config.host.includes('ic0.app');
 },

 // Get canister URL
 getCanisterUrl: (canisterId) => {
   const config = getNetworkConfig();
   if (network.isLocal()) {
     return `${config.host}/?canisterId=${canisterId}`;
   }
   return `https://${canisterId}.ic0.app`;
 },

 // Check network connectivity
 checkConnectivity: async () => {
   try {
     const config = getNetworkConfig();
     const response = await fetch(`${config.host}/api/v2/status`);
     return response.ok;
   } catch {
     return false;
   }
 },
};

/**
* Error handling utilities
*/
export const errors = {
 // Parse error from different sources
 parse: (error) => {
   if (!icpService) return errorUtils.parseError(error);
   return icpService.parseCanisterError(error);
 },

 // Check error type
 isNetworkError: (error) => errorUtils.isNetworkError(error),
 isAuthError: (error) => errorUtils.isAuthError(error),

 // Create user-friendly error messages
 getUserMessage: (error) => {
   const message = errors.parse(error);

   // Map technical errors to user-friendly messages
   const errorMap = {
     'Unauthorized access': 'Please sign in to continue',
     'Resource not found': 'The requested item was not found',
     'Insufficient funds': 'You don\'t have enough ICP for this transaction',
     'Asset not for sale': 'This asset is not currently available for purchase',
     'Asset already owned': 'You already own this asset',
   };

   return errorMap[message] || message || 'An unexpected error occurred';
 },
};

/**
* Data transformation utilities
*/
export const transform = {
 // Convert BigInt fields to Numbers
 bigIntToNumber: (obj) => {
   if (typeof obj === 'bigint') {
     return Number(obj);
   }

   if (Array.isArray(obj)) {
     return obj.map(transform.bigIntToNumber);
   }

   if (obj && typeof obj === 'object') {
     const result = {};
     for (const [key, value] of Object.entries(obj)) {
       result[key] = transform.bigIntToNumber(value);
     }
     return result;
   }

   return obj;
 },

 // Convert Numbers to BigInt for canister calls
 numberToBigInt: (obj, bigIntFields = []) => {
   if (Array.isArray(obj)) {
     return obj.map(item => transform.numberToBigInt(item, bigIntFields));
   }

   if (obj && typeof obj === 'object') {
     const result = {};
     for (const [key, value] of Object.entries(obj)) {
       if (bigIntFields.includes(key) && typeof value === 'number') {
         result[key] = BigInt(Math.floor(value));
       } else {
         result[key] = value;
       }
     }
     return result;
   }

   return obj;
 },

 // Format Principal for display
 formatPrincipal: (principal) => {
   if (!icpService) return 'Unknown';
   return icpService.formatPrincipal(principal);
 },

 // Convert timestamps from nanoseconds to milliseconds
 timestampToDate: (timestamp) => {
   return new Date(Number(timestamp) / 1_000_000);
 },

 // Convert Date to nanoseconds timestamp
 dateToTimestamp: (date) => {
   return BigInt(date.getTime() * 1_000_000);
 },
};

/**
* Development utilities
*/
export const dev = {
 // Enable debug mode
 enableDebug: () => {
   if (typeof window !== 'undefined') {
     window.icpDebug = true;
     window.icpService = icpService;
     console.log('ICP Debug mode enabled. Access service via window.icpService');
   }
 },

 // Get service instance for debugging
 getService: () => icpService,

 // Log current state
 logState: () => {
   if (!icpService) {
     console.log('ICP Service not available (SSR environment)');
     return;
   }
   
   console.log('ICP Service State:', {
     isAuthenticated: icpService.isUserAuthenticated(),
     principal: icpService.getPrincipal(),
     actors: Object.keys(icpService.actors),
     network: network.getConfig(),
   });
 },

 // Test canister connectivity
 testConnection: async () => {
   if (!icpService) {
     return { error: 'ICP service not available' };
   }
   
   const results = {};

   for (const canisterName of ['users', 'assets', 'marketplace']) {
     try {
       if (icpService.actors[canisterName]) {
         // Try a simple query call
         await icpService.query(canisterName, 'query_method', []);
         results[canisterName] = 'connected';
       } else {
         results[canisterName] = 'no_actor';
       }
     } catch (error) {
       results[canisterName] = `error: ${error.message}`;
     }
   }

   return results;
 },
};

// Export main service instance and helpers
export default icpService;
export { icpService };
