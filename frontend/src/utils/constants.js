// -----------------------------------------------------------------------------
// Network Configuration
export const NETWORKS = {
  local: {
    host: 'http://127.0.0.1:4943',
    identityProvider: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943',
  },
  ic: {
    host: 'https://icp0.io',
    identityProvider: 'https://identity.ic0.app',
  },
};

// -----------------------------------------------------------------------------
// Environment helpers
export const getCurrentNetwork = () => process.env.DFX_NETWORK || 'local';

export const getNetworkConfig = () => {
  const network = getCurrentNetwork();
  return NETWORKS[network] || NETWORKS.local;
};

// -----------------------------------------------------------------------------
// Canister IDs
export const CANISTER_IDS = {
  marketplace: process.env.CANISTER_ID_MARKETPLACE,
  assets: process.env.CANISTER_ID_ASSETS,
  users: process.env.CANISTER_ID_USERS,
  frontend: process.env.CANISTER_ID_FRONTEND,
};

// -----------------------------------------------------------------------------
// Asset Categories
export const ASSET_CATEGORIES = {
  Environment: {
    label: 'Environment',
    value: 'Environment',
    description: 'VR environments and worlds',
    color: 'bg-green-100 text-green-800',
  },
  Character: {
    label: 'Character',
    value: 'Character',
    description: '3D characters and avatars',
    color: 'bg-blue-100 text-blue-800',
  },
  Object: {
    label: 'Object',
    value: 'Object',
    description: '3D objects and props',
    color: 'bg-purple-100 text-purple-800',
  },
  Animation: {
    label: 'Animation',
    value: 'Animation',
    description: 'Animations and motion data',
    color: 'bg-orange-100 text-orange-800',
  },
  Audio: {
    label: 'Audio',
    value: 'Audio',
    description: 'Audio files and soundscapes',
    color: 'bg-pink-100 text-pink-800',
  },
  Complete_Experience: {
    label: 'Complete Experience',
    value: 'Complete_Experience',
    description: 'Full VR experiences',
    color: 'bg-indigo-100 text-indigo-800',
  },
};

// -----------------------------------------------------------------------------
// VR Platform Compatibility
export const VR_PLATFORMS = [
  'Oculus Quest',
  'Oculus Rift',
  'HTC Vive',
  'Valve Index',
  'PlayStation VR',
  'Windows Mixed Reality',
  'Pico',
  'WebXR',
  'Unity VR',
  'Unreal Engine VR',
];

// -----------------------------------------------------------------------------
// Supported File Formats
export const VR_FILE_FORMATS = [
  { value: 'fbx',  label: 'FBX',            description: 'Autodesk FBX format' },
  { value: 'obj',  label: 'OBJ',            description: 'Wavefront OBJ format' },
  { value: 'gltf', label: 'glTF',           description: 'GL Transmission Format' },
  { value: 'glb',  label: 'GLB',            description: 'Binary glTF' },
  { value: 'unity',label: 'Unity Package',  description: 'Unity asset package' },
  { value: 'unreal',label:'Unreal Asset',   description: 'Unreal Engine asset' },
  { value: 'blend',label:'Blender',         description: 'Blender file format' },
  { value: 'dae',  label:'Collada',         description: 'Collada DAE format' },
  { value: 'max',  label:'3ds Max',         description: '3ds Max file format' },
  { value: 'ma',   label:'Maya',            description: 'Maya ASCII format' },
];

// -----------------------------------------------------------------------------
// Price Ranges (in e8s – ICP’s smallest unit)
export const PRICE_RANGES = [
  { label: 'Free',      min: 0,           max: 0 },
  { label: 'Under 1 ICP', min: 1,         max: 99_999_999 },
  { label: '1 – 5 ICP',   min: 100_000_000, max: 500_000_000 },
  { label: '5 – 10 ICP',  min: 500_000_001, max: 1_000_000_000 },
  { label: '10 – 50 ICP', min: 1_000_000_001, max: 5_000_000_000 },
  { label: '50 + ICP',   min: 5_000_000_001, max: Number.MAX_SAFE_INTEGER },
];

// -----------------------------------------------------------------------------
// Transaction Status
export const TRANSACTION_STATUS = {
  Pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  Completed: { label: 'Completed', color: 'bg-green-100 text-green-800',  icon: 'CheckCircle' },
  Failed:    { label: 'Failed',    color: 'bg-red-100 text-red-800',      icon: 'XCircle' },
  Refunded:  { label: 'Refunded',  color: 'bg-gray-100 text-gray-800',    icon: 'ArrowLeft' },
};

