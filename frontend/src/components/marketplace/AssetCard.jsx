import React, { useState } from 'react';
import { Eye, Download, Star, Heart, ShoppingCart, User, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../common/Button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ASSET_CATEGORIES } from '../../utils/constants';

/**
 * Enhanced Asset Card Component with Modern VR Design
 */
const AssetCard = ({
  asset,
  onView,
  onPurchase,
  onAddToWishlist,
  showCreator = true,
  showStats = true,
  variant = 'default',
  className,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const category = ASSET_CATEGORIES[asset.metadata?.category] || ASSET_CATEGORIES.Object;
  const isOwned = asset.isOwned || false;
  const isFree = asset.price === 0;

  const handleCardClick = () => {
    if (onView) {
      onView(asset);
    }
  };

  const handlePurchaseClick = (e) => {
    e.stopPropagation();
    if (onPurchase) {
      onPurchase(asset);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(asset);
    }
  };

  const getImageSrc = () => {
    if (asset.metadata?.previewImage) {
      return asset.metadata.previewImage;
    }
    return `/demo-assets/${asset.metadata?.category?.toLowerCase() || 'default'}-placeholder.jpg`;
  };

  const gradients = [
    'from-purple-600 to-blue-600',
    'from-pink-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-red-600',
  ];

  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
          className
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="glass-card rounded-2xl p-4 hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              {!imageLoaded && !imageError && (
                <div className={`w-full h-full bg-gradient-to-br ${randomGradient} animate-pulse`} />
              )}
              <img
                src={getImageSrc()}
                alt={asset.metadata?.title || 'VR Asset'}
                className={cn("w-full h-full object-cover transition-transform duration-300 group-hover:scale-110", !imageLoaded && "hidden")}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div className={`w-full h-full bg-gradient-to-br ${randomGradient} flex items-center justify-center`}>
                  <Eye className="w-6 h-6 text-white/70" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                {asset.metadata?.title || 'Untitled Asset'}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                {asset.metadata?.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {category.label}
                </Badge>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {asset.priceFormatted || 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="glass-card rounded-3xl overflow-hidden hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
        {/* Enhanced Image Section */}
        <div className="relative aspect-video overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className={`w-full h-full bg-gradient-to-br ${randomGradient} animate-pulse`} />
          )}

          <img
            src={getImageSrc()}
            alt={asset.metadata?.title || 'VR Asset'}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
              !imageLoaded && "hidden"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />

          {imageError && (
            <div className={`w-full h-full bg-gradient-to-br ${randomGradient} flex items-center justify-center`}>
              <div className="text-center">
                <Eye className="w-16 h-16 text-white/70 mx-auto mb-2" />
                <p className="text-sm text-white/70">Preview Coming Soon</p>
              </div>
            </div>
          )}

          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Floating play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/40 backdrop-blur-sm text-white border-white/20 hover:bg-black/60 transition-colors">
              {category.label}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {isOwned && (
              <Badge className="bg-emerald-500/90 text-white border-0">
                Owned
              </Badge>
            )}
            {isFree && (
              <Badge className="bg-blue-500/90 text-white border-0">
                Free
              </Badge>
            )}
          </div>

          {/* Enhanced Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={cn(
              "absolute bottom-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110",
              isWishlisted 
                ? "bg-red-500/90 text-white shadow-lg shadow-red-500/25" 
                : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
            )}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Enhanced Content Section */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
              {asset.metadata?.title || 'Untitled Asset'}
            </h3>
            <p className="text-gray-400 line-clamp-2 leading-relaxed">
              {asset.metadata?.description || 'No description available'}
            </p>
          </div>

          {/* Enhanced Tags */}
          {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {asset.metadata.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30">
                  #{tag}
                </Badge>
              ))}
              {asset.metadata.tags.length > 3 && (
                <span className="text-xs text-gray-500 self-center">
                  +{asset.metadata.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Enhanced Stats */}
          {showStats && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                  <span>{asset.downloads || 0}</span>
                </div>

                {asset.rating && asset.rating > 0 && (
                  <div className="flex items-center space-x-1 hover:text-yellow-400 transition-colors">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{asset.rating.toFixed(1)}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>{asset.views || 0}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {asset.priceFormatted || 'Free'}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Creator Info */}
          {showCreator && (
            <div className="flex items-center space-x-3 mb-6">
              <Avatar className="h-8 w-8 ring-2 ring-purple-500/50">
                <AvatarImage src={asset.creator?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                  {asset.creator?.username?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-400">
                by <span className="text-gray-300 font-medium">{asset.creator?.username || 'Anonymous'}</span>
              </span>
            </div>
          )}

          {/* Enhanced Action Button */}
          <div className="pt-2">
            {isOwned ? (
              <Button 
                variant="success" 
                size="sm" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl" 
                disabled
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Owned
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handlePurchaseClick}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isFree ? 'Get Free' : 'Purchase'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
