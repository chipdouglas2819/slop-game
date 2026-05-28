import { useState } from 'react'
import { useStore } from '../store'
import { ACHIEVEMENTS } from '../engine/data'
import { clearSave } from '../engine/persistence'

// Minimal footer — the one vanity drawer slot (§10). Just achievements + the
// resource-tooltip thesis line, plus a hard-reset escape hatch for testing.
export function Footer() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState<'achievements' | 'about' | null>(null)
  const unlocked = state.unlocked.length
  const total = ACHIEVEMENTS.length

  return (
    <>
      <footer className="fixed bottom-0 inset-x-0 z-10 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center gap-3 text-xs">
          <button
            onClick={() => setOpen('achievements')}
            className="text-zinc-400 hover:text-zinc-200"
          >
            🏆 {unlocked}/{total}
          </button>
          <button
            onClick={() => setOpen('about')}
            className="text-zinc-400 hover:text-zinc-200"
          >
            What is SLOP?
          </button>
          <span className="flex-1" />
          <button
            onClick={() => {
              if (confirm('Wipe save?')) {
                clearSave()
                dispatch({ type: 'HARD_RESET', now: Date.now() })
              }
            }}
            className="text-zinc-600 hover:text-zinc-400 text-[10px]"
          >
            reset
          </button>
        </div>
      </footer>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-wider text-zinc-300 font-semibold">
                {open === 'achievements' ? 'Achievements' : 'What is SLOP?'}
              </h3>
              <button onClick={() => setOpen(null)} className="text-zinc-400 text-xl leading-none">
                ×
              </button>
            </div>

            {open === 'achievements' && (
              <ul className="divide-y divide-zinc-800">
                {ACHIEVEMENTS.map((a) => {
                  const got = state.unlocked.includes(a.id)
                  return (
                    <li key={a.id} className={`px-4 py-3 ${got ? '' : 'opacity-40'}`}>
                      <div className="flex items-center gap-2">
                        <span>{got ? '🏆' : '🔒'}</span>
                        <span className="text-zinc-100 font-medium">{a.title}</span>
                      </div>
                      {a.hint && (
                        <div className="text-[11px] text-zinc-500 italic mt-0.5 ml-7">
                          {a.hint}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {open === 'about' && (
              <div className="p-4 space-y-3 text-sm text-zinc-300">
                <p>
                  <strong className="text-zinc-100">SLOP</strong>{' '}
                  <em className="text-zinc-400">(n.)</em> — content that is
                  mindlessly generated and thrust upon someone who didn't ask for it.{' '}
                  <span className="text-zinc-500">(Simon Willison, 2024.)</span>
                </p>
                <p className="text-zinc-400">
                  You are not making bad art. You are forcing it on people who never asked.
                </p>
                <p className="text-[11px] text-zinc-600 italic">
                  Phase 1 prototype. Era II–IV, scandals, bots, and the bounded cursed coda
                  arrive in later builds.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