// -----------------------------------------------------------------------------
// Pagination
export const ITEMS_PER_PAGE     = 20;
export const MAX_ITEMS_PER_PAGE = 100;

// -----------------------------------------------------------------------------
// File-upload limits
export const FILE_UPLOAD_LIMITS = {
  maxSize: 100 * 1024 * 1024, // 100 MB
  maxPreviewSize: 5 * 1024 * 1024, // 5 MB
  allowedPreviewTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedVRTypes: [
    'application/octet-stream', // .fbx, .blend …
    'model/gltf+json',          // .gltf
    'model/gltf-binary',        // .glb
    'application/zip',          // .unitypackage
  ],
};

// -----------------------------------------------------------------------------
// ICP helpers
export const ICP_DECIMALS = 8;
export const E8S_PER_ICP  = 100_000_000;

// -----------------------------------------------------------------------------
// Misc constants
export const API_TIMEOUT = 30_000; // 30 s

export const STORAGE_KEYS = {
  user:   'vr_marketplace_user',
  theme:  'vr_marketplace_theme',
  filters:'vr_marketplace_filters',
  cart:   'vr_marketplace_cart',
};

// -----------------------------------------------------------------------------
// Global messages
export const ERROR_MESSAGES = {
  networkError:      'Network error. Please check your connection and try again.',
  authRequired:      'Please sign in to continue.',
  uploadFailed:      'Upload failed. Please try again.',
  invalidFile:       'Invalid file format or size.',
  purchaseFailed:    'Purchase failed. Please try again.',
  insufficientFunds: 'Insufficient funds for this purchase.',
  assetNotFound:     'Asset not found.',
  unauthorized:      'You are not authorized to perform this action.',
  serverError:       'Server error. Please try again later.',
};

export const SUCCESS_MESSAGES = {
  assetUploaded:    'Asset uploaded successfully!',
  assetPurchased:   'Asset purchased successfully!',
  profileUpdated:   'Profile updated successfully!',
  listingCreated:   'Listing created successfully!',
  listingUpdated:   'Listing updated successfully!',
};

// -----------------------------------------------------------------------------
// Routes
export const ROUTES = {
  home: '/',
  marketplace: '/marketplace',
  asset:      (id) => `/asset/${id}`,
  creator: '/creator',
  creatorDashboard: '/creator/dashboard',
  creatorUpload:    '/creator/upload',
  profile:   (id) => `/profile/${id}`,
  myProfile: '/profile/me',
  transactions: '/transactions',
  search: '/search',
  category: (category) => `/marketplace?category=${category}`,
};

// -----------------------------------------------------------------------------
// Social, Help & Docs
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/dfinity',
  discord: 'https://discord.gg/dfinity',
  github:  'https://github.com/dfinity',
  reddit:  'https://reddit.com/r/dfinity',
  medium:  'https://medium.com/dfinity',
  youtube: 'https://youtube.com/c/dfinity',
};

export const HELP_LINKS = {
  gettingStarted: '/help/getting-started',
  uploadGuide:    '/help/upload-guide',
  buyingGuide:    '/help/buying-guide',
  sellingGuide:   '/help/selling-guide',
  faq:            '/help/faq',
  support:        '/help/support',
  api:            '/help/api',
  terms:          '/legal/terms',
  privacy:        '/legal/privacy',
  guidelines:     '/legal/community-guidelines',
};

// -----------------------------------------------------------------------------
// Marketplace features
export const FEATURES = {
  upload:   { title: 'Upload VR Assets',   description: 'Share your VR creations with the world', icon: 'Upload' },
  discover: { title: 'Discover Assets',    description: 'Find amazing VR content from creators worldwide', icon: 'Search' },
  trade:    { title: 'Trade Securely',     description: 'Buy and sell with blockchain security', icon: 'Shield' },
  earn:     { title: 'Earn ICP',           description: 'Monetize your VR creations', icon: 'DollarSign' },
};

