import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text,
  center = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const content = (
    <div className={clsx('flex items-center space-x-2', className)}>
      <Loader2 className={clsx('animate-spin text-primary-600', sizeClasses[size])} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
  
  if (center) {
    return (
      <div className="flex items-center justify-center p-8">
        {content}
      </div>
    );
  }
  
  return content;
};

/**
 * Page Loading Component
 */
export const PageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Section Loading Component
 */
export const SectionLoading = ({ message = 'Loading...', className }) => (
  <div className={clsx('flex items-center justify-center p-12', className)}>
    <LoadingSpinner size="lg" text={message} />
  </div>
);

export default LoadingSpinner;
