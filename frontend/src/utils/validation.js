import { z } from 'zod';
import { ASSET_CATEGORIES, VR_FILE_FORMATS, VR_PLATFORMS, E8S_PER_ICP } from './constants';

/**
* Common validation schemas
*/

// Principal ID validation
const principalSchema = z.string().regex(
 /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/,
 'Invalid Principal ID format'
);

// Email validation
const emailSchema = z.string().email('Invalid email format');

// Price validation (in ICP)
const priceSchema = z.number()
 .min(0, 'Price must be non-negative')
 .max(1000000, 'Price cannot exceed 1,000,000 ICP')
 .refine((val) => Number.isFinite(val), 'Price must be a valid number');

// Asset category validation
const categorySchema = z.enum(Object.keys(ASSET_CATEGORIES), {
 errorMap: () => ({ message: 'Invalid asset category' })
});

// File format validation
const fileFormatSchema = z.enum(
 VR_FILE_FORMATS.map(format => format.value),
 { errorMap: () => ({ message: 'Invalid file format' }) }
);

// VR platform validation
const vrPlatformSchema = z.enum(VR_PLATFORMS, {
 errorMap: () => ({ message: 'Invalid VR platform' })
});

/**
* User Profile Schemas
*/
export const userProfileSchema = z.object({
 username: z.string()
   .min(3, 'Username must be at least 3 characters')
   .max(20, 'Username cannot exceed 20 characters')
   .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
 
 email: emailSchema.optional(),
 
 bio: z.string()
   .max(500, 'Bio cannot exceed 500 characters')
   .optional(),
 
 avatar: z.string()
   .url('Avatar must be a valid URL')
   .optional(),
});

export const createUserSchema = userProfileSchema.pick({
 username: true,
 email: true,
 bio: true,
 avatar: true,
});

export const updateUserSchema = userProfileSchema.partial();

/**
* Asset Schemas
*/
export const assetMetadataSchema = z.object({
 title: z.string()
   .min(3, 'Title must be at least 3 characters')
   .max(100, 'Title cannot exceed 100 characters')
   .trim(),
 
 description: z.string()
   .min(10, 'Description must be at least 10 characters')
   .max(2000, 'Description cannot exceed 2000 characters')
   .trim(),
 
 category: categorySchema,
 
 tags: z.array(z.string().min(1).max(30))
   .max(10, 'Cannot have more than 10 tags')
   .default([]),
 
 previewImage: z.string()
   .url('Preview image must be a valid URL')
   .optional(),
 
 fileSize: z.number()
   .min(1, 'File size must be positive')
   .max(100 * 1024 * 1024, 'File size cannot exceed 100MB'),
 
 fileFormat: fileFormatSchema,
 
 compatibility: z.array(vrPlatformSchema)
   .min(1, 'At least one VR platform must be selected')
   .max(10, 'Cannot select more than 10 platforms'),
});

export const createAssetSchema = assetMetadataSchema.extend({
 price: priceSchema,
 fileHash: z.string().min(1, 'File hash is required'),
 downloadUrl: z.string().url('Download URL must be valid'),
});

export const updateAssetSchema = z.object({
 title: assetMetadataSchema.shape.title.optional(),
 description: assetMetadataSchema.shape.description.optional(),
 category: categorySchema.optional(),
 tags: assetMetadataSchema.shape.tags.optional(),
 previewImage: assetMetadataSchema.shape.previewImage.optional(),
 compatibility: assetMetadataSchema.shape.compatibility.optional(),
 price: priceSchema.optional(),
 isForSale: z.boolean().optional(),
});

/**
* Marketplace Schemas
*/
export const createListingSchema = z.object({
 assetId: z.string().min(1, 'Asset ID is required'),
 price: priceSchema,
 description: z.string()
   .max(500, 'Description cannot exceed 500 characters')
   .optional(),
});

export const updateListingSchema = z.object({
 price: priceSchema.optional(),
 isActive: z.boolean().optional(),
 description: z.string()
   .max(500, 'Description cannot exceed 500 characters')
   .optional(),
});

export const purchaseSchema = z.object({
 listingId: z.string().min(1, 'Listing ID is required'),
 paymentMethod: z.enum(['ICP', 'Cycles'], {
   errorMap: () => ({ message: 'Invalid payment method' })
 }),
});

/**
* Search and Filter Schemas
*/
export const searchFiltersSchema = z.object({
 query: z.string().max(100, 'Search query too long').optional(),
 category: categorySchema.optional(),
 minPrice: z.number().min(0).optional(),
 maxPrice: z.number().min(0).optional(),
 tags: z.array(z.string()).optional(),
 creator: principalSchema.optional(),
 compatibility: vrPlatformSchema.optional(),
 sortBy: z.enum([
   'relevance', 'newest', 'oldest', 
   'price_low', 'price_high', 
   'popular', 'rating'
 ]).default('relevance'),
 page: z.number().min(1).default(1),
 limit: z.number().min(1).max(100).default(20),
});

