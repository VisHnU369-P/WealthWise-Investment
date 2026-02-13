import { createContext, useContext } from 'react'

export const STORAGE_KEY = 'wealthwise.portfolio.v1'

export const PortfolioContext = createContext(null)

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function initialState() {
  const saved = safeParse(localStorage.getItem(STORAGE_KEY))
  if (saved && Array.isArray(saved.holdings)) {
    return { holdings: saved.holdings }
  }

  // Seed a few sample holdings so the dashboard isn't empty.
  return {
    holdings: [
      {
        id: crypto.randomUUID(),
        type: 'STOCK',
        name: 'AAPL',
        quantity: 5,
        purchasePrice: 185.25,
        dailyChangePct: 0.004,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
      },
      {
        id: crypto.randomUUID(),
        type: 'CRYPTO',
        name: 'BTC',
        quantity: 0.08,
        purchasePrice: 64000,
        dailyChangePct: -0.013,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      },
      {
        id: crypto.randomUUID(),
        type: 'Mutual Funds',
        name: 'VFIAX',
        quantity: 12,
        purchasePrice: 410.5,
        dailyChangePct: 0.0025,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      },
    ],
  }
}

export function reducer(state, action) {
  // Ensure holdings is always an array
  const currentHoldings = Array.isArray(state.holdings) ? state.holdings : [];
  
  switch (action.type) {
    case 'ADD_HOLDING': {
      return { ...state, holdings: [action.payload, ...currentHoldings] }
    }
    case 'REMOVE_HOLDING': {
      return { ...state, holdings: currentHoldings.filter((h) => h._id !== action.payload._id) }
    }
    case 'CLEAR_ALL': {
      return { ...state, holdings: [] }
    }
    case "SET_HOLDINGS": {
      // Ensure payload is an array
      const payload = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, holdings: payload };
    }
    default:
      return state
  }
}

