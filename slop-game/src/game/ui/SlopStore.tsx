import type { ReactNode } from 'react'
import { useStore } from '../store'
import { useLockBodyScroll } from './useLockBodyScroll'
import { fmtMoney } from '../format'

// Monetization SIMULATION (D11) — a FAKE, non-charging store so the ethical-F2P
// layer can be felt. Nothing here charges real money; nothing touches the recipe
// decision system (no pay-to-win); the permanent multiplier is capped; the boost
// is daily-capped; there are no loot boxes or limited-time offers. The joke is
// that the store is the satire turned on the player — kept genuinely optional.

const CLOUT_PACKS = [
  { cents: 99, clout: 100, name: 'Pocket Clout', sub: 'a little engagement, for you' },
  { cents: 499, clout: 600, name: 'Handful of Clout', sub: 'now we’re talking' },
  { cents: 1999, clout: 2800, name: 'Sack of Clout', sub: 'popular!' },
  { cents: 9999, clout: 16000, name: 'The Whale Bucket', sub: 'best value — be the whale' },
]

const PERM_MULT_STEP = 0.5
const PERM_MULT_COST = 1000 // clout per +0.5×
const PERM_MULT_CAP = 3
const TIME_WARP_COST = 400
const BOOST_DAILY_CAP = 5

export function SlopStore({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  useLockBodyScroll()
  const m = state.monetization
  const boostOn = m.boostUntilMs > Date.now()
  const permMaxed = m.permanentMult >= PERM_MULT_CAP

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + the honest banner */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-zinc-100 font-semibold">🛒 The Slop Store</h3>
            <button onClick={onClose} className="text-zinc-400 text-2xl leading-none" aria-label="Close">×</button>
          </div>
          <div className="mt-2 text-[11px] bg-amber-950/60 border border-amber-800 text-amber-200 rounded px-2 py-1">
            🚫 This store is FAKE. Nothing here charges real money — it's a demo of how the
            (ethical) shop would feel. Tap to "buy" and the effect just happens.
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-zinc-400">Your Clout</span>
            <span className="font-mono text-fuchsia-300 font-semibold">✨ {m.clout.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Clout packs */}
          <Section title="Buy Clout" sub="the premium currency (totally fake checkout)">
            <div className="grid grid-cols-2 gap-2">
              {CLOUT_PACKS.map((p) => (
                <button
                  key={p.cents}
                  onClick={() => dispatch({ type: 'BUY_CLOUT', clout: p.clout, centsPretend: p.cents })}
                  className="text-left rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 p-3"
                >
                  <div className="text-zinc-100 font-semibold text-sm">✨ {p.clout.toLocaleString('en-US')}</div>
                  <div className="text-[10px] text-zinc-500">{p.name}</div>
                  <div className="text-[10px] text-zinc-600 italic">{p.sub}</div>
                  <div className="mt-1 text-xs font-mono text-emerald-300">${(p.cents / 100).toFixed(2)}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Permanent multiplier — the whale hook (capped, reset-surviving) */}
          <Section title="Permanent Earnings" sub={`survives every reset · capped at ×${PERM_MULT_CAP} (never pay-to-win)`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-zinc-300">
                Now: <span className="font-mono text-fuchsia-300">×{m.permanentMult.toFixed(1)}</span>
                {!permMaxed && <span className="text-zinc-500"> → ×{(m.permanentMult + PERM_MULT_STEP).toFixed(1)}</span>}
              </div>
              <button
                disabled={permMaxed || m.clout < PERM_MULT_COST}
                onClick={() => dispatch({ type: 'BUY_PERMANENT_MULT', cloutCost: PERM_MULT_COST, mult: PERM_MULT_STEP })}
                className="rounded-lg bg-fuchsia-700 hover:bg-fuchsia-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold px-3 py-2"
              >
                {permMaxed ? 'Maxed' : `+${PERM_MULT_STEP}× · ✨${PERM_MULT_COST}`}
              </button>
            </div>
          </Section>

          {/* 2× boost — rewarded-ad analog, simulated + daily-capped */}
          <Section title="2× Boost" sub={`watch a (fake) ad · ${BOOST_DAILY_CAP - m.boostsToday}/${BOOST_DAILY_CAP} left today · 4 hours`}>
            <button
              disabled={m.boostsToday >= BOOST_DAILY_CAP}
              onClick={() => dispatch({ type: 'WATCH_AD_BOOST', now: Date.now() })}
              className="w-full rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-semibold py-2.5"
            >
              {boostOn ? '2× is active — watch again to extend' : '▶ Watch a fake ad for 2× earnings'}
            </button>
          </Section>

          {/* Time Warp — pay-to-skip convenience */}
          <Section title="Time Warp" sub="instantly collect 4 hours of earnings">
            <button
              disabled={m.clout < TIME_WARP_COST}
              onClick={() => dispatch({ type: 'TIME_WARP', cloutCost: TIME_WARP_COST })}
              className="w-full rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 text-zinc-100 text-sm font-semibold py-2.5"
            >
              ⏩ Skip ahead 4 hours · ✨{TIME_WARP_COST}
            </button>
          </Section>

          <div className="text-[10px] text-zinc-600 italic text-center">
            "You would have spent" so far: ${(m.spentRealCentsPretend / 100).toFixed(2)} — and the game is
            still 100% beatable for free. That's the whole point. Treasury: {fmtMoney(state.money)}.
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm text-zinc-200 font-semibold">{title}</div>
      <div className="text-[10px] text-zinc-500 mb-2">{sub}</div>
      {children}
    </div>
  )
}