export const listingFiltersSchema = z.object({
 minPrice: z.number().min(0).optional(),
 maxPrice: z.number().min(0).optional(),
 seller: principalSchema.optional(),
 category: categorySchema.optional(),
 isActive: z.boolean().optional(),
});

/**
* File Upload Schemas
*/
export const fileUploadSchema = z.object({
 file: z.instanceof(File, { message: 'File is required' })
   .refine((file) => file.size > 0, 'File cannot be empty')
   .refine((file) => file.size <= 100 * 1024 * 1024, 'File size cannot exceed 100MB'),
 
 type: z.enum(['asset', 'preview'], {
   errorMap: () => ({ message: 'Invalid file type' })
 }),
});

export const previewImageSchema = z.object({
 file: z.instanceof(File, { message: 'Image file is required' })
   .refine((file) => file.type.startsWith('image/'), 'File must be an image')
   .refine((file) => file.size <= 5 * 1024 * 1024, 'Image size cannot exceed 5MB')
   .refine((file) => {
     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
     return allowedTypes.includes(file.type);
   }, 'Image must be JPEG, PNG, or WebP format'),
});

export const vrAssetFileSchema = z.object({
 file: z.instanceof(File, { message: 'VR asset file is required' })
   .refine((file) => {
     const fileName = file.name.toLowerCase();
     const validExtensions = ['.fbx', '.obj', '.gltf', '.glb', '.unity', '.blend', '.dae', '.max', '.ma'];
     return validExtensions.some(ext => fileName.endsWith(ext));
   }, 'Invalid VR asset file format')
   .refine((file) => file.size <= 100 * 1024 * 1024, 'File size cannot exceed 100MB'),
});

/**
* Form Validation Schemas
*/
export const contactFormSchema = z.object({
 name: z.string()
   .min(2, 'Name must be at least 2 characters')
   .max(50, 'Name cannot exceed 50 characters'),
 
 email: emailSchema,
 
 subject: z.string()
   .min(5, 'Subject must be at least 5 characters')
   .max(100, 'Subject cannot exceed 100 characters'),
 
 message: z.string()
   .min(10, 'Message must be at least 10 characters')
   .max(1000, 'Message cannot exceed 1000 characters'),
});

export const reviewSchema = z.object({
 rating: z.number()
   .min(1, 'Rating must be at least 1')
   .max(5, 'Rating cannot exceed 5')
   .int('Rating must be a whole number'),
 
 title: z.string()
   .min(3, 'Review title must be at least 3 characters')
   .max(100, 'Review title cannot exceed 100 characters')
   .optional(),
 
 comment: z.string()
   .min(10, 'Review comment must be at least 10 characters')
   .max(500, 'Review comment cannot exceed 500 characters')
   .optional(),
});

export const reportSchema = z.object({
 reason: z.enum([
   'inappropriate_content',
   'copyright_violation',
   'spam',
   'fraud',
   'other'
 ], {
   errorMap: () => ({ message: 'Please select a valid reason' })
 }),
 
 description: z.string()
   .min(10, 'Description must be at least 10 characters')
   .max(500, 'Description cannot exceed 500 characters'),
 
 reportedItemId: z.string().min(1, 'Item ID is required'),
 reportedItemType: z.enum(['asset', 'user', 'listing'], {
   errorMap: () => ({ message: 'Invalid item type' })
 }),
});

/**
* URL and Query Parameter Schemas
*/
export const paginationSchema = z.object({
 page: z.coerce.number().min(1).default(1),
 limit: z.coerce.number().min(1).max(100).default(20),
});

export const sortSchema = z.object({
 sortBy: z.enum([
   'newest', 'oldest', 'price_low', 'price_high', 
   'popular', 'rating', 'title', 'downloads'
 ]).default('newest'),
 order: z.enum(['asc', 'desc']).default('desc'),
});

export const assetQuerySchema = z.object({
 ...paginationSchema.shape,
 ...sortSchema.shape,
 category: categorySchema.optional(),
 minPrice: z.coerce.number().min(0).optional(),
 maxPrice: z.coerce.number().min(0).optional(),
 tags: z.string().transform((str) => str.split(',').filter(Boolean)).optional(),
 search: z.string().max(100).optional(),
 creator: z.string().optional(),
 compatibility: z.string().optional(),
});

/**
* Authentication Schemas
*/
export const loginSchema = z.object({
 remember: z.boolean().default(false),
});

/**
* Settings Schemas
*/
export const notificationSettingsSchema = z.object({
 emailNotifications: z.boolean().default(true),
 pushNotifications: z.boolean().default(true),
 marketingEmails: z.boolean().default(false),
 
 notifyOnPurchase: z.boolean().default(true),
 notifyOnSale: z.boolean().default(true),
 notifyOnReview: z.boolean().default(true),
 notifyOnFollow: z.boolean().default(true),
 notifyOnAssetUpdate: z.boolean().default(false),
});

