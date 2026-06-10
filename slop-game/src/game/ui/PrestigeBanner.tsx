import { useStore } from '../store'

// Post-Algorithm-Update celebration — the reset must FEEL like a victory with
// a visible reward, not like waking up in a fresh install. Shows the tokens
// gained + the new permanent multiplier; on the FIRST update it also frames
// the Algorithm "going dark" (D2) so the missing numbers read as intentional.
// (The prestige sound plays at the confirm button, not here, so an undismissed
// banner doesn't replay the fanfare on every reload.)
export function PrestigeBanner() {
  const { state, dispatch } = useStore()
  const gain = state.lastPrestigeGain

  if (gain == null) return null
  const mult = 1 + 0.02 * state.slopTokens
  const firstEver = state.algorithmUpdatesCompleted === 1

  return (
    <div className="border-2 border-fuchsia-600 rounded-2xl bg-gradient-to-b from-fuchsia-950/70 to-zinc-900 px-4 py-3 animate-[flashPop_300ms_ease-out]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-fuchsia-400 font-semibold">
            ⚡ You survived the Algorithm Update
          </div>
          <div className="text-zinc-50 font-semibold leading-snug mt-1">
            +{gain} Slop Tokens banked — everything you earn is now{' '}
            <span className="text-fuchsia-300 font-mono">×{mult.toFixed(2)}</span>, forever.
          </div>
          {firstEver && (
            <div className="text-xs text-fuchsia-200/80 mt-1.5 leading-snug">
              One more thing: the Algorithm went dark. From now on it shows{' '}
              <span className="text-zinc-100">what's</span> hot — never <em>how</em> hot. And some
              topic fits got reshuffled. Welcome to the black box.
            </div>
          )}
          <div className="text-[11px] text-zinc-500 mt-1.5 italic">
            Your pages reset — rebuild. It'll be faster this time.
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_PRESTIGE_RESULT' })}
          className="text-zinc-400 hover:text-zinc-200 text-xl leading-none shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
