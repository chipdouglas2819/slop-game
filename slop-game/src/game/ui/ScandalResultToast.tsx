import { useEffect } from 'react'
import { useStore } from '../store'

// Shows the outcome of a resolved scandal for a few seconds, then clears.
export function ScandalResultToast() {
  const { state, dispatch } = useStore()
  const result = state.lastScandalResult

  useEffect(() => {
    if (!result) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_SCANDAL_RESULT' }), 6000)
    return () => clearTimeout(t)
  }, [result, dispatch])

  if (!result) return null

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-16 z-30 max-w-sm w-[92vw] pointer-events-none">
      <div className="bg-zinc-800/95 border border-zinc-600 rounded-xl px-4 py-3 shadow-xl">
        <div className="text-[10px] uppercase tracking-wider text-orange-300">Aftermath</div>
        <div className="text-sm text-zinc-100 leading-snug mt-0.5">{result}</div>
      </div>
    </div>
  )
}
