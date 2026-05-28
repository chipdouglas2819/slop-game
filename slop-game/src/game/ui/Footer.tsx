import { useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from '../store'
import { ACHIEVEMENTS } from '../engine/data'
import { clearSave } from '../engine/persistence'

// Minimal footer — the one vanity drawer slot (§10). Just achievements + the
// resource-tooltip thesis line, plus a hard-reset escape hatch for testing.
export function Footer() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState<'achievements' | 'about' | 'howto' | null>(null)
  const unlocked = state.unlocked.length
  const total = ACHIEVEMENTS.length

  return (
    <>
      <footer className="fixed bottom-0 inset-x-0 z-10 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center gap-3 text-xs">
          <button
            onClick={() => setOpen('howto')}
            className="text-fuchsia-300 hover:text-fuchsia-200 font-medium"
          >
            ❓ How to play
          </button>
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
                {open === 'achievements'
                  ? 'Achievements'
                  : open === 'howto'
                  ? 'How to play'
                  : 'What is SLOP?'}
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

            {open === 'howto' && (
              <div className="p-4 space-y-3 text-sm text-zinc-300">
                <HowToRow icon="📝" title="Post slop, make money">
                  Each page auto-posts and earns cash. Buy more copies to earn faster; the
                  numbers go up.
                </HowToRow>
                <HowToRow icon="🧑‍💼" title="Hire a Manager">
                  Tired of tapping Publish? Hire a Manager and the page runs itself.
                </HowToRow>
                <HowToRow icon="🎯" title="Topic = what you post">
                  Tap the Topic chip and pick something that fits the page (◆ Great is best).
                </HowToRow>
                <HowToRow icon="🔥" title="Trending = bonus money">
                  The bar up top shows what's hot right now. Switch a page's Topic to match it
                  and that page earns a bonus. It changes every few minutes.
                </HowToRow>
                <HowToRow icon="📉" title="Freshness = don't overdo it">
                  Posting the same thing too long wears it out and earns less ("overused").
                  Switch it up to refresh.
                </HowToRow>
                <HowToRow icon="⚡" title="Algorithm Update">
                  When it appears up top, you can reset your pages for permanent Tokens that make
                  everything earn a little more, forever. Optional — do it when you're ready.
                </HowToRow>
                <HowToRow icon="📰" title="Scandals">
                  Push a topic too hard and it "Goes Mainstream" — a pop-up with three choices and
                  no single right answer. Read the hints and gamble.
                </HowToRow>
              </div>
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

function HowToRow({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="text-lg shrink-0">{icon}</span>
      <div>
        <div className="text-zinc-100 font-medium">{title}</div>
        <div className="text-[13px] text-zinc-400 leading-snug">{children}</div>
      </div>
    </div>
  )
}
