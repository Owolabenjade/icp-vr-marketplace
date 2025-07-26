import { E8S_PER_ICP, ICP_DECIMALS, CURRENCY_FORMAT, DATE_FORMAT } from './constants';

/**
* ICP Currency Conversion Utilities
*/
export const icpUtils = {
 // Convert ICP to e8s (smallest unit)
 toE8s: (icp) => {
   if (typeof icp === 'string') {
     icp = parseFloat(icp);
   }
   return Math.floor(icp * E8S_PER_ICP);
 },

 // Convert e8s to ICP
 fromE8s: (e8s) => {
   if (typeof e8s === 'string') {
     e8s = parseInt(e8s);
   }
   return e8s / E8S_PER_ICP;
 },

 // Format ICP amount for display
 format: (e8s, options = {}) => {
   const icp = icpUtils.fromE8s(e8s);
   const formatOptions = {
     ...CURRENCY_FORMAT.options,
     ...options,
   };

   if (icp === 0) return 'Free';

   const formatted = new Intl.NumberFormat(CURRENCY_FORMAT.locale, formatOptions).format(icp);
   return `${formatted} ICP`;
 },

 // Validate ICP amount
 isValidAmount: (amount) => {
   if (typeof amount === 'string') {
     amount = parseFloat(amount);
   }
   return !isNaN(amount) && amount >= 0 && amount <= Number.MAX_SAFE_INTEGER / E8S_PER_ICP;
 },
};

/**
* Date Formatting Utilities
*/
export const dateUtils = {
 // Format timestamp to readable date
 format: (timestamp, format = 'short') => {
   const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
   const options = DATE_FORMAT[format] || DATE_FORMAT.short;
   return new Intl.DateTimeFormat('en-US', options).format(date);
 },

 // Get relative time (e.g., "2 hours ago")
 relative: (timestamp) => {
   const date = new Date(Number(timestamp) / 1000000);
   const now = new Date();
   const diffInSeconds = Math.floor((now - date) / 1000);

   if (diffInSeconds < 60) return 'Just now';
   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
   if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
   if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
   if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
   return `${Math.floor(diffInSeconds / 31536000)} years ago`;
 },

 // Check if date is today
 isToday: (timestamp) => {
   const date = new Date(Number(timestamp) / 1000000);
   const today = new Date();
   return date.toDateString() === today.toDateString();
 },

 // Check if date is this week
 isThisWeek: (timestamp) => {
   const date = new Date(Number(timestamp) / 1000000);
   const today = new Date();
   const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
   return date >= weekAgo && date <= today;
 },
};

/**
* File Utilities
*/
export const fileUtils = {
 // Format file size for display
 formatSize: (bytes) => {
   if (bytes === 0) return '0 Bytes';

   const k = 1024;
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));

   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 },

 // Check if file is an image
 isImage: (file) => {
   return file && file.type.startsWith('image/');
 },

 // Check if file is a VR asset
 isVRAsset: (file) => {
   const vrExtensions = ['.fbx', '.obj', '.gltf', '.glb', '.unity', '.blend', '.dae', '.max', '.ma'];
   const fileName = file.name.toLowerCase();
   return vrExtensions.some(ext => fileName.endsWith(ext));
 },

 // Generate file hash (simple implementation)
 generateHash: (file) => {
   return new Promise((resolve) => {
     const reader = new FileReader();
     reader.onload = (e) => {
       const buffer = e.target.result;
       const hashArray = Array.from(new Uint8Array(buffer));
       const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
       resolve(hashHex.substring(0, 32)); // Return first 32 characters
     };
     reader.readAsArrayBuffer(file.slice(0, 1024)); // Hash first 1KB for speed
   });
 },

 // Create file preview URL
 createPreviewUrl: (file) => {
   if (fileUtils.isImage(file)) {
     return URL.createObjectURL(file);
   }
   return null;
 },
};

