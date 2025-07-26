import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, DollarSign, Tag, Monitor, Calendar, Sparkles, Filter } from 'lucide-react';
import clsx from 'clsx';
import Button from '../common/Button';
import { ASSET_CATEGORIES, VR_PLATFORMS, PRICE_RANGES } from '../../utils/constants';
import { cn } from '../../lib/utils';

/**
 * Enhanced Filter Sidebar Component with VR Design System
 */
const FilterSidebar = ({
  isOpen,
  onClose,
  filters = {},
  onFiltersChange,
  onClearFilters,
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    platform: false,
    date: false,
    additional: false,
    fileSize: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key, value) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  );

  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (value !== undefined && value !== '') return count + 1;
    return count;
  }, 0);

  return (
    <div className={cn(
      'glass-card rounded-3xl h-fit overflow-hidden',
      'transition-all duration-300 transform',
      isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100',
      className
    )}>
      {/* Enhanced Header */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gradient-vr">Filters</h2>
              {activeFilterCount > 0 && (
                <p className="text-sm text-gray-400">
                  {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              fullWidth
              className="btn-outline-vr"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {/* Category Filter */}
        <FilterSection
          title="Category"
          icon={Tag}
          expanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
          count={filters.category ? 1 : 0}
        >
          <div className="space-y-3">
            {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
              <FilterCheckbox
                key={key}
                label={category.label}
                description={category.description}
                checked={filters.category === key}
                onChange={(checked) => updateFilter('category', checked ? key : undefined)}
                gradient={category.gradient || 'from-purple-400 to-pink-400'}
                icon={category.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Filter */}
        <FilterSection
          title="Price Range"
          icon={DollarSign}
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
          count={(filters.minPrice || filters.maxPrice) ? 1 : 0}
        >
          <div className="space-y-4">
            {/* Quick price ranges */}
            <div className="space-y-3">
              {PRICE_RANGES.map((range, index) => (
                <FilterCheckbox
                  key={index}
                  label={range.label}
                  checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                  onChange={(checked) => {
                    if (checked) {
                      updateFilter('minPrice', range.min);
                      updateFilter('maxPrice', range.max);
                    } else {
                      updateFilter('minPrice', undefined);
                      updateFilter('maxPrice', undefined);
                    }
                  }}
                  gradient="from-green-400 to-emerald-400"
                  icon="💰"
                />
              ))}
            </div>

            {/* Custom price range */}
            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Custom Range (ICP)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={cn(
                      'w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl',
                      'text-white placeholder-gray-400 text-sm',
                      'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/25',
                      'transition-all duration-300 outline-none'
                    )}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={cn(
                      'w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl',
                      'text-white placeholder-gray-400 text-sm',
                      'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/25',
                      'transition-all duration-300 outline-none'
                    )}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Platform Compatibility */}
        <FilterSection
          title="VR Platform"
          icon={Monitor}
          expanded={expandedSections.platform}
          onToggle={() => toggleSection('platform')}
          count={filters.compatibility?.length || 0}
        >
          <div className="space-y-3">
            {VR_PLATFORMS.map((platform) => (
              <FilterCheckbox
                key={platform}
                label={platform}
                checked={filters.compatibility?.includes(platform) || false}
                onChange={() => toggleArrayFilter('compatibility', platform)}
                gradient="from-blue-400 to-cyan-400"
                icon="🥽"
              />
            ))}
          </div>
        </FilterSection>

        {/* Date Filter */}
        <FilterSection
          title="Upload Date"
          icon={Calendar}
          expanded={expandedSections.date}
          onToggle={() => toggleSection('date')}
          count={filters.dateRange ? 1 : 0}
        >
          <div className="space-y-3">
            {[
              { label: 'Last 24 hours', value: 'day', icon: '🕐' },
              { label: 'Last week', value: 'week', icon: '📅' },
              { label: 'Last month', value: 'month', icon: '📆' },
              { label: 'Last year', value: 'year', icon: '🗓️' },
            ].map((option) => (
              <FilterCheckbox
                key={option.value}
                label={option.label}
                checked={filters.dateRange === option.value}
                onChange={(checked) => updateFilter('dateRange', checked ? option.value : undefined)}
                gradient="from-orange-400 to-red-400"
                icon={option.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Additional Filters */}
        <FilterSection
          title="Additional Options"
          icon={Sparkles}
          expanded={expandedSections.additional}
          onToggle={() => toggleSection('additional')}
          count={[filters.freeOnly, filters.highlyRated, filters.recentlyUpdated, filters.hasPreview].filter(Boolean).length}
        >
          <div className="space-y-3">
            <FilterCheckbox
              label="Free Assets Only"
              checked={filters.freeOnly || false}
              onChange={(checked) => updateFilter('freeOnly', checked)}
              gradient="from-green-400 to-emerald-400"
              icon="🆓"
            />

            <FilterCheckbox
              label="Highly Rated (4+ stars)"
              checked={filters.highlyRated || false}
              onChange={(checked) => updateFilter('highlyRated', checked)}
              gradient="from-yellow-400 to-orange-400"
              icon="⭐"
            />

            <FilterCheckbox
              label="Recently Updated"
              checked={filters.recentlyUpdated || false}
              onChange={(checked) => updateFilter('recentlyUpdated', checked)}
              gradient="from-blue-400 to-purple-400"
              icon="🔄"
            />

            <FilterCheckbox
              label="Has Preview"
              checked={filters.hasPreview || false}
              onChange={(checked) => updateFilter('hasPreview', checked)}
              gradient="from-pink-400 to-purple-400"
              icon="👁️"
            />
          </div>
        </FilterSection>

        {/* File Size Filter */}
        <FilterSection
          title="File Size"
          icon={Tag}
          expanded={expandedSections.fileSize}
          onToggle={() => toggleSection('fileSize')}
          count={(filters.fileSizeMin || filters.fileSizeMax) ? 1 : 0}
        >
          <div className="space-y-3">
            {[
              { label: 'Small (< 10 MB)', min: 0, max: 10 * 1024 * 1024, icon: '📁' },
              { label: 'Medium (10-50 MB)', min: 10 * 1024 * 1024, max: 50 * 1024 * 1024, icon: '📂' },
              { label: 'Large (50-100 MB)', min: 50 * 1024 * 1024, max: 100 * 1024 * 1024, icon: '📦' },
              { label: 'Very Large (> 100 MB)', min: 100 * 1024 * 1024, max: Infinity, icon: '🗃️' },
            ].map((size, index) => (
              <FilterCheckbox
                key={index}
                label={size.label}
                checked={filters.fileSizeMin === size.min && filters.fileSizeMax === size.max}
                onChange={(checked) => {
                  if (checked) {
                    updateFilter('fileSizeMin', size.min);
                    updateFilter('fileSizeMax', size.max === Infinity ? undefined : size.max);
                  } else {
                    updateFilter('fileSizeMin', undefined);
                    updateFilter('fileSizeMax', undefined);
                  }
                }}
                gradient="from-indigo-400 to-purple-400"
                icon={size.icon}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply button for mobile */}
      <div className="p-6 border-t border-white/10 lg:hidden">
        <Button
          variant="primary"
          size="lg"
          onClick={onClose}
          fullWidth
          className="btn-vr"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

/**
 * Enhanced Filter Section Component
 */
const FilterSection = ({ title, icon: Icon, expanded, onToggle, children, count = 0 }) => (
  <div className="border-b border-white/10 last:border-b-0">
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center justify-between p-6 text-left',
        'hover:bg-white/5 transition-all duration-300 group'
      )}
    >
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            expanded ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20' : 'bg-white/5'
          )}>
            <Icon className={cn(
              'w-4 h-4 transition-colors duration-300',
              expanded ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
            )} />
          </div>
        )}
        <div>
          <span className={cn(
            'font-semibold transition-colors duration-300',
            expanded ? 'text-gradient-vr' : 'text-gray-300 group-hover:text-white'
          )}>
            {title}
          </span>
          {count > 0 && (
            <div className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              {count}
            </div>
          )}
        </div>
      </div>
      <div className={cn(
        'transition-all duration-300',
        expanded ? 'rotate-180 text-purple-400' : 'text-gray-400 group-hover:text-white'
      )}>
        <ChevronDown className="w-5 h-5" />
      </div>
    </button>

    <div className={cn(
      'overflow-hidden transition-all duration-300',
      expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    )}>
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  </div>
);

/**
 * Enhanced Filter Checkbox Component
 */
const FilterCheckbox = ({
  label,
  description,
  checked,
  onChange,
  gradient = 'from-purple-400 to-pink-400',
  icon,
  disabled = false
}) => (
  <div className={cn(
    'group relative p-3 rounded-xl transition-all duration-300 cursor-pointer',
    'hover:bg-white/5 hover:scale-105',
    checked && 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 ring-1 ring-purple-400/30',
    disabled && 'opacity-50 cursor-not-allowed'
  )}>
    <label className="flex items-start space-x-3 cursor-pointer">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={cn(
          'w-5 h-5 rounded-md border-2 transition-all duration-300',
          'flex items-center justify-center',
          checked
            ? `bg-gradient-to-r ${gradient} border-transparent`
            : 'border-gray-400 group-hover:border-purple-400'
        )}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className={cn(
            'font-medium transition-colors duration-300',
            checked ? 'text-white' : 'text-gray-300 group-hover:text-white'
          )}>
            {label}
          </span>
        </div>
        {description && (
          <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">
            {description}
          </p>
        )}
      </div>
    </label>
  </div>
);

/**
 * Enhanced Mobile Filter Overlay
 */
export const MobileFilterOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Sidebar */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl h-full w-80 max-w-sm ml-auto shadow-2xl animate-slide-left">
        {children}
      </div>
    </div>
  );
};

/**
 * Enhanced Active Filters Display
 */
export const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  const activeFilters = [];

  // Process filters into readable format
  if (filters.category) {
    const category = ASSET_CATEGORIES[filters.category];
    activeFilters.push({
      key: 'category',
      label: `${category?.icon || '📂'} ${category?.label}`,
      value: filters.category,
      gradient: category?.gradient || 'from-purple-400 to-pink-400',
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice || 0;
    const max = filters.maxPrice || '∞';
    activeFilters.push({
      key: 'price',
      label: `💰 ${min} - ${max} ICP`,
      value: 'price',
      gradient: 'from-green-400 to-emerald-400',
    });
  }

  if (filters.compatibility?.length > 0) {
    filters.compatibility.forEach(platform => {
      activeFilters.push({
        key: 'compatibility',
        label: `🥽 ${platform}`,
        value: platform,
        gradient: 'from-blue-400 to-cyan-400',
      });
    });
  }

  if (filters.dateRange) {
    const dateLabels = {
      day: '🕐 Last 24 hours',
      week: '📅 Last week',
      month: '📆 Last month',
      year: '🗓️ Last year',
    };
    activeFilters.push({
      key: 'dateRange',
      label: dateLabels[filters.dateRange],
      value: filters.dateRange,
      gradient: 'from-orange-400 to-red-400',
    });
  }

  if (filters.freeOnly) {
    activeFilters.push({
      key: 'freeOnly',
      label: '🆓 Free Only',
      value: true,
      gradient: 'from-green-400 to-emerald-400',
    });
  }

  if (filters.highlyRated) {
    activeFilters.push({
      key: 'highlyRated',
      label: '⭐ Highly Rated',
      value: true,
      gradient: 'from-yellow-400 to-orange-400',
    });
  }

  if (filters.recentlyUpdated) {
    activeFilters.push({
      key: 'recentlyUpdated',
      label: '🔄 Recently Updated',
      value: true,
      gradient: 'from-blue-400 to-purple-400',
    });
  }

  if (filters.hasPreview) {
    activeFilters.push({
      key: 'hasPreview',
      label: '👁️ Has Preview',
      value: true,
      gradient: 'from-pink-400 to-purple-400',
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">Active filters:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <button
              key={`${filter.key}-${index}`}
              onClick={() => onRemoveFilter(filter.key, filter.value)}
              className={cn(
                'group inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl',
                'bg-gradient-to-r text-white text-sm font-medium',
                'hover:scale-105 transition-all duration-300',
                'border border-white/20 shadow-lg',
                filter.gradient
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span>{filter.label}</span>
              <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          ))}

          {activeFilters.length > 1 && (
            <button
              onClick={onClearAll}
              className={cn(
                'inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl',
                'bg-white/10 text-gray-300 text-sm font-medium',
                'hover:bg-white/20 hover:text-white transition-all duration-300',
                'border border-white/20'
              )}
            >
              <X className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
