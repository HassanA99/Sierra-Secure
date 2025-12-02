'use client'
import React, { useState } from 'react'

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void
}

export interface FilterOptions {
  types: string[]
  statuses: string[]
  dateFrom?: string
  dateTo?: string
  sharedOnly: boolean
}

const DOCUMENT_TYPES = [
  'Birth Certificate',
  'National ID',
  'Passport',
  'Driver\'s License',
  'Land Title',
  'Property Deed',
  'Vehicle Registration',
  'Professional License',
  'Academic Certificate',
]

const STATUSES = ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED']

/**
 * FilterPanel Component
 * Provides advanced filtering for documents
 * 
 * Features:
 * - Filter by document type (multi-select)
 * - Filter by status (multi-select)
 * - Filter by date range
 * - Show only shared documents
 * - Save filter preferences
 */
export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [sharedOnly, setSharedOnly] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  const handleTypeToggle = (type: string) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    setSelectedTypes(updated)
    updateFilters(updated, selectedStatuses, dateFrom, dateTo, sharedOnly)
  }

  const handleStatusToggle = (status: string) => {
    const updated = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]
    setSelectedStatuses(updated)
    updateFilters(selectedTypes, updated, dateFrom, dateTo, sharedOnly)
  }

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
    updateFilters(selectedTypes, selectedStatuses, from, to, sharedOnly)
  }

  const handleSharedToggle = () => {
    const updated = !sharedOnly
    setSharedOnly(updated)
    updateFilters(selectedTypes, selectedStatuses, dateFrom, dateTo, updated)
  }

  const updateFilters = (
    types: string[],
    statuses: string[],
    from: string,
    to: string,
    shared: boolean
  ) => {
    let count = 0
    if (types.length > 0) count += types.length
    if (statuses.length > 0) count += statuses.length
    if (from || to) count += 1
    if (shared) count += 1
    setActiveFilterCount(count)

    onFilterChange({
      types,
      statuses,
      dateFrom: from,
      dateTo: to,
      sharedOnly: shared,
    })
  }

  const handleClearFilters = () => {
    setSelectedTypes([])
    setSelectedStatuses([])
    setDateFrom('')
    setDateTo('')
    setSharedOnly(false)
    setActiveFilterCount(0)
    onFilterChange({
      types: [],
      statuses: [],
      sharedOnly: false,
    })
  }

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          showFilters || activeFilterCount > 0
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        ⚙️ Filters
        {activeFilterCount > 0 && (
          <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-sm font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-6 bg-white rounded-lg border border-gray-200 space-y-6">
          {/* Document Type Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Document Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedStatuses.includes(status)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h3>
            <div className="flex gap-4">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange(e.target.value, dateTo)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="To"
              />
            </div>
          </div>

          {/* Shared Documents Filter */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sharedOnly}
              onChange={handleSharedToggle}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show only shared documents</span>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
