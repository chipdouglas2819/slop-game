import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { ACHIEVEMENT_BY_ID } from '../engine/data'

// Slide-in toast when an achievement unlocks. Phase 1 picks newly-added ids
// off the unlocked list and queues them; queue empties on display.
export function AchievementToast() {
  const { state } = useStore()
  const seenRef = useRef<Set<string>>(new Set())
  const [queue, setQueue] = useState<string[]>([])

  useEffect(() => {
    const newly: string[] = []
    for (const id of state.unlocked) {
      if (!seenRef.current.has(id)) {
        seenRef.current.add(id)
        newly.push(id)
      }
    }
    if (newly.length) setQueue((q) => [...q, ...newly])
  }, [state.unlocked])

  const current = queue[0]
  useEffect(() => {
    if (!current) return
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 4500)
    return () => clearTimeout(t)
  }, [current])

  if (!current) return null
  const ach = ACHIEVEMENT_BY_ID[current]
  if (!ach) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 top-16 z-30 max-w-sm w-[90vw] pointer-events-none animate-[slideDown_300ms_ease-out]"
      style={{
        // inline keyframes so we don't need a Tailwind config extension
        animation: 'slideDown 300ms ease-out',
      }}
    >
      <div className="bg-fuchsia-900/90 border border-fuchsia-600 rounded-xl px-4 py-3 shadow-xl">
        <div className="text-[10px] uppercase tracking-wider text-fuchsia-200">
          Achievement Unlocked
        </div>
        <div className="text-zinc-50 font-semibold leading-snug">{ach.title}</div>
        {ach.hint && (
          <div className="text-[11px] text-fuchsia-200/80 italic mt-1">{ach.hint}</div>
        )}
      </div>
    </div>
  )
}
