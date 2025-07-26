import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Enhanced Button Component with VR Nexus Design
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 shadow-lg',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    hero: 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 focus:ring-primary-500 shadow-xl hover:scale-105',
    white: 'bg-white text-primary-600 hover:bg-gray-50 border border-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}

      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={cn('w-4 h-4', children && 'mr-2')} />
      )}

      {children}

      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={cn('w-4 h-4', children && 'ml-2')} />
      )}
    </button>
  );
};

export default Button;
