import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type Decimal from 'break_infinity.js'
import type { Action } from './engine/state'
import type { GameState } from './engine/types'

export interface StoreShape {
  state: GameState
  dispatch: Dispatch<Action>
  // Offline-progress info surfaced once on load (cleared by the UI after the
  // While-You-Were-Out card is dismissed).
  offlineMs: number
  offlineEarned: Decimal // money gained by the offline catch-up tick
  clearOfflineMs: () => void
}

export const StoreContext = createContext<StoreShape | null>(null)

export function useStore(): StoreShape {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
