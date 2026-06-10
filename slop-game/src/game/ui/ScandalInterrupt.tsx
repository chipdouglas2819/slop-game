import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { scandalHints } from '../engine/scandals'
import { PLATFORMS, TOPICS } from '../engine/data'
import { sfx } from './sfx'

// The "Goes Mainstream" interrupt (§7, D7). A prominent card pinned to the top
// of the Feed — never a menu. Three-way gamble, no dominant option; the player
// reads direction hints (D5) and gambles, because magnitudes are hidden.
export function ScandalInterrupt() {
  const { state, dispatch } = useStore()
  const sc = state.activeScandal
  const stungFor = useRef<string | null>(null)

  // Ominous stinger when a scandal lands (once per scandal per session — a
  // page load with a pending scandal re-alerts once, which is the point)
  useEffect(() => {
    if (sc && stungFor.current !== sc.instanceId) {
      stungFor.current = sc.instanceId
      sfx('scandal')
    }
  }, [sc])

  if (!sc) return null

  const hints = scandalHints(state)
  const burned = hints.saturation < 0.5
  const cells = 4
  const satFilled = Math.round(hints.saturation * cells)

  return (
    <div className="border-2 border-orange-500 rounded-2xl overflow-hidden bg-gradient-to-b from-orange-950/60 to-zinc-900 animate-[slideDown_300ms_ease-out]">
      <div className="px-4 pt-3 pb-2">
        <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">
          ⚡ Goes Mainstream
        </div>
        <div className="text-zinc-50 font-semibold leading-snug mt-0.5">{sc.headline}</div>
        <div className="text-xs text-orange-200/80 italic mt-1">{sc.line}</div>
        <div className="text-[11px] text-zinc-400 mt-2">
          {TOPICS[sc.topic].name} · {PLATFORMS[sc.platform].name}
        </div>
        {!state.progression.firstScandalSeen && (
          <div className="mt-2 text-[11px] text-orange-100/90 bg-orange-900/30 border border-orange-700/60 rounded-lg px-2.5 py-2 leading-snug">
            <span className="font-semibold">First scandal?</span> Push a niche hard enough and it
            blows up into the mainstream — a big payout spike, then a backlash. There's no right
            answer: read the hints below and gamble. (Ignoring it is the only sure loss.)
          </div>
        )}
      </div>

      {/* Direction hints — read the room (D5). No numbers. */}
      <div className="px-4 pb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono">
        <span className="text-zinc-400">
          niche{' '}
          <span className="text-zinc-200">
            {Array.from({ length: cells }).map((_, i) => (
              <span key={i} className={i < satFilled ? 'text-zinc-200' : 'text-zinc-700'}>
                ▓
              </span>
            ))}
          </span>{' '}
          {burned ? '(burned)' : '(fresh)'}
        </span>
        <span className={hints.stillHot ? 'text-orange-300' : 'text-sky-300'}>
          {hints.stillHot ? '🔥 still trending' : '❄ cooling'}
        </span>
        {hints.hasPivot && <span className="text-emerald-300">↪ pivot ready</span>}
        {hints.canAffordDamage && <span className="text-zinc-300">$ PR affordable</span>}
      </div>

      {/* The three-way fork */}
      <div className="px-3 pb-3 grid gap-2">
        <ChoiceButton
          label="Ride it"
          desc="Take the whole spike. Backlash bites hardest if the niche is still hot."
          tone="ride"
          onClick={() => { sfx('resolve'); dispatch({ type: 'SCANDAL_RESOLVE', choice: 'ride' }) }}
        />
        <ChoiceButton
          label="Cash out & pivot"
          desc="Bank most of the spike, jump to a fresh niche before backlash lands."
          tone="cashout"
          disabled={sc.rideOnly}
          onClick={() => { sfx('resolve'); dispatch({ type: 'SCANDAL_RESOLVE', choice: 'cashout' }) }}
        />
        <ChoiceButton
          label="Damage-control"
          desc="Spend cash to keep the niche. Worth it only for a real cash cow."
          tone="damage"
          disabled={sc.rideOnly || !hints.canAffordDamage}
          onClick={() => { sfx('resolve'); dispatch({ type: 'SCANDAL_RESOLVE', choice: 'damage' }) }}
        />
        {sc.rideOnly && (
          <div className="text-[11px] text-orange-300/80 italic text-center pt-1">
            No good options here. You can only ride it.
          </div>
        )}
        <button
          onClick={() => dispatch({ type: 'SCANDAL_IGNORE' })}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 pt-1"
        >
          ignore (let it burn)
        </button>
      </div>
    </div>
  )
}

function ChoiceButton({
  label,
  desc,
  tone,
  onClick,
  disabled,
}: {
  label: string
  desc: string
  tone: 'ride' | 'cashout' | 'damage'
  onClick: () => void
  disabled?: boolean
}) {
  const toneClass =
    tone === 'ride'
      ? 'border-orange-600 bg-orange-900/30 hover:bg-orange-800/40'
      : tone === 'cashout'
      ? 'border-emerald-700 bg-emerald-900/20 hover:bg-emerald-800/40'
      : 'border-sky-700 bg-sky-900/20 hover:bg-sky-800/40'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-xl border px-3 py-2 ${toneClass} disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <div className="text-zinc-50 font-semibold text-sm">{label}</div>
      <div className="text-[11px] text-zinc-400 mt-0.5">{desc}</div>
    </button>
  )
}
