import { useStore } from '../store'
import {
  canPullPlug,
  eraLifetimeE,
  plugGainNeeded,
  plugRequirements,
  plugWeightsGained,
  weightsMult,
} from '../engine/math'
import { fmtNumber } from '../format'
import { useLockBodyScroll } from './useLockBodyScroll'
import { sfx } from './sfx'

// "Pull the Plug" — the hard prestige (Era Jump, §6). Doubles as the GOAL
// screen: when locked it shows the checklist (teaching what to chase), when
// ready it spells out the much deeper trade than an Algorithm Update.
export function PullPlugSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  useLockBodyScroll()
  const reqs = plugRequirements(state)
  const ready = canPullPlug(state)
  const gain = plugWeightsGained(eraLifetimeE(state))
  const curMult = weightsMult(state.modelWeights)
  const newMult = weightsMult(state.modelWeights + gain)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-red-800 rounded-2xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-[10px] uppercase tracking-widest text-red-400">
            Pull the Plug — the deep reset
          </div>
          <h3 className="text-lg text-zinc-50 font-semibold">Kill this internet. Train the next one.</h3>
        </div>

        <p className="text-sm text-zinc-400 leading-snug">
          Deeper than an Algorithm Update: you lose your pages, your cash{' '}
          <span className="text-zinc-200">and all your Slop Tokens</span>. In return:{' '}
          <span className="text-violet-300 font-semibold">Model Weights</span> — permanent, they
          survive <em>everything</em> — and the <span className="text-zinc-100">Model chip</span>{' '}
          (Era III: better generators, bigger reach, real running costs).
        </p>

        {/* The goal checklist — also the long-term goal display while locked */}
        <div className="bg-zinc-800/60 rounded-xl p-3 space-y-1.5 text-sm">
          <Req ok={reqs.updates.ok} label={`Survive ${reqs.updates.need} Algorithm Updates`} value={`${reqs.updates.have}/${reqs.updates.need}`} />
          <Req ok={reqs.z.ok} label={`Zombie Ratio ≥ ${Math.round(reqs.z.need * 100)}% (run bots)`} value={`${Math.round(reqs.z.have * 100)}%`} />
          <Req ok={reqs.eraE.ok} label={`${fmtNumber(reqs.eraE.need)} views this era`} value={fmtNumber(reqs.eraE.have)} />
          {state.modelWeights > 0 && (
            <Req
              ok={gain >= plugGainNeeded(state.modelWeights)}
              label={`A haul worth jumping for (+${plugGainNeeded(state.modelWeights)} weights min)`}
              value={`+${gain}`}
            />
          )}
        </div>

        {ready && (
          <div className="bg-violet-950/40 border border-violet-800 rounded-xl p-3 space-y-2">
            <Row label="Model Weights you'll gain" value={`+${gain}`} accent />
            <Row label="Permanent bonus (forever)" value={`×${curMult.toFixed(1)} → ×${newMult.toFixed(1)}`} />
            <Row label="Unlocks" value="Model chip · Era III" />
          </div>
        )}

        <p className="text-[11px] text-zinc-500 leading-snug">
          The long game: every bot you run pushes 🧟 Zombie higher. At{' '}
          <span className="text-cyan-300">100%</span> the internet is fully dead — bots watching
          bots, no humans left. That's the ending. (Era IV.)
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 font-medium"
          >
            Not yet
          </button>
          <button
            onClick={() => {
              sfx('prestige')
              dispatch({ type: 'PULL_PLUG', now: Date.now() })
              onClose()
            }}
            disabled={!ready}
            className="flex-1 rounded-xl bg-red-800 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-2.5 font-semibold"
          >
            {ready ? `🔌 Pull it (+${gain})` : 'Locked'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Req({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={ok ? 'text-emerald-400' : 'text-zinc-400'}>
        {ok ? '✓' : '•'} {label}
      </span>
      <span className={`font-mono ${ok ? 'text-emerald-300' : 'text-zinc-500'}`}>{value}</span>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono font-semibold ${accent ? 'text-violet-300' : 'text-zinc-100'}`}>{value}</span>
    </div>
  )
}
