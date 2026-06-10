import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { PLATFORMS } from '../engine/data'
import { sfx } from './sfx'

// Live platform bot-purge notice (D8). The affected page cards carry their own
// badge; this is the feed-level alert with the remaining time.
export function CrackdownBanner() {
  const { state } = useStore()
  const cd = state.crackdown
  const alertedFor = useRef<number | null>(null)

  useEffect(() => {
    if (cd && alertedFor.current !== cd.untilMs) {
      alertedFor.current = cd.untilMs
      sfx('scandal')
    }
  }, [cd])

  if (!cd || state.lastTickAt >= cd.untilMs) return null
  const secsLeft = Math.max(0, Math.ceil((cd.untilMs - state.lastTickAt) / 1000))

  return (
    <div className="border border-cyan-700 rounded-2xl bg-cyan-950/40 px-4 py-2.5 animate-[flashPop_300ms_ease-out]">
      <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold">
        🚨 Platform crackdown
      </div>
      <div className="text-sm text-zinc-100 leading-snug mt-0.5">
        {PLATFORMS[cd.platform].name} is purging fake accounts — bot views there do nothing for{' '}
        <span className="font-mono text-cyan-300">{secsLeft}s</span>. Ride it out, or shift your
        bots elsewhere.
      </div>
    </div>
  )
}
