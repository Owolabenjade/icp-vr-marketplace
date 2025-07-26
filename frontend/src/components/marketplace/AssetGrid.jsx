import React from 'react';
import clsx from 'clsx';
import AssetCard from './AssetCard';
import LoadingSpinner, { SectionLoading } from '../common/LoadingSpinner';
import { Package, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Enhanced Asset Grid Component with VR Design System
 */
const AssetGrid = ({
  assets = [],
  loading = false,
  error = null,
  onAssetView,
  onAssetPurchase,
  onAddToWishlist,
  variant = 'default',
  showCreator = true,
  showStats = true,
  emptyMessage = 'No assets found',
  emptyDescription = 'Try adjusting your search or filters',
  className,
}) => {
  // Loading state with VR styling
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            <span className="text-gradient-vr font-medium">Loading amazing VR assets...</span>
          </div>
        </div>
        <AssetGridSkeleton count={8} />
      </div>
    );
  }

  // Error state with VR styling
  if (error) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="text-red-400 mb-4">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gradient-vr mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-400">{error}</p>
        </div>
        <button className="btn-vr mt-6 px-6 py-3">
          Try Again
        </button>
      </div>
    );
  }

  // Empty state with VR styling
  if (!assets || assets.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="relative">
          <Package className="w-20 h-20 text-purple-400/30 mx-auto mb-6" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gradient-vr mb-3">
          {emptyMessage}
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {emptyDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-vr px-6 py-3">
            Browse All Assets
          </button>
          <button className="btn-outline-vr px-6 py-3">
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Assets Grid */}
      <div className={cn(
        'grid gap-6 animate-fade-in',
        variant === 'compact' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-1' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      )}>
        {assets.map((asset, index) => (
          <div
            key={asset.metadata?.id || asset.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AssetCard
              asset={asset}
              onView={onAssetView}
              onPurchase={onAssetPurchase}
              onAddToWishlist={onAddToWishlist}
              variant={variant}
              showCreator={showCreator}
              showStats={showStats}
            />
          </div>
        ))}
      </div>

      {/* Load more indicator if needed */}
      {assets.length > 0 && assets.length % 20 === 0 && (
        <div className="text-center py-6">
          <div className="glass-card inline-block rounded-xl px-4 py-2">
            <p className="text-sm text-gray-400">
              Showing {assets.length} assets
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Asset Grid Skeleton with VR styling
 */
export const AssetGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="glass-card rounded-2xl overflow-hidden group animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Image skeleton */}
          <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full"></div>
              <div className="h-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded flex-1"></div>
            </div>
            <div className="h-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded w-20"></div>
              <div className="h-8 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Enhanced Infinite Scroll Asset Grid
 */
export const InfiniteAssetGrid = ({
  assets = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  ...props
}) => {
  const handleScroll = React.useCallback(() => {
    if (loading || !hasMore || !onLoadMore) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="space-y-8">
      <AssetGrid assets={assets} loading={false} {...props} />

      {loading && (
        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="text-gradient-vr font-medium">Loading more amazing assets...</span>
          </div>
        </div>
      )}

      {!hasMore && assets.length > 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-gray-400">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-400" />
            <p className="font-medium">You've discovered all available assets!</p>
            <p className="text-sm mt-1">Check back later for new additions</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetGrid;
