import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Filter, Grid, List, SlidersHorizontal, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/layout/Layout';
import Button from '../components/common/Button';
import AssetGrid from '../components/marketplace/AssetGrid';
import SearchBar, { SearchResultsSummary } from '../components/marketplace/SearchBar';
import FilterSidebar, { MobileFilterOverlay, ActiveFilters } from '../components/marketplace/FilterSidebar';
import { useAssets } from '../hooks';
import { ROUTES } from '../utils/constants';
import { cn } from '../lib/utils';

/**
 * Enhanced Marketplace Page Component with VR Design System
 */
const MarketplacePage = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Parse URL parameters
  useEffect(() => {
    const { query } = router;

    setSearchQuery(query.search || '');
    setSortBy(query.sort || 'newest');
    setCurrentPage(parseInt(query.page) || 1);

    // Parse filters from URL
    const urlFilters = {};
    if (query.category) urlFilters.category = query.category;
    if (query.minPrice) urlFilters.minPrice = parseFloat(query.minPrice);
    if (query.maxPrice) urlFilters.maxPrice = parseFloat(query.maxPrice);
    if (query.platform) urlFilters.compatibility = [query.platform];

    setFilters(urlFilters);
  }, [router.query]);

  // Fetch assets with current filters
  const {
    assets,
    loading,
    error,
    pagination,
    refresh
  } = useAssets({
    filters: {
      ...filters,
      query: searchQuery,
    },
    sortBy,
    page: currentPage,
  });

  // Update URL when filters change
  const updateURL = (newFilters, newSearch, newSort, newPage = 1) => {
    const query = {};

    if (newSearch) query.search = newSearch;
    if (newSort && newSort !== 'newest') query.sort = newSort;
    if (newPage > 1) query.page = newPage;
    if (newFilters.category) query.category = newFilters.category;
    if (newFilters.minPrice) query.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice) query.maxPrice = newFilters.maxPrice;
    if (newFilters.compatibility?.[0]) query.platform = newFilters.compatibility[0];

    router.push({
      pathname: ROUTES.marketplace,
      query,
    }, undefined, { shallow: true });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(filters, query, sortBy, 1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, searchQuery, sortBy, 1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    updateURL(filters, searchQuery, newSort, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(filters, searchQuery, sortBy, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSortBy('newest');
    setCurrentPage(1);
    router.push(ROUTES.marketplace, undefined, { shallow: true });
  };

  const handleRemoveFilter = (key, value) => {
    const newFilters = { ...filters };

    if (key === 'compatibility') {
      newFilters.compatibility = newFilters.compatibility?.filter(item => item !== value) || [];
      if (newFilters.compatibility.length === 0) {
        delete newFilters.compatibility;
      }
    } else if (key === 'price') {
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
    } else {
      delete newFilters[key];
    }

    handleFiltersChange(newFilters);
  };

  const handleAssetView = (asset) => {
    router.push(ROUTES.asset(asset.metadata.id));
  };

  const handleAssetPurchase = (asset) => {
    // TODO: Implement purchase flow
    console.log('Purchase asset:', asset.metadata.title);
  };

  const handleAddToWishlist = (asset) => {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', asset.metadata.title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <PageLayout
        title="VR Marketplace"
        subtitle="Discover and purchase amazing VR assets from creators worldwide"
      >
        <div className="space-y-8">
          {/* Hero Section with enhanced styling */}
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-gradient-vr text-lg font-medium">
                Explore Virtual Worlds
              </span>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse thousands of premium VR assets, from immersive environments to interactive characters
            </p>
          </div>

          {/* Search and Controls Section */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="Search VR assets..."
                  onFilterClick={() => setShowFilters(true)}
                  showFilterButton={true}
                />
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="glass-card rounded-xl p-1">
                  <div className="flex">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        viewMode === 'grid'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        viewMode === 'list'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowFilters(true)}
                  icon={SlidersHorizontal}
                  className="lg:hidden btn-outline-vr"
                >
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearFilters}
          />

          {/* Search Results Summary */}
          {(searchQuery || Object.keys(filters).length > 0) && (
            <div className="glass-card rounded-2xl p-4">
              <SearchResultsSummary
                query={searchQuery}
                totalResults={pagination.totalCount}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                resultsPerPage={20}
                currentSort={sortBy}
                onSortChange={handleSortChange}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <FilterSidebar
                isOpen={true}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Assets Grid */}
            <div className="flex-1">
              <AssetGrid
                assets={assets}
                loading={loading}
                error={error}
                onAssetView={handleAssetView}
                onAssetPurchase={handleAssetPurchase}
                onAddToWishlist={handleAddToWishlist}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                emptyMessage={
                  searchQuery || Object.keys(filters).length > 0
                    ? 'No assets found matching your criteria'
                    : 'No assets available'
                }
                emptyDescription={
                  searchQuery || Object.keys(filters).length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for new content'
                }
              />

              {/* Enhanced Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <div className="glass-card rounded-2xl p-6">
                    <nav className="flex items-center justify-center space-x-3">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="btn-outline-vr"
                      >
                        Previous
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = Math.max(1, currentPage - 2) + i;
                          if (page > pagination.totalPages) return null;

                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? 'primary' : 'outline'}
                              size="md"
                              onClick={() => handlePageChange(page)}
                              className={page === currentPage ? 'btn-vr' : 'btn-outline-vr'}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="btn-outline-vr"
                      >
                        Next
                      </Button>
                    </nav>

                    {/* Page info */}
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-400">
                        Page {currentPage} of {pagination.totalPages} 
                        <span className="mx-2">•</span>
                        {pagination.totalCount} total assets
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        <MobileFilterOverlay
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        >
          <FilterSidebar
            isOpen={true}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </MobileFilterOverlay>
      </PageLayout>
    </div>
  );
};

export default MarketplacePage;
