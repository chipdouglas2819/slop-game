import { useStore } from '../store'
import { weightsMult } from '../engine/math'

// Post-Pull-the-Plug celebration — the era jump must land as a triumph and
// frame what's NEW (the Model chip), since everything else just got wiped.
export function EraBanner() {
  const { state, dispatch } = useStore()
  const gain = state.lastEraJumpGain
  if (gain == null) return null
  const mult = weightsMult(state.modelWeights)

  return (
    <div className="border-2 border-violet-600 rounded-2xl bg-gradient-to-b from-violet-950/70 to-zinc-900 px-4 py-3 animate-[flashPop_300ms_ease-out]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold">
            🔌 You pulled the plug — ERA III: VIDEO SLOP
          </div>
          <div className="text-zinc-50 font-semibold leading-snug mt-1">
            +{gain} Model Weights — <span className="text-violet-300 font-mono">×{mult.toFixed(1)}</span>{' '}
            on everything, permanent, survives every reset.
          </div>
          <div className="text-xs text-violet-200/80 mt-1.5 leading-snug">
            The <span className="text-zinc-100">Model chip</span> is live: fancier generators reach
            far more people — and burn real money per post. The cheapest model that does the job
            still usually wins. Your tokens are gone; weights make the climb back faster.
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_ERA_RESULT' })}
          className="text-zinc-400 hover:text-zinc-200 text-xl leading-none shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
