// Common Components
export { default as Button } from './common/Button';
export { default as LoadingSpinner, PageLoading, SectionLoading } from './common/LoadingSpinner';
export { default as Modal, ConfirmModal } from './common/Modal';

// Layout Components
export { default as Layout, PageLayout, DashboardLayout, AuthLayout, ErrorLayout, FullscreenLayout } from './layout/Layout';
export { default as Header } from './layout/Header';
export { default as Footer, MinimalFooter } from './layout/Footer';

// Marketplace Components
export { default as AssetCard } from './marketplace/AssetCard';
export { default as AssetGrid, AssetGridSkeleton, InfiniteAssetGrid } from './marketplace/AssetGrid';
export { default as SearchBar, AdvancedSearchBar, SearchResultsSummary, useSearchSuggestions } from './marketplace/SearchBar';
export { default as FilterSidebar, MobileFilterOverlay, ActiveFilters } from './marketplace/FilterSidebar';

// Export commonly used component combinations
export const Marketplace = {
  AssetCard,
  AssetGrid,
  AssetGridSkeleton,
  InfiniteAssetGrid,
  SearchBar,
  AdvancedSearchBar,
  SearchResultsSummary,
  FilterSidebar,
  MobileFilterOverlay,
  ActiveFilters,
};

export const Common = {
  Button,
  LoadingSpinner,
  PageLoading,
  SectionLoading,
  Modal,
  ConfirmModal,
};

export const Layouts = {
  Layout,
  PageLayout,
  DashboardLayout,
  AuthLayout,
  ErrorLayout,
  FullscreenLayout,
  Header,
  Footer,
  MinimalFooter,
};