/**
* String Utilities
*/
export const stringUtils = {
 // Truncate string with ellipsis
 truncate: (str, length = 100) => {
   if (!str || str.length <= length) return str;
   return str.substring(0, length).trim() + '...';
 },

 // Capitalize first letter
 capitalize: (str) => {
   if (!str) return '';
   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
 },

 // Convert to title case
 toTitleCase: (str) => {
   if (!str) return '';
   return str.replace(/\w\S*/g, (txt) =>
     txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
   );
 },

 // Generate slug from string
 slugify: (str) => {
   if (!str) return '';
   return str
     .toLowerCase()
     .trim()
     .replace(/[^\w\s-]/g, '')
     .replace(/[\s_-]+/g, '-')
     .replace(/^-+|-+$/g, '');
 },

 // Extract hashtags from text
 extractHashtags: (text) => {
   if (!text) return [];
   const hashtagRegex = /#[a-zA-Z0-9_]+/g;
   const matches = text.match(hashtagRegex);
   return matches ? matches.map(tag => tag.substring(1)) : [];
 },

 // Clean and validate username
 validateUsername: (username) => {
   if (!username) return false;
   const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
   return usernameRegex.test(username);
 },
};

/**
* Validation Utilities
*/
export const validationUtils = {
 // Validate email
 isValidEmail: (email) => {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
 },

 // Validate URL
 isValidUrl: (url) => {
   try {
     new URL(url);
     return true;
   } catch {
     return false;
   }
 },

 // Validate Principal ID
 isValidPrincipal: (principal) => {
   // Basic Principal ID validation (ICP format)
   const principalRegex = /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
   return principalRegex.test(principal);
 },

 // Validate asset title
 isValidAssetTitle: (title) => {
   return title && title.length >= 3 && title.length <= 100;
 },

 // Validate asset description
 isValidAssetDescription: (description) => {
   return description && description.length >= 10 && description.length <= 2000;
 },

 // Validate price
 isValidPrice: (price) => {
   const numPrice = typeof price === 'string' ? parseFloat(price) : price;
   return !isNaN(numPrice) && numPrice >= 0;
 },
};

