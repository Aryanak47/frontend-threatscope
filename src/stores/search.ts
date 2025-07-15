import { create } from 'zustand'
import { SearchRequest, SearchResponse, SearchType, SearchMode } from '@/types'
import { apiClient } from '@/lib/api'

interface SearchState {
  // Current search
  currentSearch: SearchRequest | null
  results: SearchResponse | null
  isSearching: boolean
  searchError: string | null
  
  // Search history
  searchHistory: Array<{
    id: string
    query: string
    type: SearchType
    timestamp: string
    resultsCount: number
  }>
  
  // UI state
  selectedSearchType: SearchType
  searchMode: SearchMode
  
  // Actions
  performSearch: (request: SearchRequest) => Promise<void>
  performAdvancedSearch: (criteria: any) => Promise<void>
  performBulkSearch: (queries: string[], type: SearchType) => Promise<void>
  setSearchType: (type: SearchType) => void
  setSearchMode: (mode: SearchMode) => void
  clearResults: () => void
  clearError: () => void
  addToHistory: (search: any) => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  currentSearch: null,
  results: null,
  isSearching: false,
  searchError: null,
  searchHistory: [],
  selectedSearchType: 'email',
  searchMode: 'exact',

  // Actions
  performSearch: async (request: SearchRequest) => {
    try {
      set({ 
        isSearching: true, 
        searchError: null, 
        currentSearch: request 
      })
      
      const results = await apiClient.search(request)
      
      set({ 
        results, 
        isSearching: false 
      })
      
      // Add to history
      get().addToHistory({
        id: Date.now().toString(),
        query: request.query,
        type: request.type,
        timestamp: new Date().toISOString(),
        resultsCount: results?.results?.length || 0
      })
      
    } catch (error: any) {
      let errorMessage = 'Search failed'
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in to perform searches.'
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this search.'
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait before performing another search.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      set({
        searchError: errorMessage,
        isSearching: false,
        results: null
      })
      throw error
    }
  },

  performAdvancedSearch: async (criteria: any) => {
    try {
      set({ isSearching: true, searchError: null })
      
      const results = await apiClient.advancedSearch(criteria)
      
      set({ 
        results, 
        isSearching: false,
        currentSearch: {
          query: 'Advanced Search',
          type: 'email', // Default for advanced search
          mode: 'exact'
        }
      })
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Advanced search failed'
      set({
        searchError: errorMessage,
        isSearching: false,
        results: null
      })
      throw error
    }
  },

  performBulkSearch: async (queries: string[], type: SearchType) => {
    try {
      set({ isSearching: true, searchError: null })
      
      const results = await apiClient.bulkSearch({
        queries,
        type,
        mode: get().searchMode
      })
      
      set({ 
        results, 
        isSearching: false,
        currentSearch: {
          query: `Bulk Search (${queries.length} items)`,
          type,
          mode: get().searchMode
        }
      })
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Bulk search failed'
      set({
        searchError: errorMessage,
        isSearching: false,
        results: null
      })
      throw error
    }
  },

  setSearchType: (type: SearchType) => set({ selectedSearchType: type }),
  setSearchMode: (mode: SearchMode) => set({ searchMode }),
  clearResults: () => set({ results: null, currentSearch: null }),
  clearError: () => set({ searchError: null }),
  
  addToHistory: (search: any) => {
    const { searchHistory } = get()
    const newHistory = [search, ...searchHistory].slice(0, 50) // Keep last 50 searches
    set({ searchHistory: newHistory })
  }
}))
