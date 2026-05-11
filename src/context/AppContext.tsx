import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { ScanRecord } from '../utils/types'
import { fetchScanHistory } from '../utils/api'

interface AppState {
  darkMode: boolean
  scanHistory: ScanRecord[]
  currentResult: ScanRecord | null
  isAnalyzing: boolean
  historyLoading: boolean
}

type Action =
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'ADD_SCAN_RESULT'; payload: ScanRecord }
  | { type: 'SET_CURRENT_RESULT'; payload: ScanRecord | null }
  | { type: 'SET_SCAN_HISTORY'; payload: ScanRecord[] }
  | { type: 'SET_HISTORY_LOADING'; payload: boolean }
  | { type: 'CLEAR_HISTORY' }

const initialState: AppState = {
  darkMode: false,
  scanHistory: [],
  currentResult: null,
  isAnalyzing: false,
  historyLoading: false,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload }
    case 'ADD_SCAN_RESULT':
      return {
        ...state,
        scanHistory: [action.payload, ...state.scanHistory],
        currentResult: action.payload,
      }
    case 'SET_CURRENT_RESULT':
      return { ...state, currentResult: action.payload }
    case 'SET_SCAN_HISTORY':
      return { ...state, scanHistory: action.payload }
    case 'SET_HISTORY_LOADING':
      return { ...state, historyLoading: action.payload }
    case 'CLEAR_HISTORY':
      return { ...state, scanHistory: [] }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const saved = localStorage.getItem('waspadasiber_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...init, darkMode: parsed.darkMode ?? false }
      } catch {
        return init
      }
    }
    return init
  })

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('waspadasiber_state', JSON.stringify({ darkMode: state.darkMode }))
    if (state.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.darkMode])

  // Load scan history from backend on mount
  useEffect(() => {
    dispatch({ type: 'SET_HISTORY_LOADING', payload: true })
    fetchScanHistory(20)
      .then((res) => {
        if (res.success && res.data) {
          dispatch({ type: 'SET_SCAN_HISTORY', payload: res.data })
        }
      })
      .finally(() => dispatch({ type: 'SET_HISTORY_LOADING', payload: false }))
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