export const privacySettingsSchema = z.object({
 profileVisibility: z.enum(['public', 'private']).default('public'),
 showEmail: z.boolean().default(false),
 showPurchaseHistory: z.boolean().default(false),
 showCreationHistory: z.boolean().default(true),
 allowMessages: z.boolean().default(true),
 allowReviews: z.boolean().default(true),
});

export const accountSettingsSchema = z.object({
 twoFactorEnabled: z.boolean().default(false),
 sessionTimeout: z.number().min(5).max(1440).default(60), // minutes
 autoLogout: z.boolean().default(true),
});

/**
* Collection Schemas (for future features)
*/
export const collectionSchema = z.object({
 name: z.string()
   .min(3, 'Collection name must be at least 3 characters')
   .max(50, 'Collection name cannot exceed 50 characters'),
 
 description: z.string()
   .max(500, 'Description cannot exceed 500 characters')
   .optional(),
 
 isPublic: z.boolean().default(true),
 
 assets: z.array(z.string()).default([]),
});

/**
* Utility Functions for Validation
*/

// Validate and parse form data
export const validateFormData = async (schema, data) => {
 try {
   const result = await schema.parseAsync(data);
   return { success: true, data: result, errors: null };
 } catch (error) {
   if (error instanceof z.ZodError) {
     const errors = error.errors.reduce((acc, err) => {
       const path = err.path.join('.');
       acc[path] = err.message;
       return acc;
     }, {});
     return { success: false, data: null, errors };
   }
   return { 
     success: false, 
     data: null, 
     errors: { general: 'Validation failed' } 
   };
 }
};

// Validate single field
export const validateField = (schema, value) => {
 try {
   schema.parse(value);
   return { isValid: true, error: null };
 } catch (error) {
   if (error instanceof z.ZodError) {
     return { isValid: false, error: error.errors[0]?.message || 'Invalid value' };
   }
   return { isValid: false, error: 'Validation failed' };
 }
};

// Custom validators
export const customValidators = {
 // Check if username is available (placeholder - would call API)
 isUsernameAvailable: async (username) => {
   // Simulate API call
   return new Promise((resolve) => {
     setTimeout(() => {
       const unavailableUsernames = ['admin', 'root', 'user', 'test'];
       resolve(!unavailableUsernames.includes(username.toLowerCase()));
     }, 300);
   });
 },

 // Check if email is already registered (placeholder)
 isEmailAvailable: async (email) => {
   return new Promise((resolve) => {
     setTimeout(() => {
       const unavailableEmails = ['test@test.com', 'admin@example.com'];
       resolve(!unavailableEmails.includes(email.toLowerCase()));
     }, 300);
   });
 },

 // Check if asset title is unique for user (placeholder)
 isAssetTitleUnique: async (title, userId) => {
   return new Promise((resolve) => {
     setTimeout(() => {
       // In real implementation, would check against user's existing assets
       resolve(true);
     }, 200);
   });
 },

 // Validate file integrity (placeholder)
 validateFileIntegrity: async (file) => {
   return new Promise((resolve) => {
     setTimeout(() => {
       // In real implementation, would perform virus scan, etc.
       resolve({ isValid: true, warnings: [] });
     }, 1000);
   });
 },
};

// Schema transformation helpers
export const transformers = {
 // Transform string to number
 stringToNumber: z.string().transform((val) => {
   const num = parseFloat(val);
   return isNaN(num) ? 0 : num;
 }),

 // Transform comma-separated string to array
 csvToArray: z.string().transform((val) => 
   val.split(',').map(item => item.trim()).filter(Boolean)
 ),

 // Transform ICP to e8s
 icpToE8s: z.number().transform((icp) => Math.floor(icp * E8S_PER_ICP)),

 // Transform e8s to ICP
 e8sToIcp: z.number().transform((e8s) => e8s / E8S_PER_ICP),

 // Sanitize HTML
 sanitizeHtml: z.string().transform((html) => {
   // Basic HTML sanitization (in production, use a proper sanitizer)
   return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
 }),

 // Normalize URL
 normalizeUrl: z.string().transform((url) => {
   try {
     return new URL(url).toString();
   } catch {
     return url;
   }
 }),
};

// Export all schemas and utilities
export default {
 // User schemas
 userProfileSchema,
 createUserSchema,
 updateUserSchema,
 
 // Asset schemas
 assetMetadataSchema,
 createAssetSchema,
 updateAssetSchema,
 
 // Marketplace schemas
 createListingSchema,
 updateListingSchema,
 purchaseSchema,
 
 // Search schemas
 searchFiltersSchema,
 listingFiltersSchema,
 
 // File schemas
 fileUploadSchema,
 previewImageSchema,
 vrAssetFileSchema,
 
 // Form schemas
 contactFormSchema,
 reviewSchema,
 reportSchema,
 
 // URL schemas
 paginationSchema,
 sortSchema,
 assetQuerySchema,
 
 // Settings schemas
 notificationSettingsSchema,
 privacySettingsSchema,
 accountSettingsSchema,
 
 // Collection schemas
 collectionSchema,
 
 // Utilities
 validateFormData,
 validateField,
 customValidators,
 transformers,
};
