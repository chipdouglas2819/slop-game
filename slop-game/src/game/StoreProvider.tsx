import { useEffect, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { reduce } from './engine/state'
import { loadGame, saveGame } from './engine/persistence'
import { StoreContext } from './store'

const TICK_INTERVAL_MS = 100 // 10Hz — smooth enough for UI, easy on mobile CPU
const SAVE_INTERVAL_MS = 5000

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy init: load from localStorage on first render
  const [initial] = useState(() => loadGame(Date.now()))
  const [state, dispatch] = useReducer(reduce, initial.state)
  const [offlineMs, setOfflineMs] = useState(initial.offlineMs)

  // Apply offline-progress tick on mount
  const appliedOffline = useRef(false)
  useEffect(() => {
    if (appliedOffline.current) return
    appliedOffline.current = true
    if (initial.offlineMs > 1000) {
      // The reducer's TICK consumes lastTickAt → now; setting now=Date.now()
      // applies the full offline delta (capped at 24h inside the reducer).
      dispatch({ type: 'TICK', now: Date.now() })
    }
  }, [initial.offlineMs])

  // Game tick loop — setInterval (not rAF) so it keeps running when the tab
  // is backgrounded or the preview iframe isn't actively repainting.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Save loop
  useEffect(() => {
    const id = setInterval(() => saveGame(state), SAVE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [state])

  // Save on tab hide / pagehide for mobile reliability
  useEffect(() => {
    const onHide = () => saveGame(state)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  }, [state])

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        offlineMs,
        clearOfflineMs: () => setOfflineMs(0),
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
