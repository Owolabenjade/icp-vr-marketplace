import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal className handling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(amount, currency = 'ICP') {
  if (amount === 0) return 'Free';
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${formatted} ${currency}`;
}

/**
 * Format file sizes
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate avatar fallback from name
 */
export function getAvatarFallback(name) {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
