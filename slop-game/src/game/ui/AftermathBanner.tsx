import { useEffect } from 'react'
import { useStore } from '../store'

// The outcome of a resolved scandal, shown INLINE where the scandal card was —
// dismissible, generous timeout. (It used to be a 6-second toast at the bottom
// screen edge: the narrative payoff of the gamble was the easiest thing in the
// game to miss.)
export function AftermathBanner() {
  const { state, dispatch } = useStore()
  const result = state.lastScandalResult

  useEffect(() => {
    if (!result) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_SCANDAL_RESULT' }), 20_000)
    return () => clearTimeout(t)
  }, [result, dispatch])

  if (!result) return null

  return (
    <div className="border border-orange-700/60 rounded-2xl bg-zinc-900 px-4 py-3 animate-[flashPop_300ms_ease-out]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">
            📰 Aftermath
          </div>
          <div className="text-sm text-zinc-100 leading-snug mt-1">{result}</div>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_SCANDAL_RESULT' })}
          className="text-zinc-400 hover:text-zinc-200 text-xl leading-none shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
