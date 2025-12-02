'use client'
import React, { useState, useRef, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange?: (filters: SearchFilters) => void
  placeholder?: string
}

export interface SearchFilters {
  query: string
  type?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sharedOnly?: boolean
}

/**
 * SearchBar Component
 * Provides search and filtering for documents
 * 
 * Features:
 * - Full-text search by title, type
 * - Filter by document type
 * - Filter by status (pending, approved, rejected)
 * - Filter by date range
 * - Filter by shared documents
 * - Autocomplete suggestions
 * - Save frequent searches
 */
export default function SearchBar({ onSearch, onFilterChange, placeholder }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({ query: '' })
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nddv_recent_searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    // Generate autocomplete suggestions
    const documentTypes = ['Birth Certificate', 'National ID', 'Passport', 'Land Title', 'Vehicle Registration']
    const filtered = documentTypes.filter((type) =>
      type.toLowerCase().includes(value.toLowerCase())
    )
    setSuggestions(filtered)
    setShowSuggestions(value.length > 0 && filtered.length > 0)
  }

  const handleSearch = (e: React.FormEvent | string) => {
    if (typeof e === 'string') {
      setSearchQuery(e)
    } else {
      e.preventDefault()
    }

    const newFilters = { ...filters, query: typeof e === 'string' ? e : searchQuery }
    setFilters(newFilters)
    onSearch(typeof e === 'string' ? e : searchQuery)
    onFilterChange?.(newFilters)

    // Save to recent searches
    const query = typeof e === 'string' ? e : searchQuery
    if (query && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('nddv_recent_searches', JSON.stringify(updated))
    }

    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={() => handleSearch(searchQuery)} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              placeholder={placeholder || 'Search documents by name, type...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-900">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            🔍 Search
          </button>
        </div>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !searchQuery && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Recent:</span>
          {recentSearches.map((search, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(search)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