/**
* Authentication utilities
*/
export const authUtils = {
  // Check if user has completed profile setup
  hasCompleteProfile: (user) => {
    return user && user.username;
  },

  // Check if user is a creator
  isCreator: (user) => {
    return user && (user.roles?.includes('creator') || user.totalAssetsCreated > 0);
  },

  // Check if user is verified
  isVerified: (user) => {
    return user && user.isVerified;
  },

  // Get user display name
  getDisplayName: (user) => {
    if (!user) return 'Anonymous';
    return user.username || user.email || 'User';
  },

  // Get user avatar URL or fallback
  getAvatarUrl: (user) => {
    return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUtils.getDisplayName(user))}&background=3B82F6&color=fff`;
  },

  // Format user role for display
  formatRole: (role) => {
    const roleMap = {
      'creator': 'Creator',
      'verified_creator': 'Verified Creator',
      'moderator': 'Moderator',
      'admin': 'Administrator',
    };
    return roleMap[role] || 'User';
  },

  // Check if user is valid principal
  isValidPrincipal: (principal) => {
    if (!principal) return false;
    return principal !== 'anonymous' && principal.length > 0;
  },

  // Get principal from identity
  getPrincipalFromIdentity: (identity) => {
    if (!identity) return null;
    return identity.getPrincipal?.()?.toString();
  },

  // Format principal for display
  formatPrincipal: (principal) => {
    if (!principal) return 'Unknown';
    const principalStr = principal.toString();
    if (principalStr.length > 15) {
      return `${principalStr.slice(0, 5)}...${principalStr.slice(-5)}`;
    }
    return principalStr;
  },
};

/**
* Array Utilities
*/
export const arrayUtils = {
 // Remove duplicates from array
 unique: (arr) => {
   return [...new Set(arr)];
 },

 // Shuffle array
 shuffle: (arr) => {
   const shuffled = [...arr];
   for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled;
 },

 // Group array by key
 groupBy: (arr, key) => {
   return arr.reduce((groups, item) => {
     const group = item[key];
     groups[group] = groups[group] || [];
     groups[group].push(item);
     return groups;
   }, {});
 },

 // Sort array by multiple criteria
 sortBy: (arr, ...criteria) => {
   return arr.sort((a, b) => {
     for (const criterion of criteria) {
       let comparison = 0;
       if (typeof criterion === 'string') {
         comparison = a[criterion] > b[criterion] ? 1 : -1;
       } else if (typeof criterion === 'function') {
         comparison = criterion(a, b);
       }
       if (comparison !== 0) return comparison;
     }
     return 0;
   });
 },

 // Paginate array
 paginate: (arr, page, pageSize) => {
   const startIndex = (page - 1) * pageSize;
   const endIndex = startIndex + pageSize;
   return {
     data: arr.slice(startIndex, endIndex),
     totalItems: arr.length,
     totalPages: Math.ceil(arr.length / pageSize),
     currentPage: page,
     hasNextPage: endIndex < arr.length,
     hasPrevPage: startIndex > 0,
   };
 },
};

/**
* Local Storage Utilities
*/
export const storageUtils = {
 // Set item in localStorage
 set: (key, value) => {
   try {
     if (typeof window !== 'undefined') {
       localStorage.setItem(key, JSON.stringify(value));
     }
   } catch (error) {
     console.warn('Failed to save to localStorage:', error);
   }
 },

 // Get item from localStorage
 get: (key, defaultValue = null) => {
   try {
     if (typeof window !== 'undefined') {
       const item = localStorage.getItem(key);
       return item ? JSON.parse(item) : defaultValue;
     }
   } catch (error) {
     console.warn('Failed to read from localStorage:', error);
   }
   return defaultValue;
 },

 // Remove item from localStorage
 remove: (key) => {
   try {
     if (typeof window !== 'undefined') {
       localStorage.removeItem(key);
     }
   } catch (error) {
     console.warn('Failed to remove from localStorage:', error);
   }
 },

 // Clear all items
 clear: () => {
   try {
     if (typeof window !== 'undefined') {
       localStorage.clear();
     }
   } catch (error) {
     console.warn('Failed to clear localStorage:', error);
   }
 },
};

/**
* Color Utilities
*/
export const colorUtils = {
 // Generate avatar color from string
 generateAvatarColor: (str) => {
   if (!str) return '#6B7280';

   const colors = [
     '#EF4444', '#F97316', '#F59E0B', '#EAB308',
     '#84CC16', '#22C55E', '#10B981', '#14B8A6',
     '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
     '#8B5CF6', '#A855F7', '#C026D3', '#DB2777',
   ];

   let hash = 0;
   for (let i = 0; i < str.length; i++) {
     hash = str.charCodeAt(i) + ((hash << 5) - hash);
   }

   return colors[Math.abs(hash) % colors.length];
 },

 // Get contrast text color
 getContrastColor: (backgroundColor) => {
   // Simple implementation - in practice, you might want more sophisticated color theory
   const hex = backgroundColor.replace('#', '');
   const r = parseInt(hex.substr(0, 2), 16);
   const g = parseInt(hex.substr(2, 2), 16);
   const b = parseInt(hex.substr(4, 2), 16);
   const brightness = (r * 299 + g * 587 + b * 114) / 1000;
   return brightness > 128 ? '#000000' : '#FFFFFF';
 },
};

/**
* Error Handling Utilities
*/
export const errorUtils = {
 // Parse error message from various sources
 parseError: (error) => {
   if (typeof error === 'string') return error;
   if (error?.message) return error.message;
   if (error?.err) return error.err;
   if (error?.error) return error.error;
   return 'An unknown error occurred';
 },

 // Check if error is network related
 isNetworkError: (error) => {
   const errorMessage = errorUtils.parseError(error).toLowerCase();
   return errorMessage.includes('network') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('fetch');
 },

 // Check if error is authentication related
 isAuthError: (error) => {
   const errorMessage = errorUtils.parseError(error).toLowerCase();
   return errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('login');
 },

 // Get user-friendly error message
 getUserMessage: (error) => {
   const message = errorUtils.parseError(error);

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
* Performance Utilities
*/
export const performanceUtils = {
 // Debounce function
 debounce: (func, wait, immediate = false) => {
   let timeout;
   return function executedFunction(...args) {
     const later = () => {
       timeout = null;
       if (!immediate) func(...args);
     };
     const callNow = immediate && !timeout;
     clearTimeout(timeout);
     timeout = setTimeout(later, wait);
     if (callNow) func(...args);
   };
 },

 // Throttle function
 throttle: (func, limit) => {
   let inThrottle;
   return function(...args) {
     if (!inThrottle) {
       func.apply(this, args);
       inThrottle = true;
       setTimeout(() => inThrottle = false, limit);
     }
   };
 },

 // Lazy load images
 lazyLoadImage: (img, src) => {
   if ('IntersectionObserver' in window) {
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.src = src;
           observer.unobserve(entry.target);
         }
       });
     });
     observer.observe(img);
   } else {
     // Fallback for browsers without IntersectionObserver
     img.src = src;
   }
 },

 // Check if element is in viewport
 isInViewport: (element) => {
   const rect = element.getBoundingClientRect();
   return (
     rect.top >= 0 &&
     rect.left >= 0 &&
     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
     rect.right <= (window.innerWidth || document.documentElement.clientWidth)
   );
 },

 // Measure function execution time
 measureTime: async (func, label = 'Function') => {
   const start = performance.now();
   const result = await func();
   const end = performance.now();
   console.log(`${label} execution time: ${(end - start).toFixed(2)}ms`);
   return result;
 },

 // Simple memoization
 memoize: (func, getKey = (...args) => JSON.stringify(args)) => {
   const cache = new Map();
   return function(...args) {
     const key = getKey(...args);
     if (cache.has(key)) {
       return cache.get(key);
     }
     const result = func.apply(this, args);
     cache.set(key, result);
     return result;
   };
 },
};

/**
* URL Utilities
*/
export const urlUtils = {
 // Get query parameters from URL
 getQueryParams: (url = window.location.href) => {
   const params = new URLSearchParams(new URL(url).search);
   const result = {};
   for (const [key, value] of params) {
     result[key] = value;
   }
   return result;
 },

 // Build URL with query parameters
 buildUrl: (baseUrl, params = {}) => {
   const url = new URL(baseUrl, window.location.origin);
   Object.entries(params).forEach(([key, value]) => {
     if (value !== null && value !== undefined && value !== '') {
       url.searchParams.set(key, value.toString());
     }
   });
   return url.toString();
 },

 // Extract domain from URL
 getDomain: (url) => {
   try {
     return new URL(url).hostname;
   } catch {
     return '';
   }
 },

 // Check if URL is external
 isExternalUrl: (url) => {
   try {
     const urlObj = new URL(url, window.location.origin);
     return urlObj.origin !== window.location.origin;
   } catch {
     return false;
   }
 },
};

/**
* Math Utilities
*/
export const mathUtils = {
 // Clamp number between min and max
 clamp: (num, min, max) => {
   return Math.min(Math.max(num, min), max);
 },

 // Linear interpolation
 lerp: (start, end, factor) => {
   return start + (end - start) * factor;
 },

 // Map value from one range to another
 mapRange: (value, inMin, inMax, outMin, outMax) => {
   return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
 },

 // Generate random integer between min and max (inclusive)
 randomInt: (min, max) => {
   return Math.floor(Math.random() * (max - min + 1)) + min;
 },

 // Generate random float between min and max
 randomFloat: (min, max) => {
   return Math.random() * (max - min) + min;
 },

 // Round to specified decimal places
 roundTo: (num, decimals) => {
   return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
 },

 // Calculate percentage
 percentage: (value, total) => {
   return total === 0 ? 0 : (value / total) * 100;
 },
};

/**
* Animation Utilities
*/
export const animationUtils = {
 // Easing functions
 easing: {
   linear: (t) => t,
   easeInQuad: (t) => t * t,
   easeOutQuad: (t) => t * (2 - t),
   easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
   easeInCubic: (t) => t * t * t,
   easeOutCubic: (t) => (--t) * t * t + 1,
   easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
 },

 // Animate value over time
 animate: ({
   from,
   to,
   duration = 300,
   easing = 'easeOutQuad',
   onUpdate,
   onComplete,
 }) => {
   const start = performance.now();
   const easingFn = animationUtils.easing[easing] || animationUtils.easing.linear;

   const step = (currentTime) => {
     const elapsed = currentTime - start;
     const progress = Math.min(elapsed / duration, 1);
     const easedProgress = easingFn(progress);
     const currentValue = mathUtils.lerp(from, to, easedProgress);

     if (onUpdate) onUpdate(currentValue);

     if (progress < 1) {
       requestAnimationFrame(step);
     } else if (onComplete) {
       onComplete();
     }
   };

   requestAnimationFrame(step);
 },

 // Scroll to element smoothly
 scrollToElement: (element, offset = 0, duration = 500) => {
   const startPosition = window.pageYOffset;
   const targetPosition = element.getBoundingClientRect().top + startPosition + offset;

   animationUtils.animate({
     from: startPosition,
     to: targetPosition,
     duration,
     onUpdate: (value) => window.scrollTo(0, value),
   });
 },
};

/**
* Device Detection Utilities
*/
export const deviceUtils = {
 // Check if device is mobile
 isMobile: () => {
   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
 },

 // Check if device is tablet
 isTablet: () => {
   return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
 },

 // Check if device is desktop
 isDesktop: () => {
   return !deviceUtils.isMobile() && !deviceUtils.isTablet();
 },

 // Check if device supports touch
 isTouchDevice: () => {
   return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
 },

 // Get device info
 getDeviceInfo: () => {
   return {
     isMobile: deviceUtils.isMobile(),
     isTablet: deviceUtils.isTablet(),
     isDesktop: deviceUtils.isDesktop(),
     isTouchDevice: deviceUtils.isTouchDevice(),
     userAgent: navigator.userAgent,
     platform: navigator.platform,
     language: navigator.language,
     cookieEnabled: navigator.cookieEnabled,
     onLine: navigator.onLine,
   };
 },
};

/**
* Security Utilities
*/
export const securityUtils = {
 // Sanitize HTML to prevent XSS
 sanitizeHtml: (html) => {
   const temp = document.createElement('div');
   temp.textContent = html;
   return temp.innerHTML;
 },

 // Generate random string for nonces, etc.
 generateRandomString: (length = 32) => {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let result = '';
   for (let i = 0; i < length; i++) {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return result;
 },

 // Basic content security policy helpers
 isValidImageUrl: (url) => {
   try {
     const urlObj = new URL(url);
     return ['http:', 'https:', 'data:'].includes(urlObj.protocol);
   } catch {
     return false;
   }
 },
};

// Export all utilities as default
export default {
 icpUtils,
 dateUtils,
 fileUtils,
 stringUtils,
 validationUtils,
 authUtils,
 arrayUtils,
 storageUtils,
 colorUtils,
 errorUtils,
 performanceUtils,
 urlUtils,
 mathUtils,
 animationUtils,
 deviceUtils,
 securityUtils,
};