// -----------------------------------------------------------------------------
// Search filters, ratings, notifications
export const SEARCH_FILTERS = {
  sortBy: [
    { value: 'relevance',  label: 'Relevance' },
    { value: 'newest',     label: 'Newest First' },
    { value: 'oldest',     label: 'Oldest First' },
    { value: 'price_low',  label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular',    label: 'Most Popular' },
    { value: 'rating',     label: 'Highest Rated' },
  ],
  timeFilters: [
    { value: 'all',  label: 'All Time' },
    { value: 'today',label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month',label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ],
};

export const RATING_SYSTEM = {
  maxRating: 5,
  ratingLabels: {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  },
};

export const NOTIFICATION_TYPES = {
  success: { icon: 'CheckCircle', color: 'text-green-600',bgColor: 'bg-green-100' },
  error:   { icon: 'XCircle',     color: 'text-red-600',bgColor: 'bg-red-100' },
  warning: { icon: 'AlertTriangle',color:'text-yellow-600',bgColor: 'bg-yellow-100' },
  info:    { icon: 'Info',        color: 'text-blue-600',bgColor: 'bg-blue-100' },
};

// -----------------------------------------------------------------------------
// Sample data
export const SAMPLE_ASSETS = [
  {
    id: 'asset-1',
    title: 'Cyberpunk City Environment',
    description: 'A futuristic cyberpunk cityscape perfect for VR exploration',
    category: 'Environment',
    price: 500_000_000, // 5 ICP
    creator: 'VR Artist Pro',
    rating: 4.8,
    downloads: 156,
    tags: ['cyberpunk', 'city', 'futuristic', 'neon'],
    previewImage: '/demo-assets/cyberpunk-city.jpg',
  },
  {
    id: 'asset-2',
    title: 'Medieval Knight Character',
    description: 'Fully rigged medieval knight with animations',
    category: 'Character',
    price: 300_000_000, // 3 ICP
    creator: 'Character Master',
    rating: 4.9,
    downloads: 203,
    tags: ['medieval', 'knight', 'character', 'rigged'],
    previewImage: '/demo-assets/medieval-knight.jpg',
  },
  {
    id: 'asset-3',
    title: 'Space Station Interior',
    description: 'Detailed space station interior with interactive elements',
    category: 'Environment',
    price: 800_000_000, // 8 ICP
    creator: 'Sci-Fi Studios',
    rating: 4.7,
    downloads: 98,
    tags: ['space', 'station', 'sci-fi', 'interior'],
    previewImage: '/demo-assets/space-station.jpg',
  },
];

// -----------------------------------------------------------------------------
// Formatting helpers
export const CURRENCY_FORMAT = {
  locale: 'en-US',
  options: { minimumFractionDigits: 2, maximumFractionDigits: 8 },
};

export const DATE_FORMAT = {
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  long:  { year: 'numeric', month: 'long',  day: 'numeric', hour: '2-digit', minute: '2-digit' },
  relative: { numeric: 'auto' },
};

// -----------------------------------------------------------------------------
// UI timings & layout
export const ANIMATION_DURATION = { fast: 150, normal: 300, slow: 500, modal: 200, toast: 4000 };

export const BREAKPOINTS = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' };

export const Z_INDEX = { dropdown: 1000, sticky: 1020, fixed: 1030, modal: 1040, popover: 1050, tooltip: 1060, toast: 1070 };

// -----------------------------------------------------------------------------
// Environment detection
export const IS_BROWSER     = typeof window !== 'undefined';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION  = process.env.NODE_ENV === 'production';

// -----------------------------------------------------------------------------
// Feature flags
export const FEATURE_FLAGS = {
  enableReviews:        true,
  enableChat:           false,
  enableAuction:        false,
  enableCollections:    true,
  enableAnalytics:      true,
  enableNotifications:  true,
  enableWishlist:       true,
  enableRecommendations:true,
};

// -----------------------------------------------------------------------------
// App metadata
export const APP_METADATA = {
  name: 'VR Marketplace',
  description: 'The decentralized marketplace for VR assets built on ICP',
  version: '1.0.0',
  author: 'Benjamin Owolabi & Edozie Obidile',
  keywords: ['VR', 'marketplace', 'ICP', 'blockchain', 'assets', '3D'],
  url: 'https://vr-marketplace.icp',
  image: '/og-image.png',
};

// -----------------------------------------------------------------------------
// Contact
export const CONTACT_INFO = {
  email:    'hello@vr-marketplace.icp',
  support:  'support@vr-marketplace.icp',
  business: 'business@vr-marketplace.icp',
};

// -----------------------------------------------------------------------------
// Default export (for convenience imports)
export default {
  NETWORKS,
  getCurrentNetwork,
  getNetworkConfig,
  CANISTER_IDS,
  ASSET_CATEGORIES,
  VR_PLATFORMS,
  VR_FILE_FORMATS,
  PRICE_RANGES,
  TRANSACTION_STATUS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  APP_METADATA,
};
