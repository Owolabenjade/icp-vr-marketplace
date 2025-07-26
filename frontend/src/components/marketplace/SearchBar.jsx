import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import clsx from 'clsx';
import Button from '../common/Button';
import { performanceUtils } from '../../utils/helpers';
import { cn } from '../../lib/utils';

/**
 * Enhanced Search Bar Component with VR Design System
 */
const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search VR assets...',
  suggestions = [],
  showSuggestions = false,
  loading = false,
  onFilterClick,
  showFilterButton = true,
  className,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search
  const debouncedSearch = performanceUtils.debounce((searchTerm) => {
    if (onChange) {
      onChange(searchTerm);
    }
  }, 300);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedSearch(newValue);

    if (newValue.length > 0 && suggestions.length > 0 && showSuggestions) {
      setShowSuggestionsList(true);
      setActiveSuggestionIndex(-1);
    } else {
      setShowSuggestionsList(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localValue);
    }
    setShowSuggestionsList(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setLocalValue('');
    setShowSuggestionsList(false);
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalValue(suggestion);
    setShowSuggestionsList(false);
    if (onChange) {
      onChange(suggestion);
    }
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : -1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;

      case 'Escape':
        setShowSuggestionsList(false);
        setActiveSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className={cn(
              'glass-card rounded-2xl transition-all duration-300',
              isFocused && 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25'
            )}>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isFocused ? 'text-purple-400' : 'text-gray-400'
                  )} />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={localValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setIsFocused(true);
                    if (localValue.length > 0 && suggestions.length > 0 && showSuggestions) {
                      setShowSuggestionsList(true);
                    }
                  }}
                  onBlur={() => setIsFocused(false)}
                  placeholder={placeholder}
                  className={cn(
                    'w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-gray-400',
                    'border-0 outline-none text-lg font-medium',
                    'transition-all duration-300'
                  )}
                  disabled={loading}
                />

                {localValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={cn(
                      'absolute right-4 top-1/2 transform -translate-y-1/2',
                      'text-gray-400 hover:text-white transition-colors duration-300',
                      'hover:bg-white/10 rounded-full p-1'
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Suggestions dropdown */}
            {showSuggestionsList && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef} 
                className="absolute top-full left-0 right-0 mt-2 z-50 animate-slide-up"
              >
                <div className="glass-card rounded-2xl overflow-hidden shadow-xl shadow-purple-500/25">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200',
                        'border-b border-white/10 last:border-b-0',
                        index === activeSuggestionIndex
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Search className={cn(
                        "w-4 h-4 transition-colors duration-200",
                        index === activeSuggestionIndex ? 'text-purple-400' : 'text-gray-500'
                      )} />
                      <span className="font-medium">{suggestion}</span>
                      {index === activeSuggestionIndex && (
                        <Zap className="w-4 h-4 text-purple-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="btn-vr px-6 shrink-0"
            disabled={loading}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Filter Button */}
          {showFilterButton && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onFilterClick}
              icon={SlidersHorizontal}
              className="btn-outline-vr px-6 shrink-0"
            >
              <span className="hidden sm:inline ml-2">Filter</span>
            </Button>
          )}
        </div>
      </form>

      {/* Enhanced Quick Filters */}
      <QuickFilters className="animate-fade-in" />
    </div>
  );
};

/**
 * Enhanced Quick Filters Component with VR styling
 */
const QuickFilters = ({ className, onFilterSelect, activeFilters = [] }) => {
  const quickFilters = [
    { label: 'Free', value: 'free', icon: '🆓', gradient: 'from-green-400 to-emerald-500' },
    { label: 'New', value: 'new', icon: '✨', gradient: 'from-blue-400 to-cyan-500' },
    { label: 'Popular', value: 'popular', icon: '🔥', gradient: 'from-orange-400 to-red-500' },
    { label: 'Environment', value: 'environment', icon: '🌍', gradient: 'from-green-400 to-blue-500' },
    { label: 'Character', value: 'character', icon: '👤', gradient: 'from-purple-400 to-pink-500' },
    { label: 'Object', value: 'object', icon: '📦', gradient: 'from-yellow-400 to-orange-500' },
  ];

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {quickFilters.map((filter, index) => (
        <button
          key={filter.value}
          onClick={() => onFilterSelect?.(filter.value)}
          className={cn(
            'group relative inline-flex items-center space-x-2 px-4 py-2 rounded-xl',
            'transition-all duration-300 transform hover:scale-105',
            'border border-white/20 backdrop-blur-sm',
            activeFilters.includes(filter.value)
              ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg`
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-sm">{filter.icon}</span>
          <span className="font-medium text-sm">{filter.label}</span>
          {activeFilters.includes(filter.value) && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * Advanced Search Bar with voice search capability
 */
export const AdvancedSearchBar = ({
  onVoiceSearch,
  showVoiceSearch = false,
  ...props
}) => {
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onVoiceSearch) {
        onVoiceSearch(transcript);
      }
      props.onChange?.(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="relative">
      <SearchBar {...props} />

      {showVoiceSearch && (
        <button
          onClick={startVoiceSearch}
          disabled={isListening}
          className={cn(
            'absolute right-20 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-all duration-300',
            isListening
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg'
              : 'glass-card text-gray-400 hover:text-white hover:bg-white/10'
          )}
          title={isListening ? 'Listening...' : 'Voice search'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Enhanced Search Results Summary
 */
export const SearchResultsSummary = ({
  query,
  totalResults,
  currentPage,
  totalPages,
  resultsPerPage,
  onSortChange,
  sortOptions = [
    { value: 'relevance', label: 'Most Relevant', icon: '🎯' },
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'oldest', label: 'Oldest First', icon: '📅' },
    { value: 'price_low', label: 'Price: Low to High', icon: '💰' },
    { value: 'price_high', label: 'Price: High to Low', icon: '💎' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
  ],
  currentSort = 'relevance',
}) => {
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div className="flex-1">
        {query ? (
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <p className="text-gray-300">
              Found <span className="text-gradient-vr font-bold">{totalResults}</span> results for{' '}
              <span className="text-white font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-lg">
                "{query}"
              </span>
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="text-gradient-vr font-semibold">
              {totalResults} VR Assets Available
            </div>
          </div>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Showing {startResult}-{endResult} of {totalResults}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <label className="text-sm text-gray-400 font-medium">Sort by:</label>
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className={cn(
              'glass-card rounded-xl px-4 py-2 text-white bg-transparent',
              'border border-white/20 outline-none cursor-pointer',
              'hover:border-purple-400/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/25',
              'transition-all duration-300 appearance-none pr-10'
            )}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Search Suggestions Generator Hook
 */
export const useSearchSuggestions = (query, delay = 300) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedGetSuggestions = performanceUtils.debounce(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would be an API call
      const mockSuggestions = [
        'cyberpunk environment',
        'medieval character',
        'space station',
        'fantasy sword',
        'robot animation',
        'ambient music',
        'VR experience',
        'low poly',
        'futuristic city',
        'underwater world',
        'character avatar',
        'weapon pack',
      ].filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSuggestions(mockSuggestions.slice(0, 6)); // Limit to 6 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, delay);

  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  return { suggestions, loading };
};

export default SearchBar;
